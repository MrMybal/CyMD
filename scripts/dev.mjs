// Lance le serveur Vite puis Electron pointé dessus (rechargement à chaud du rendu).
// Les fichiers de electron/ relancent Electron quand ils changent.
import { createServer } from 'vite'
import { spawn } from 'node:child_process'
import { watch } from 'node:fs'
import electronPath from 'electron'

const server = await createServer({ configFile: 'vite.config.ts' })
await server.listen()
const url = server.resolvedUrls.local[0]
console.log(`[dev] Vite : ${url}`)

let child = null
let restarting = false

function startElectron() {
  child = spawn(electronPath, ['.', ...process.argv.slice(2)], {
    stdio: 'inherit',
    env: { ...process.env, VITE_DEV_SERVER_URL: url },
  })
  child.on('close', () => {
    if (restarting) {
      restarting = false
      startElectron()
      return
    }
    server.close()
    process.exit(0)
  })
}

let timer = null
watch('electron', () => {
  clearTimeout(timer)
  timer = setTimeout(() => {
    if (!child) return
    console.log('[dev] electron/ modifié, redémarrage…')
    restarting = true
    child.kill()
  }, 200)
})

startElectron()
