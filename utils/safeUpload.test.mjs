import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'webp'])
const BLOCKED_EXTENSIONS = new Set(['php', 'phtml', 'html', 'htm', 'svg'])

function fileExtension(name) {
  const base = name.split(/[/\\]/).pop() ?? ''
  const idx = base.lastIndexOf('.')
  if (idx <= 0) return ''
  return base.slice(idx + 1).toLowerCase()
}

function isAllowedClientImage(file) {
  const ext = fileExtension(file.name)
  if (BLOCKED_EXTENSIONS.has(ext)) return false
  if (!ALLOWED_EXTENSIONS.has(ext)) return false
  const type = (file.type || '').toLowerCase()
  if (type !== '' && !['image/jpeg', 'image/png', 'image/webp'].includes(type)) return false
  return true
}

describe('safeUpload isAllowedClientImage', () => {
  it('allows png/jpeg by name and mime', () => {
    assert.equal(isAllowedClientImage({ name: 'a.png', type: 'image/png' }), true)
    assert.equal(isAllowedClientImage({ name: 'b.JPG', type: 'image/jpeg' }), true)
  })

  it('blocks php/html/svg extensions', () => {
    assert.equal(isAllowedClientImage({ name: 'evil.php', type: 'image/jpeg' }), false)
    assert.equal(isAllowedClientImage({ name: 'x.html', type: '' }), false)
    assert.equal(isAllowedClientImage({ name: 'icon.svg', type: 'image/svg+xml' }), false)
  })

  it('blocks wrong mime for allowed extension', () => {
    assert.equal(isAllowedClientImage({ name: 'a.jpg', type: 'text/html' }), false)
    assert.equal(isAllowedClientImage({ name: 'a.jpg', type: 'image/svg+xml' }), false)
  })
})
