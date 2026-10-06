import puppeteer from 'puppeteer-core'
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, 'tmp-gifts-mobile-shots')
mkdirSync(outDir, { recursive: true })

const chromePath = process.env.CHROME_PATH ||
  'C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe'

const widths = [320, 360, 390, 430]
const height = 844
const base = 'http://localhost:3000/gifts'

const browser = await puppeteer.launch({
  executablePath: chromePath,
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--lang=ru-RU'],
  defaultViewport: { width: 390, height },
})

const page = await browser.newPage()

async function shot(name, width = 390) {
  await page.setViewport({ width, height, deviceScaleFactor: 2 })
  const file = join(outDir, `${name}-${width}.png`)
  await page.screenshot({ path: file, fullPage: false })
  console.log('saved', file)
}

await page.goto(base, { waitUntil: 'networkidle2', timeout: 60000 })
await page.waitForSelector('.gift-mobile-hub', { timeout: 30000 })

for (const w of widths) {
  await shot('hub', w)
}

await page.setViewport({ width: 390, height, deviceScaleFactor: 2 })

// Open subscription checkout
const subBtn = await page.$('button.gift-mobile-card')
if (!subBtn) throw new Error('subscription card not found')
await subBtn.click()
await page.waitForSelector('.gift-m-panel', { timeout: 10000 })
await new Promise((r) => setTimeout(r, 400))
await shot('step1-subscription', 390)

// Continue to step 2
await page.click('.gift-m-primary')
await new Promise((r) => setTimeout(r, 300))
await shot('step2-recipient', 390)

// Fill recipient and continue
await page.type('#gift-m-recipient-name', 'Миша')
await page.type('#gift-m-recipient-email', 'parents@example.com')
await page.click('.gift-m-primary')
await new Promise((r) => setTimeout(r, 400))
await shot('step3-review', 390)

// Close and reopen to verify draft
await page.click('.gift-m-close')
await new Promise((r) => setTimeout(r, 400))
await page.click('button.gift-mobile-card')
await page.waitForSelector('.gift-m-panel')
await new Promise((r) => setTimeout(r, 300))
const nameVal = await page.$eval('#gift-m-recipient-name', (el) => el.value).catch(() => null)
// may be on step 3 still — go to step 2 via back if needed
const stepLabel = await page.$eval('.gift-m-step-label', (el) => el.textContent || '')
console.log('reopened step label:', stepLabel.trim(), 'draft name visible?', nameVal)

await browser.close()
console.log('done')
