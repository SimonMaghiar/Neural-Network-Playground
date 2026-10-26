import { useState } from 'react'
import { RotateCcw, StepForward } from 'lucide-react'
import type { SimProps } from '../../types'
import { formatBytes } from '../../units'

const PROMPT = ['The', 'cat']
const GENERATED = ['sat', 'on', 'the', 'warm', 'mat', 'all', 'day', '.']

/** Llama 3 uses grouped-query attention: 8 key/value heads of 128 numbers per layer, stored in BF16 (2 bytes). */
const MODELS = [
  { name: 'Llama 3 8B', layers: 32, kvHeads: 8, headDim: 128, weights: 16e9 },
  { name: 'Llama 3 70B', layers: 80, kvHeads: 8, headDim: 128, weights: 140e9 },
]
const CONTEXTS = [1024, 8192, 32768, 131072]
const bytesPerToken = (m: (typeof MODELS)[number]) => 2 * m.layers * m.kvHeads * m.headDim * 2

export function KvCache({ onTaskDone }: SimProps) {
  const [cache, setCache] = useState(true)
  const [step, setStep] = useState(0)
  const [work, setWork] = useState(0)
  const [finished, setFinished] = useState<Set<boolean>>(() => new Set())
  const [modelIndex, setModelIndex] = useState(0)
  const [contextIndex, setContextIndex] = useState(1)
  const [users, setUsers] = useState(1)

  const tokens = [...PROMPT, ...GENERATED.slice(0, step)]
  const done = step >= GENERATED.length

  const reset = (c: boolean) => {
    setCache(c)
    setStep(0)
    setWork(0)
  }
  const next = () => {
    const computed = cache && step > 0 ? 1 : tokens.length
    setWork(work + computed)
    setStep(step + 1)
    if (step + 1 === GENERATED.length) {
      const f = new Set(finished).add(cache)
      setFinished(f)
      if (f.size === 2) onTaskDone()
    }
  }

  const model = MODELS[modelIndex]
  const perToken = bytesPerToken(model)
  const kvTotal = perToken * CONTEXTS[contextIndex] * users

  return (
    <div className="sim">
      <h3 className="sim-subtitle">Part 1: writing a sentence, one token at a time</h3>
      <div className="sim-row">
        <div className="pill-group">
          <button className={!cache ? 'is-active' : ''} onClick={() => reset(false)}>
            No cache: recompute everything
          </button>
          <button className={cache ? 'is-active' : ''} onClick={() => reset(true)}>
            With KV cache
          </button>
        </div>
        <button className="btn primary" onClick={next} disabled={done}>
          <StepForward size={16} /> Generate next token
        </button>
        <button className="btn" onClick={() => reset(cache)}>
          <RotateCcw size={16} /> Restart
        </button>
      </div>

      <div className="kv-grid">
        {tokens.map((t, i) => {
          const justWritten = step > 0 && i === tokens.length - 1
          const processedNow = step > 0 && !justWritten && (!cache || step === 1 || i === tokens.length - 2)
          const state = !step || justWritten ? '' : processedNow ? ' computed' : ' cached'
          const note = !step
            ? ''
            : justWritten
              ? '← just written; its K and V are computed next step'
              : processedNow
                ? cache || step === 1
                  ? 'computed'
                  : 'computed again'
                : 'reused from cache'
          return (
            <div key={i} className="kv-row">
              <span className={`kv-token${justWritten ? ' new' : ''}`}>{t}</span>
              <span className={`kv-cell${state}`}>K</span>
              <span className={`kv-cell${state}`}>V</span>
              <span className="kv-note">{note}</span>
            </div>
          )
        })}
      </div>

      <div className="big-stats">
        <div>
          <span>Tokens generated</span>
          <b>
            {step} / {GENERATED.length}
          </b>
        </div>
        <div>
          <span>Key/value computations so far</span>
          <b className={cache ? 'good' : 'warn'}>{work}</b>
        </div>
      </div>

      <h3 className="sim-subtitle">Part 2: how much memory does the cache need?</h3>
      <div className="sim-row">
        <div className="pill-group">
          {MODELS.map((m, i) => (
            <button key={m.name} className={i === modelIndex ? 'is-active' : ''} onClick={() => setModelIndex(i)}>
              {m.name}
            </button>
          ))}
        </div>
      </div>
      <div className="sim-row">
        <span className="sim-label">Conversation length:</span>
        <div className="pill-group">
          {CONTEXTS.map((c, i) => (
            <button key={c} className={i === contextIndex ? 'is-active' : ''} onClick={() => setContextIndex(i)}>
              {c >= 1024 ? `${c / 1024}K` : c} tokens
            </button>
          ))}
        </div>
      </div>
      <label className="slider wide">
        <span>
          Users chatting at the same time: <b>{users}</b>
        </span>
        <input type="range" min={1} max={64} value={users} onChange={(e) => setUsers(Number(e.target.value))} />
      </label>
      <div className="big-stats">
        <div>
          <span>Cache per token</span>
          <b>{formatBytes(perToken)}</b>
        </div>
        <div>
          <span>Total KV cache</span>
          <b className={kvTotal > model.weights ? 'warn' : ''}>{formatBytes(kvTotal)}</b>
        </div>
        <div>
          <span>Model weights (BF16)</span>
          <b>{formatBytes(model.weights)}</b>
        </div>
      </div>
      <p className="sim-note">
        Cache per token = 2 (key and value) × layers × KV heads × head size × 2 bytes. For {model.name}: 2 × {model.layers}{' '}
        × {model.kvHeads} × {model.headDim} × 2.
      </p>
    </div>
  )
}
