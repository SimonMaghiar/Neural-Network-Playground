import { BrainCircuit } from 'lucide-react'
import { href } from '../router'
import { SITE_NAME } from '../site'
import { courses } from '../tracks/catalog'
import { SiteSearch } from './SiteSearch'

const NAV = [
  { label: 'Courses', href: `${href('')}#courses`, matches: courses.map((c) => c.id) },
  { label: 'Lab', href: href('foundations'), matches: ['foundations'] },
  { label: 'Glossary', href: href('glossary'), matches: ['glossary'] },
  { label: 'About', href: href('about'), matches: ['about'] },
]

/** Shown on every page. `section` is the first URL segment, used to highlight the current menu item. */
export function SiteHeader({ section }: { section: string }) {
  return (
    <header className="site-header">
      <a className="site-logo" href={href('')} aria-label={`${SITE_NAME} home`}>
        <span className="site-logo-mark">
          <BrainCircuit size={18} />
        </span>
        <span className="site-logo-text">{SITE_NAME}</span>
      </a>
      <nav className="site-nav" aria-label="Main">
        {NAV.map((item) => (
          <a
            key={item.label}
            href={item.href}
            aria-current={item.matches.includes(section) ? 'page' : undefined}
          >
            {item.label}
          </a>
        ))}
      </nav>
      <SiteSearch />
    </header>
  )
}
