import { useEffect } from 'react'
import type { InfoPage } from './pages/info'
import { href } from './router'
import { SITE_NAME, SITE_URL } from './site'
import { courses } from './tracks/catalog'
import type { ListedTrack, ModuleContent, TrackContent } from './tracks/types'
import { glossary, glossaryAnchor } from './ui/glossary'

/** Everything search engines and link previews need to know about one page. */
export interface PageMeta {
  title: string
  description: string
  /** Canonical path, e.g. `/gpu/tiling/`. */
  path: string
  type?: 'website' | 'article'
  noindex?: boolean
  /** schema.org structured data. */
  jsonLd?: object[]
}

const url = (path: string) => SITE_URL + path
const provider = { '@type': 'Organization', name: SITE_NAME, url: url('/') }

/** Appends the site name when the title stays short enough to show in full in search results. */
const withSiteName = (title: string) => (title.length + SITE_NAME.length + 3 <= 62 ? `${title} | ${SITE_NAME}` : title)

function breadcrumbs(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Home', path: '/' }, ...items].map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: url(item.path),
    })),
  }
}

function course(track: ListedTrack) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: track.title,
    description: track.description,
    url: url(href(track.id)),
    provider,
    educationalLevel: track.level,
    inLanguage: 'en',
  }
}

export function homeMeta(): PageMeta {
  const available = courses.filter((c) => c.loadContent)
  return {
    title: `${SITE_NAME}: Learn How AI Works, from GPUs to LLMs`,
    description:
      'Interactive courses for beginners: learn why AI runs on GPUs and how large language models like ChatGPT work, with hands-on simulations and no math background needed.',
    path: '/',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: SITE_NAME,
        url: url('/'),
        inLanguage: 'en',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: available.map((c, i) => ({ '@type': 'ListItem', position: i + 1, item: course(c) })),
      },
    ],
  }
}

export function trackPageMeta(track: ListedTrack, content: TrackContent): PageMeta {
  return {
    title: withSiteName(`${track.title}: Interactive Course`),
    description: track.description,
    path: href(track.id),
    jsonLd: [
      {
        ...course(track),
        hasPart: track.modules.map((m, i) => ({
          '@type': 'LearningResource',
          name: m.title,
          description: content[m.id]?.goal,
          url: url(href(`${track.id}/${m.id}`)),
          position: i + 1,
        })),
      },
      breadcrumbs([{ name: track.title, path: href(track.id) }]),
    ],
  }
}

export function modulePageMeta(track: ListedTrack, index: number, mod: ModuleContent): PageMeta {
  const m = track.modules[index]
  const path = href(`${track.id}/${m.id}`)
  const description = `${mod.goal} Module ${index + 1} of the "${track.title}" course, with an interactive simulation and a short quiz.`
  return {
    title: withSiteName(`${m.title} | ${track.title}`),
    description,
    path,
    type: 'article',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'LearningResource',
        name: m.title,
        description: mod.goal,
        url: url(path),
        learningResourceType: 'Interactive lesson',
        educationalLevel: track.level,
        inLanguage: 'en',
        position: index + 1,
        isPartOf: { '@type': 'Course', name: track.title, url: url(href(track.id)) },
        provider,
      },
      breadcrumbs([
        { name: track.title, path: href(track.id) },
        { name: m.title, path },
      ]),
    ],
  }
}

/** Pages of tracks that bring their own page component, e.g. the Foundations lab and its playground. */
export function customPageMeta(track: ListedTrack, sub: string): PageMeta {
  const info = track.pageMeta?.[sub] ?? { title: track.title, description: track.description }
  const path = href(sub ? `${track.id}/${sub}` : track.id)
  const trail = [{ name: track.title, path: href(track.id) }]
  if (sub) trail.push({ name: info.title.split(':')[0], path })
  return {
    title: withSiteName(info.title),
    description: info.description,
    path,
    jsonLd: [breadcrumbs(trail)],
  }
}

/** About, Glossary, Privacy and the other site pages. */
export function infoPageMeta(page: InfoPage): PageMeta {
  const path = href(page.id)
  const jsonLd: object[] = [breadcrumbs([{ name: page.title, path }])]
  if (page.id === 'glossary') {
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'DefinedTermSet',
      name: page.title,
      url: url(path),
      hasDefinedTerm: Object.entries(glossary).map(([term, description]) => ({
        '@type': 'DefinedTerm',
        name: term,
        description,
        url: `${url(path)}#${glossaryAnchor(term)}`,
      })),
    })
  }
  return { title: withSiteName(page.seoTitle ?? page.title), description: page.description, path, jsonLd }
}

export function notFoundMeta(path: string): PageMeta {
  return {
    title: `Page not found | ${SITE_NAME}`,
    description: 'This page does not exist. Start from the home page to find all courses and labs.',
    path,
    noindex: true,
  }
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export const titleTag = (meta: PageMeta) => `<title>${escapeHtml(meta.title)}</title>`

/** The `<head>` tags of a page except the title. Marked with `data-seo` so the browser can swap them on navigation. */
export function headTags(meta: PageMeta): string {
  const tags: [string, Record<string, string>][] = [['meta', { name: 'description', content: meta.description }]]
  if (meta.noindex) tags.push(['meta', { name: 'robots', content: 'noindex' }])
  else {
    tags.push(
      ['link', { rel: 'canonical', href: url(meta.path) }],
      ['meta', { property: 'og:type', content: meta.type ?? 'website' }],
      ['meta', { property: 'og:site_name', content: SITE_NAME }],
      ['meta', { property: 'og:title', content: meta.title }],
      ['meta', { property: 'og:description', content: meta.description }],
      ['meta', { property: 'og:url', content: url(meta.path) }],
      ['meta', { property: 'og:locale', content: 'en_US' }],
      ['meta', { name: 'twitter:card', content: 'summary' }],
    )
  }
  const html = tags.map(
    ([tag, attrs]) =>
      `<${tag} ${Object.entries(attrs)
        .map(([k, v]) => `${k}="${escapeHtml(v)}"`)
        .join(' ')} data-seo>`,
  )
  for (const data of meta.jsonLd ?? []) {
    html.push(`<script type="application/ld+json" data-seo>${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`)
  }
  return html.join('\n    ')
}

/** Keeps the document head in sync when the learner moves between pages in the browser. */
export function useDocumentHead(meta: PageMeta) {
  const tags = headTags(meta)
  useEffect(() => {
    document.title = meta.title
    document.head.querySelectorAll('[data-seo]').forEach((el) => el.remove())
    document.head.insertAdjacentHTML('beforeend', tags)
  }, [meta.title, tags])
}
