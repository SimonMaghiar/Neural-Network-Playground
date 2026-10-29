import { Suspense, useEffect } from 'react'
import './App.css'
import './tracks.css'
import './site.css'
import { Home } from './pages/Home'
import { InfoPageView } from './pages/InfoPageView'
import { NotFound } from './pages/NotFound'
import { resolveRoute } from './routes'
import { useRoute } from './router'
import { cardFill } from './tracks/colors'
import { TrackPage } from './tracks/TrackPage'
import { CourseProgressBar } from './ui/CourseProgressBar'
import { SiteHeader } from './ui/SiteHeader'

export default function App() {
  const route = useRoute()
  const page = resolveRoute(route)
  const pageKey = 'track' in page ? page.track.id : page.kind === 'info' ? page.info.id : page.kind

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pageKey])

  let content = <Home />
  if (page.kind === 'custom') {
    const CustomPage = page.track.page!
    content = <CustomPage route={route} />
  } else if (page.kind === 'track') {
    content = <TrackPage key={page.track.id} track={page.track} moduleIndex={page.moduleIndex} />
  } else if (page.kind === 'info') {
    content = <InfoPageView key={page.info.id} page={page.info} />
  } else if (page.kind === 'notFound') {
    content = <NotFound />
  }

  const branded =
    page.kind === 'home' ||
    (page.kind === 'track' && page.track.section === 'course') ||
    (page.kind === 'custom' && page.track.id === 'foundations')

  return (
    <div className={`app-shell${branded ? ' is-brand' : ''}${page.kind === 'home' ? ' is-landing' : ''}`}>
      <SiteHeader section={route[0] ?? ''} />
      <div className="site-page">
        <Suspense fallback={<div className="page-loading">Loading…</div>}>{content}</Suspense>
      </div>
      {page.kind === 'track' && page.track.section === 'course' && <CourseProgressBar color={cardFill(page.track.id)} />}
    </div>
  )
}
