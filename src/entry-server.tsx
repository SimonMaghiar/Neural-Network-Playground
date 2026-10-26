import { StrictMode } from 'react'
import { prerender } from 'react-dom/static'
import App from './App'
import { allPaths, resolveRoute } from './routes'
import { setServerPath, toRoute } from './router'
import {
  customPageMeta,
  headTags,
  homeMeta,
  infoPageMeta,
  modulePageMeta,
  notFoundMeta,
  trackPageMeta,
  titleTag,
  type PageMeta,
} from './seo'
import { CONTACT_EMAIL, SITE_URL } from './site'

export { allPaths, CONTACT_EMAIL, SITE_URL }

async function metaFor(path: string): Promise<PageMeta> {
  const page = resolveRoute(toRoute(path))
  switch (page.kind) {
    case 'home':
      return homeMeta()
    case 'custom':
      return customPageMeta(page.track, page.sub)
    case 'track': {
      const content = await page.track.loadContent!()
      if (page.moduleIndex === null) return trackPageMeta(page.track, content)
      return modulePageMeta(page.track, page.moduleIndex, content[page.track.modules[page.moduleIndex].id])
    }
    case 'info':
      return infoPageMeta(page.info)
    case 'notFound':
      return notFoundMeta(path)
  }
}

/** Renders one page to HTML at build time, waiting for lazily loaded content. */
export async function render(path: string) {
  setServerPath(path)
  const meta = await metaFor(path)
  const { prelude } = await prerender(
    <StrictMode>
      <App />
    </StrictMode>,
  )
  const html = await new Response(prelude).text()
  return { html, title: titleTag(meta), head: headTags(meta), indexable: !meta.noindex }
}
