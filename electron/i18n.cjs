'use strict'
const english = require('../locales/en.json')

function createTranslator(initial = 'fr') {
  let language = initial.toLowerCase().startsWith('fr') ? 'fr' : 'en'
  return {
    getLanguage: () => language,
    setLanguage(value) {
      if (value !== 'fr' && value !== 'en') throw new Error('Invalid language')
      language = value
    },
    tr(text, ...values) {
      const translated = language === 'en' && Object.hasOwn(english, text) ? english[text] : text
      return translated.replace(/\{(\d+)\}/g, (match, index) => index < values.length ? String(values[index]) : match)
    },
  }
}
module.exports = { createTranslator }
