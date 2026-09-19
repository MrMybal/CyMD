const { test } = require('node:test')
const assert = require('node:assert/strict')
const { createTranslator } = require('../electron/i18n.cjs')
const english = require('../locales/en.json')

test('language detection, switching and invalid preference', () => {
  const locale = createTranslator('fr-CA')
  assert.equal(locale.tr('Enregistrer'), 'Enregistrer')
  locale.setLanguage('en')
  assert.equal(locale.tr('Enregistrer'), 'Save')
  assert.throws(() => locale.setLanguage('es'))
  assert.equal(locale.getLanguage(), 'en')
  assert.equal(createTranslator('de-DE').getLanguage(), 'en')
})
test('parameters are preserved literally and unknown keys fall back', () => {
  const { tr } = createTranslator('en')
  assert.equal(tr('Enregistré : {0}', 'français {1}.md'), 'Saved: français {1}.md')
  assert.equal(tr('unknown'), 'unknown')
  assert.equal(tr('toString'), 'toString')
})
test('all translations are nonempty and preserve their parameter indices', () => {
  const params = (value) => [...value.matchAll(/\{\d+\}/g)].map(m => m[0]).sort()
  for (const [source, translation] of Object.entries(english)) {
    assert.ok(translation.trim(), source)
    assert.deepEqual(params(source), params(translation), source)
  }
})
