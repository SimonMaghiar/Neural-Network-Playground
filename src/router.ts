import { useSyncExternalStore } from 'react'

const listeners = new Set<() => void>()
let serverPath = '/'

/** Pre-rendering has no `window`: the build tells the router which page it is rendering. */
export function setServerPath(path: string) {
  serverPath = path
}

const subscribe = (onChange: () => void) => {
  listeners.add(onChange)
  window.addEventListener('popstate', onChange)
  return () => {
    listeners.delete(onChange)
    window.removeEventListener('popstate', onChange)
  }
}

const currentPath = () => (typeof window === 'undefined' ? serverPath : window.location.pathname)

/** Current route as path segments, e.g. `/gpu/memory/` → ['gpu', 'memory']. */
export function useRoute(): string[] {
  const path = useSyncExternalStore(subscribe, currentPath, currentPath)
  return toRoute(path)
}

export const toRoute = (path: string) => path.split('/').filter(Boolean)

/** Canonical URL path of a page: always with a trailing slash, e.g. `gpu/memory` → `/gpu/memory/`. */
export const href = (path: string) => (path ? `/${path}/` : '/')

/** Scrolls to the element named in the URL's #fragment, waiting briefly for lazily loaded pages to render it. */
function scrollToHash(hash: string, tries = 40) {
  const el = document.getElementById(decodeURIComponent(hash.slice(1)))
  if (el) el.scrollIntoView({ block: 'start' })
  else if (tries > 0) setTimeout(() => scrollToHash(hash, tries - 1), 50)
}

/** Goes to a same-site URL such as `/glossary/#kv-cache` without reloading the page. */
export function navigateTo(url: string) {
  const target = new URL(url, window.location.href)
  window.history.pushState(null, '', target.pathname + target.search + target.hash)
  listeners.forEach((l) => l())
  if (target.hash) scrollToHash(target.hash)
}

export function navigate(path: string) {
  navigateTo(href(path))
}

/** Same-site links switch pages without a reload, while staying real links for crawlers. */
export function interceptLinks() {
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    const link = (e.target as Element | null)?.closest?.('a')
    if (!link || link.target || link.hasAttribute('download')) return
    const url = new URL(link.href, window.location.href)
    if (url.origin !== window.location.origin || /\.[a-z0-9]+$/i.test(url.pathname)) return
    if (url.pathname === window.location.pathname && url.hash) return
    e.preventDefault()
    if (url.pathname + url.search !== window.location.pathname + window.location.search) navigateTo(url.href)
  })
}

/** Old `#/gpu/memory` links: rewrites the address to the real path. Returns true if it did. */
export function upgradeHashUrl(): boolean {
  const { hash } = window.location
  if (!hash.startsWith('#/')) return false
  window.history.replaceState(null, '', href(hash.slice(2).replace(/\/+$/, '')))
  return true
}
