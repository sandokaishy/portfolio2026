import { writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import puppeteer from 'puppeteer'
import { preview } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distDir = resolve(__dirname, '../dist')
const routes = ['/', '/about', '/projects']

async function prerender() {
  const server = await preview({
    root: resolve(__dirname, '..'),
    preview: { port: 4173 },
  })

  const browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()

  for (const route of routes) {
    const url = `http://localhost:4173/portfolio2026${route}`
    await page.goto(url, { waitUntil: 'networkidle0' })

    const html = await page.content()
    const filePath =
      route === '/'
        ? resolve(distDir, 'index.html')
        : resolve(distDir, route.slice(1), 'index.html')

    mkdirSync(dirname(filePath), { recursive: true })
    writeFileSync(filePath, html)
    console.log(`Prerendered: ${route} -> ${filePath}`)
  }

  await browser.close()
  server.close()
}

prerender().catch((err) => {
  console.error(err)
  process.exit(1)
})
