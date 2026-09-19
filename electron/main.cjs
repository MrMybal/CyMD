'use strict'
// Processus principal Electron : fenêtres, fichiers, menus, protocole cymd:// et
// récupération des aperçus de liens (sans CORS, contrairement au rendu).

const {
  app,
  BrowserWindow,
  Menu,
  dialog,
  ipcMain,
  shell,
  protocol,
  nativeTheme,
  nativeImage,
  session,
  clipboard,
} = require('electron')
const path = require('node:path')
const fs = require('node:fs')
const fsp = require('node:fs/promises')
const { Readable } = require('node:stream')

const DEV_URL = process.env.VITE_DEV_SERVER_URL
const isMac = process.platform === 'darwin'
const DOC_EXTS = new Set(['.md', '.markdown', '.mdown', '.mkd', '.cymd', '.txt'])
const USER_AGENT = 'Mozilla/5.0 (compatible; CyMDBot/0.1; link preview)'
const APP_ID = 'fr.cyberalien.cymd'

protocol.registerSchemesAsPrivileged([
  { scheme: 'cymd', privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true } },
])

/**
 * État par fenêtre (clé : webContents.id).
 * @typedef {{ win: BrowserWindow, paths: Set<string>, dirty: boolean, ready: boolean,
 *   forceClose: boolean, pending: string[], attach: object|null, grants: Set<string> }} WinCtx
 * @type {Map<number, WinCtx>}
 */
const wins = new Map()
const updates = require('./updates.cjs').createUpdates({
  app,
  updater: require('electron-updater').autoUpdater,
  showDialog: (options) => {
    const win = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0]
    const settings = { title: 'Mises à jour CyMD', ...options }
    return win ? dialog.showMessageBox(win, settings) : dialog.showMessageBox(settings)
  },
  openExternal: (url) => shell.openExternal(url),
  hasUnsaved: () => [...wins.values()].some((ctx) => ctx.dirty || !ctx.ready),
  setProgress: (value) => {
    for (const { win } of wins.values()) if (!win.isDestroyed()) win.setProgressBar(value)
  },
})
app.on('before-quit', () => updates.stop())
/** Dossiers racines dont le protocole cymd:// peut servir les fichiers. */
const allowedRoots = new Set()

// ---------------------------------------------------------------------------
// Utilitaires chemins / sécurité

function key(p) {
  const r = path.resolve(p)
  return process.platform === 'win32' ? r.toLowerCase() : r
}

function isInside(child, parent) {
  const rel = path.relative(parent, child)
  return rel !== '' && !rel.startsWith('..') && !path.isAbsolute(rel)
}

function grant(ctx, filePath) {
  ctx.grants.add(key(filePath))
  ctx.lastDir = path.dirname(path.resolve(filePath))
  allowedRoots.add(ctx.lastDir)
}

function requireGrant(ctx, filePath) {
  if (!ctx || !ctx.grants.has(key(filePath))) throw new Error('Accès refusé à ce fichier.')
}

/** Résout `rel` dans le dossier du document, en refusant toute sortie du dossier. */
function resolveInside(docPath, rel) {
  const dir = path.dirname(path.resolve(docPath))
  const target = path.resolve(dir, rel)
  if (!isInside(target, dir)) throw new Error('Chemin hors du dossier du document.')
  return target
}

function openExternalSafe(url) {
  try {
    const u = new URL(url)
    if (['http:', 'https:', 'mailto:'].includes(u.protocol)) shell.openExternal(u.toString())
  } catch {
    /* URL invalide : ignorée */
  }
}

const MIME = {
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
  '.webp': 'image/webp', '.svg': 'image/svg+xml', '.avif': 'image/avif', '.bmp': 'image/bmp',
  '.ico': 'image/x-icon', '.mp4': 'video/mp4', '.m4v': 'video/mp4', '.webm': 'video/webm',
  '.ogv': 'video/ogg', '.mov': 'video/quicktime', '.mkv': 'video/x-matroska',
  '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.ogg': 'audio/ogg', '.oga': 'audio/ogg',
  '.opus': 'audio/ogg', '.m4a': 'audio/mp4', '.flac': 'audio/flac', '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8', '.md': 'text/markdown; charset=utf-8',
}

