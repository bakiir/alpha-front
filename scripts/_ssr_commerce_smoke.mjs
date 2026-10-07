import fs from 'node:fs'
import path from 'node:path'

const outDir = path.resolve('../docs/_ssr_smoke')
fs.mkdirSync(outDir, { recursive: true })

const cases = [
  { url: 'http://127.0.0.1:3000/kk/shop', needles: ['Дүкен', 'Каталог', 'Себетке'] },
  { url: 'http://127.0.0.1:3000/en/cart', needles: ['Your cart', 'Checkout', 'Empty'] },
  { url: 'http://127.0.0.1:3000/en/checkout', needles: ['Delivery', 'Payment'] },
  { url: 'http://127.0.0.1:3000/kk/subscription', needles: ['Жазылым'] },
  { url: 'http://127.0.0.1:3000/en/short-rent', needles: ['Rent', 'Book'] },
  { url: 'http://127.0.0.1:3000/kk/gifts', needles: ['СЫЙЛЫҚТАРЫ', 'сыйлық'] },
  { url: 'http://127.0.0.1:3000/en/gifts', needles: ['Gift'] },
  { url: 'http://127.0.0.1:3000/kk/short-rent', needles: ['Жалға', 'жалға'] },
]

const rows = []
for (const c of cases) {
  try {
    const r = await fetch(c.url)
    const html = await r.text()
    const hits = c.needles.filter((n) => html.includes(n))
    rows.push({
      url: c.url,
      status: r.status,
      bytes: html.length,
      needles: c.needles,
      hits,
      ok: r.status === 200 && hits.length > 0,
    })
  } catch (e) {
    rows.push({ url: c.url, status: 'ERR', ok: false, error: e.message })
  }
}

const md = [
  '# SSR smoke results (local)',
  '',
  `Date: ${new Date().toISOString()}`,
  'Host: Nuxt `127.0.0.1:3000` + API `127.0.0.1:8000`',
  '',
  '| URL | Status | OK | Hits |',
  '|-----|--------|----|------|',
  ...rows.map((r) => `| \`${r.url}\` | ${r.status} | ${r.ok ? 'yes' : 'no'} | ${(r.hits || []).join(', ') || r.error || '—'} |`),
  '',
  '## Notes',
  '- Needle hits prove **UI dictionary** strings in initial HTML (SSR).',
  '- SEO `<title>` / CMS body / product names may still be RU — that is **data locale**, not UI chrome.',
  '- Fixed vue-i18n `@` in `checkout.placeholders.recipientEmail` (`email{\'@\'}example.com`) which caused `/gifts` 500.',
  '',
]

fs.writeFileSync(path.join(outDir, 'RESULTS.md'), md.join('\n'), 'utf8')
fs.writeFileSync(path.join(outDir, 'results.json'), JSON.stringify(rows, null, 2), 'utf8')
console.log(md.join('\n'))
console.log('PASS', rows.filter((r) => r.ok).length, '/', rows.length)
