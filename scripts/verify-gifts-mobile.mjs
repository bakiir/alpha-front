import puppeteer from 'puppeteer-core'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { mkdirSync } from 'node:fs'

const outDir = join(dirname(fileURLToPath(import.meta.url)), 'tmp-gifts-mobile-shots')
mkdirSync(outDir, { recursive: true })

const browser = await puppeteer.launch({
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  headless: 'new',
  args: ['--no-sandbox'],
  defaultViewport: { width: 390, height: 844, deviceScaleFactor: 2 },
})
const page = await browser.newPage()

for (const w of [320, 360, 390, 430]) {
  await page.setViewport({ width: w, height: 844, deviceScaleFactor: 2 })
  await page.goto('http://localhost:3000/gifts', { waitUntil: 'networkidle2', timeout: 60000 })
  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }))
  console.log('hub overflow', w, overflow, overflow.scrollWidth > overflow.clientWidth + 1 ? 'OVERFLOW' : 'ok')
}

await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 })
await page.goto('http://localhost:3000/gifts', { waitUntil: 'networkidle2' })
const cards = await page.$$('button.gift-mobile-card')
await cards[1].click()
await page.waitForSelector('.gift-m-panel')
await new Promise((r) => setTimeout(r, 400))
await page.screenshot({ path: join(outDir, 'step1-voucher-390.png') })
const overflowSheet = await page.evaluate(() => ({
  scrollWidth: document.documentElement.scrollWidth,
  clientWidth: document.documentElement.clientWidth,
  panel: document.querySelector('.gift-m-panel')?.scrollWidth,
}))
console.log('voucher sheet', overflowSheet)

await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 })
await page.goto('http://localhost:3000/gifts', { waitUntil: 'networkidle2' })
const desktop = await page.evaluate(() => {
  const tabs = document.querySelector('.gift-tabs-wrapper')
  const hub = document.querySelector('.gift-mobile-hub')
  return {
    tabsVisible: tabs ? getComputedStyle(tabs).display !== 'none' : false,
    hubVisible: hub ? getComputedStyle(hub).display !== 'none' : false,
    configurator: !!document.querySelector('.gift-configurator-grid'),
  }
})
console.log('desktop', desktop)
await page.screenshot({ path: join(outDir, 'desktop-1280.png') })
await browser.close()