// ---------------------------------------------------------------------------
// Protocole cymd://file/<chemin absolu encodé> : fichiers locaux du dossier du document.
// Gère les requêtes Range pour pouvoir naviguer dans les vidéos.

function registerAssetProtocol() {
  protocol.handle('cymd', async (req) => {
    try {
      const u = new URL(req.url)
      if (u.host !== 'file') return new Response('Not found', { status: 404 })
      const filePath = path.resolve(decodeURIComponent(u.pathname.slice(1)))
      let allowed = false
      for (const root of allowedRoots) if (isInside(filePath, root)) { allowed = true; break }
      if (!allowed) return new Response('Forbidden', { status: 403 })

      const stat = await fsp.stat(filePath)
      if (!stat.isFile()) return new Response('Not found', { status: 404 })
      const type = MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream'
      const headers = { 'Content-Type': type, 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-cache' }

      const range = req.headers.get('range')
      const m = range && /bytes=(\d*)-(\d*)/.exec(range)
      if (m && stat.size > 0) {
        let start = m[1] ? parseInt(m[1], 10) : 0
        let end = m[2] ? parseInt(m[2], 10) : stat.size - 1
        if (!m[1] && m[2]) { start = Math.max(0, stat.size - parseInt(m[2], 10)); end = stat.size - 1 }
        end = Math.min(end, stat.size - 1)
        if (start > end) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${stat.size}` } })
        const stream = fs.createReadStream(filePath, { start, end })
        return new Response(Readable.toWeb(stream), {
          status: 206,
          headers: { ...headers, 'Content-Length': String(end - start + 1), 'Content-Range': `bytes ${start}-${end}/${stat.size}` },
        })
      }
      return new Response(Readable.toWeb(fs.createReadStream(filePath)), {
        status: 200,
        headers: { ...headers, 'Content-Length': String(stat.size) },
      })
    } catch {
      return new Response('Not found', { status: 404 })
    }
  })
}

// ---------------------------------------------------------------------------
// Réseau (aperçus de liens) : session isolée, en mémoire, sans cookies de l'utilisateur.

let previewSession = null
function netSession() {
  if (!previewSession) {
    previewSession = session.fromPartition('cymd-previews')
    previewSession.setUserAgent(USER_AGENT, 'fr-FR,fr;q=0.9,en;q=0.8')
  }
  return previewSession
}

function checkHttpUrl(url) {
  const u = new URL(url)
  if (u.protocol !== 'http:' && u.protocol !== 'https:') throw new Error('URL non supportée')
  return u.toString()
}

async function readLimited(res, max, truncate) {
  if (!res.body) return Buffer.alloc(0)
  const reader = res.body.getReader()
  const chunks = []
  let total = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    total += value.byteLength
    if (total > max) {
      reader.cancel().catch(() => {})
      if (!truncate) throw new Error('Fichier trop volumineux')
      chunks.push(Buffer.from(value.subarray(0, value.byteLength - (total - max))))
      break
    }
    chunks.push(Buffer.from(value))
  }
  return Buffer.concat(chunks)
}

async function timedFetch(url, accept) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 12000)
  try {
    const res = await netSession().fetch(checkHttpUrl(url), {
      signal: ctrl.signal,
      redirect: 'follow',
      headers: { Accept: accept, 'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8' },
    })
    return { res, done: () => clearTimeout(timer) }
  } catch (err) {
    clearTimeout(timer)
    throw err
  }
}

async function fetchText(url) {
  const { res, done } = await timedFetch(url, 'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8')
  try {
    const contentType = res.headers.get('content-type') || ''
    const textual = /html|xml|json|text\//i.test(contentType)
    if (!textual) {
      res.body?.cancel().catch(() => {})
      return { url: res.url || url, status: res.status, contentType, text: '' }
    }
    const buf = await readLimited(res, 1_500_000, true)
    let charset = /charset=([\w-]+)/i.exec(contentType)?.[1]
    if (!charset) charset = /<meta[^>]+charset=["']?([\w-]+)/i.exec(buf.subarray(0, 4096).toString('latin1'))?.[1]
    let text
    try { text = new TextDecoder(charset || 'utf-8').decode(buf) } catch { text = buf.toString('utf8') }
    return { url: res.url || url, status: res.status, contentType, text }
  } finally {
    done()
  }
}

async function fetchBinary(url) {
  const { res, done } = await timedFetch(url, 'image/*,video/*,*/*;q=0.8')
  try {
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await readLimited(res, 15_000_000, false)
    return { data: new Uint8Array(data), contentType: res.headers.get('content-type') || '' }
  } finally {
    done()
  }
}

// ---------------------------------------------------------------------------
// Fenêtres

function focusWin(win) {
  if (win.isMinimized()) win.restore()
  win.focus()
}

function askUnsaved(win, name) {
  const choice = dialog.showMessageBoxSync(win, {
    type: 'warning',
    title: 'CyMD',
    message: `Voulez-vous enregistrer les modifications de « ${name} » ?`,
    detail: 'Vos modifications seront perdues si vous ne les enregistrez pas.',
    buttons: ['Enregistrer', 'Ne pas enregistrer', 'Annuler'],
    defaultId: 0,
    cancelId: 2,
    noLink: true,
  })
  return ['save', 'discard', 'cancel'][choice]
}

async function loadIntoWindow(ctx, filePath) {
  try {
    const data = await fsp.readFile(filePath)
    grant(ctx, filePath)
    ctx.paths.add(key(filePath))
    app.addRecentDocument(filePath)
    ctx.win.webContents.send('doc:load', { path: filePath, data: new Uint8Array(data) })
    focusWin(ctx.win)
  } catch (err) {
    dialog.showErrorBox('CyMD', `Impossible d'ouvrir « ${filePath} » :\n${err.message}`)
  }
}

/** Fenêtre (déjà chargée) qui contient ce fichier dans un de ses onglets. */
function windowWithPath(abs) {
  for (const ctx of wins.values()) if (ctx.paths.has(key(abs))) return ctx
  return null
}

/** Dernière fenêtre utilisée, prête à recevoir un onglet. */
function targetWindow() {
  const focused = lastFocused && !lastFocused.isDestroyed() ? wins.get(lastFocused.webContents.id) : null
  if (focused?.ready) return focused
  for (const ctx of wins.values()) if (ctx.ready) return ctx
  return null
}

/** Ouvre un fichier : active son onglet s'il est déjà ouvert, sinon un nouvel onglet. */
function openPath(filePath) {
  const abs = path.resolve(filePath)
  const owner = windowWithPath(abs)
  if (owner) {
    owner.win.webContents.send('tab:focusPath', abs)
    return focusWin(owner.win)
  }
  const target = targetWindow()
  if (target) return loadIntoWindow(target, abs)
  createWindow({ files: [abs] })
}

// Icône de fenêtre (Linux, mode dev) et de la boîte « À propos ». Générée par scripts/make-icons.ps1.
const APP_ICON = path.join(__dirname, 'icon.png')

let lastFocused = null
let detachSeq = 0
const pendingDetach = new Map()

/** Demande à une fenêtre de retirer un onglet et de le renvoyer sérialisé. */
function requestDetach(ctx, tabId) {
  return new Promise((resolve) => {
    const id = ++detachSeq
    const timer = setTimeout(() => {
      pendingDetach.delete(id)
      resolve(null)
    }, 5000)
    pendingDetach.set(id, (payload) => {
      clearTimeout(timer)
      resolve(payload)
    })
    ctx.win.webContents.send('tab:detach', id, tabId)
  })
}

/**
 * @param {{ files?: string[], attach?: object, bounds?: Electron.Rectangle }} [opts]
 *   files : fichiers à ouvrir ; attach : onglet déplacé depuis une autre fenêtre.
 */
function createWindow(opts = {}) {
  const win = new BrowserWindow({
    width: opts.bounds?.width ?? 1100,
    height: opts.bounds?.height ?? 800,
    ...(opts.bounds ? { x: opts.bounds.x, y: opts.bounds.y } : {}),
    minWidth: 420,
    minHeight: 300,
    show: false,
    title: 'CyMD',
    icon: APP_ICON,
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#1e1f22' : '#ffffff',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: true,
    },
  })
  const wc = win.webContents
  const id = wc.id
  /** @type {WinCtx} */
  const ctx = {
    win, paths: new Set(), dirty: false, ready: false, forceClose: false,
    pending: (opts.files ?? []).map((f) => path.resolve(f)), attach: opts.attach ?? null, grants: new Set(),
  }
  wins.set(id, ctx)

  win.once('ready-to-show', () => win.show())
  win.on('page-title-updated', (e) => e.preventDefault()) // le titre vient de doc:state
  win.on('focus', () => (lastFocused = win))
  win.on('closed', () => wins.delete(id))
  win.on('close', (e) => {
    if (ctx.forceClose || !ctx.dirty) return
    // Des onglets ne sont pas enregistrés : le rendu demande pour chacun, puis ferme.
    e.preventDefault()
    wc.send('cmd', 'close-window')
  })

  // Aucune navigation dans la fenêtre : les liens partent dans le navigateur.
  wc.setWindowOpenHandler(({ url }) => { openExternalSafe(url); return { action: 'deny' } })
  wc.on('will-navigate', (e, url) => {
    const current = wc.getURL()
    const sameApp = DEV_URL ? url.startsWith(DEV_URL) : url.split('#')[0] === current.split('#')[0]
    if (!sameApp) { e.preventDefault(); openExternalSafe(url) }
  })
  wc.on('context-menu', (_e, params) => showContextMenu(wc, params))

  if (DEV_URL) win.loadURL(DEV_URL)
  else win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  return win
}

function showContextMenu(wc, params) {
  const items = []
  if (params.misspelledWord) {
    for (const s of params.dictionarySuggestions.slice(0, 6)) items.push({ label: s, click: () => wc.replaceMisspelling(s) })
    if (!params.dictionarySuggestions.length) items.push({ label: 'Aucune suggestion', enabled: false })
    items.push({ label: 'Ajouter au dictionnaire', click: () => wc.session.addWordToSpellCheckerDictionary(params.misspelledWord) })
    items.push({ type: 'separator' })
  }
  if (params.linkURL && /^(https?|mailto):/i.test(params.linkURL)) {
    items.push({ label: 'Ouvrir le lien', click: () => openExternalSafe(params.linkURL) })
    items.push({ label: 'Copier le lien', click: () => clipboard.writeText(params.linkURL) })
    items.push({ type: 'separator' })
  }
  if (params.mediaType === 'image') {
    items.push({ label: "Copier l'image", click: () => wc.copyImageAt(params.x, params.y) })
    items.push({ type: 'separator' })
  }
  if (params.isEditable) {
    items.push(
      { role: 'cut', label: 'Couper', enabled: params.editFlags.canCut },
      { role: 'copy', label: 'Copier', enabled: params.editFlags.canCopy },
      { role: 'paste', label: 'Coller', enabled: params.editFlags.canPaste },
      { label: 'Coller en texte brut', enabled: params.editFlags.canPaste, click: () => wc.send('cmd', 'paste-plain') },
      { type: 'separator' },
      { role: 'selectAll', label: 'Tout sélectionner' },
    )
  } else if (params.selectionText) {
    items.push({ role: 'copy', label: 'Copier' })
  }
  while (items.length && items[items.length - 1].type === 'separator') items.pop()
  if (items.length) Menu.buildFromTemplate(items).popup({ window: BrowserWindow.fromWebContents(wc) })
}

// ---------------------------------------------------------------------------
// Menu de l'application. Les raccourcis gérés par le rendu (Ctrl+S, Ctrl+B…) sont
// affichés mais pas interceptés (registerAccelerator: false) pour éviter les doublons.

function send(cmd, arg) {
  const win = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0]
  if (win) win.webContents.send('cmd', cmd, arg)
  else if (cmd === 'new-tab' || cmd === 'open') createWindow()
}

function item(label, accelerator, cmd, arg) {
  return { label, accelerator, registerAccelerator: false, click: () => send(cmd, arg) }
}

function buildMenu() {
  const sep = { type: 'separator' }
  const template = [
    ...(isMac ? [{ role: 'appMenu' }] : []),
    {
      label: '&Fichier',
      submenu: [
        item('Nouvel onglet', 'CmdOrCtrl+T', 'new-tab'),
        { label: 'Nouvelle fenêtre', accelerator: 'CmdOrCtrl+Shift+N', click: () => createWindow() },
        item('Ouvrir…', 'CmdOrCtrl+O', 'open'),
        sep,
        item('Enregistrer', 'CmdOrCtrl+S', 'save'),
        item('Enregistrer sous…', 'CmdOrCtrl+Shift+S', 'save-as'),
        sep,
        item('Exporter en HTML…', undefined, 'export-html'),
        item("Afficher dans l'explorateur", undefined, 'show-in-folder'),
        sep,
        item("Fermer l'onglet", 'CmdOrCtrl+W', 'close-tab'),
        { role: 'close', label: 'Fermer la fenêtre', accelerator: 'CmdOrCtrl+Shift+W' },
        ...(isMac ? [] : [{ role: 'quit', label: 'Quitter' }]),
      ],
    },
    {
      label: '&Édition',
      submenu: [
        item('Annuler', 'CmdOrCtrl+Z', 'undo'),
        item('Rétablir', 'CmdOrCtrl+Y', 'redo'),
        sep,
        { role: 'cut', label: 'Couper' },
        { role: 'copy', label: 'Copier' },
        { role: 'paste', label: 'Coller' },
        item('Coller en texte brut', 'CmdOrCtrl+Shift+V', 'paste-plain'),
        { role: 'selectAll', label: 'Tout sélectionner' },
        sep,
        item('Rechercher / Remplacer…', 'CmdOrCtrl+F', 'find'),
        sep,
        item('Insérer une image ou une vidéo…', undefined, 'insert-media'),
      ],
    },
    {
      label: 'F&ormat',
      submenu: [
        item('Gras', 'CmdOrCtrl+B', 'format', 'bold'),
        item('Italique', 'CmdOrCtrl+I', 'format', 'italic'),
        item('Souligné', 'CmdOrCtrl+U', 'format', 'underline'),
        item('Barré', 'CmdOrCtrl+Shift+X', 'format', 'strike'),
        item('Code', 'CmdOrCtrl+E', 'format', 'code'),
        item('Spoiler', undefined, 'format', 'spoiler'),
        item('Lien', 'CmdOrCtrl+K', 'format', 'link'),
        sep,
        // Pas de Ctrl+Alt+chiffre : c'est AltGr sur les claviers AZERTY (#, ~, @…).
        item('Titre 1', 'CmdOrCtrl+Shift+1', 'format', 'h1'),
        item('Titre 2', 'CmdOrCtrl+Shift+2', 'format', 'h2'),
        item('Titre 3', 'CmdOrCtrl+Shift+3', 'format', 'h3'),
        sep,
        item('Liste à puces', 'CmdOrCtrl+Shift+8', 'format', 'bullet'),
        item('Liste numérotée', 'CmdOrCtrl+Shift+7', 'format', 'ordered'),
        item('Case à cocher', 'CmdOrCtrl+Shift+9', 'format', 'task'),
        item('Citation', 'CmdOrCtrl+Shift+.', 'format', 'quote'),
        sep,
        item('Bloc de code', undefined, 'format', 'codeblock'),
        item('Tableau', undefined, 'format', 'table'),
        item('Ligne horizontale', undefined, 'format', 'hr'),
      ],
    },
    {
      label: '&Affichage',
      submenu: [
        item('Live', 'CmdOrCtrl+1', 'mode', 'live'),
        item('Côte à côte', 'CmdOrCtrl+2', 'mode', 'split'),
        item('Brut', 'CmdOrCtrl+3', 'mode', 'raw'),
        item('Lecture', 'CmdOrCtrl+4', 'mode', 'read'),
        sep,
        item('Numéros de ligne', undefined, 'toggle-line-numbers'),
        item('Onglet suivant', 'CmdOrCtrl+Tab', 'next-tab'),
        item('Onglet précédent', 'CmdOrCtrl+Shift+Tab', 'prev-tab'),
        sep,
        {
          label: 'Thème',
          submenu: [
            { label: 'Système', click: () => send('theme', 'system') },
            { label: 'Clair', click: () => send('theme', 'light') },
            { label: 'Sombre', click: () => send('theme', 'dark') },
          ],
        },
        item('Largeur de page limitée', undefined, 'toggle-narrow'),
        sep,
        { role: 'zoomIn', label: 'Zoom avant' },
        { role: 'zoomOut', label: 'Zoom arrière' },
        { role: 'resetZoom', label: 'Taille réelle' },
        sep,
        { role: 'togglefullscreen', label: 'Plein écran' },
        ...(DEV_URL ? [sep, { role: 'reload', label: 'Recharger' }] : []),
        { role: 'toggleDevTools', label: 'Outils de développement' },
      ],
    },
    {
      label: 'Ai&de',
      submenu: [
        item("Document d'exemple", undefined, 'open-guide'),
        { label: 'Rechercher des mises à jour…', click: () => { void updates.check() } },
        sep,
        {
          label: 'À propos de CyMD',
          click: () => dialog.showMessageBox(BrowserWindow.getFocusedWindow(), {
            type: 'info',
            icon: nativeImage.createFromPath(APP_ICON).resize({ width: 96, height: 96, quality: 'best' }),
            title: 'À propos de CyMD',
            message: `CyMD ${app.getVersion()}`,
            detail: `Éditeur et lecteur Markdown.\n\nElectron ${process.versions.electron} · Chromium ${process.versions.chrome} · Node ${process.versions.node}`,
          }),
        },
      ],
    },
  ]
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

// ---------------------------------------------------------------------------
// IPC

function ctxOf(e) {
  return wins.get(e.sender.id)
}

ipcMain.on('app:ready', async (e) => {
  const ctx = ctxOf(e)
  if (!ctx) return
  ctx.ready = true
  if (ctx.attach) {
    const payload = ctx.attach
    ctx.attach = null
    ctx.win.webContents.send('tab:attach', payload, -1)
  }
  for (const p of ctx.pending.splice(0)) await loadIntoWindow(ctx, p)
})

ipcMain.handle('window:id', (e) => e.sender.id)

ipcMain.on('doc:state', (e, s) => {
  const ctx = ctxOf(e)
  if (!ctx) return
  ctx.paths = new Set((s.paths || []).map(key))
  ctx.dirty = !!s.dirty
  ctx.win.setTitle(s.title || 'CyMD')
  if (isMac) ctx.win.setDocumentEdited(!!s.dirty)
})

// Onglet déposé dans cette fenêtre depuis une autre : on le demande à la fenêtre d'origine.
ipcMain.handle('tab:moveHere', async (e, fromId, tabId, index) => {
  const target = ctxOf(e)
  const source = wins.get(fromId)
  if (!target || !source || source === target) return false
  const payload = await requestDetach(source, tabId)
  if (!payload) return false
  if (payload.path && source.grants.has(key(payload.path))) grant(target, payload.path)
  target.win.webContents.send('tab:attach', payload, index)
  focusWin(target.win)
  return true
})

ipcMain.on('tab:detach-reply', (_e, id, payload) => {
  const done = pendingDetach.get(id)
  if (done) {
    pendingDetach.delete(id)
    done(payload)
  }
})

// Onglet lâché hors de toute fenêtre : nouvelle fenêtre à cet endroit.
ipcMain.handle('tab:tearOff', (e, payload, screenX, screenY) => {
  const source = ctxOf(e)
  const [width, height] = source.win.getSize()
  const win = createWindow({
    attach: payload,
    bounds: { x: Math.round(screenX - 120), y: Math.round(screenY - 20), width, height },
  })
  const ctx = wins.get(win.webContents.id)
  if (payload?.path && source.grants.has(key(payload.path))) grant(ctx, payload.path)
})

const FILTER_MD = { name: 'Markdown', extensions: ['md', 'markdown'] }
const FILTER_CYMD = { name: 'Document CyMD tout-en-un', extensions: ['cymd'] }

ipcMain.handle('dialog:open', async (e) => {
  const ctx = ctxOf(e)
  const r = await dialog.showOpenDialog(ctx.win, {
    title: 'Ouvrir',
    defaultPath: ctx.lastDir,
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Documents (md, cymd)', extensions: ['md', 'markdown', 'cymd', 'txt'] },
      FILTER_CYMD,
      FILTER_MD,
      { name: 'Tous les fichiers', extensions: ['*'] },
    ],
  })
  if (r.canceled) return []
  const files = []
  for (const filePath of r.filePaths) {
    try {
      const data = await fsp.readFile(filePath)
      grant(ctx, filePath)
      app.addRecentDocument(filePath)
      files.push({ path: filePath, data: new Uint8Array(data) })
    } catch (err) {
      dialog.showErrorBox('CyMD', `Impossible d'ouvrir « ${filePath} » :\n${err.message}`)
    }
  }
  return files
})

ipcMain.handle('dialog:save', async (e, opts) => {
  const ctx = ctxOf(e)
  const baseDir = ctx.lastDir ?? app.getPath('documents')
  const r = await dialog.showSaveDialog(ctx.win, {
    title: 'Enregistrer sous',
    defaultPath: path.join(baseDir, opts.defaultName || 'Sans titre.md'),
    filters: opts.kind === 'cymd' ? [FILTER_CYMD, FILTER_MD] : [FILTER_MD, FILTER_CYMD],
  })
  if (r.canceled || !r.filePath) return null
  grant(ctx, r.filePath)
  return r.filePath
})

ipcMain.handle('dialog:saveHtml', async (e, defaultName) => {
  const ctx = ctxOf(e)
  const baseDir = ctx.lastDir ?? app.getPath('documents')
  const r = await dialog.showSaveDialog(ctx.win, {
    title: 'Exporter en HTML',
    defaultPath: path.join(baseDir, defaultName),
    filters: [{ name: 'Page HTML', extensions: ['html'] }],
  })
  if (r.canceled || !r.filePath) return null
  grant(ctx, r.filePath)
  return r.filePath
})

ipcMain.handle('dialog:unsaved', (e, name) => askUnsaved(ctxOf(e).win, name))

ipcMain.handle('dialog:error', (e, message) => {
  dialog.showMessageBox(ctxOf(e).win, { type: 'error', title: 'CyMD', message })
})

ipcMain.handle('file:write', async (e, filePath, data) => {
  requireGrant(ctxOf(e), filePath)
  // Écriture via fichier temporaire pour ne jamais laisser un document à moitié écrit.
  const tmp = `${filePath}.cymd-tmp`
  await fsp.writeFile(tmp, data)
  try {
    await fsp.rename(tmp, filePath)
  } catch {
    await fsp.writeFile(filePath, data)
    await fsp.rm(tmp, { force: true })
  }
  return true
})

ipcMain.handle('asset:read', async (e, docPath, rel) => {
  requireGrant(ctxOf(e), docPath)
  try {
    return new Uint8Array(await fsp.readFile(resolveInside(docPath, rel)))
  } catch {
    return null
  }
})

ipcMain.handle('asset:exists', async (e, docPath, rel) => {
  requireGrant(ctxOf(e), docPath)
  try {
    return (await fsp.stat(resolveInside(docPath, rel))).isFile()
  } catch {
    return false
  }
})

ipcMain.handle('asset:write', async (e, docPath, rel, data) => {
  requireGrant(ctxOf(e), docPath)
  const target = resolveInside(docPath, rel)
  await fsp.mkdir(path.dirname(target), { recursive: true })
  await fsp.writeFile(target, data)
  return true
})

ipcMain.handle('net:fetchText', (_e, url) => fetchText(url))
ipcMain.handle('net:fetchBinary', (_e, url) => fetchBinary(url))

ipcMain.handle('shell:openExternal', (_e, url) => openExternalSafe(url))

ipcMain.handle('shell:openLinked', async (e, docPath, rel) => {
  requireGrant(ctxOf(e), docPath)
  const target = resolveInside(docPath, rel)
  if (!fs.existsSync(target)) return false
  if (DOC_EXTS.has(path.extname(target).toLowerCase())) openPath(target)
  else shell.showItemInFolder(target) // jamais d'exécution directe d'un fichier lié
  return true
})

ipcMain.handle('shell:showInFolder', (e, filePath) => {
  if (typeof filePath === 'string' && ctxOf(e)?.grants.has(key(filePath))) shell.showItemInFolder(filePath)
})

// Fichier .md/.cymd glissé depuis l'explorateur sur une fenêtre : un onglet dans celle-ci.
ipcMain.handle('window:openFile', async (e, filePath) => {
  if (typeof filePath !== 'string' || !DOC_EXTS.has(path.extname(filePath).toLowerCase())) return false
  if (!fs.existsSync(filePath)) return false
  const abs = path.resolve(filePath)
  const owner = windowWithPath(abs)
  if (owner) {
    owner.win.webContents.send('tab:focusPath', abs)
    focusWin(owner.win)
  } else await loadIntoWindow(ctxOf(e), abs)
  return true
})

ipcMain.handle('window:new', () => { createWindow() })

ipcMain.handle('window:close', (e) => {
  const ctx = ctxOf(e)
  ctx.forceClose = true
  ctx.win.close()
})

ipcMain.handle('theme:set', (_e, theme) => {
  nativeTheme.themeSource = ['light', 'dark'].includes(theme) ? theme : 'system'
})

ipcMain.handle('clipboard:readText', () => clipboard.readText())

// ---------------------------------------------------------------------------
// Démarrage

function filesFromArgv(argv, cwd) {
  const out = []
  for (const a of argv) {
    if (!a || a.startsWith('-')) continue
    const p = path.resolve(cwd || process.cwd(), a)
    try {
      if (DOC_EXTS.has(path.extname(p).toLowerCase()) && fs.statSync(p).isFile()) out.push(p)
    } catch {
      /* argument qui n'est pas un fichier */
    }
  }
  return out
}

const pendingOpenFiles = []

if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  // CyMD déjà lancé : les fichiers ouverts depuis l'explorateur arrivent en onglets
  // dans la fenêtre existante (instantané, pas de nouveau démarrage).
  app.on('second-instance', (_e, argv, cwd) => {
    const files = filesFromArgv(argv.slice(1), cwd)
    if (files.length) files.forEach(openPath)
    else createWindow()
  })

  // macOS : ouverture via le Finder
  app.on('open-file', (e, filePath) => {
    e.preventDefault()
    if (app.isReady()) openPath(filePath)
    else pendingOpenFiles.push(filePath)
  })

  app.whenReady().then(() => {
    registerAssetProtocol()
    buildMenu()
    // Le lecteur YouTube intégré exige un Referer (erreur 153 sinon). Une page chargée
    // depuis file:// n'en envoie pas : on fournit l'identifiant de l'app, comme le
    // recommande YouTube pour les applications natives.
    session.defaultSession.webRequest.onBeforeSendHeaders(
      { urls: ['https://www.youtube-nocookie.com/embed/*', 'https://www.youtube.com/embed/*'] },
      (details, callback) => {
        const headers = details.requestHeaders
        if (!headers.Referer && !headers.referer) headers.Referer = `https://${APP_ID}/`
        callback({ requestHeaders: headers })
      },
    )
    try {
      const langs = session.defaultSession.availableSpellCheckerLanguages
      const wanted = ['fr', 'fr-FR', 'en-US'].filter((l) => langs.includes(l))
      if (wanted.length) session.defaultSession.setSpellCheckerLanguages(wanted)
    } catch {
      /* Windows/macOS : correcteur du système */
    }

    // Tous les fichiers passés au lancement s'ouvrent en onglets d'une même fenêtre.
    createWindow({ files: [...filesFromArgv(process.argv.slice(1)), ...pendingOpenFiles] })
    updates.start()

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })

  app.on('window-all-closed', () => {
    if (!isMac) app.quit()
  })
}
