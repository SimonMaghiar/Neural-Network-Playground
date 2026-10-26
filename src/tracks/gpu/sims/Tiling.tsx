import { useEffect, useState } from 'react'
import { Play } from 'lucide-react'
import type { SimProps } from '../../types'

const N = 8
const FAST_CAPACITY = 32
const TILES = [1, 2, 4, 8]
const RUN_SECONDS = 5

export function Tiling({ onTaskDone }: SimProps) {
  const [tile, setTile] = useState(1)
  const [step, setStep] = useState(-1)
  const [running, setRunning] = useState(false)

  const per = N / tile
  const totalSteps = per * per * per
  const loadsPerStep = 2 * tile * tile
  const totalLoads = totalSteps * loadsPerStep
  const fits = 2 * tile * tile <= FAST_CAPACITY

  useEffect(() => {
    if (!running) return
    const start = performance.now()
    let id = requestAnimationFrame(function tick(now) {
      const s = Math.floor(((now - start) / 1000 / RUN_SECONDS) * totalSteps)
      if (s >= totalSteps) {
        setStep(totalSteps - 1)
        setRunning(false)
        if (tile === 4) onTaskDone()
        return
      }
      setStep(s)
      id = requestAnimationFrame(tick)
    })
    return () => cancelAnimationFrame(id)
  }, [running, totalSteps, tile, onTaskDone])

  const bi = step < 0 ? -1 : Math.floor(step / (per * per))
  const bj = step < 0 ? -1 : Math.floor(step / per) % per
  const bk = step < 0 ? -1 : step % per
  const loadsSoFar = step < 0 ? 0 : (step + 1) * loadsPerStep
  const outputTilesDone = step < 0 ? 0 : bi * per + bj + (bk === per - 1 ? 1 : 0)

  const inTile = (r: number, c: number, tr: number, tc: number) =>
    tr >= 0 && Math.floor(r / tile) === tr && Math.floor(c / tile) === tc

  const grid = (kind: 'A' | 'B' | 'C') => (
    <div className="tile-matrix">
      <div className="matrix-title">{kind === 'C' ? 'C = A × B' : kind}</div>
      <div className="tile-grid">
        {Array.from({ length: N * N }, (_, idx) => {
          const r = Math.floor(idx / N)
          const c = idx % N
          let cls = ''
          if (kind === 'A' && inTile(r, c, bi, bk)) cls = ' hot'
          if (kind === 'B' && inTile(r, c, bk, bj)) cls = ' hot'
          if (kind === 'C') {
            const tileIndex = Math.floor(r / tile) * per + Math.floor(c / tile)
            if (inTile(r, c, bi, bj)) cls = ' working'
            else if (tileIndex < outputTilesDone) cls = ' done'
          }
          return <span key={idx} className={`tile-cell${cls}`} />
        })}
      </div>
    </div>
  )

  return (
    <div className="sim">
      <div className="sim-row">
        <span className="sim-label">Tile size:</span>
        <div className="pill-group">
          {TILES.map((t) => {
            const ok = 2 * t * t <= FAST_CAPACITY
            return (
              <button
                key={t}
                className={t === tile ? 'is-active' : ''}
                onClick={() => {
                  setTile(t)
                  setStep(-1)
                  setRunning(false)
                }}
                title={ok ? '' : 'Too big for the fast memory'}
              >
                {t} × {t}
                {!ok && ' (too big)'}
              </button>
            )
          })}
        </div>
        <button
          className="btn primary"
          disabled={running || !fits}
          onClick={() => {
            setStep(-1)
            setRunning(true)
          }}
        >
          <Play size={16} /> Multiply
        </button>
      </div>

      <div className="tile-arena">
        {grid('A')}
        <span className="matrix-op">×</span>
        {grid('B')}
        <span className="matrix-op">=</span>
        {grid('C')}
      </div>

      <div className="big-stats">
        <div>
          <span>Numbers held in fast memory</span>
          <b className={fits ? 'good' : 'warn'}>
            {2 * tile * tile} / {FAST_CAPACITY}
          </b>
        </div>
        <div>
          <span>Trips to slow memory so far</span>
          <b>{loadsSoFar.toLocaleString('en-US')}</b>
        </div>
        <div>
          <span>Total trips for the whole multiply</span>
          <b className={tile === 4 ? 'good' : ''}>{fits ? totalLoads.toLocaleString('en-US') : '—'}</b>
        </div>
      </div>
      {!fits && (
        <div className="verdict-box cpu">
          An 8 × 8 tile of A plus one of B is 128 numbers, but the fast memory only holds {FAST_CAPACITY}. On a real GPU
          this is the limit set by shared memory and registers.
        </div>
      )}
      <p className="sim-note">
        Highlighted: the tiles of A and B currently copied into fast memory, and the tile of C they are adding into.
      </p>
    </div>
  )
}
