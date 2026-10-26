import { useSyncExternalStore } from 'react'

const subscribe = (onChange: () => void) => {
  window.addEventListener('hashchange', onChange)
  return () => window.removeEventListener('hashchange', onChange)
}

/** Current route as path segments, e.g. `#/gpu/memory` → ['gpu', 'memory']. */
export function useRoute(): string[] {
  const hash = useSyncExternalStore(subscribe, () => window.location.hash)
  return hash.replace(/^#\/?/, '').split('/').filter(Boolean)
}

export const href = (path: string) => `#/${path}`

export function navigate(path: string) {
  window.location.hash = `/${path}`
}
