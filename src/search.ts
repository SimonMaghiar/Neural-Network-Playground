import { lessons } from './lessons'
import { infoPages } from './pages/info'
import { href } from './router'
import { courses, labs } from './tracks/catalog'
import { glossary, glossaryAnchor } from './ui/glossary'

export type ResultKind = 'Course' | 'Module' | 'Lab' | 'Lesson' | 'Term' | 'Page'

export interface SearchItem {
  kind: ResultKind
  title: string
  /** Where the result lives, e.g. "Track 2: How LLMs Work". */
  context?: string
  /** Extra searchable text, also shown as a snippet. */
  text?: string
  href: string
}

/** Module goals live in each track's lazily loaded content, so they are passed in once loaded. */
export function buildIndex(goals: Record<string, string> = {}): SearchItem[] {
  const items: SearchItem[] = []
  for (const t of courses.filter((c) => c.loadContent)) {
    items.push({ kind: 'Course', title: t.title, context: t.label, text: t.description, href: href(t.id) })
    for (const m of t.modules) {
      const path = `${t.id}/${m.id}`
      items.push({ kind: 'Module', title: m.title, context: `${t.label}: ${t.title}`, text: goals[path], href: href(path) })
    }
  }
  for (const t of labs) {
    items.push({ kind: 'Lab', title: t.title, context: 'Lab', text: t.description, href: href(t.id) })
    for (const [sub, info] of Object.entries(t.pageMeta ?? {})) {
      if (sub) items.push({ kind: 'Lab', title: info.title.split(':')[0], context: 'Lab', text: info.description, href: href(`${t.id}/${sub}`) })
    }
  }
  for (const l of lessons) {
    items.push({
      kind: 'Lesson',
      title: l.title,
      context: 'Lab: Neural Network Foundations',
      text: l.steps.map((s) => s.title).join(' · '),
      href: href('foundations'),
    })
  }
  for (const [term, definition] of Object.entries(glossary)) {
    items.push({ kind: 'Term', title: term, context: 'Glossary', text: definition, href: `${href('glossary')}#${glossaryAnchor(term)}` })
  }
  for (const p of infoPages) items.push({ kind: 'Page', title: p.title, text: p.description, href: href(p.id) })
  return items
}

/** Learning content first: a lesson on a topic beats its one-line glossary definition. */
const KIND_WEIGHT: Record<ResultKind, number> = { Course: 30, Module: 25, Lab: 20, Lesson: 15, Term: 10, Page: 5 }

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

/** Results where every word of the query appears; title matches rank first. */
export function search(items: SearchItem[], query: string, limit = 8): SearchItem[] {
  const q = normalize(query).trim()
  const words = q.split(/\s+/).filter(Boolean)
  if (!words.length) return []
  const scored: { item: SearchItem; score: number }[] = []
  for (const item of items) {
    const title = normalize(item.title)
    const haystack = `${title} ${normalize(item.context ?? '')} ${normalize(item.text ?? '')}`
    if (!words.every((w) => haystack.includes(w))) continue
    let score = KIND_WEIGHT[item.kind]
    if (title === q) score += 40
    else if (title.startsWith(q)) score += 30
    else if (title.includes(q)) score += 20
    score += words.filter((w) => title.includes(w)).length * 10
    scored.push({ item, score })
  }
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.item)
}

/** Loads every course's module goals, keyed by `track/module`. */
export async function loadGoals(): Promise<Record<string, string>> {
  const goals: Record<string, string> = {}
  await Promise.all(
    courses
      .filter((c) => c.loadContent)
      .map(async (t) => {
        const content = await t.loadContent!()
        for (const m of t.modules) if (content[m.id]) goals[`${t.id}/${m.id}`] = content[m.id].goal
      }),
  )
  return goals
}
