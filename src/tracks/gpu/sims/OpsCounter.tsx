import { useState } from 'react'
import { Cpu, Gpu, User } from 'lucide-react'
import type { SimProps } from '../../types'
import { formatCount, formatDuration } from '../../units'

const models = [
  { name: 'Beach neuron (Track 1)', params: 4 },
  { name: 'Circle network (Track 1)', params: 33 },
  { name: 'Small handwriting reader', params: 100_000 },
  { name: 'GPT-2 (2019)', params: 1.5e9 },
  { name: 'Llama 3 8B (2024)', params: 8e9 },
  { name: 'GPT-3 (2020)', params: 175e9 },
]

const workers = [
  { name: 'You, with a calculator', icon: User, opsPerSecond: 1, note: '1 operation per second' },
  { name: 'A fast desktop CPU', icon: Cpu, opsPerSecond: 1e12, note: '≈ 1 trillion per second' },
  { name: 'An AI GPU (NVIDIA H100)', icon: Gpu, opsPerSecond: 1e15, note: '≈ 1,000 trillion per second' },
]

export function OpsCounter({ onTaskDone }: SimProps) {
  const [modelIndex, setModelIndex] = useState(0)
  const model = models[modelIndex]
  const ops = model.params * 2

  const choose = (i: number) => {
    setModelIndex(i)
    if (models[i].params >= 175e9) onTaskDone()
  }

  const times = workers.map((w) => ops / w.opsPerSecond)
  const maxLog = Math.log10(Math.max(...times)) + 9

  return (
    <div className="sim">
      <div className="sim-row">
        <span className="sim-label">Pick a network:</span>
        <div className="pill-group">
          {models.map((m, i) => (
            <button key={m.name} className={i === modelIndex ? 'is-active' : ''} onClick={() => choose(i)}>
              {m.name}
            </button>
          ))}
        </div>
      </div>

      <div className="big-stats">
        <div>
          <span>Weights (numbers it learned)</span>
          <b>{formatCount(model.params)}</b>
        </div>
        <div>
          <span>Multiplications + additions for one word</span>
          <b>{formatCount(ops)}</b>
        </div>
      </div>

      <div className="race-bars">
        {workers.map((w, i) => {
          const t = times[i]
          const width = Math.max(2, ((Math.log10(t) + 9) / Math.max(maxLog, 1)) * 100)
          const Icon = w.icon
          return (
            <div className="race-bar" key={w.name}>
              <div className="race-who">
                <Icon size={18} />
                <div>
                  <b>{w.name}</b>
                  <span>{w.note}</span>
                </div>
              </div>
              <div className="race-track">
                <div className="race-fill" style={{ width: `${Math.min(100, width)}%` }} />
              </div>
              <div className="race-time">{formatDuration(t)}</div>
            </div>
          )
        })}
      </div>
      <p className="sim-note">
        Time to produce one word, counting only the arithmetic. Bar lengths use a logarithmic scale (each step is 10×),
        otherwise the GPU bar would be invisible.
      </p>
    </div>
  )
}
