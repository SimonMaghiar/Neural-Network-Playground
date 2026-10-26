import { useEffect, useState } from 'react'
import { Play } from 'lucide-react'
import type { SimProps } from '../../types'
import { formatBytes, formatCount } from '../../units'

const WIDTHS = [128, 256, 512, 768, 1024, 1600, 2048, 4096, 8192, 12288]
const VOCAB = 50_257
const KNOWN = [
  { name: 'GPT-2 small (2019)', layers: 12, width: 768 },
  { name: 'GPT-2 XL (2019)', layers: 48, width: 1600 },
  { name: 'GPT-3 (2020)', layers: 96, width: 12288 },
]
const MAX_DRAWN = 8

/** ≈ 4d² for attention + 8d² for the feed-forward network per block, plus the embedding table. */
const paramCount = (layers: number, width: number) => 12 * layers * width * width + VOCAB * width

export function TransformerStack({ onTaskDone }: SimProps) {
  const [layers, setLayers] = useState(4)
  const [widthIndex, setWidthIndex] = useState(2)
  const [stage, setStage] = useState(-1)
  const width = WIDTHS[widthIndex]
  const drawn = Math.min(layers, MAX_DRAWN)
  const stages = 2 + drawn * 2 + 1

  useEffect(() => {
    if (stage < 0 || stage >= stages) return
    const id = setTimeout(() => setStage(stage + 1), 350)
    return () => clearTimeout(id)
  }, [stage, stages])

  const update = (l: number, wi: number) => {
    setLayers(l)
    setWidthIndex(wi)
    setStage(-1)
    if (l === 12 && WIDTHS[wi] === 768) onTaskDone()
  }

  const params = paramCount(layers, width)
  const cls = (s: number) => `tf-box${stage === s ? ' is-active' : stage > s ? ' is-done' : ''}`

  return (
    <div className="sim">
      <label className="slider wide">
        <span>
          Number of transformer blocks (layers): <b>{layers}</b>
        </span>
        <input type="range" min={1} max={96} value={layers} onChange={(e) => update(Number(e.target.value), widthIndex)} />
      </label>
      <label className="slider wide">
        <span>
          Width (numbers per token vector): <b>{width.toLocaleString('en-US')}</b>
        </span>
        <input
          type="range"
          min={0}
          max={WIDTHS.length - 1}
          value={widthIndex}
          onChange={(e) => update(layers, Number(e.target.value))}
        />
      </label>

      <div className="tf-wrap">
        <div className="tf-stack">
          <div className={cls(0)}>“The cat sat” → tokens</div>
          <div className={cls(1)}>Embedding: each token becomes {width.toLocaleString('en-US')} numbers</div>
          {Array.from({ length: drawn }, (_, i) => (
            <div key={i} className="tf-block">
              <span className="tf-block-label">Block {i + 1}</span>
              <div className={cls(2 + i * 2)}>Attention: look at the other words</div>
              <div className={cls(3 + i * 2)}>Feed-forward: think about each word</div>
            </div>
          ))}
          {layers > MAX_DRAWN && <div className="tf-more">… {layers - MAX_DRAWN} more blocks …</div>}
          <div className={cls(stages - 1)}>Output: probability of every next token → “on”</div>
        </div>
        <div className="tf-side">
          <button className="btn primary" onClick={() => setStage(0)} disabled={stage >= 0 && stage < stages}>
            <Play size={16} /> Send a token through
          </button>
          <div className="big-stats column">
            <div>
              <span>Parameters (weights)</span>
              <b>{formatCount(params)}</b>
            </div>
            <div>
              <span>Memory in BF16</span>
              <b>{formatBytes(params * 2)}</b>
            </div>
          </div>
          <table className="attn-table">
            <thead>
              <tr>
                <th>Real model</th>
                <th>Blocks</th>
                <th>Width</th>
              </tr>
            </thead>
            <tbody>
              {KNOWN.map((k) => (
                <tr key={k.name} className={k.layers === layers && k.width === width ? 'is-query' : ''}>
                  <td>{k.name}</td>
                  <td className="mono">{k.layers}</td>
                  <td className="mono">{k.width.toLocaleString('en-US')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <p className="sim-note">
        Parameter count ≈ 12 × blocks × width² + vocabulary × width, using GPT-2's vocabulary of 50,257 tokens. The
        diagram shows at most {MAX_DRAWN} blocks.
      </p>
    </div>
  )
}
