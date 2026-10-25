import { useEffect, useMemo, useRef } from 'react'
import {
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { output, type Network } from '../nn/network'
import type { Preset } from '../nn/presets'
import { fmt, fmtLoss } from './format'
import type { HistoryPoint } from './useTrainer'
import { Term } from './Term'

const axis = { tick: { fontSize: 11 }, stroke: '#6b7280' }
const tooltipStyle = { background: '#11141c', border: '1px solid #2e3446', fontSize: 12 }

export function LossChart({ history }: { history: HistoryPoint[] }) {
  const data = history
    .filter((h) => Number.isFinite(h.loss))
    .map((h) => ({ epoch: h.epoch, loss: Math.max(h.loss, 1e-10) }))
  return (
    <div className="chart-box">
      <div className="chart-title">
        <Term t="mistake score" /> over time. Going down means the network is learning.
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 4, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="#262b3a" />
          <XAxis dataKey="epoch" type="number" domain={['dataMin', 'dataMax']} {...axis} />
          <YAxis
            scale="log"
            domain={['auto', 'auto']}
            allowDataOverflow
            width={64}
            tickFormatter={(v: number) => fmtLoss(v)}
            {...axis}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            labelFormatter={(v) => `after ${v} learning steps`}
            formatter={(v) => [fmtLoss(Number(v)), 'mistake score']}
          />
          <Line dataKey="loss" stroke="#f472b6" dot={false} strokeWidth={2} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

interface FitProps {
  net: Network
  preset: Preset
  scaleInput: (x: number[]) => number[]
  rawInput: number[]
  showMistakes?: boolean
}

export function FitChart({ net, preset, scaleInput, rawInput, showMistakes }: FitProps) {
  const [min, max] = preset.inputRanges[0]
  const curve = useMemo(() => {
    const pts = []
    for (let k = 0; k <= 100; k++) {
      const x = min + ((max - min) * k) / 100
      pts.push({ x, model: output(net, scaleInput([x])), truth: preset.target([x]) })
    }
    return pts
  }, [net, min, max, scaleInput, preset])
  const points = preset.data.map((d) => ({ x: d.x[0], y: d.y }))
  const pred = output(net, scaleInput(rawInput))
  const finite = curve.every((p) => Number.isFinite(p.model))

  return (
    <div className="chart-box">
      <div className="chart-title">
        <span style={{ color: '#a3e635' }}>Green dots</span> = the correct answers it learns from (
        <Term t="training data" />). <span style={{ color: '#38bdf8' }}>Blue line</span> = what the network answers
        for every input. <span style={{ color: '#f472b6' }}>Pink dot</span> = your current input.
        {showMistakes && (
          <>
            {' '}
            <span style={{ color: '#f87171' }}>Red lines</span> = mistakes.
          </>
        )}
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart margin={{ top: 4, right: 12, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="#262b3a" />
          <XAxis dataKey="x" type="number" domain={[min, max]} tickFormatter={(v: number) => fmt(v, 1)} {...axis} />
          <YAxis type="number" width={48} tickFormatter={(v: number) => fmt(v, 1)} domain={['auto', 'auto']} {...axis} />
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => fmt(Number(v))} labelFormatter={(v) => `x = ${fmt(Number(v))}`} />
          <Line
            data={curve}
            dataKey="truth"
            name="true function"
            stroke="#6b7280"
            strokeDasharray="4 4"
            dot={false}
            isAnimationActive={false}
          />
          {finite && (
            <Line
              data={curve}
              dataKey="model"
              name="model"
              stroke="#38bdf8"
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={false}
            />
          )}
          {showMistakes &&
            finite &&
            preset.data.map((d) => (
              <ReferenceLine
                key={d.x[0]}
                segment={[
                  { x: d.x[0], y: d.y },
                  { x: d.x[0], y: output(net, scaleInput(d.x)) },
                ]}
                stroke="#f87171"
                strokeWidth={2}
                ifOverflow="extendDomain"
              />
            ))}
          <Scatter data={points} dataKey="y" name="training data" fill="#a3e635" isAnimationActive={false} />
          {Number.isFinite(pred) && (
            <ReferenceDot x={rawInput[0]} y={pred} r={6} fill="#f472b6" stroke="#fff" strokeWidth={1.5} />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

const MAP_MIN = -0.5
const MAP_MAX = 1.5
const MAP_SIZE = 200
const MAP_CELLS = 50

function mapColor(v: number): [number, number, number] {
  const t = Math.min(1, Math.max(0, v))
  const lo: [number, number, number] = [251, 146, 60]
  const mid: [number, number, number] = [24, 27, 38]
  const hi: [number, number, number] = [56, 189, 248]
  const [a, b, u] = t < 0.5 ? [lo, mid, t * 2] : [mid, hi, (t - 0.5) * 2]
  return [0, 1, 2].map((k) => Math.round(a[k] + (b[k] - a[k]) * u)) as [number, number, number]
}

interface MapProps {
  net: Network
  preset: Preset
  scaleInput: (x: number[]) => number[]
  rawInput: number[]
  onPick: (x: number[]) => void
}

export function DecisionMap({ net, preset, scaleInput, rawInput, onPick }: MapProps) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const toPx = (v: number) => ((v - MAP_MIN) / (MAP_MAX - MAP_MIN)) * MAP_SIZE

  useEffect(() => {
    const ctx = canvas.current?.getContext('2d')
    if (!ctx) return
    const cell = MAP_SIZE / MAP_CELLS
    for (let r = 0; r < MAP_CELLS; r++) {
      for (let c = 0; c < MAP_CELLS; c++) {
        const a = MAP_MIN + ((c + 0.5) / MAP_CELLS) * (MAP_MAX - MAP_MIN)
        const b = MAP_MAX - ((r + 0.5) / MAP_CELLS) * (MAP_MAX - MAP_MIN)
        const [R, G, B] = mapColor(output(net, scaleInput([a, b])))
        ctx.fillStyle = `rgb(${R},${G},${B})`
        ctx.fillRect(c * cell, r * cell, cell + 0.5, cell + 0.5)
      }
    }
    const px = (v: number) => ((v - MAP_MIN) / (MAP_MAX - MAP_MIN)) * MAP_SIZE
    for (const d of preset.data) {
      ctx.beginPath()
      ctx.arc(px(d.x[0]), MAP_SIZE - px(d.x[1]), 7, 0, Math.PI * 2)
      ctx.fillStyle = d.y >= 0.5 ? '#38bdf8' : '#fb923c'
      ctx.fill()
      ctx.lineWidth = 2
      ctx.strokeStyle = '#fff'
      ctx.stroke()
    }
  }, [net, preset, scaleInput])

  return (
    <div className="chart-box">
      <div className="chart-title">
        The network's answer for every possible input. <span style={{ color: '#38bdf8' }}>Blue = yes (1)</span>,{' '}
        <span style={{ color: '#fb923c' }}>orange = no (0)</span>. The circles are the 4 examples it learns from, coloured
        by their correct answer. Click anywhere to try that input.
      </div>
      <div className="decision-map-wrap">
        <div className="decision-map" style={{ width: MAP_SIZE, height: MAP_SIZE }}>
          <canvas
            ref={canvas}
            width={MAP_SIZE}
            height={MAP_SIZE}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const toVal = (p: number) => MAP_MIN + (p / MAP_SIZE) * (MAP_MAX - MAP_MIN)
              const clamp = (v: number, [lo, hi]: [number, number]) => Math.min(hi, Math.max(lo, v))
              const a = clamp(toVal(e.clientX - rect.left), preset.inputRanges[0])
              const b = clamp(toVal(MAP_SIZE - (e.clientY - rect.top)), preset.inputRanges[1])
              onPick([Math.round(a * 100) / 100, Math.round(b * 100) / 100])
            }}
          />
          <div
            className="decision-cursor"
            style={{ left: toPx(rawInput[0]), top: MAP_SIZE - toPx(rawInput[1]) }}
          />
          <span className="axis-label axis-x">{preset.inputLabels[0]} →</span>
          <span className="axis-label axis-y">{preset.inputLabels[1]} →</span>
        </div>
        <TruthTable net={net} preset={preset} scaleInput={scaleInput} onPick={onPick} />
      </div>
    </div>
  )
}

function TruthTable({ net, preset, scaleInput, onPick }: Omit<MapProps, 'rawInput'>) {
  return (
    <table className="truth-table">
      <thead>
        <tr>
          <th>{preset.inputLabels[0]}</th>
          <th>{preset.inputLabels[1]}</th>
          <th>correct</th>
          <th>network says</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {preset.data.map((d) => {
          const got = output(net, scaleInput(d.x))
          const ok = Math.abs(got - d.y) < 0.4
          return (
            <tr key={d.x.join()} onClick={() => onPick(d.x)}>
              <td>{d.x[0]}</td>
              <td>{d.x[1]}</td>
              <td>{d.y}</td>
              <td>{fmt(got)}</td>
              <td className={ok ? 'ok' : 'bad'}>{ok ? '✓' : '✗'}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
