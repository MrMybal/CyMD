import { readFileSync, writeFileSync, rmSync, cpSync, readdirSync, existsSync } from 'node:fs'
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
const configFile = '.CyDocBuild/cydoc.config.json'
const output = resolve(root, 'Documentation')
function cleanGenerated(directory, marker) {
  const absolute = resolve(directory)
  if (!['Documentation', 'public/Documentation', 'public/help'].includes(relative(root, absolute).replaceAll('\\', '/'))) throw new Error('Invalid generated directory')
  if (existsSync(absolute) && !existsSync(join(absolute, marker))) throw new Error('Refusing to replace an unrecognized directory: ' + directory)
  rmSync(absolute, { recursive: true, force: true })
}
cleanGenerated(output, 'DocData/manifest.json')
const config = JSON.parse(readFileSync(configFile, 'utf8'))
const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
if (config.version !== pkg.version) {
  config.version = pkg.version
  writeFileSync(configFile, JSON.stringify(config, null, 2) + '\n')
}
execFileSync(process.execPath, [join(cydocRoot, 'tools/cli.mjs'), 'check', configFile], { stdio: 'inherit' })
const data = JSON.parse(readFileSync(join(output, 'DocData/manifest.json'), 'utf8'))
const docs = createDocumentation(data)
const targets = JSON.parse(readFileSync('src/help/targets.json', 'utf8'))
for (const locale of ['en', 'fr']) for (const route of Object.values(targets)) {
  const result = docs.resolve(route.pageId, locale)
  if (!result || result.fallback || (route.anchor && !hasAnchor(result.page, route.anchor))) throw new Error('Invalid help target: ' + locale + '/' + route.pageId)
  if (route.state?.media && !result.page.html.includes('data-cydoc-id="' + route.state.media + '"')) throw new Error('Invalid media target')
}
const report = JSON.parse(readFileSync(join(output, 'DocData/translation-report.json'), 'utf8'))
if (report.missing.length || report.outdated.length || report.untracked.some(item => !JSON.stringify(item).includes('integration-api'))) throw new Error('Documentation translations need updating')
for (const page of data.pages.filter(page => page.locale === 'en')) {
  const fr = docs.resolve(page.id, 'fr')?.page
  if (!fr || JSON.stringify(page.headings.map(h => h.id).sort()) !== JSON.stringify(fr.headings.map(h => h.id).sort())) throw new Error('Heading IDs differ: ' + page.id)
  if (page.parent !== fr.parent) throw new Error('Navigation parents differ: ' + page.id)
}
if (data.pages.some(page => page.kind === 'source' || ['development','translation-report'].includes(page.id))) throw new Error('Internal content in public manual')
cpSync(join(cydocRoot, 'LICENSE'), join(output, 'DocData/CyDoc-LICENSE.txt'))
cpSync('LICENSE', join(output, 'DocData/CyMD-LICENSE.txt'))
cpSync('src/examples', join(output, 'DocData/examples'), { recursive: true })
// Copy the unmodified CyDoc export to the browser distribution.
cleanGenerated('public/Documentation', 'DocData/manifest.json')
cpSync(output, 'public/Documentation', { recursive: true })
// Preserve previous Pages URLs without retaining a second, obsolete manual.
cleanGenerated('public/help', 'index.html')
cpSync('.CyDocBuild/compat', 'public/help', { recursive: true })
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
console.log('CyMD help: ' + data.pages.length + ' human pages, EN/FR, image module, standalone Documentation.html.')
