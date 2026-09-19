import { createRequire } from 'node:module'
import { spawnSync } from 'node:child_process'

const require = createRequire(import.meta.url)
const hosts = { win: 'win32', mac: 'darwin', linux: 'linux' }
const current = Object.keys(hosts).find((key) => hosts[key] === process.platform)
const unpacked = process.argv[2] === 'dir' || process.argv[3] === 'dir'
const target = process.argv[2] === 'dir' ? current : process.argv[2] || current
if (!hosts[target] || hosts[target] !== process.platform) {
  console.error(`Build ${target} on its native operating system (Windows, macOS or Linux).`)
  process.exit(1)
}

const args = [require.resolve('electron-builder/cli.js'), `--${target}`, '--publish', 'never']
if (unpacked) args.push('--dir')
else args.push(target === 'mac' ? '--universal' : '--x64')
// The installed Electron distribution is safe only for this OS and architecture.
if (unpacked || (target !== 'mac' && process.arch === 'x64')) {
  args.push('--config.electronDist=node_modules/electron/dist')
}
const result = spawnSync(process.execPath, args, { stdio: 'inherit', shell: false })
if (result.error) console.error(result.error.message)
process.exit(result.status ?? 1)
