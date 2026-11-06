'use strict'
// Capture actual app UI using a disposable Electron profile and fictional documents.
const { app, BrowserWindow } = require('electron')
const fs = require('node:fs')
const { zipSync } = require('fflate')
const path = require('node:path')
const root = path.resolve(__dirname, '..')
const output = path.join(root, 'output/documentation-captures')
fs.mkdirSync(output, { recursive: true })
app.setPath('userData', fs.mkdtempSync(path.join(output, 'profile-')))
const windows = []
app.on('browser-window-created', (_event, win) => windows.push(win))
const pause = ms => new Promise(resolve => setTimeout(resolve, ms))
async function until(test) {
  for (let i=0;i<150;i++) { try { if(await test())return } catch {} await pause(60) }
  throw new Error('Timed out waiting for capture')
}
require('../electron/main.cjs')
app.whenReady().then(async () => {
  try {
    await until(() => windows.find(w=>w.webContents.getURL().includes('/dist/index.html')))
    const editor=windows.find(w=>w.webContents.getURL().includes('/dist/index.html'))
    await until(()=>editor.webContents.executeJavaScript('!!document.querySelector(".cm-content")'))
    editor.setContentSize(1280,850)
    const logo='assets/logo.png'
    for(const locale of ['en','fr']) {
      await editor.webContents.executeJavaScript('window.cymdNative.setLanguage('+JSON.stringify(locale)+')')
      const markdown=locale==='en'
        ? '# Project notes\n\nWrite **clear ideas**, add *useful details* and keep everything together.\n\n![CyMD|100]('+logo+')\n\n## Today\n\n- [x] Create a note\n- [ ] Add a screenshot\n- [ ] Save the document\n\n> Save as .cymd to share text and images in one file.\n\n| View | Shortcut |\n| --- | --- |\n| Live | Ctrl+1 |\n| Side by side | Ctrl+2 |\n\n~~~javascript\nconst message = "Hello, CyMD";\nconsole.log(message);\n~~~\n'
        : '# Notes du projet\n\nÉcrivez des **idées claires**, ajoutez des *détails utiles* et rassemblez le tout.\n\n![CyMD|100]('+logo+')\n\n## Aujourd’hui\n\n- [x] Créer une note\n- [ ] Ajouter une capture\n- [ ] Enregistrer le document\n\n> Enregistrez en .cymd pour partager texte et images dans un seul fichier.\n\n| Vue | Raccourci |\n| --- | --- |\n| Live | Ctrl+1 |\n| Côte à côte | Ctrl+2 |\n\n~~~javascript\nconst message = "Bonjour, CyMD";\nconsole.log(message);\n~~~\n'
      const data=zipSync({'document.md':new Uint8Array(Buffer.from(markdown)),'assets/logo.png':fs.readFileSync(path.join(root,'public/logo.png'))})
      editor.webContents.send('doc:load',{path:path.join(output,locale==='en'?'Project.cymd':'Projet.cymd'),data})
      await pause(300)
      for (const mode of ['live','split','read']) {
        editor.webContents.send('cmd','mode',mode)
        await pause(250)
        await editor.webContents.executeJavaScript('document.querySelectorAll(".cm-scroller,.pane-preview").forEach(el=>el.scrollTop=0)')
        await pause(80)
        fs.writeFileSync(path.join(root,'.CyDocBuild/assets','cymd-'+mode+'-'+locale+'.jpg'),(await editor.webContents.capturePage()).toJPEG(88))
      }
    }
    console.log('Captured six localized screenshots of the current app.')
    for(const win of windows)if(!win.isDestroyed())win.destroy()
    app.exit(0)
  }catch(error){console.error(error);app.exit(1)}
})
