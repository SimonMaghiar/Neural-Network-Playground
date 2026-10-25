import { Fragment, type ReactNode } from 'react'
import type { ForwardTrace, Network } from '../nn/network'
import { fmt } from './format'
import { Term } from './Term'

export type ParamTarget =
  | { kind: 'weight'; layer: number; to: number; from: number }
  | { kind: 'bias'; layer: number; index: number }

interface Props {
  net: Network
  trace: ForwardTrace
  rawInput: number[]
  inputLabels: string[]
  inputScales: number[]
  target: number | undefined
  /** When set, weights and bias get sliders so the learner can tune them by hand. */
  onEdit?: (target: ParamTarget, value: number) => void
}

const WEIGHT_RANGE: [number, number] = [-2, 10]
const BIAS_RANGE: [number, number] = [-12, 8]

function Chip(props: {
  kind: 'input' | 'weight' | 'bias' | 'result' | 'answer'
  label: ReactNode
  value: number
  slider?: { range: [number, number]; onChange: (v: number) => void }
}) {
  const { kind, label, value, slider } = props
  return (
    <div className={`chip chip-${kind}`}>
      <span className="chip-label">{label}</span>
      <span className="chip-value">{fmt(value, 2)}</span>
      {slider && (
        <input
          type="range"
          min={slider.range[0]}
          max={slider.range[1]}
          step={0.05}
          value={Math.min(slider.range[1], Math.max(slider.range[0], value))}
          onChange={(e) => slider.onChange(Number(e.target.value))}
        />
      )}
    </div>
  )
}

/** Shows a single-neuron network's whole calculation as one readable line. */
export function NeuronRecipe({ net, trace, rawInput, inputLabels, inputScales, target, onEdit }: Props) {
  const layer = net.layers[0]
  const weights = layer.weights[0]
  const bias = layer.biases[0]
  const z = trace.z[0][0]
  const out = trace.a[1][0]
  const squished = layer.activation !== 'linear'

  return (
    <div className="recipe">
      <div className="recipe-title">
        Inside the <Term t="neuron" />: {weights.length > 1 ? 'each input × its weight, all added up, + bias' : 'input × weight + bias'}
      </div>
      <div className="recipe-row">
        {weights.map((w, i) => (
          <Fragment key={i}>
            {i > 0 && <span className="op">+</span>}
            <span className="op">(</span>
            <Chip
              kind="input"
              label={
                inputScales[i] === 1
                  ? inputLabels[i]
                  : `${inputLabels[i]} ${fmt(rawInput[i], 1)} ÷ ${Math.abs(inputScales[i] - Math.PI) < 1e-9 ? 'π' : inputScales[i]}`
              }
              value={trace.a[0][i]}
            />
            <span className="op">×</span>
            <Chip
              kind="weight"
              label={
                <Term t="weight">weight{weights.length > 1 ? ` ${i + 1}` : ''}</Term>
              }
              value={w}
              slider={
                onEdit && {
                  range: WEIGHT_RANGE,
                  onChange: (v) => onEdit({ kind: 'weight', layer: 0, to: 0, from: i }, v),
                }
              }
            />
            <span className="op">)</span>
          </Fragment>
        ))}
        <span className="op">+</span>
        <Chip
          kind="bias"
          label={<Term t="bias" />}
          value={bias}
          slider={onEdit && { range: BIAS_RANGE, onChange: (v) => onEdit({ kind: 'bias', layer: 0, index: 0 }, v) }}
        />
        <span className="op">=</span>
        <Chip kind={squished ? 'result' : 'answer'} label={squished ? 'sum' : 'answer'} value={z} />
        {squished && (
          <>
            <span className="op">
              → <Term t="squish function">squish</Term> →
            </span>
            <Chip kind="answer" label="answer" value={out} />
          </>
        )}
        {target !== undefined && (
          <span className={`recipe-target ${Math.abs(out - target) < 0.05 ? 'ok' : ''}`}>
            correct answer: <b>{fmt(target, 2)}</b>
            {Math.abs(out - target) < 0.05 ? ' ✓' : ` (off by ${fmt(Math.abs(out - target), 2)})`}
          </span>
        )}
      </div>
    </div>
  )
}
