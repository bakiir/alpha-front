import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { resolveMediaUrl } from './mediaUrl.ts'

describe('resolveMediaUrl', () => {
  it('rewrites local Laravel storage to same-origin /storage for Nuxt proxy', () => {
    assert.equal(
      resolveMediaUrl('http://127.0.0.1:8000/storage/toys/a.jpg', '/api'),
      '/storage/toys/a.jpg',
    )
    assert.equal(
      resolveMediaUrl('http://localhost:8000/storage/toys/a.jpg', '/api'),
      '/storage/toys/a.jpg',
    )
    assert.equal(
      resolveMediaUrl('/storage/toys/a.jpg', '/api'),
      '/storage/toys/a.jpg',
    )
  })

  it('rewrites local absolute storage even without apiBase', () => {
    assert.equal(
      resolveMediaUrl('http://127.0.0.1:8000/storage/toys/a.jpg'),
      '/storage/toys/a.jpg',
    )
  })

  it('keeps production API storage on the API host', () => {
    assert.equal(
      resolveMediaUrl(
        'https://back-alpha.test-nomad.kz/storage/toys/a.jpg',
        'https://back-alpha.test-nomad.kz/api',
      ),
      'https://back-alpha.test-nomad.kz/storage/toys/a.jpg',
    )
    assert.equal(
      resolveMediaUrl('/storage/toys/a.jpg', 'https://back-alpha.test-nomad.kz/api'),
      'https://back-alpha.test-nomad.kz/storage/toys/a.jpg',
    )
  })

  it('leaves non-storage absolute URLs untouched', () => {
    assert.equal(
      resolveMediaUrl('https://images.unsplash.com/photo.jpg', '/api'),
      'https://images.unsplash.com/photo.jpg',
    )
  })

  it('handles empty input', () => {
    assert.equal(resolveMediaUrl(''), '')
    assert.equal(resolveMediaUrl(null), '')
  })
})
