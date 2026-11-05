'use strict'
const path = require('node:path')
const { pathToFileURL } = require('node:url')
const fs = require('node:fs')

function createHelp({ app, BrowserWindow, nativeTheme, shell, session, getLanguage }) {
  let window = null
  let configured = false
  let pending = Promise.resolve()
  const assets = process.env.VITE_DEV_SERVER_URL ? 'public' : 'dist'
  const base = pathToFileURL(path.join(app.getAppPath(), assets, 'help/index.html')).href
  // CyDoc's public route API is bundled at build time.
  const { helpLink } = require(path.join(app.getAppPath(), assets, 'help-links.cjs'))
  function allowed(url) {
    try { const u = new URL(url); u.hash = ''; return u.href === base } catch { return false }
  }
  function external(url) {
    try { if (['https:', 'http:', 'mailto:'].includes(new URL(url).protocol)) void shell.openExternal(url) } catch {}
  }
  async function navigate(target = 'overview') {
    if (!fs.existsSync(path.join(app.getAppPath(), assets, 'help/index.html'))) throw new Error('Local documentation is missing. Run npm run build.')
    const url = helpLink(base, getLanguage(), target)
    if (!window || window.isDestroyed()) {
      const helpSession = session.fromPartition('persist:cymd-help')
      if (!configured) {
        configured = true
        helpSession.setPermissionRequestHandler((_contents, _permission, callback) => callback(false))
        helpSession.webRequest.onBeforeRequest((details, callback) => {
          callback({ cancel: !['file:', 'data:', 'blob:'].includes(new URL(details.url).protocol) })
        })
      }
      window = new BrowserWindow({
        width: 1180, height: 820, minWidth: 640, minHeight: 480,
        title: 'CyMD — Documentation', icon: path.join(__dirname, 'icon.png'),
        backgroundColor: nativeTheme.shouldUseDarkColors ? '#171a20' : '#ffffff',
        webPreferences: { sandbox: true, contextIsolation: true, nodeIntegration: false, session: helpSession },
      })
      window.setMenu(null)
      window.webContents.setWindowOpenHandler(({ url }) => { external(url); return { action: 'deny' } })
      window.webContents.on('will-navigate', (event, destination) => {
        if (!allowed(destination)) { event.preventDefault(); external(destination) }
      })
      window.webContents.on('before-input-event', (event, input) => {
        if (input.key === 'F1') event.preventDefault()
      })
      window.on('closed', () => { window = null })
      await window.loadURL(url)
    } else {
      if (window.webContents.getURL() !== url) await window.loadURL(url)
      if (window.isMinimized()) window.restore()
      window.focus()
    }
  }
  function open(target = 'overview') {
    pending = pending.catch(() => {}).then(() => navigate(target))
    return pending
  }
  return { open, close: () => window?.close() }
}
module.exports = { createHelp }
