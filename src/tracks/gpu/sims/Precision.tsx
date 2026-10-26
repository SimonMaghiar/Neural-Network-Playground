import { useState } from 'react'
import type { SimProps } from '../../types'
import { formatBytes } from '../../units'

/** Rounds to a floating-point format with `e` exponent bits and `m` mantissa bits (round-to-nearest). */
function roundFloat(x: number, e: number, m: number, max: number): number {
  if (x === 0 || !Number.isFinite(x)) return x
  const bias = 2 ** (e - 1) - 1
  const a = Math.abs(x)
  const exp = Math.max(Math.floor(Math.log2(a)), 1 - bias)
  const step = 2 ** (exp - m)
  const r = Math.round(a / step) * step
  return Math.sign(x) * (r > max ? Infinity : r)
}

const INT_RANGE = 10

function roundInt(x: number, bits: number): number {
  const levels = 2 ** (bits - 1) - 1
  const scale = INT_RANGE / levels
  const q = Math.max(-levels, Math.min(levels, Math.round(x / scale)))
  return q * scale
}

const formats = [
  { name: 'FP32', bits: [1, 8, 23], bytes: 4, round: (x: number) => Math.fround(x), speed: '67 trillion/s (no tensor cores)' },
  { name: 'BF16', bits: [1, 8, 7], bytes: 2, round: (x: number) => roundFloat(x, 8, 7, 3.39e38), speed: '989 trillion/s' },
  { name: 'FP16', bits: [1, 5, 10], bytes: 2, round: (x: number) => roundFloat(x, 5, 10, 65504), speed: '989 trillion/s' },
  { name: 'FP8 (E4M3)', bits: [1, 4, 3], bytes: 1, round: (x: number) => roundFloat(x, 4, 3, 448), speed: '1,979 trillion/s' },
  { name: 'INT8', bits: [8], bytes: 1, round: (x: number) => roundInt(x, 8), speed: '1,979 trillion/s' },
  { name: 'INT4', bits: [4], bytes: 0.5, round: (x: number) => roundInt(x, 4), speed: 'mostly saves memory' },
]

const PRESETS = ['3.14159265', '0.1', '1.001', '0.00001', '1000', '70000']
const MODEL_PARAMS = 7e9

export function Precision({ onTaskDone }: SimProps) {
  const [text, setText] = useState('3.14159265')
  const x = Number(text)
  const valid = text.trim() !== '' && Number.isFinite(x)

  const change = (t: string) => {
    setText(t)
    const v = Number(t)
    if (Number.isFinite(v) && !Number.isFinite(roundFloat(v, 5, 10, 65504)) && Number.isFinite(roundFloat(v, 8, 7, 3.39e38)))
      onTaskDone()
  }

  return (
    <div className="sim">
      <div className="sim-row">
        <label className="number-input">
          <span>Number to store:</span>
          <input type="number" step="any" value={text} onChange={(e) => change(e.target.value)} />
        </label>
        <div className="pill-group">
          {PRESETS.map((p) => (
            <button key={p} className={p === text ? 'is-active' : ''} onClick={() => change(p)}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <table className="precision-table">
        <thead>
          <tr>
            <th>Format</th>
            <th>Bits</th>
            <th>Stored as</th>
            <th>Error</th>
            <th>A 7B-weight model needs</th>
            <th>H100 speed</th>
          </tr>
        </thead>
        <tbody>
          {formats.map((f) => {
            const stored = valid ? f.round(x) : NaN
            const overflow = valid && !Number.isFinite(stored)
            const clipped = valid && f.bits.length === 1 && Math.abs(x) > INT_RANGE
            const err = valid && x !== 0 && !overflow ? Math.abs(stored - x) / Math.abs(x) : 0
            return (
              <tr key={f.name}>
                <td>
                  <b>{f.name}</b>
                </td>
                <td>
                  <div className="bit-row" title={f.bits.length === 3 ? 'sign / exponent / mantissa' : 'integer'}>
                    {f.bits.map((count, k) =>
                      Array.from({ length: count }, (_, i) => (
                        <span key={`${k}-${i}`} className={`bit ${f.bits.length === 1 ? 'int' : ['sign', 'exp', 'man'][k]}`} />
                      )),
                    )}
                  </div>
                </td>
                <td className="mono">
                  {!valid ? '—' : overflow ? <span className="warn">too big! (overflow)</span> : formatStored(stored)}
                  {clipped && <span className="warn"> (clipped)</span>}
                </td>
                <td className={`mono ${err > 0.01 ? 'warn' : err > 0 ? '' : 'good'}`}>
                  {!valid || overflow ? '—' : formatError(err)}
                </td>
                <td className="mono">{formatBytes(MODEL_PARAMS * f.bytes)}</td>
                <td className="muted">{f.speed}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <div className="bit-legend">
        <span>
          <i className="bit sign" /> sign (+/−)
        </span>
        <span>
          <i className="bit exp" /> exponent (how big: the range)
        </span>
        <span>
          <i className="bit man" /> mantissa (the digits: the precision)
        </span>
        <span>
          <i className="bit int" /> integer levels (here scaled to cover −{INT_RANGE}…{INT_RANGE})
        </span>
      </div>
    </div>
  )
}

function formatError(err: number): string {
  const pct = err * 100
  if (pct === 0) return 'exact'
  if (pct < 0.0001) return '< 0.0001%'
  return `${pct >= 10 ? Math.round(pct) : Number(pct.toPrecision(2))}%`
}

function formatStored(v: number): string {
  if (v === 0) return '0'
  const a = Math.abs(v)
  if (a >= 1e6 || a < 1e-4) return v.toExponential(6)
  return Number(v.toPrecision(10)).toString()
}
