const { test } = require('node:test')
const assert = require('node:assert/strict')

test('document identity respects POSIX case and Windows path conventions', async () => {
  const { createServer } = await import('vite')
  const server = await createServer({ server: { middlewareMode: true } })
  try {
    const { sameDocumentPath } = await server.ssrLoadModule('/src/doc/paths.ts')
    assert.equal(sameDocumentPath('C:\\Docs\\Notes.md', 'c:/docs/notes.md'), true)
    assert.equal(sameDocumentPath('\\\\server\\Docs\\Notes.md', '\\\\SERVER\\docs\\notes.md'), true)
    assert.equal(sameDocumentPath('/docs/Notes.md', '/docs/notes.md'), false)
    assert.equal(sameDocumentPath('/docs/notes.md', '/docs/notes.md'), true)
    assert.equal(sameDocumentPath('/docs/a\\b.md', '/docs/a/b.md'), false)
  } finally {
    await server.close()
  }
})
