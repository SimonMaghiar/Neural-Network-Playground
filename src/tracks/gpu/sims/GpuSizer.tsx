import { useState } from 'react'
import { Gpu } from 'lucide-react'
import type { SimProps } from '../../types'
import { formatBytes } from '../../units'

const MODELS = [
  { name: '1B', params: 1e9 },
  { name: '8B', params: 8e9 },
  { name: '70B', params: 70e9 },
  { name: '405B', params: 405e9 },
]
const PRECISIONS = [
  { name: 'FP32', bytes: 4 },
  { name: 'BF16', bytes: 2 },
  { name: 'FP8', bytes: 1 },
  { name: 'INT4', bytes: 0.5 },
]
const GPUS = [
  { name: 'RTX 4090 (gaming)', memory: 24e9, bandwidth: 1.0e12 },
  { name: 'A100 80GB', memory: 80e9, bandwidth: 2.0e12 },
  { name: 'H100', memory: 80e9, bandwidth: 3.35e12 },
  { name: 'H200', memory: 141e9, bandwidth: 4.8e12 },
  { name: 'B200', memory: 192e9, bandwidth: 8.0e12 },
]
/** Extra room for the KV cache, activations and the framework itself; a rough rule of thumb. */
const INFERENCE_OVERHEAD = 1.2
/** Mixed-precision training with the Adam optimizer: weights, gradients, FP32 master copy, two optimizer states. */
const TRAIN_BYTES_PER_PARAM = 16

export function GpuSizer({ onTaskDone }: SimProps) {
  const [model, setModel] = useState(MODELS[1])
  const [precision, setPrecision] = useState(PRECISIONS[1])
  const [gpu, setGpu] = useState(GPUS[2])
  const [training, setTraining] = useState(false)

  const weightBytes = model.params * precision.bytes
  const needed = training ? model.params * TRAIN_BYTES_PER_PARAM : weightBytes * INFERENCE_OVERHEAD
  const count = Math.ceil(needed / gpu.memory)
  const tokensPerSecond = (gpu.bandwidth * count) / weightBytes

  const update = (m = model, p = precision, g = gpu, t = training) => {
    setModel(m)
    setPrecision(p)
    setGpu(g)
    setTraining(t)
    const n = Math.ceil((t ? m.params * TRAIN_BYTES_PER_PARAM : m.params * p.bytes * INFERENCE_OVERHEAD) / g.memory)
    if (!t && m.params === 70e9 && n === 1) onTaskDone()
  }

  return (
    <div className="sim">
      <div className="sim-row">
        <span className="sim-label">Goal:</span>
        <div className="pill-group">
          <button className={!training ? 'is-active' : ''} onClick={() => update(model, precision, gpu, false)}>
            Run the model (answer questions)
          </button>
          <button className={training ? 'is-active' : ''} onClick={() => update(model, precision, gpu, true)}>
            Train the model
          </button>
        </div>
      </div>
      <div className="sim-row">
        <span className="sim-label">Model size:</span>
        <div className="pill-group">
          {MODELS.map((m) => (
            <button key={m.name} className={m === model ? 'is-active' : ''} onClick={() => update(m)}>
              {m.name} weights
            </button>
          ))}
        </div>
      </div>
      {!training && (
        <div className="sim-row">
          <span className="sim-label">Number format:</span>
          <div className="pill-group">
            {PRECISIONS.map((p) => (
              <button key={p.name} className={p === precision ? 'is-active' : ''} onClick={() => update(model, p)}>
                {p.name} ({p.bytes} byte{p.bytes === 1 ? '' : 's'} per weight)
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="sim-row">
        <span className="sim-label">GPU:</span>
        <div className="pill-group">
          {GPUS.map((g) => (
            <button key={g.name} className={g === gpu ? 'is-active' : ''} onClick={() => update(model, precision, g)}>
              {g.name} · {formatBytes(g.memory)}
            </button>
          ))}
        </div>
      </div>

      <div className="big-stats">
        <div>
          <span>Memory needed</span>
          <b>{formatBytes(needed)}</b>
        </div>
        <div>
          <span>GPUs needed</span>
          <b className={count === 1 ? 'good' : count > 8 ? 'warn' : ''}>{count.toLocaleString('en-US')}</b>
        </div>
        {!training && (
          <div>
            <span>Top speed for one user</span>
            <b>≈ {Math.round(tokensPerSecond).toLocaleString('en-US')} tokens/s</b>
          </div>
        )}
      </div>

      <div className="gpu-rack">
        {Array.from({ length: Math.min(count, 64) }, (_, i) => {
          const fill = Math.min(1, needed / gpu.memory - i)
          return (
            <div key={i} className="gpu-box" title={`GPU ${i + 1}`}>
              <Gpu size={16} />
              <div className="gpu-fill" style={{ height: `${fill * 100}%` }} />
            </div>
          )
        })}
        {count > 64 && <span className="muted">… and {count - 64} more</span>}
      </div>

      <p className="sim-note">
        {training
          ? `Training needs about ${TRAIN_BYTES_PER_PARAM} bytes per weight (the weights, their gradients, a full-precision copy and the optimizer's memory), before counting the activations, which add a lot more.`
          : `Running a model needs its weights (${formatBytes(weightBytes)} here) plus roughly 20% extra for the KV cache and working memory. The speed estimate assumes generating each word means reading every weight once, so memory speed sets the limit.`}
      </p>
    </div>
  )
}
