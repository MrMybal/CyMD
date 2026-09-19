'use strict'

const RELEASES_URL = 'https://github.com/MrMybal/CyMD/releases/latest'

function createUpdates({ app, updater, showDialog, openExternal, hasUnsaved, setProgress,
  tr = (text, ...values) => text.replace(/\{(\d+)\}/g, (_match, index) => String(values[index])),
  platform = process.platform, portable = Boolean(process.env.PORTABLE_EXECUTABLE_DIR) }) {
  const supported = app.isPackaged && platform === 'win32' && !portable
  let busy = false
  let downloaded = null
  let available = null
  let timer = null
  let installError = false

  const reportError = () => showDialog({ type: 'warning',
    message: tr('La mise à jour n’a pas pu aboutir.'),
    detail: tr('Vérifiez votre connexion et réessayez plus tard. Une release compatible doit contenir son installeur et le fichier latest.yml.') })

  updater.autoDownload = false
  updater.autoInstallOnAppQuit = false
  updater.allowPrerelease = false
  updater.allowDowngrade = false
  updater.logger = null
  updater.on('update-available', (info) => { available = info })
  updater.on('update-downloaded', (info) => { downloaded = info })
  updater.on('download-progress', ({ percent }) => setProgress(percent / 100))
  // Les erreurs des opérations sont traitées par check ; un listener évite aussi
  // qu'une erreur asynchrone d'installation termine le processus principal.
  updater.on('error', () => {
    installError = true
    if (!busy) void reportError().catch(() => {})
  })

  async function install() {
    const { response } = await showDialog({
      type: 'info', message: tr("CyMD {0} est prêt à être installé.", downloaded.version),
      detail: tr('Enregistrez vos documents avant de redémarrer CyMD.'),
      buttons: [tr('Redémarrer et installer'), tr('Plus tard')], defaultId: 1, cancelId: 1,
    })
    if (response !== 0) return
    if (hasUnsaved()) {
      await showDialog({ type: 'warning', message: tr('Des documents ne sont pas enregistrés.'),
        detail: tr('Enregistrez-les ou fermez-les, puis relancez « Rechercher des mises à jour » dans Aide.') })
      return
    }
    installError = false
    updater.quitAndInstall(false, true)
    if (installError) throw new Error('Installation failed')
  }

  async function check(manual = true) {
    if (busy) {
      if (manual) await showDialog({ type: 'info', message: tr('Une recherche ou un téléchargement est déjà en cours.') })
      return
    }
    busy = true
    try {
      if (!supported) {
        if (manual) {
          const { response } = await showDialog({ type: 'info', message: tr('Mises à jour de CyMD'),
            detail: tr('L’installation automatique est disponible dans la version Windows installée. Les autres versions se téléchargent depuis les releases GitHub.'),
            buttons: [tr('Ouvrir les releases'), tr('Fermer')], cancelId: 1 })
          if (response === 0) await openExternal(RELEASES_URL)
        }
        return
      }
      if (downloaded) return await install()
      available = null
      await updater.checkForUpdates()
      if (!available) {
        if (manual) await showDialog({ type: 'info', message: tr("CyMD {0} est à jour.", app.getVersion()) })
        return
      }
      const { response } = await showDialog({ type: 'info',
        message: tr("CyMD {0} est disponible.", available.version),
        detail: tr("Version actuelle : {0}. Télécharger la mise à jour depuis GitHub ?", app.getVersion()),
        buttons: [tr('Télécharger'), tr('Plus tard')], defaultId: 0, cancelId: 1 })
      if (response !== 0) return
      setProgress(0)
      await updater.downloadUpdate()
      setProgress(-1)
      if (!downloaded) throw new Error('Download incomplete')
      await install()
    } catch {
      if (manual || available) await reportError()
    } finally {
      setProgress(-1)
      busy = false
    }
  }

  return {
    check,
    start() {
      if (!supported || timer) return
      timer = setTimeout(() => { timer = null; void check(false) }, 15000)
      timer.unref?.()
    },
    stop() { clearTimeout(timer); timer = null },
  }
}

module.exports = { createUpdates }
