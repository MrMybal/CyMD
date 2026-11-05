import { getLanguage, tr } from '../i18n'
import { helpLink } from './links'

let reader: HTMLDialogElement | undefined
let frame: HTMLIFrameElement
let previousFocus: HTMLElement | null

/** Web/plugin builds use the same exported reader; Electron opens file://. */
export function openBrowserHelp(target = 'overview') {
  if (!reader) {
    reader = document.createElement('dialog')
    reader.className = 'help-dialog'
    reader.setAttribute('aria-label', tr('Documentation CyMD'))
    const bar = document.createElement('div')
    bar.className = 'help-dialog-bar'
    const download = document.createElement('a')
    download.href = `${import.meta.env.BASE_URL}CyMD-help.zip`
    download.download = 'CyMD-help.zip'
    download.textContent = tr('Télécharger le manuel hors ligne')
    const close = document.createElement('button')
    close.type = 'button'
    close.textContent = tr('Fermer la documentation')
    close.addEventListener('click', () => reader!.close())
    bar.append(download, close)
    frame = document.createElement('iframe')
    frame.title = tr('Documentation CyMD')
    frame.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-downloads allow-popups allow-popups-to-escape-sandbox')
    reader.append(bar, frame)
    reader.addEventListener('close', () => previousFocus?.focus())
    document.body.append(reader)
  }
  reader.setAttribute('aria-label', tr('Documentation CyMD'))
  frame.title = tr('Documentation CyMD')
  reader.querySelector('a')!.textContent = tr('Télécharger le manuel hors ligne')
  reader.querySelector('button')!.textContent = tr('Fermer la documentation')
  const base = new URL(`${import.meta.env.BASE_URL}help/index.html`, document.baseURI).href
  const url = helpLink(base, getLanguage(), target)
  if (frame.src !== url) frame.src = url
  if (!reader.open) {
    previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    reader.showModal()
  }
}
