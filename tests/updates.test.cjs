const { test } = require('node:test')
const assert = require('node:assert/strict')
const { EventEmitter } = require('node:events')
const { createUpdates } = require('../electron/updates.cjs')
const { createTranslator } = require('../electron/i18n.cjs')

function setup({ available = true, dirty = false, packaged = true, portable = false,
  answers = [0, 0], failure = false, language = 'fr' } = {}) {
  const updater = new EventEmitter()
  const calls = { checks: 0, downloads: 0, installs: 0, dialogs: [], links: [], progress: [] }
  updater.checkForUpdates = async () => {
    calls.checks++
    if (failure) { updater.emit('error', new Error('offline')); throw new Error('offline') }
    if (available) updater.emit('update-available', { version: '0.2.0' })
  }
  updater.downloadUpdate = async () => {
    calls.downloads++
    updater.emit('download-progress', { percent: 50 })
    updater.emit('update-downloaded', { version: '0.2.0' })
  }
  updater.quitAndInstall = () => { calls.installs++ }
  const updates = createUpdates({
    app: { isPackaged: packaged, getVersion: () => '0.1.0' }, updater,
    tr: createTranslator(language).tr,
    platform: 'win32', portable, hasUnsaved: () => dirty,
    showDialog: async (options) => { calls.dialogs.push(options); return { response: answers.shift() ?? 1 } },
    openExternal: async (url) => { calls.links.push(url) },
    setProgress: (value) => calls.progress.push(value),
  })
  return { updates, updater, calls }
}

test('download and installation require confirmation; auto-install and prereleases are disabled', async () => {
  const { updates, updater, calls } = setup()
  await updates.check()
  assert.equal(calls.downloads, 1)
  assert.equal(calls.installs, 1)
  assert.ok(calls.progress.includes(0.5))
  assert.equal(calls.progress.at(-1), -1)
  assert.equal(updater.autoDownload, false)
  assert.equal(updater.autoInstallOnAppQuit, false)
  assert.equal(updater.allowPrerelease, false)
  assert.equal(updater.allowDowngrade, false)
})
test('unsaved documents prevent installation', async () => {
  const { updates, calls } = setup({ dirty: true })
  await updates.check()
  assert.equal(calls.installs, 0)
  assert.match(calls.dialogs.at(-1).message, /pas enregistrés/)
})
test('declining download does not download or install', async () => {
  const { updates, calls } = setup({ answers: [1] })
  await updates.check()
  assert.equal(calls.downloads, 0)
  assert.equal(calls.installs, 0)
})
test('postponed installation can be resumed without downloading again', async () => {
  const { updates, calls } = setup({ answers: [0, 1, 0] })
  await updates.check()
  assert.equal(calls.installs, 0)
  await updates.check()
  assert.equal(calls.downloads, 1)
  assert.equal(calls.installs, 1)
})
test('background no-update and network errors are quiet; manual errors are visible and retryable', async () => {
  const quiet = setup({ available: false })
  await quiet.updates.check(false)
  assert.equal(quiet.calls.dialogs.length, 0)
  const offline = setup({ failure: true })
  await offline.updates.check(false)
  assert.equal(offline.calls.dialogs.length, 0)
  await offline.updates.check()
  assert.equal(offline.calls.dialogs.length, 1)
  assert.equal(offline.calls.checks, 2)
})
test('portable and development versions only open releases on request', async () => {
  for (const options of [{ portable: true }, { packaged: false }]) {
    const { updates, calls } = setup(options)
    await updates.check(false)
    assert.equal(calls.dialogs.length, 0)
    await updates.check()
    assert.equal(calls.checks, 0)
    assert.deepEqual(calls.links, ['https://github.com/MrMybal/CyMD/releases/latest'])
  }
})
test('concurrent requests do not start a second check', async () => {
  const { updates, updater, calls } = setup()
  let finish
  updater.checkForUpdates = () => { calls.checks++; return new Promise((resolve) => { finish = resolve }) }
  const first = updates.check(false)
  await updates.check()
  assert.equal(calls.checks, 1)
  finish()
  await first
})
test('download failure clears progress and allows retry', async () => {
  const { updates, updater, calls } = setup({ answers: [0, 1, 1] })
  updater.downloadUpdate = async () => { throw new Error('checksum mismatch') }
  await updates.check()
  assert.equal(calls.installs, 0)
  assert.equal(calls.progress.at(-1), -1)
  assert.match(calls.dialogs.at(-1).message, /pas pu aboutir/)
  await updates.check()
  assert.equal(calls.checks, 2)
})

test('installer error events are reported', async () => {
  const { updates, updater, calls } = setup()
  updater.quitAndInstall = () => updater.emit('error', new Error('installer failed'))
  await updates.check()
  assert.match(calls.dialogs.at(-1).message, /pas pu aboutir/)
})

test('update and unsaved-document prompts are translated into English', async () => {
  const { updates, calls } = setup({ language: 'en', dirty: true })
  await updates.check()
  assert.equal(calls.dialogs[0].message, 'CyMD 0.2.0 is available.')
  assert.equal(calls.dialogs[1].buttons[0], 'Restart and install')
  assert.equal(calls.dialogs[2].message, 'Some documents have unsaved changes.')
  assert.equal(calls.installs, 0)
})
