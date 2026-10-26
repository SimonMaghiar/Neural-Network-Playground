import { infoPageMeta, useDocumentHead } from '../seo'
import { SiteFooter } from '../ui/SiteFooter'
import type { InfoPage } from './info'

export function InfoPageView({ page }: { page: InfoPage }) {
  useDocumentHead(infoPageMeta(page))
  const Body = page.body
  return (
    <div className="home">
      <article className="info-page">
        <header>
          <h1>{page.title}</h1>
          <p className="info-lead">{page.lead}</p>
        </header>
        <Body />
      </article>
      <SiteFooter />
    </div>
  )
}
