import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const localesDir = join(__dirname, '..', 'i18n', 'locales')

/**
 * @param {Record<string, unknown>} obj
 * @param {string} [prefix]
 * @returns {Record<string, unknown>}
 */
function flatten(obj, prefix = '') {
  /** @type {Record<string, unknown>} */
  const out = {}
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(out, flatten(/** @type {Record<string, unknown>} */ (value), path))
    } else {
      out[path] = value
    }
  }
  return out
}

/** @param {string} code */
function loadLocale(code) {
  const filePath = join(localesDir, `${code}.json`)
  return JSON.parse(readFileSync(filePath, 'utf8'))
}

const ru = loadLocale('ru')
const ruKeys = Object.keys(flatten(ru)).sort()

/** @type {string[]} */
const locales = ['en', 'kk']
let failed = false

for (const code of locales) {
  const data = loadLocale(code)
  const keys = new Set(Object.keys(flatten(data)))
  const missing = ruKeys.filter((k) => !keys.has(k))
  if (missing.length > 0) {
    failed = true
    console.error(`Missing keys in ${code}.json (${missing.length}):`)
    for (const k of missing) {
      console.error(`  ${k}`)
    }
  }
}

if (!failed) {
  console.log(`OK: ${locales.join(', ')} have all ${ruKeys.length} keys from ru.json`)
}

process.exit(failed ? 1 : 0)
