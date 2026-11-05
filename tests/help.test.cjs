const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { pathToFileURL } = require('node:url')
const { unzipSync } = require('fflate')
const config = require('../cydoc.config.json')
const data = JSON.parse(fs.readFileSync('public/help/manifest.json', 'utf8'))
const targets = require('../src/help/targets.json')

test('every help destination exists in both languages, with stable anchors and media', async () => {
  const { createDocumentation, parseLink, hasAnchor } = await import('cydoc')
  const { helpLink } = require('../public/help-links.cjs')
  const docs = createDocumentation(data)
  const base = pathToFileURL(path.resolve('output/épreuve #1/help/index.html')).href
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
  assert.equal(docs.canonicalRoute({ locale: 'fr', pageId: 'Guide CyMD.md' }).pageId, 'overview')
  const missing = createDocumentation({ ...data, pages: data.pages.filter(p => !(p.id === 'media' && p.locale === 'fr')) })
  assert.equal(missing.resolve('media', 'fr').fallback, true)
})

test('manual is complete, translated, local and includes only the image reader', () => {
  const report = JSON.parse(fs.readFileSync('public/help/translation-report.json', 'utf8'))
  assert.deepEqual([report.missing, report.outdated, report.untracked], [[], [], []])
  assert.deepEqual(config.modules, ['image'])
  const files = fs.readdirSync('public/help')
  assert.deepEqual(files.filter(f => /^media-.*\.js$/.test(f)), ['media-image.js'])
  assert.ok(!fs.existsSync('node_modules/three'))
  for (const page of data.pages) {
    assert.doesNotMatch(page.html, /<(?:img|script|iframe|video)[^>]+src=["']https?:/i)
    assert.doesNotMatch(page.source || '', /^[A-Z]:|Users[\\/]/i)
    for (const match of page.html.matchAll(/src="(assets\/[^"]+)"/g)) assert.ok(fs.existsSync(path.join('public/help', match[1])))
  }
  const sourcePages = data.pages.filter(p => p.kind === 'source')
  assert.equal(sourcePages.length, 8)
  assert.ok(sourcePages.every(p => p.id.startsWith('source-src-doc-')))
  assert.ok(data.pages.some(p => p.html.includes('<svg role="img"')))
  const zip = unzipSync(fs.readFileSync('public/CyMD-help.zip'))
  for (const name of ['index.html','viewer.js','viewer.css','data.js','brand.css','media-image.js','assets/cymd-live.jpg','assets/cymd-split.jpg','assets/cymd-reading.jpg','examples/welcome.fr.md','examples/welcome.en.md','CyDoc-LICENSE.txt','CyMD-LICENSE.txt']) {
    assert.deepEqual(Buffer.from(zip[name]),fs.readFileSync(path.join('public/help',name)))
  }
})
