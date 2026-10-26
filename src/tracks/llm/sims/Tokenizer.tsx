import { useState } from 'react'
import type { SimProps } from '../../types'

/** Word → how often it appears in the training text. */
const CORPUS: Record<string, number> = {
  the: 20, low: 6, lower: 4, lowest: 4, new: 6, newer: 4, newest: 4, slow: 5, slower: 3, slowest: 3,
  wide: 3, wider: 2, widest: 2, token: 5, tokens: 4, model: 5, models: 4, learn: 4, learning: 4, learned: 3,
}
const MAX_MERGES = 40
const DEFAULT_TEXT = 'the newest models learn the slowest tokens'
const COLORS = ['#60a5fa', '#4ade80', '#f472b6', '#facc15', '#a78bfa', '#fb923c', '#2dd4bf']

/** Byte-pair encoding: repeatedly glue together the most frequent neighbouring pair of symbols. */
function learnMerges(): [string, string][] {
  let words = Object.entries(CORPUS).map(([w, n]) => ({ symbols: [...w], n }))
  const merges: [string, string][] = []
  for (let m = 0; m < MAX_MERGES; m++) {
    const pairs = new Map<string, number>()
    for (const { symbols, n } of words)
      for (let i = 0; i < symbols.length - 1; i++) {
        const key = `${symbols[i]}\u0000${symbols[i + 1]}`
        pairs.set(key, (pairs.get(key) ?? 0) + n)
      }
    let best: string | null = null
    for (const [key, n] of pairs) if (!best || n > pairs.get(best)!) best = key
    if (!best) break
    const [a, b] = best.split('\u0000')
    merges.push([a, b])
    words = words.map(({ symbols, n }) => ({ symbols: applyMerge(symbols, a, b), n }))
  }
  return merges
}

function applyMerge(symbols: string[], a: string, b: string): string[] {
  const out: string[] = []
  for (let i = 0; i < symbols.length; i++) {
    if (i < symbols.length - 1 && symbols[i] === a && symbols[i + 1] === b) {
      out.push(a + b)
      i++
    } else out.push(symbols[i])
  }
  return out
}

const MERGES = learnMerges()
const BASE_VOCAB = [...new Set(Object.keys(CORPUS).join(''))].sort()

function tokenize(text: string, mergeCount: number): string[][] {
  return text
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => MERGES.slice(0, mergeCount).reduce((symbols, [a, b]) => applyMerge(symbols, a, b), [...word]))
}

function tokenId(token: string): number {
  const base = BASE_VOCAB.indexOf(token)
  if (base >= 0) return base
  const merged = MERGES.findIndex(([a, b]) => a + b === token)
  return merged >= 0 ? BASE_VOCAB.length + merged : 999
}

export function Tokenizer({ onTaskDone }: SimProps) {
  const [text, setText] = useState(DEFAULT_TEXT)
  const [merges, setMerges] = useState(0)

  const words = tokenize(text, merges)
  const tokens = words.flat()
  const letters = words.reduce((s, w) => s + w.join('').length, 0)

  const update = (t: string, m: number) => {
    setText(t)
    setMerges(m)
    const w = tokenize(t, m)
    const count = w.flat().length
    if (m >= 20 && count > 0 && count * 3 <= w.reduce((s, x) => s + x.join('').length, 0)) onTaskDone()
  }

  return (
    <div className="sim">
      <label className="number-input wide-input">
        <span>Text:</span>
        <input type="text" value={text} onChange={(e) => update(e.target.value, merges)} />
      </label>
      <label className="slider wide">
        <span>
          Merges learned: <b>{merges}</b> of {MAX_MERGES} (vocabulary: {BASE_VOCAB.length + merges} tokens)
        </span>
        <input type="range" min={0} max={MAX_MERGES} value={merges} onChange={(e) => update(text, Number(e.target.value))} />
      </label>

      <div className="token-view">
        {words.map((w, wi) => (
          <span key={wi} className="token-word">
            {w.map((t, ti) => {
              const color = COLORS[(wi * 3 + ti) % COLORS.length]
              return (
                <span key={ti} className="token" style={{ borderColor: color, background: `${color}22` }}>
                  {t}
                  <sub>{tokenId(t)}</sub>
                </span>
              )
            })}
          </span>
        ))}
      </div>

      <div className="big-stats">
        <div>
          <span>Letters</span>
          <b>{letters}</b>
        </div>
        <div>
          <span>Tokens</span>
          <b>{tokens.length}</b>
        </div>
        <div>
          <span>Letters per token</span>
          <b className={tokens.length && letters / tokens.length >= 3 ? 'good' : ''}>
            {tokens.length ? (letters / tokens.length).toFixed(1) : '—'}
          </b>
        </div>
      </div>

      <div className="merge-list">
        <span className="sim-label">Merges so far, in the order they were learned:</span>
        <div>
          {merges === 0 && <span className="muted">none yet, so every letter is its own token</span>}
          {MERGES.slice(0, merges).map(([a, b], i) => (
            <span key={i} className="merge">
              {a}+{b}
            </span>
          ))}
        </div>
      </div>
      <p className="sim-note">
        Learned from {Object.keys(CORPUS).length} words like “low”, “newest” and “learning”. Try a word it never saw, like
        “unbelievable”: it falls apart into small pieces.
      </p>
    </div>
  )
}
