import { useSyncExternalStore } from 'react'

const KEY = 'neural-playground-track-progress'

/** Finished module ids per track. */
export type Progress = Record<string, string[]>

const EMPTY: Progress = {}
const listeners = new Set<() => void>()
let cache: { raw: string | null; value: Progress } | undefined

function read(): Progress {
  const raw = localStorage.getItem(KEY)
  if (cache?.raw !== raw) {
    let value = EMPTY
    try {
      value = raw ? (JSON.parse(raw) as Progress) : EMPTY
    } catch {
      // Corrupt data: start over.
    }
    cache = { raw, value }
  }
  return cache.value
}

function subscribe(onChange: () => void) {
  listeners.add(onChange)
  window.addEventListener('storage', onChange)
  return () => {
    listeners.delete(onChange)
    window.removeEventListener('storage', onChange)
  }
}

/** Saved progress. Empty on the server and during hydration, so pre-rendered pages stay identical for everyone. */
export const useProgress = () => useSyncExternalStore(subscribe, read, () => EMPTY)

export function saveModuleDone(trackId: string, moduleId: string) {
  const progress = read()
  const done = new Set(progress[trackId] ?? [])
  done.add(moduleId)
  localStorage.setItem(KEY, JSON.stringify({ ...progress, [trackId]: [...done] }))
  listeners.forEach((l) => l())
}
