import { BrainCircuit } from 'lucide-react'
import { infoPages } from '../pages/info'
import { href } from '../router'
import { OWNER, SITE_NAME, TAGLINE } from '../site'
import { courses, labs } from '../tracks/catalog'
import { isAvailable } from '../tracks/types'

const page = (id: string) => infoPages.find((p) => p.id === id)!
const ABOUT = ['about', 'contact', 'privacy', 'terms'].map(page)
const legal = (
  <p className="footer-legal">
    © {new Date().getFullYear()} {OWNER}. All rights reserved. Spec figures are approximate and for learning purposes.
  </p>
)

/** Site-wide footer. `compact` fits narrow columns such as the module text or the lab sidebar. */
export function SiteFooter({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <footer className="site-footer compact">
        <nav aria-label="Site">
          {[page('glossary'), ...ABOUT].map((p) => (
            <a key={p.id} href={href(p.id)}>
              {p.title.replace(` ${SITE_NAME}`, '')}
            </a>
          ))}
        </nav>
        {legal}
      </footer>
    )
  }

  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <a className="site-logo" href={href('')}>
            <span className="site-logo-mark">
              <BrainCircuit size={18} />
            </span>
            {SITE_NAME}
          </a>
          <p>{TAGLINE}</p>
        </div>
        <nav aria-label="Courses">
          <div className="footer-heading">Courses</div>
          <ul>
            {courses.map((t) => (
              <li key={t.id}>
                {isAvailable(t) ? (
                  <a href={href(t.id)}>{t.title}</a>
                ) : (
                  <span className="footer-soon">
                    {t.title} <small>soon</small>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Lab and resources">
          <div className="footer-heading">Learn</div>
          <ul>
            {labs.map((t) => (
              <li key={t.id}>
                <a href={href(t.id)}>{t.title}</a>
              </li>
            ))}
            <li>
              <a href={href('foundations/playground')}>Neural network playground</a>
            </li>
            <li>
              <a href={href('glossary')}>AI glossary</a>
            </li>
          </ul>
        </nav>
        <nav aria-label="About">
          <div className="footer-heading">{SITE_NAME}</div>
          <ul>
            {ABOUT.map((p) => (
              <li key={p.id}>
                <a href={href(p.id)}>{p.id === 'about' ? 'About' : p.title}</a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      {legal}
    </footer>
  )
}
