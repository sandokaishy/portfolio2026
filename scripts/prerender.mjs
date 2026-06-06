import { writeFileSync, mkdirSync, copyFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import puppeteer from 'puppeteer'
import { preview } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))
const distDir = resolve(__dirname, '../dist')
// Every client route gets its own static HTML so direct links / refreshes
// resolve on GitHub Pages (which has no server-side routing). The project
// detail paths mirror src/data/projects.js — keep them in sync if that
// list changes.
const routes = [
  '/',
  '/about',
  '/projects',
  '/projects/mobile-router',
  '/projects/poweramp',
  '/projects/figarrow',
  '/projects/tree-point',
  '/projects/interaction-lab',
]

async function prerender() {
  const server = await preview({
    root: resolve(__dirname, '..'),
    preview: { port: 4173 },
  })

  // --no-sandbox is required when this runs as root on CI (GitHub Actions).
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })
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

  // SPA fallback: GitHub Pages serves 404.html for any path it can't find.
  // Pointing it at the prerendered shell lets the client router recover any
  // route not covered above instead of showing GitHub's default 404.
  copyFileSync(resolve(distDir, 'index.html'), resolve(distDir, '404.html'))
  console.log('Wrote SPA fallback: 404.html')

  await browser.close()
  server.close()
}

prerender().catch((err) => {
  console.error(err)
  process.exit(1)
})
