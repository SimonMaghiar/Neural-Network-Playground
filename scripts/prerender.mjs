// Turns the built single-page app into one static HTML file per page, plus sitemap.xml and robots.txt.
// Runs after `vite build` (browser bundle in dist/) and `vite build --ssr` (server bundle in dist-ssr/).
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const dist = resolve('dist')
const serverDir = resolve('dist-ssr')
const { render, allPaths, SITE_URL, CONTACT_EMAIL } = await import(pathToFileURL(join(serverDir, 'entry-server.js')).href)

const template = await readFile(join(dist, 'index.html'), 'utf8')
if (!template.includes('<div id="root"></div>') || !/<title>.*<\/title>/.test(template)) {
  throw new Error('index.html needs an empty <div id="root"></div> and a <title>')
}

async function writePage(path, file) {
  const page = await render(path)
  const html = template
    .replace(/<title>.*<\/title>/, () => `${page.title}\n    ${page.head}`)
    .replace('<div id="root"></div>', () => `<div id="root">${page.html}</div>`)
  await mkdir(dirname(file), { recursive: true })
  await writeFile(file, html)
  return page
}

const indexed = []
for (const path of allPaths()) {
  const page = await writePage(path, join(dist, path, 'index.html'))
  if (page.indexable) indexed.push(path)
}
await writePage('/404/', join(dist, '404.html'))

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexed.map((p) => `  <url><loc>${SITE_URL}${p}</loc></url>`).join('\n')}
</urlset>
`
await writeFile(join(dist, 'sitemap.xml'), sitemap)
await writeFile(join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`)
await rm(serverDir, { recursive: true, force: true })

console.log(`Pre-rendered ${indexed.length} pages and 404.html for ${SITE_URL}`)
if (SITE_URL.endsWith('.example')) {
  console.warn('Warning: set VITE_SITE_URL in .env to the real domain, or canonical URLs and the sitemap will be wrong.')
}
if (CONTACT_EMAIL.endsWith('.example')) {
  console.warn('Warning: set VITE_CONTACT_EMAIL in .env to a real address; the Contact, Privacy and Terms pages show it.')
}
