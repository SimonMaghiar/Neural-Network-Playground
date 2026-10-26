import { useRoute } from '../../router'
import { TrackLayout } from '../../ui/TrackLayout'
import { tracks } from '../catalog'
import { gpuContent } from './modules'

const gpuTrack = tracks.find((t) => t.id === 'gpu')!

export default function GpuTrack() {
  const route = useRoute()
  return <TrackLayout track={gpuTrack} content={gpuContent} moduleId={route[1]} />
}
