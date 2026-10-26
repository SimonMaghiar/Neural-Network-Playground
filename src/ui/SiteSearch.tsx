import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { Search } from 'lucide-react'
import { navigateTo } from '../router'
import { buildIndex, loadGoals, search, type SearchItem } from '../search'

const SNIPPET = 90

/** Header search over courses, modules, lab lessons, glossary terms and site pages. Press "/" to focus it. */
export function SiteSearch() {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const [goals, setGoals] = useState<Record<string, string>>()
  const input = useRef<HTMLInputElement>(null)
  const box = useRef<HTMLDivElement>(null)
  const index = useMemo(() => buildIndex(goals), [goals])
  const results = useMemo(() => search(index, query), [index, query])
  const showResults = open && query.trim() !== ''

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      const el = e.target as HTMLElement
      const typing = el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)
      if (e.key === '/' && !typing) {
        e.preventDefault()
        input.current?.focus()
      }
    }
    const onPointer = (e: PointerEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [])

  const onFocus = () => {
    setOpen(true)
    if (!goals) loadGoals().then(setGoals, () => setGoals({}))
  }

  const close = () => {
    setOpen(false)
    setQuery('')
    input.current?.blur()
  }

  const choose = (item: SearchItem) => {
    close()
    navigateTo(item.href)
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (!results.length) return
      const step = e.key === 'ArrowDown' ? 1 : -1
      setActive((i) => (i + step + results.length) % results.length)
      setOpen(true)
    } else if (e.key === 'Enter' && showResults && results[active]) {
      e.preventDefault()
      choose(results[active])
    } else if (e.key === 'Escape') {
      close()
    }
  }

  return (
    <div className="site-search" ref={box} role="search">
      <Search size={15} className="site-search-icon" />
      <input
        ref={input}
        type="search"
        placeholder="Search courses, lessons, terms…"
        aria-label="Search the site"
        role="combobox"
        aria-expanded={showResults}
        aria-controls="site-search-results"
        aria-autocomplete="list"
        aria-activedescendant={showResults && results[active] ? `search-result-${active}` : undefined}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setActive(0)
          setOpen(true)
        }}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
      />
      <kbd className="site-search-key" aria-hidden="true">
        /
      </kbd>
      {showResults && (
        <ul className="search-results" id="site-search-results" role="listbox">
          {results.length === 0 ? (
            <li className="search-empty">No results for “{query.trim()}”</li>
          ) : (
            results.map((r, i) => (
              <li key={r.href + r.title} id={`search-result-${i}`} role="option" aria-selected={i === active}>
                <a
                  href={r.href}
                  className={i === active ? 'is-active' : ''}
                  onMouseEnter={() => setActive(i)}
                  onClick={close}
                >
                  <span className={`search-kind kind-${r.kind.toLowerCase()}`}>{r.kind}</span>
                  <span className="search-main">
                    <span className="search-title">{r.title}</span>
                    {r.context && <span className="search-context">{r.context}</span>}
                    {r.text && (
                      <span className="search-snippet">
                        {r.text.length > SNIPPET ? `${r.text.slice(0, SNIPPET).trimEnd()}…` : r.text}
                      </span>
                    )}
                  </span>
                </a>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
