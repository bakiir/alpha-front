import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

const HTML_TAG = /<\s*\/?\s*[a-zA-Z][^>]*>/
const JS_SCHEME = /\bjavascript\s*:/i

function containsMarkup(value) {
  const text = value?.trim() ?? ''
  if (!text) return false
  if (HTML_TAG.test(text)) return true
  if (JS_SCHEME.test(text)) return true
  return false
}

describe('plainText containsMarkup', () => {
  it('allows normal text', () => {
    assert.equal(containsMarkup('Айгерим'), false)
    assert.equal(containsMarkup('<3'), false)
  })

  it('blocks script tags', () => {
    assert.equal(containsMarkup('<script>alert(1)</script>'), true)
    assert.equal(containsMarkup('<img src=x onerror=alert(1)>'), true)
  })

  it('blocks X5–X8 vectors', () => {
    assert.equal(containsMarkup('<svg onload=alert(1)>'), true)
    assert.equal(containsMarkup('<body onload=alert(1)>'), true)
    assert.equal(containsMarkup('"><img src=x onerror=alert(1)>'), true)
    assert.equal(containsMarkup('data:text/html,<script>alert(1)</script>'), true)
  })
})
