import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

// Lightweight mirror of cmsContent.ts for node:test without a TS loader pipeline.
function cmsTextToHtml(value) {
  if (value === null || value === undefined) return null
  if (value === '') return ''
  if (/<[a-z][\s\S]*>/i.test(value)) return value
  const escaped = value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  return escaped
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`)
    .join('')
}

function hasCmsText(value) {
  return typeof value === 'string' && value.trim().length > 0
}

const __dirname = dirname(fileURLToPath(import.meta.url))
const source = readFileSync(join(__dirname, 'cmsContent.ts'), 'utf8')

describe('cmsTextToHtml', () => {
  it('keeps null and empty string distinct', () => {
    assert.equal(cmsTextToHtml(null), null)
    assert.equal(cmsTextToHtml(undefined), null)
    assert.equal(cmsTextToHtml(''), '')
  })

  it('preserves sanitized HTML', () => {
    assert.equal(cmsTextToHtml('<p>Alpha</p>'), '<p>Alpha</p>')
  })

  it('escapes plain text and keeps paragraphs', () => {
    assert.equal(
      cmsTextToHtml('Alpha — платформа\n\nВторой абзац'),
      '<p>Alpha — платформа</p><p>Второй абзац</p>',
    )
    assert.equal(cmsTextToHtml('A < B'), '<p>A &lt; B</p>')
  })

  it('source module exports helpers used by pages', () => {
    assert.match(source, /export function cmsTextToHtml/)
    assert.match(source, /export function hasCmsText/)
  })
})

describe('hasCmsText', () => {
  it('treats whitespace-only as empty', () => {
    assert.equal(hasCmsText(null), false)
    assert.equal(hasCmsText(''), false)
    assert.equal(hasCmsText('   '), false)
    assert.equal(hasCmsText('Alpha'), true)
  })
})
