const KEY = 'neural-playground-track-progress'

type Progress = Record<string, string[]>

export function loadProgress(): Progress {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '{}') as Progress
  } catch {
    return {}
  }
}

export function saveModuleDone(trackId: string, moduleId: string): Progress {
  const progress = loadProgress()
  const done = new Set(progress[trackId] ?? [])
  done.add(moduleId)
  const next = { ...progress, [trackId]: [...done] }
  localStorage.setItem(KEY, JSON.stringify(next))
  return next
}
