import { createRequire } from 'node:module'
import { readdirSync, readFileSync } from 'node:fs'
import { join, basename } from 'node:path'
import assert from 'node:assert/strict'

const require = createRequire(import.meta.url)
const asar = require('@electron/asar')
const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
function archives(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    const path = join(dir, entry.name)
    return entry.isDirectory() ? archives(path) : entry.name === 'app.asar' ? [path] : []
  })
}
const found = archives(process.argv[2] || 'release')
assert.ok(found.length, 'Packaged application must exist')
for (const archive of found) {
  const entries = asar.listPackage(archive).map(path => path.replaceAll('\\', '/').replace(/^\//, ''))
  for (const entry of entries) {
    assert.ok(!/(^|\/)(?:\.git|\.codex|\.claude|\.agents|output|tests)(\/|$)/.test(entry), `Unexpected entry: ${entry}`)
    assert.ok(!/^\.env(?:\.|$)/.test(basename(entry)), `Unexpected configuration: ${entry}`)
  }
  const packed = JSON.parse(asar.extractFile(archive, 'package.json'))
  assert.equal(packed.version, pkg.version)
  assert.equal(packed.main, pkg.main)
  assert.equal(packed.license, 'AGPL-3.0-only')
  for (const file of ['LICENSE', 'electron/main.cjs', 'electron/preload.cjs', 'electron/updates.cjs', 'electron/i18n.cjs', 'electron/help.cjs', 'locales/en.json']) {
    assert.deepEqual(asar.extractFile(archive, file), readFileSync(file), `Packaged source differs: ${file}`)
  }
  assert.ok(entries.includes('dist/index.html'))
  for (const file of ['index.html', 'data.js', 'viewer.js', 'viewer.css', 'brand.css', 'media-image.js', 'assets/cymd-live.jpg', 'assets/cymd-split.jpg', 'assets/cymd-reading.jpg', 'examples/welcome.fr.md', 'examples/welcome.en.md', 'CyDoc-LICENSE.txt', 'CyMD-LICENSE.txt']) {
    assert.deepEqual(asar.extractFile(archive, join('dist', 'help', file)), readFileSync('dist/help/' + file), 'Packaged help differs: ' + file)
  }
  assert.deepEqual(asar.extractFile(archive, 'dist/help-links.cjs'), readFileSync('dist/help-links.cjs'))
  assert.deepEqual(asar.extractFile(archive, 'dist/CyMD-help.zip'), readFileSync('dist/CyMD-help.zip'))
  assert.ok(!entries.some(entry => /dist\/help\/media-(mesh|gif|video|graph|gallery)/.test(entry)))
  assert.ok(!entries.some(entry => /node_modules\/(three|cydoc)\//.test(entry)))
  console.log(`Verified ${archive} (${pkg.version})`)
}
