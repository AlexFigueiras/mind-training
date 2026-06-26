import { chromium } from 'playwright'
import path from 'path'

const SCRATCHPAD = '/tmp/claude-0/-home-user-mind-training/5fb1fb13-decc-59da-b975-c6466021c38a/scratchpad'
const BASE = 'http://localhost:5174'

const browser = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
})

const ctx = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
})

const page = await ctx.newPage()

async function shot(filename) {
  await page.waitForTimeout(600)
  await page.screenshot({ path: path.join(SCRATCHPAD, filename) })
  console.log('✓', filename)
}

// Home
await page.goto(BASE, { waitUntil: 'networkidle' })
await shot('s-home.png')

// Module 1 — click via bottom nav "Base"
await page.locator('text=Base').first().click()
await shot('s-mod1.png')

// Back to home, go Module 2 via "Decisão"
await page.locator('text=Decisão').first().click()
await shot('s-mod2.png')

// Module 3 via Home card
await page.locator('text=Início').first().click()
await page.waitForTimeout(400)
await page.locator('text=Pensamento Sistêmico').first().click()
await shot('s-mod3.png')

// Module 4 via bottom nav "Neuro"
await page.locator('text=Neuro').first().click()
await shot('s-mod4.png')

// Module 5 via bottom nav "Hábitos"
await page.locator('text=Hábitos').first().click()
await shot('s-mod5.png')

await browser.close()
console.log('\nAll screenshots done.')
