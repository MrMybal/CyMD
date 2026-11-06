/**
 * @doc integration-api
 * @locale en
 * @title Message API
 * @section Developer reference / Protocol
 * @symbol cymd.integration
 * Exchange documents and acknowledge saves without direct filesystem access.
 *
 * ## Transport and imports {#transport}
 * Use the browser's Window.postMessage API; no CyMD JavaScript SDK import is needed.
 * The editor runs inside an iframe with integration=1, an exact HTTP(S) parentOrigin
 * and a nonempty session. See the [host example](doc:integration#example).
 *
 * ## Signature and return {#signature}
 * ```typescript
 * // Browser API used to send a protocol message; returns void.
 * iframe.contentWindow?.postMessage(message, editorOrigin);
 * ```
 * Results arrive asynchronously as message events. Validate origin, source window,
 * protocol, version and session before handling an event.
 *
 * ## Common fields {#parameters}
 * | Field | Type | Meaning |
 * | --- | --- | --- |
 * | protocol | string | Exactly cymd.integration |
 * | version | number | Exactly 1 |
 * | session | string | Fresh ID shared by this host and iframe |
 * | source | string | host for host messages, cymd for editor events |
 * | type | string | Message name from the table below |
 *
 * ## Messages and results {#messages}
 * | Direction | Type | Additional fields and behavior |
 * | --- | --- | --- |
 * | Editor → host | ready | The host may now send the initial document |
 * | Host → editor | open | name: string, file: Blob or File, locale?: en or fr; accepted once; .md/.markdown/.cymd, at most 50 MiB |
 * | Editor → host | state | title: string, dirty: boolean; use dirty to guard closing |
 * | Host → editor | command | command: save or save-as |
 * | Editor → host | save | requestId: string, name: string, file: Blob |
 * | Host → editor | save-result | Same requestId, ok: boolean, error?: string; acknowledge after storage succeeds |
 * | Editor → host | error | message: string; report the error to the user |
 * | Editor → host | close-request | Ask the host to close, with an unsaved-change check |
 *
 * A missing save-result fails after 60 seconds; the document remains modified.
 * Never acknowledge before storing the Blob. Do not send filesystem paths.
 *
 * ## Related workflow {#workflow}
 * Follow the [save workflow](doc:integration#save) and [resource limits](doc:integration#limits).
 */

/**
 * @doc integration-api
 * @locale fr
 * @title API des messages
 * @section Référence développeur / Protocole
 * @symbol cymd.integration
 * Échangez des documents et confirmez les enregistrements sans accès direct au disque.
 *
 * ## Transport et imports {#transport}
 * Utilisez l’API Window.postMessage du navigateur ; aucun SDK JavaScript CyMD n’est à importer.
 * L’éditeur s’exécute dans une iframe avec integration=1, une origine HTTP(S) exacte dans
 * parentOrigin et un identifiant session non vide. Voir l’[exemple côté hôte](doc:integration#example).
 *
 * ## Signature et retour {#signature}
 * ```typescript
 * // API du navigateur pour envoyer un message du protocole ; retour void.
 * iframe.contentWindow?.postMessage(message, editorOrigin);
 * ```
 * Les résultats arrivent par des événements message. Vérifiez l’origine, la fenêtre source,
 * le protocole, la version et la session avant de les traiter.
 *
 * ## Champs communs {#parameters}
 * | Champ | Type | Signification |
 * | --- | --- | --- |
 * | protocol | string | Exactement cymd.integration |
 * | version | number | Exactement 1 |
 * | session | string | Identifiant neuf partagé entre cet hôte et cette iframe |
 * | source | string | host pour l’hôte, cymd pour les événements de l’éditeur |
 * | type | string | Nom du message décrit ci-dessous |
 *
 * ## Messages et résultats {#messages}
 * | Direction | Type | Champs supplémentaires et comportement |
 * | --- | --- | --- |
 * | Éditeur → hôte | ready | L’hôte peut envoyer le document initial |
 * | Hôte → éditeur | open | name: string, file: Blob ou File, locale?: en ou fr ; accepté une fois ; .md/.markdown/.cymd, 50 Mio maximum |
 * | Éditeur → hôte | state | title: string, dirty: boolean ; vérifiez dirty avant fermeture |
 * | Hôte → éditeur | command | command: save ou save-as |
 * | Éditeur → hôte | save | requestId: string, name: string, file: Blob |
 * | Hôte → éditeur | save-result | Même requestId, ok: boolean, error?: string ; confirmez après réussite du stockage |
 * | Éditeur → hôte | error | message: string ; présentez l’erreur à l’utilisateur |
 * | Éditeur → hôte | close-request | Demande de fermeture avec vérification des modifications non enregistrées |
 *
 * Sans save-result sous 60 secondes, l’enregistrement échoue et le document reste modifié.
 * Ne confirmez pas avant d’avoir stocké le Blob. N’envoyez pas de chemin disque.
 *
 * ## Parcours associé {#workflow}
 * Consultez le [parcours d’enregistrement](doc:integration#save) et les [limites des ressources](doc:integration#limits).
 */

