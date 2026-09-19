'use strict'
// Pont minimal et typé entre le rendu (sandboxé) et le processus principal.
const { contextBridge, ipcRenderer, webUtils } = require('electron')

contextBridge.exposeInMainWorld('cymdNative', {
  platform: process.platform,
  getLanguage: () => ipcRenderer.invoke('language:get'),
  setLanguage: (value) => ipcRenderer.invoke('language:set', value),
  onLanguage: (cb) => ipcRenderer.on('language:changed', (_e, value) => cb(value)),
  ready: () => ipcRenderer.send('app:ready'),
  windowId: () => ipcRenderer.invoke('window:id'),
  setState: (state) => ipcRenderer.send('doc:state', state),
  onCommand: (cb) => {
    ipcRenderer.on('cmd', (_e, cmd, arg) => cb(cmd, arg))
  },
  onLoad: (cb) => {
    ipcRenderer.on('doc:load', (_e, file) => cb(file))
  },
  onFocusPath: (cb) => {
    ipcRenderer.on('tab:focusPath', (_e, filePath) => cb(filePath))
  },
  // Déplacement d'onglets entre fenêtres (le processus principal fait l'intermédiaire).
  onTabDetach: (cb) => {
    ipcRenderer.on('tab:detach', async (_e, requestId, tabId) => {
      let payload = null
      try {
        payload = await cb(tabId)
      } catch {
        payload = null
      }
      ipcRenderer.send('tab:detach-reply', requestId, payload)
    })
  },
  onTabAttach: (cb) => {
    ipcRenderer.on('tab:attach', (_e, payload, index) => cb(payload, index))
  },
  moveTabHere: (fromWindow, tabId, index) => ipcRenderer.invoke('tab:moveHere', fromWindow, tabId, index),
  tearOffTab: (payload, screenX, screenY) => ipcRenderer.invoke('tab:tearOff', payload, screenX, screenY),
  openDialog: () => ipcRenderer.invoke('dialog:open'),
  saveDialog: (opts) => ipcRenderer.invoke('dialog:save', opts),
  saveHtmlDialog: (name) => ipcRenderer.invoke('dialog:saveHtml', name),
  askUnsaved: (name) => ipcRenderer.invoke('dialog:unsaved', name),
  showError: (message) => ipcRenderer.invoke('dialog:error', message),
  writeFile: (filePath, data) => ipcRenderer.invoke('file:write', filePath, data),
  readAsset: (docPath, rel) => ipcRenderer.invoke('asset:read', docPath, rel),
  assetExists: (docPath, rel) => ipcRenderer.invoke('asset:exists', docPath, rel),
  writeAsset: (docPath, rel, data) => ipcRenderer.invoke('asset:write', docPath, rel, data),
  fetchText: (url) => ipcRenderer.invoke('net:fetchText', url),
  fetchBinary: (url) => ipcRenderer.invoke('net:fetchBinary', url),
  openExternal: (url) => ipcRenderer.invoke('shell:openExternal', url),
  openLinked: (docPath, rel) => ipcRenderer.invoke('shell:openLinked', docPath, rel),
  showInFolder: (filePath) => ipcRenderer.invoke('shell:showInFolder', filePath),
  openFile: (filePath) => ipcRenderer.invoke('window:openFile', filePath),
  newWindow: () => ipcRenderer.invoke('window:new'),
  closeWindow: () => ipcRenderer.invoke('window:close'),
  setTheme: (theme) => ipcRenderer.invoke('theme:set', theme),
  readClipboardText: () => ipcRenderer.invoke('clipboard:readText'),
  pathForFile: (file) => {
    try {
      return webUtils.getPathForFile(file) || null
    } catch {
      return null
    }
  },
})
