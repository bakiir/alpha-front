const urls = [
  'http://127.0.0.1:3000/kk/gifts',
  'http://127.0.0.1:3000/en/gifts',
  'http://127.0.0.1:3000/gifts',
]
for (const url of urls) {
  try {
    const r = await fetch(url)
    const t = await r.text()
    const pre = t.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i)
    const title = t.match(/<title>([^<]+)<\/title>/i)
    const err = t.match(/\[nuxt\][\s\S]{0,200}|Cannot |is not |undefined|TypeError|ReferenceError/)
    console.log('---', url, r.status)
    console.log('title:', title?.[1]?.slice(0, 120))
    if (pre) console.log('pre:', pre[1].replace(/<[^>]+>/g, '').slice(0, 800))
    else if (err) console.log('hint:', err[0].slice(0, 400))
    else console.log('snippet:', t.replace(/\s+/g, ' ').slice(0, 300))
  } catch (e) {
    console.log('---', url, 'FETCH_ERR', e.message)
  }
}
