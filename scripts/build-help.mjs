import { readFileSync, writeFileSync, rmSync, cpSync, readdirSync } from 'node:fs'
import { resolve, dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { zipSync } from 'fflate'
import { createDocumentation, hasAnchor } from 'cydoc'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
process.chdir(root)
const cydocRoot = resolve(dirname(fileURLToPath(import.meta.resolve('cydoc'))), '..')
const require = createRequire(join(cydocRoot, 'package.json'))
const { build } = require('esbuild')
const output = resolve(root, 'public/help')
if (relative(root, output).replaceAll('\\', '/') !== 'public/help') throw new Error('Invalid help output')
rmSync(output, { recursive: true, force: true })
const config = JSON.parse(readFileSync('cydoc.config.json', 'utf8'))
const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
if (config.version !== pkg.version) {
  config.version = pkg.version
  writeFileSync('cydoc.config.json', JSON.stringify(config, null, 2) + '\n')
}
execFileSync(process.execPath, [join(cydocRoot, 'tools/cli.mjs'), 'check', 'cydoc.config.json'], { stdio: 'inherit' })
const data = JSON.parse(readFileSync(join(output, 'manifest.json'), 'utf8'))
const docs = createDocumentation(data)
const targets = JSON.parse(readFileSync('src/help/targets.json', 'utf8'))
for (const locale of ['en', 'fr']) for (const route of Object.values(targets)) {
  const result = docs.resolve(route.pageId, locale)
  if (!result || result.fallback || (route.anchor && !hasAnchor(result.page, route.anchor))) throw new Error(`Invalid help target: ${locale}/${route.pageId}`)
  if (route.state?.media && !result.page.html.includes(`data-cydoc-id="${route.state.media}"`)) throw new Error('Invalid media target')
}
const report = JSON.parse(readFileSync(join(output, 'translation-report.json'), 'utf8'))
if (report.missing.length || report.outdated.length || report.untracked.length) throw new Error('Documentation translations need updating')
for (const page of data.pages.filter(page => page.locale === 'en' && page.kind !== 'source')) {
  const fr = docs.resolve(page.id, 'fr')?.page
  if (!fr || JSON.stringify(page.headings.map(h => h.id).sort()) !== JSON.stringify(fr.headings.map(h => h.id).sort())) throw new Error(`Heading IDs differ: ${page.id}`)
}
cpSync(join(cydocRoot, 'LICENSE'), join(output, 'CyDoc-LICENSE.txt'))
cpSync('LICENSE', join(output, 'CyMD-LICENSE.txt'))
cpSync('manual/examples', join(output, 'examples'), { recursive: true })
cpSync('manual/brand.css', join(output, 'brand.css'))
let html = readFileSync(join(output, 'index.html'), 'utf8')
html = html.replace('</head>', '  <link rel="stylesheet" href="brand.css">\n</head>')
  .replace('<title>CyDoc — Documentation</title>', '<title>CyMD — Documentation</title>')
  .replace('<meta name="description" content="CyDoc — votre documentation, partout. Lecteur local et multilingue pour vos applications.">', '<meta name="description" content="CyMD — Offline user manual / Manuel utilisateur hors ligne">')
html = html.replace('<meta charset="utf-8">', `<meta charset="utf-8">\n  <meta http-equiv="Content-Security-Policy" content="default-src 'self' data: blob:; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'none'; object-src 'none'; base-uri 'none'">`)
writeFileSync(join(output, 'index.html'), html)
await build({ entryPoints: ['src/help/links.ts'], bundle: true, platform: 'node', format: 'cjs', outfile: 'public/help-links.cjs' })
const archive = {}
function collect(dir, prefix = '') {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const name = prefix + entry.name
    if (entry.isDirectory()) collect(join(dir, entry.name), name + '/')
    else archive[name] = readFileSync(join(dir, entry.name))
  }
}
collect(output)
writeFileSync('public/CyMD-help.zip', zipSync(archive))
console.log(`CyMD help: ${data.pages.length} pages, image module only, offline archive ready.`)
