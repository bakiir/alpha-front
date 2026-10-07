import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const localesDir = join(__dirname, '..', 'i18n', 'locales')
const fragDir = join(__dirname, 'i18n-fragments')

const codes = ['ru', 'en', 'kk']

for (const code of codes) {
  const localePath = join(localesDir, `${code}.json`)
  const fragPath = join(fragDir, `subscription-rental.${code}.json`)
  const locale = JSON.parse(readFileSync(localePath, 'utf8'))
  const frag = JSON.parse(readFileSync(fragPath, 'utf8'))
  Object.assign(locale, frag)
  writeFileSync(localePath, `${JSON.stringify(locale, null, 2)}\n`, 'utf8')
  console.log(`Merged subscription+rental into ${code}.json`)
}
