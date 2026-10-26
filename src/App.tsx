import { Suspense, useEffect } from 'react'
import './App.css'
import './tracks.css'
import { Home } from './pages/Home'
import { useRoute } from './router'
import { findTrack } from './tracks/catalog'
import { TrackPage } from './tracks/TrackPage'

export default function App() {
  const route = useRoute()
  const track = findTrack(route[0])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [track])

  let page = <Home />
  if (track?.page) {
    const CustomPage = track.page
    page = <CustomPage route={route} />
  } else if (track?.loadContent) {
    page = <TrackPage key={track.id} track={track} route={route} />
  }

  return <Suspense fallback={<div className="page-loading">Loading…</div>}>{page}</Suspense>
}
