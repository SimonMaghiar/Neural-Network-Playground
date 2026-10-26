import { lessons, stepKey } from '../../lessons'

const STORAGE_KEY = 'neural-playground-progress'

export interface FoundationsProgress {
  lesson: number
  step: number
  completed: string[]
}

export function loadFoundationsProgress(): FoundationsProgress {
  try {
    const s = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '') as FoundationsProgress
    if (s.lesson < lessons.length && s.step < lessons[s.lesson].steps.length) return s
  } catch {
    // No saved progress yet.
  }
  return { lesson: 0, step: 0, completed: [] }
}

export function saveFoundationsProgress(p: FoundationsProgress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p))
}

/** Lessons whose tasks are all done (lessons without tasks count once the learner has moved past them). */
export function foundationsLessonsDone(): number {
  const p = loadFoundationsProgress()
  const done = new Set(p.completed)
  return lessons.filter(
    (l, i) => i < p.lesson || (l.steps.some((s) => s.task) && l.steps.every((s, k) => !s.task || done.has(stepKey(i, k)))),
  ).length
}
