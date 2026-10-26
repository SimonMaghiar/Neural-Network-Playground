import { lazy, Suspense, useEffect } from 'react'
import './App.css'
import './tracks.css'
import { Home } from './pages/Home'
import { useRoute } from './router'

const FoundationsTrack = lazy(() => import('./tracks/FoundationsTrack'))
const GpuTrack = lazy(() => import('./tracks/gpu/GpuTrack'))

export default function App() {
  const [section] = useRoute()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [section])

  let page
  switch (section) {
    case 'foundations':
      page = <FoundationsTrack key="learn" mode="learn" />
      break
    case 'playground':
      page = <FoundationsTrack key="play" mode="play" />
      break
    case 'gpu':
      page = <GpuTrack />
      break
    default:
      page = <Home />
  }

  return <Suspense fallback={<div className="page-loading">Loading…</div>}>{page}</Suspense>
}
