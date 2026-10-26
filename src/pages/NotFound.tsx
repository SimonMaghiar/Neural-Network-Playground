import { ArrowRight } from 'lucide-react'
import { href, useRoute } from '../router'
import { notFoundMeta, useDocumentHead } from '../seo'
import { SiteFooter } from '../ui/SiteFooter'

export function NotFound() {
  const route = useRoute()
  useDocumentHead(notFoundMeta(href(route.join('/'))))
  return (
    <div className="home">
      <header className="hero">
        <div className="hero-kicker">Error 404</div>
        <h1>Page not found</h1>
        <p>This page does not exist, or it has moved. All courses and labs are listed on the home page.</p>
        <div className="hero-actions">
          <a className="btn primary big" href={href('')}>
            Go to the home page <ArrowRight size={18} />
          </a>
        </div>
      </header>
      <SiteFooter />
    </div>
  )
}
