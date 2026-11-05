import assert from 'node:assert/strict'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, posix } from 'node:path'
import { createDocumentation, parseLink, hasAnchor } from 'cydoc'
import { unzipSync } from 'fflate'

const root = 'output/pages'
function files(dir, prefix = '') {
  return readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory()
    ? files(join(dir, e.name), prefix + e.name + '/')
    : [prefix + e.name])
}
const published = files(root)
assert.deepEqual(readdirSync(root).sort(), ['.nojekyll', 'CyMD-help.zip', 'LICENSE.txt', 'assets', 'help', 'index.html', 'logo.png', 'source.zip'].sort())
const expectedHelp = files('public/help').sort()
assert.deepEqual(files(root + '/help').sort(), expectedHelp)
for (const name of expectedHelp) assert.deepEqual(readFileSync(root + '/help/' + name), readFileSync('public/help/' + name))
const zip = unzipSync(readFileSync(root + '/CyMD-help.zip'))
assert.deepEqual(Object.keys(zip).sort(), expectedHelp)
for (const name of expectedHelp) assert.deepEqual(Buffer.from(zip[name]), readFileSync(root + '/help/' + name))

const data = JSON.parse(readFileSync(root + '/help/manifest.json', 'utf8'))
const docs = createDocumentation(data)
let references = 0
function reference(href, from, locale) {
  if (!href || /^(?:https?:|mailto:|data:|blob:)/i.test(href)) return
  if (href.startsWith('#/')) {
    const route = parseLink(href.replaceAll('&amp;', '&'))
    const result = docs.resolve(route.pageId, route.locale || locale)
    assert.ok(result && !result.fallback, 'Missing translated route: ' + href)
    if (route.anchor) assert.ok(hasAnchor(result.page, route.anchor), 'Missing anchor: ' + href)
    if (route.state?.media) assert.ok(result.page.html.includes('data-cydoc-id="' + route.state.media + '"'))
  } else if (!href.startsWith('#')) {
    assert.ok(!/^[a-z]+:|^\//i.test(href), 'Unexpected absolute resource: ' + href)
    const path = posix.normalize(posix.join(posix.dirname(from), decodeURIComponent(href.split(/[?#]/)[0])))
    assert.ok(!path.startsWith('../'), 'Resource escapes export: ' + path)
    assert.ok(statSync(root + '/' + path).isFile(), 'Missing resource: ' + path)
  }
  references++
}
function checkHtml(html, from, locale) {
  for (const m of html.matchAll(/\b(?:src|href)=["']([^"']+)["']/g)) reference(m[1], from, locale)
}
checkHtml(readFileSync(root + '/index.html', 'utf8'), 'index.html')
checkHtml(readFileSync(root + '/help/index.html', 'utf8'), 'help/index.html')
for (const page of data.pages) checkHtml(page.html, 'help/index.html', page.locale)
for (const name of published.filter(name => name.endsWith('.css'))) {
  for (const m of readFileSync(root + '/' + name, 'utf8').matchAll(/url\(\s*["']?([^"'\s)]+)["']?\s*\)/g)) reference(m[1], name)
}
for (const [file, locale] of [['README.md', 'en'], ['README.fr.md', 'fr']]) {
  assert.ok(readFileSync(file, 'utf8').includes('https://mrmybal.github.io/CyMD/help/#/' + locale + '/overview'))
}
assert.ok(published.every(name => !/\.map$|help-links\.cjs$|node_modules|vendor|\.tgz$/.test(name)))
console.log('Pages: ' + expectedHelp.length + ' complete help files, ' + data.pages.length + ' pages, ' + references + ' local links/resources verified.')

// Optional post-deployment verification; every exported resource must be reachable.
if (process.argv[2]) {
  const base = new URL(process.argv[2])
  assert.ok(base.protocol === 'https:' || base.hostname === 'localhost')
  for (const name of ['index.html', 'CyMD-help.zip', ...expectedHelp.map(name => 'help/' + name)]) {
    const response = await fetch(new URL(name, base), { signal: AbortSignal.timeout(30000) })
    assert.equal(response.status, 200, name)
    const bytes = Buffer.from(await response.arrayBuffer())
    if (name !== 'CyMD-help.zip') assert.deepEqual(bytes, readFileSync(root + '/' + name), 'Published content differs: ' + name)
    else assert.deepEqual(Object.keys(unzipSync(bytes)).sort(), expectedHelp)
  }
  console.log('Published editor, complete documentation and offline download verified at ' + base.href)
}