import { setLanguage, tr } from '../i18n'
import { createWebPlatform } from './web'
import type { OpenedFile, Platform } from './types'

const PROTOCOL = 'cymd.integration'
const MAX_BYTES = 50 * 1024 * 1024

/** Explicit, versioned iframe integration; never enabled in the desktop app. */
export function createEmbeddedPlatform(): Platform | null {
  const query = new URLSearchParams(location.search)
  if (query.get('integration') !== '1' || window.parent === window) return null
  const origin = query.get('parentOrigin') || ''
  const session = query.get('session') || ''
  try {
    const url = new URL(origin)
    if (!['http:', 'https:'].includes(url.protocol) || url.origin !== origin || !session) return null
  } catch { return null }
  const web = createWebPlatform()
  let load: (file: OpenedFile) => void = () => {}
  let command: (cmd: string, arg?: string) => void = () => {}
  let opened = false
  const pending = new Map<string, { resolve(): void; reject(error: Error): void; timer: ReturnType<typeof setTimeout> }>()
  const send = (type: string, payload: Record<string, unknown> = {}) => window.parent.postMessage({
    protocol: PROTOCOL, version: 1, session, source: 'cymd', type, ...payload,
  }, origin)
  window.addEventListener('message', async event => {
    const m = event.data
    if (event.source !== window.parent || event.origin !== origin || !m || m.protocol !== PROTOCOL || m.version !== 1 || m.session !== session || m.source !== 'host') return
    if (m.type === 'save-result' && typeof m.requestId === 'string') {
      const item = pending.get(m.requestId)
      if (!item) return
      clearTimeout(item.timer)
      pending.delete(m.requestId)
      m.ok === true ? item.resolve() : item.reject(new Error(typeof m.error === 'string' ? m.error : tr('Enregistrement refusé par l’application hôte.')))
    } else if (m.type === 'open' && !opened) {
      if (!(m.file instanceof Blob) || m.file.size > MAX_BYTES || typeof m.name !== 'string' || !/\.(cymd|md|markdown)$/i.test(m.name)) {
        send('error', { message: tr('Document intégré invalide ou trop volumineux (50 Mo maximum).') })
        return
      }
      opened = true
      try {
        if (m.locale === 'fr' || m.locale === 'en') await setLanguage(m.locale)
        load({ path: null, name: m.name.replace(/^.*[\\/]/, ''), data: new Uint8Array(await m.file.arrayBuffer()), handle: { embedded: true } })
      } catch (error) { send('error', { message: String(error) }) }
    } else if (m.type === 'command' && ['save', 'save-as'].includes(m.command)) command(m.command)
  })
  return {
    ...web,
    embedded: true,
    ready() { send('ready') },
    onLoad(cb) { load = cb },
    onCommand(cb) { command = cb },
    setState(state) { web.setState(state); send('state', { title: state.title, dirty: state.dirty }) },
    async saveDialog(defaultName) {
      const name = window.prompt(tr('Nom du fichier (.md ou .cymd) :'), defaultName)
      if (!name) return null
      if (!/\.(cymd|md|markdown)$/i.test(name)) throw new Error(tr('Utilisez une extension .md ou .cymd.'))
      return { path: null, name: name.replace(/^.*[\\/]/, ''), handle: { embedded: true } }
    },
    async write(target, data) {
      if (!(target.handle as { embedded?: boolean } | undefined)?.embedded) return web.write(target, data)
      if (data.byteLength > MAX_BYTES) throw new Error(tr('Document intégré invalide ou trop volumineux (50 Mo maximum).'))
      const requestId = crypto.randomUUID()
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => { pending.delete(requestId); reject(new Error(tr('L’application hôte ne répond pas. Réessayez l’enregistrement.'))) }, 60000)
        pending.set(requestId, { resolve, reject, timer })
        send('save', { requestId, name: target.name, file: new Blob([data as BlobPart], { type: /\.cymd$/i.test(target.name) ? 'application/x-cymd' : 'text/markdown' }) })
      })
    },
    showError(message) { send('error', { message }); web.showError(message) },
    newWindow() {},
    closeWindow() { send('close-request') },
  }
}
