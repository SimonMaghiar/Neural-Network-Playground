import { useEffect, useRef, useState } from 'react'
import { Cpu, Gpu, Play } from 'lucide-react'
import type { SimProps } from '../../types'

const SIZES = [16, 64, 256, 1024, 4096]
const CPU_WORKERS = 8
const CPU_TICKS_PER_JOB = 1
const GPU_WORKERS = 512
const GPU_TICKS_PER_JOB = 4
const GPU_STARTUP = 24
const RACE_SECONDS = 4

function finishTime(kind: 'cpu' | 'gpu', n: number, chained: boolean) {
  if (kind === 'cpu') return chained ? n * CPU_TICKS_PER_JOB : Math.ceil(n / CPU_WORKERS) * CPU_TICKS_PER_JOB
  return GPU_STARTUP + (chained ? n * GPU_TICKS_PER_JOB : Math.ceil(n / GPU_WORKERS) * GPU_TICKS_PER_JOB)
}

function doneAt(kind: 'cpu' | 'gpu', n: number, chained: boolean, t: number) {
  if (kind === 'cpu') {
    const rounds = Math.floor(t / CPU_TICKS_PER_JOB)
    return Math.min(n, chained ? rounds : rounds * CPU_WORKERS)
  }
  if (t < GPU_STARTUP) return 0
  const rounds = Math.floor((t - GPU_STARTUP) / GPU_TICKS_PER_JOB)
  return Math.min(n, chained ? rounds : rounds * GPU_WORKERS)
}

function Grid({ n, done, color }: { n: number; done: number; color: string }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const ctx = canvas.current?.getContext('2d')
    if (!ctx) return
    const side = Math.ceil(Math.sqrt(n))
    const size = 180
    const cell = size / side
    ctx.clearRect(0, 0, size, size)
    for (let i = 0; i < n; i++) {
      ctx.fillStyle = i < done ? color : '#232838'
      const x = (i % side) * cell
      const y = Math.floor(i / side) * cell
      ctx.fillRect(x + 0.5, y + 0.5, Math.max(1, cell - 1), Math.max(1, cell - 1))
    }
  }, [n, done, color])
  return <canvas ref={canvas} width={180} height={180} className="race-grid" />
}

export function CpuGpuRace({ onTaskDone }: SimProps) {
  const [n, setN] = useState(256)
  const [chained, setChained] = useState(false)
  const [t, setT] = useState(0)
  const [running, setRunning] = useState(false)
  const winners = useRef(new Set<string>())

  const cpuEnd = finishTime('cpu', n, chained)
  const gpuEnd = finishTime('gpu', n, chained)
  const end = Math.max(cpuEnd, gpuEnd)

  useEffect(() => {
    if (!running) return
    const start = performance.now()
    let id = requestAnimationFrame(function tick(now) {
      const elapsed = (now - start) / 1000
      const ticks = (elapsed / RACE_SECONDS) * end
      if (ticks >= end) {
        setT(end)
        setRunning(false)
        winners.current.add(cpuEnd < gpuEnd ? 'cpu' : 'gpu')
        if (winners.current.has('cpu') && winners.current.has('gpu')) onTaskDone()
        return
      }
      setT(ticks)
      id = requestAnimationFrame(tick)
    })
    return () => cancelAnimationFrame(id)
  }, [running, end, cpuEnd, gpuEnd, onTaskDone])

  const reset = (fn: () => void) => {
    fn()
    setRunning(false)
    setT(0)
  }

  const finished = !running && t >= end && t > 0
  const sides = [
    { kind: 'cpu' as const, name: 'CPU', icon: Cpu, color: '#60a5fa', desc: `${CPU_WORKERS} fast workers, 1 tick per job`, end: cpuEnd },
    {
      kind: 'gpu' as const,
      name: 'GPU',
      icon: Gpu,
      color: '#4ade80',
      desc: `${GPU_WORKERS} simpler workers, ${GPU_TICKS_PER_JOB} ticks per job, ${GPU_STARTUP} ticks to get started`,
      end: gpuEnd,
    },
  ]

  return (
    <div className="sim">
      <div className="sim-row">
        <span className="sim-label">Number of jobs:</span>
        <div className="pill-group">
          {SIZES.map((s) => (
            <button key={s} className={s === n ? 'is-active' : ''} onClick={() => reset(() => setN(s))}>
              {s.toLocaleString('en-US')}
            </button>
          ))}
        </div>
      </div>
      <div className="sim-row">
        <span className="sim-label">Kind of work:</span>
        <div className="pill-group">
          <button className={!chained ? 'is-active' : ''} onClick={() => reset(() => setChained(false))}>
            Independent jobs (like a neural network)
          </button>
          <button className={chained ? 'is-active' : ''} onClick={() => reset(() => setChained(true))}>
            Each job needs the previous result
          </button>
        </div>
        <button
          className="btn primary"
          onClick={() => {
            setT(0)
            setRunning(true)
          }}
          disabled={running}
        >
          <Play size={16} /> Start the race
        </button>
      </div>

      <div className="race-arena">
        {sides.map((s) => {
          const Icon = s.icon
          const count = doneAt(s.kind, n, chained, t)
          return (
            <div className="racer" key={s.kind}>
              <div className="racer-head" style={{ color: s.color }}>
                <Icon size={18} /> <b>{s.name}</b>
              </div>
              <div className="racer-desc">{s.desc}</div>
              <Grid n={n} done={count} color={s.color} />
              <div className="racer-count">
                {count.toLocaleString('en-US')} / {n.toLocaleString('en-US')} jobs
                {count >= n && <span> · finished at tick {s.end.toLocaleString('en-US')}</span>}
              </div>
            </div>
          )
        })}
      </div>

      {finished && (
        <div className={`verdict-box ${cpuEnd < gpuEnd ? 'cpu' : 'gpu'}`}>
          {cpuEnd === gpuEnd
            ? 'A tie!'
            : cpuEnd < gpuEnd
              ? `The CPU wins, ${(gpuEnd / cpuEnd).toFixed(1)}× faster. ${chained ? 'When every job waits for the previous one, only one worker can be busy at a time, so the GPU’s army is useless.' : 'With so few jobs, the GPU’s start-up time is bigger than the work itself.'}`
              : `The GPU wins, ${(cpuEnd / gpuEnd).toFixed(1)}× faster. With lots of independent jobs, ${GPU_WORKERS} workers beat ${CPU_WORKERS}, even though each one is slower.`}
        </div>
      )}
    </div>
  )
}
