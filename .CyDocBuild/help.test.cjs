const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { pathToFileURL } = require('node:url')
const { unzipSync } = require('fflate')
const config = require('./cydoc.config.json')
const data = JSON.parse(fs.readFileSync('Documentation/DocData/manifest.json', 'utf8'))
const targets = require('../src/help/targets.json')

test('help routes, legacy aliases and parent navigation resolve in both complete languages', async () => {
  const { createDocumentation, parseLink, hasAnchor } = await import('cydoc')
  const { helpLink } = require('../public/help-links.cjs')
  const docs = createDocumentation(data)
  const base = pathToFileURL(path.resolve('output/épreuve #1/Documentation/Documentation.html')).href
  assert.deepEqual(docs.availableLocales().map(l => l.code), ['en','fr'])
  for (const locale of ['en', 'fr']) for (const [key, route] of Object.entries(targets)) {
    const url = new URL(helpLink(base, locale, key))
    assert.equal(url.protocol, 'file:')
    assert.equal(url.href.split('#')[0], base)
    const parsed = parseLink(url.hash)
    assert.equal(parsed.locale, locale)
    assert.equal(parsed.pageId, route.pageId)
    const found = docs.resolve(parsed.pageId, locale)
    assert.ok(found && !found.fallback)
    if (route.anchor) assert.ok(hasAnchor(found.page, route.anchor))
    if (route.state?.media) assert.ok(found.page.html.includes('data-cydoc-id="' + route.state.media + '"'))
  }
  assert.equal(parseLink(new URL(helpLink(base, 'de', '../../bad')).hash).pageId, 'overview')
  for (const locale of ['en','fr']) for (const alias of Object.keys(config.aliases)) {
    const route = docs.canonicalRoute({ locale, pageId: alias })
    const target = docs.resolve(route.pageId, locale)
    assert.ok(target && !target.fallback)
    if (route.anchor) assert.ok(hasAnchor(target.page, route.anchor))
  }
  for (const page of docs.pages('en')) {
    const fr = docs.resolve(page.id, 'fr').page
    assert.equal(fr.parent, page.parent)
    assert.deepEqual(fr.headings.map(h => h.id).sort(), page.headings.map(h => h.id).sort())
    assert.notEqual(fr.text, page.text)
  }
  assert.ok(docs.pages('en').filter(page => page.parent).length >= 5)
})

test('manual separates human content, public API and assistant notes', () => {
  const report = JSON.parse(fs.readFileSync('Documentation/DocData/translation-report.json', 'utf8'))
  assert.deepEqual([report.missing, report.outdated], [[], []])
  // Annotation extraction has no revision tags; both language blocks are reviewed together.
  assert.ok(report.untracked.every(page => page.id === 'integration-api'))
  assert.deepEqual(config.modules, ['image'])
  assert.deepEqual(fs.readdirSync('Documentation').sort(), ['DocAI.md', 'DocData', 'Documentation.html'])
  assert.deepEqual(fs.readdirSync('Documentation/DocData').filter(f => /^media-.*\.js$/.test(f)), ['media-image.js'])
  assert.ok(!fs.existsSync('node_modules/three'))
  const html = fs.readFileSync('Documentation/Documentation.html', 'utf8')
  assert.ok(!/<iframe|http-equiv="refresh"/i.test(html))
  for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) assert.ok(fs.existsSync(path.join('Documentation', match[1])))
  assert.ok(data.pages.every(p => p.kind !== 'source' && !['development', 'translation-report'].includes(p.id)))
  assert.equal(data.pages.filter(p => p.kind === 'api').length, 2)
  for (const page of data.pages) {
    assert.doesNotMatch(page.html, /<(?:img|script|iframe|video)[^>]+src=["']https?:/i)
    assert.doesNotMatch(page.text, /npm run docs:build|migration inventories|function createEmbeddedPlatform|class CyDoc|Documentation integration notes for coding assistants/)
    for (const match of page.html.matchAll(/src="(assets\/[^"]+)"/g)) assert.ok(fs.existsSync(path.join('Documentation/DocData', match[1])))
  }
  assert.ok(data.pages.some(p => p.html.includes('<svg role="img"')))
  assert.match(fs.readFileSync('Documentation/DocAI.md', 'utf8'), /coding assistants/)
  const zip = unzipSync(fs.readFileSync('public/CyMD-help.zip'))
  function collect(dir, prefix = '') {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory()
      ? collect(path.join(dir,e.name),prefix+e.name+'/') : [prefix+e.name])
  }
  const files = collect('Documentation')
  assert.deepEqual(Object.keys(zip).sort(), files.sort())
  for (const name of files) {
    assert.deepEqual(Buffer.from(zip[name]), fs.readFileSync(path.join('Documentation',name)))
    assert.deepEqual(fs.readFileSync(path.join('public/Documentation',name)), fs.readFileSync(path.join('Documentation',name)))
    assert.ok(!/\.CyDocBuild|node_modules|vendor|internal/.test(name))
  }
  assert.ok(fs.existsSync('Documentation/DocData/assets/cymd-logo.png'))
})
