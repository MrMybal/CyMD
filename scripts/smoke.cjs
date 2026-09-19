'use strict'
// Test de fumée de l'app Electron : lance CyMD, exécute un script dans la première
// fenêtre, puis (optionnel) un second script dans les autres fenêtres, capture chaque
// fenêtre et enregistre les résultats, puis quitte.
//
//   electron scripts/smoke.cjs <fichier-a-ouvrir?>
//   SMOKE_SCRIPT=etapes.js    corps d'une fonction async exécutée dans la 1re fenêtre
//   SMOKE_OTHERS=autres.js    exécuté ensuite dans les autres fenêtres ; __FIRST__ est
//                             remplacé par l'id de la 1re fenêtre, __RESULT__ par son résultat
//   SMOKE_OUT=dossier         capture-<n>.png, result.json
//   SMOKE_SAVE_PATH=chemin    remplace la boîte « Enregistrer sous »

const { app, dialog, BrowserWindow } = require('electron')
const fs = require('node:fs')
const path = require('node:path')
const os = require('node:os')

const out = process.env.SMOKE_OUT || path.join(os.tmpdir(), 'cymd-smoke')
fs.mkdirSync(out, { recursive: true })
const read = (p) => (p ? fs.readFileSync(p, 'utf8') : null)
const script = read(process.env.SMOKE_SCRIPT) ?? 'return document.title'
const others = read(process.env.SMOKE_OTHERS)

if (process.env.SMOKE_SAVE_PATH) {
  dialog.showSaveDialog = async () => ({ canceled: false, filePath: process.env.SMOKE_SAVE_PATH })
}

const run = (win, code) => win.webContents.executeJavaScript(`(async () => { ${code}\n })()`, true)
const wait = (ms) => new Promise((r) => setTimeout(r, ms))
let started = false

app.on('browser-window-created', (_e, first) => {
  if (started) return
  started = true
  first.webContents.once('did-finish-load', async () => {
    const result = {}
    try {
      await wait(Number(process.env.SMOKE_DELAY || 1500))
      result.first = await run(first, script)
      if (others) {
        await wait(1500)
        const code = others.replaceAll('__FIRST__', String(first.webContents.id)).replaceAll('__RESULT__', JSON.stringify(result.first))
        result.others = []
        for (const w of BrowserWindow.getAllWindows()) if (w !== first && !w.isDestroyed()) result.others.push(await run(w, code))
        await wait(1500)
      }
    } catch (err) {
      result.error = String(err && err.stack ? err.stack : err)
    }
    result.windows = []
    let i = 0
    for (const w of BrowserWindow.getAllWindows()) {
      if (w.isDestroyed()) continue
      i++
      try {
        fs.writeFileSync(path.join(out, `capture-${i}.png`), (await w.webContents.capturePage()).toPNG())
        const tabs = await run(w, "return [...document.querySelectorAll('.tab')].map(t => t.querySelector('.tab-title').textContent + (t.classList.contains('active') ? '*' : '') + (t.classList.contains('dirty') ? ' •' : ''))")
        result.windows.push({ id: w.webContents.id, title: w.getTitle(), tabs })
      } catch (err) {
        result.windows.push({ error: String(err) })
      }
    }
    fs.writeFileSync(path.join(out, 'result.json'), JSON.stringify(result, null, 2))
    if (!process.env.SMOKE_KEEP) {
      for (const w of BrowserWindow.getAllWindows()) w.destroy()
      app.exit(0)
    }
  })
})

require('../electron/main.cjs')
