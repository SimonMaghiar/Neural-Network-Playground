import { useState } from 'react'
import type { SimProps } from '../../types'

const SMS = 4
const WARP = 32

export function Scheduler({ onTaskDone }: SimProps) {
  const [blocks, setBlocks] = useState(5)
  const [branch, setBranch] = useState(32)

  const rounds = Math.ceil(blocks / SMS)
  const busy = blocks / (rounds * SMS)

  const changeBlocks = (b: number) => {
    setBlocks(b)
    if (b >= 2 * SMS && b % SMS === 0) onTaskDone()
  }

  const diverged = branch > 0 && branch < WARP
  const passes = diverged
    ? [
        { label: 'Pass 1: threads where the "if" is true', active: branch },
        { label: 'Pass 2: threads where it is false', active: WARP - branch },
      ]
    : [{ label: 'One pass: all threads run the same instruction', active: WARP }]

  return (
    <div className="sim">
      <h3 className="sim-subtitle">Part 1: spreading blocks over SMs</h3>
      <label className="slider wide">
        <span>
          Blocks of work: <b>{blocks}</b> (each block takes one round on one SM)
        </span>
        <input type="range" min={1} max={20} value={blocks} onChange={(e) => changeBlocks(Number(e.target.value))} />
      </label>
      <div className="sm-grid" style={{ gridTemplateColumns: `90px repeat(${rounds}, 1fr)` }}>
        <span />
        {Array.from({ length: rounds }, (_, r) => (
          <span key={r} className="sm-col-head">
            round {r + 1}
          </span>
        ))}
        {Array.from({ length: SMS }, (_, s) => (
          <div key={s} className="sm-row">
            <span className="sm-name">SM {s + 1}</span>
            {Array.from({ length: rounds }, (_, r) => {
              const b = r * SMS + s
              return (
                <span key={r} className={`sm-cell${b < blocks ? ' busy' : ''}`}>
                  {b < blocks ? `block ${b + 1}` : 'idle'}
                </span>
              )
            })}
          </div>
        ))}
      </div>
      <div className="big-stats">
        <div>
          <span>Rounds needed</span>
          <b>{rounds}</b>
        </div>
        <div>
          <span>SMs kept busy</span>
          <b className={busy < 1 ? 'warn' : 'good'}>{Math.round(busy * 100)}%</b>
        </div>
      </div>

      <h3 className="sim-subtitle">Part 2: a warp of {WARP} threads meets an "if"</h3>
      <label className="slider wide">
        <span>
          Threads whose "if" is true: <b>{branch}</b> of {WARP}
        </span>
        <input type="range" min={0} max={WARP} value={branch} onChange={(e) => setBranch(Number(e.target.value))} />
      </label>
      <div className="warp-passes">
        {passes.map((p, pi) => (
          <div key={pi} className="warp-pass">
            <span className="warp-label">{p.label}</span>
            <div className="warp-lanes">
              {Array.from({ length: WARP }, (_, lane) => {
                const on = !diverged || (pi === 0 ? lane < branch : lane >= branch)
                return <span key={lane} className={`lane${on ? ' on' : ''}`} />
              })}
            </div>
          </div>
        ))}
      </div>
      <div className={`verdict-box ${diverged ? 'cpu' : 'gpu'}`}>
        {diverged
          ? `The threads disagree, so the warp runs both paths one after the other while the other threads wait. That takes twice as long: only half the work per step is useful.`
          : 'All threads agree, so the whole warp finishes in one pass at full speed.'}
      </div>
    </div>
  )
}
