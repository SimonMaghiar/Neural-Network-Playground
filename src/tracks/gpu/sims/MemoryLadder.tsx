import { useEffect, useState } from 'react'
import type { SimProps } from '../../types'

/** Approximate figures for an NVIDIA H100 SXM system. Latencies are rough orders of magnitude. */
const levels = [
  { id: 'reg', name: 'Registers', where: 'inside each worker', size: '256 KB per SM (≈33 MB total)', speed: 'instant', cycles: 1, analogy: '1 second', analogyNote: 'the ingredient is already in your hand' },
  { id: 'smem', name: 'Shared memory / L1 cache', where: 'next to each group of workers (SM)', size: 'up to 256 KB per SM', speed: 'tens of TB/s in total', cycles: 30, analogy: '30 seconds', analogyNote: 'grab it from the counter' },
  { id: 'l2', name: 'L2 cache', where: 'on the chip, shared by everyone', size: '50 MB', speed: '≈10 TB/s', cycles: 200, analogy: '3 minutes', analogyNote: 'walk to the pantry' },
  { id: 'hbm', name: 'GPU memory (HBM)', where: 'stacked right next to the chip', size: '80 GB', speed: '3.35 TB/s', cycles: 500, analogy: '8 minutes', analogyNote: 'go down to the cellar' },
  { id: 'cpu', name: 'CPU memory (over PCIe)', where: 'on the motherboard', size: 'hundreds of GB', speed: '≈64 GB/s', cycles: 3500, analogy: '1 hour', analogyNote: 'drive to the supermarket' },
  { id: 'ssd', name: 'SSD storage', where: 'a separate drive', size: 'terabytes', speed: '≈7–14 GB/s', cycles: 180000, analogy: '2 days', analogyNote: 'order online and wait for delivery' },
]

export function MemoryLadder({ onTaskDone }: SimProps) {
  const [active, setActive] = useState<string | null>(null)
  const [visited, setVisited] = useState<Set<string>>(() => new Set())
  const [progress, setProgress] = useState(0)
  const [fetches, setFetches] = useState(0)

  const level = levels.find((l) => l.id === active)

  useEffect(() => {
    if (!level) return
    const duration = 300 + Math.log10(level.cycles) * 700
    const start = performance.now()
    let id = requestAnimationFrame(function tick(now) {
      const p = Math.min(1, (now - start) / duration)
      setProgress(p)
      if (p < 1) id = requestAnimationFrame(tick)
    })
    return () => cancelAnimationFrame(id)
  }, [level, fetches])

  const fetchFrom = (id: string) => {
    setProgress(0)
    setActive(id)
    setFetches((n) => n + 1)
    const next = new Set(visited).add(id)
    setVisited(next)
    if (next.has('reg') && next.has('hbm') && next.has('ssd')) onTaskDone()
  }

  return (
    <div className="sim">
      <div className="ladder">
        <div className="ladder-head">
          <span>Level</span>
          <span>Size</span>
          <span>Speed</span>
          <span>If a register took 1 second…</span>
          <span />
        </div>
        {levels.map((l, i) => (
          <div key={l.id} className={`ladder-row${active === l.id ? ' is-active' : ''}`} style={{ ['--depth' as string]: i }}>
            <div>
              <b>{l.name}</b>
              <span>{l.where}</span>
            </div>
            <div>{l.size}</div>
            <div>{l.speed}</div>
            <div>
              <b>{l.analogy}</b>
              <span>{l.analogyNote}</span>
            </div>
            <button className="btn small" onClick={() => fetchFrom(l.id)}>
              Fetch data
            </button>
          </div>
        ))}
      </div>
      {level && (
        <div className="fetch-anim">
          <div className="fetch-label">
            Fetching from <b>{level.name}</b>… {progress >= 1 && <span>arrived! That took about {level.cycles.toLocaleString('en-US')}× longer than a register.</span>}
          </div>
          <div className="fetch-track">
            <div className="fetch-packet" style={{ left: `${progress * 100}%` }} />
          </div>
        </div>
      )}
      <p className="sim-note">
        Approximate numbers for an NVIDIA H100 system. Real latencies vary; what matters is the pattern: every step down
        is bigger but much slower.
      </p>
    </div>
  )
}
