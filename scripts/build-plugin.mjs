import { cpSync, mkdirSync, readFileSync, writeFileSync, readdirSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { execFileSync } from 'node:child_process'
import { zipSync } from 'fflate'

const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
const root = 'release/plugin'
const generated = resolve(root)
if (generated !== resolve(process.cwd(), 'release', 'plugin')) throw new Error('Invalid plugin output directory')
rmSync(generated, { recursive: true, force: true })
mkdirSync(root, { recursive: true })
cpSync('dist', root, { recursive: true })
cpSync('LICENSE', `${root}/LICENSE.txt`)
const manifest = { id: 'cymd', name: 'CyMD', type: 'document', enabled: false,
  version: pkg.version, license: pkg.license, entry: 'index.html',
  protocol: 'cymd.integration', protocolVersion: 1, extensions: ['.cymd', '.md', '.markdown'], button: 'Ouvrir CyMD' }
writeFileSync(`${root}/plugin.json`, JSON.stringify(manifest, null, 2) + '\n')
// Only version-controlled source belongs in the distributed archive.
const tracked = execFileSync('git', ['-c', `safe.directory=${process.cwd().replaceAll('\\', '/')}`, 'ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean)
const files = new Set([...tracked, 'src/platform/embedded.ts', 'scripts/build-plugin.mjs', 'docs/integration.md'])
const source = {}
for (const file of files) source[file] = readFileSync(file)
writeFileSync(`${root}/source.zip`, zipSync(source))
const bundle = {}
function collect(dir, prefix = '') {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const name = prefix + entry.name
    if (entry.isDirectory()) collect(`${dir}/${entry.name}`, `${name}/`)
    else bundle[name] = readFileSync(`${dir}/${entry.name}`)
  }
}
collect(root)
writeFileSync('release/CyMD-plugin.zip', zipSync(bundle))
console.log(`Plugin built in ${root}`)
