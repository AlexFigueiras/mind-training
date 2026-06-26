import { chromium } from 'playwright'
import path from 'path'

const SCRATCHPAD = '/tmp/claude-0/-home-user-mind-training/5fb1fb13-decc-59da-b975-c6466021c38a/scratchpad'
const BASE = process.env.SHOT_BASE || 'http://127.0.0.1:8099'
const WIDTH = Number(process.env.SHOT_WIDTH || 412)

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
})

const ctx = await browser.newContext({
  viewport: { width: WIDTH, height: 860 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
})

const page = await ctx.newPage()

async function shot(filename) {
  await page.waitForTimeout(550)
  await page.screenshot({ path: path.join(SCRATCHPAD, filename) })
  console.log('✓', filename)
}

await page.goto(BASE, { waitUntil: 'networkidle' })
await shot('s-home.png')

await page.locator('text=Base').first().click()
await shot('s-mod1.png')

await page.locator('text=Decisão').first().click()
await shot('s-mod2.png')

await page.locator('text=Início').first().click()
await page.waitForTimeout(300)
await page.locator('text=Pensamento Sistêmico').first().click()
await shot('s-mod3.png')

await page.locator('text=Neuro').first().click()
await shot('s-mod4.png')

await page.locator('text=Hábitos').first().click()
await shot('s-mod5.png')

await browser.close()
console.log('\nAll screenshots done at width=' + WIDTH)
