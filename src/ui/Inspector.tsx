import type { ReactNode } from 'react'
import { ArrowDown, ArrowUp, MousePointerClick } from 'lucide-react'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { activations, biasIndex, weightIndex, type ForwardTrace, type Gradients, type Network } from '../nn/network'
import { fmt, fmtGrad, neuronName } from './format'
import type { HistoryPoint } from './useTrainer'
import type { Selection } from './NetworkView'
import type { ParamTarget } from './NeuronRecipe'
import { SquishCurve } from './SquishCurve'
import { Term } from './Term'

interface Props {
  net: Network
  trace: ForwardTrace
  grads: Gradients
  history: HistoryPoint[]
  selection: Selection | null
  inputLabels: string[]
  inputScales: number[]
  rawInput: number[]
  target: number | undefined
  learningRate: number
  onEdit: (target: ParamTarget, value: number) => void
}

const SERIES_COLORS = ['#f472b6', '#38bdf8', '#a3e635', '#facc15', '#c084fc', '#fb923c', '#2dd4bf', '#f87171']

const squishNames = {
  sigmoid: 'sigmoid squishes any number into 0…1',
  tanh: 'tanh squishes any number into −1…1',
  relu: 'ReLU turns negative numbers into 0 and keeps positive ones',
  linear: '',
}

interface Series {
  key: string
  label: string
  index: number
}

function ParamHistory({ history, series }: { history: HistoryPoint[]; series: Series[] }) {
  if (history.length < 2) {
    return <p className="hint">Once training starts, a chart here will show how these numbers change.</p>
  }
  const data = history.map((h) => {
    const row: Record<string, number> = { epoch: h.epoch }
    for (const s of series) row[s.key] = h.params[s.index]
    return row
  })
  return (
    <div className="chart-box">
      <div className="chart-title">How these numbers changed while learning (left = start, right = now)</div>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -12 }}>
          <CartesianGrid stroke="#262b3a" />
          <XAxis dataKey="epoch" type="number" domain={['dataMin', 'dataMax']} tick={{ fontSize: 11 }} stroke="#6b7280" />
          <YAxis tick={{ fontSize: 11 }} stroke="#6b7280" tickFormatter={(v: number) => fmt(v, 1)} />
          <Tooltip
            contentStyle={{ background: '#11141c', border: '1px solid #2e3446', fontSize: 12 }}
            labelFormatter={(v) => `after ${v} learning steps`}
            formatter={(v) => fmt(Number(v))}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {series.map((s, i) => (
            <Line
              key={s.key}
              dataKey={s.key}
              name={s.label}
              stroke={SERIES_COLORS[i % SERIES_COLORS.length]}
              dot={false}
              strokeWidth={2}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function Overview() {
  return (
    <div className="inspector-body">
      <div className="empty-hint">
        <MousePointerClick size={20} />
        <span>Click any circle or line in the picture to look inside it.</span>
      </div>
      <h3>How a network learns, in four steps</h3>
      <ol className="steps">
        <li>
          <b>Guess.</b> The <Term t="input" /> flows left to right. Each <Term t="neuron" /> multiplies what it
          receives by its <Term t="weight">weights</Term>, adds its <Term t="bias" />, and passes the result on.
        </li>
        <li>
          <b>Check.</b> The guesses are compared with the correct answers from the <Term t="training data" />. That
          gives a <Term t="mistake score" />.
        </li>
        <li>
          <b>Figure out the blame.</b> For every weight and bias, the network works out whether making it a little
          bigger would make the mistakes smaller or bigger.
        </li>
        <li>
          <b>Nudge.</b> Every weight and bias moves a little in the helpful direction. Then repeat from step 1.
        </li>
      </ol>
      <p className="hint">Hover over any underlined word to see what it means.</p>
    </div>
  )
}

function rangeFor(v: number): [number, number] {
  return Math.abs(v) > 9 ? [-60, 60] : [-10, 10]
}

function TuneSlider(props: { label: string; value: number; onChange: (v: number) => void }) {
  const [min, max] = rangeFor(props.value)
  return (
    <label className="tune">
      <span>
        Try it yourself: drag to change the {props.label} <b>{fmt(props.value, 2)}</b>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={0.05}
        value={props.value}
        onChange={(e) => props.onChange(Number(e.target.value))}
      />
    </label>
  )
}

function NudgeLine(props: { what: string; value: number; gradient: number; learningRate: number }) {
  const { what, value, gradient, learningRate } = props
  const change = -learningRate * gradient
  if (Math.abs(change) < 1e-4) {
    return (
      <div className="nudge settled">
        The next <Term t="learning step" /> will barely change this {what}. The network is happy with it as it is.
      </div>
    )
  }
  const up = change > 0
  return (
    <div className={`nudge ${up ? 'up' : 'down'}`}>
      {up ? <ArrowUp size={18} /> : <ArrowDown size={18} />}
      <span>
        The next <Term t="learning step" /> will <Term t="nudge" /> this {what} <b>{up ? 'up' : 'down'}</b> by{' '}
        {fmt(Math.abs(change), 3)} (from {fmt(value)} to {fmt(value + change)}), because that makes the{' '}
        <Term t="mistake score" /> smaller.
      </span>
    </div>
  )
}

function MathDetails(props: { symbol: string; value: number; gradient: number; learningRate: number; children?: ReactNode }) {
  const { symbol, value, gradient, learningRate } = props
  return (
    <details className="math-details">
      <summary>Show the math (for the curious)</summary>
      {props.children}
      <div className="formula">
        <Term t="gradient">∂L/∂{symbol}</Term> = <b>{fmtGrad(gradient)}</b>
      </div>
      <div className="formula">
        new {symbol} = {fmt(value)} − <Term t="learning rate">{learningRate}</Term> × {fmtGrad(gradient)} ={' '}
        <b>{fmt(value - learningRate * gradient)}</b>
      </div>
      <p className="hint">
        L is the <Term t="loss" />. ∂L/∂{symbol} says how fast the loss grows if {symbol} grows. Moving against it
        lowers the loss. This is called gradient descent.
      </p>
    </details>
  )
}

export function Inspector(props: Props) {
  const { net, trace, grads, history, selection, inputLabels, inputScales, rawInput, target, learningRate, onEdit } =
    props
  if (!selection) return <Overview />

  const totalLayers = net.layers.length + 1
  const name = (l: number, i: number) => neuronName(l, i, totalLayers, inputLabels)

  if (selection.kind === 'edge') {
    const { layer: l, to: j, from: i } = selection
    const w = net.layers[l - 1].weights[j][i]
    const signal = trace.a[l - 1][i]
    const g = grads.weights[l - 1][j][i]
    return (
      <div className="inspector-body">
        <h3>
          Connection: {name(l - 1, i)} → {name(l, j)}
        </h3>
        <p className="lead">
          This line carries a number from <b>{name(l - 1, i)}</b> to <b>{name(l, j)}</b>. On the way it gets multiplied
          by the line's <Term t="weight" />, <b>{fmt(w)}</b>.{' '}
          {Math.abs(w) < 0.1
            ? 'That is close to 0, so this connection hardly matters right now.'
            : w > 0
              ? 'It is positive, so a bigger signal here pushes the next neuron up.'
              : 'It is negative, so a bigger signal here pushes the next neuron down.'}
        </p>
        <div className="calc-line">
          signal {fmt(signal)} × weight {fmt(w)} = <b>{fmt(signal * w)}</b> arrives at {name(l, j)}
        </div>
        <NudgeLine what="weight" value={w} gradient={g} learningRate={learningRate} />
        <TuneSlider label="weight" value={w} onChange={(v) => onEdit({ kind: 'weight', layer: l - 1, to: j, from: i }, v)} />
        <ParamHistory history={history} series={[{ key: 'w', label: 'weight', index: weightIndex(net, l - 1, j, i) }]} />
        <MathDetails symbol="w" value={w} gradient={g} learningRate={learningRate} />
      </div>
    )
  }

  const { layer: l, index: i } = selection
  if (l === 0) {
    return (
      <div className="inspector-body">
        <h3>{name(0, i)}</h3>
        <p className="lead">
          This is where a number goes <b>in</b>. It doesn't calculate anything; it just hands the value{' '}
          <b>{fmt(rawInput[i], 2)}</b> to every neuron it is connected to. Change it with the input slider below the
          picture.
        </p>
        {inputScales[i] !== 1 && (
          <p className="hint">
            The value is first divided by {fmt(inputScales[i], 2)}, giving {fmt(trace.a[0][i])}. Networks learn more
            smoothly with small numbers (roughly between −1 and 1), so big inputs are shrunk first.
          </p>
        )}
      </div>
    )
  }

  const layer = net.layers[l - 1]
  const isOutput = l === totalLayers - 1
  const inputs = trace.a[l - 1]
  const weights = layer.weights[i]
  const bias = layer.biases[i]
  const z = trace.z[l - 1][i]
  const a = trace.a[l][i]
  const squished = layer.activation !== 'linear'
  const series: Series[] = [
    { key: 'b', label: 'bias', index: biasIndex(net, l - 1, i) },
    ...weights.slice(0, 7).map((_, k) => ({
      key: `w${k}`,
      label: `weight from ${name(l - 1, k)}`,
      index: weightIndex(net, l - 1, i, k),
    })),
  ]

  return (
    <div className="inspector-body">
      <h3>{isOutput ? 'Output neuron' : `${name(l, i)} (a helper neuron)`}</h3>
      <p className="lead">
        {isOutput ? (
          <>
            This neuron gives the network's final answer: <b>{fmt(a)}</b>.
          </>
        ) : (
          <>
            This neuron sits in a <Term t="hidden layer" />. Its answer (<b>{fmt(a)}</b>) is not the final result; it
            is passed on to the next layer, which combines it with the other helpers.
          </>
        )}
      </p>

      <div className="chart-title">What it is calculating right now</div>
      <div className="calc">
        {weights.map((w, k) => (
          <div className="calc-row" key={k}>
            <span className="muted">from {name(l - 1, k)}:</span>
            <span>
              {fmt(inputs[k])} × {fmt(w)}
            </span>
            <b>{fmt(inputs[k] * w)}</b>
          </div>
        ))}
        <div className="calc-row">
          <span className="muted">
            plus its <Term t="bias" />:
          </span>
          <span />
          <b>{fmt(bias)}</b>
        </div>
        <div className="calc-row total">
          <span>{squished ? 'sum' : 'answer'}</span>
          <span />
          <b>{fmt(z)}</b>
        </div>
      </div>

      {squished && (
        <div className="squish-box">
          <div className="chart-title">
            Then the <Term t="squish function" /> reshapes it: {squishNames[layer.activation]}.
          </div>
          <SquishCurve activation={layer.activation} z={z} />
          <div className="calc-line">
            {layer.activation}({fmt(z)}) = <b>{fmt(a)}</b>
          </div>
        </div>
      )}

      {isOutput && target !== undefined && (
        <div className={`verdict ${Math.abs(a - target) < 0.05 ? 'ok' : ''}`}>
          Correct answer: <b>{fmt(target)}</b>.{' '}
          {Math.abs(a - target) < 0.05
            ? 'The network gets this one right!'
            : `The network's answer is ${fmt(Math.abs(a - target))} too ${a > target ? 'high' : 'low'}.`}
        </div>
      )}

      <NudgeLine what="bias" value={bias} gradient={grads.biases[l - 1][i]} learningRate={learningRate} />
      <TuneSlider label="bias" value={bias} onChange={(v) => onEdit({ kind: 'bias', layer: l - 1, index: i }, v)} />
      <ParamHistory history={history} series={series} />
      <MathDetails symbol="b" value={bias} gradient={grads.biases[l - 1][i]} learningRate={learningRate}>
        <div className="formula">
          z = Σ (w × input) + b = {fmt(z)}
          <br />a = {activations[layer.activation].formula.replace('f(z) = ', '')} = {fmt(a)}
        </div>
        <table className="math-table">
          <thead>
            <tr>
              <th>weight from</th>
              <th>value</th>
              <th>∂L/∂w</th>
            </tr>
          </thead>
          <tbody>
            {weights.map((w, k) => (
              <tr key={k}>
                <td>{name(l - 1, k)}</td>
                <td>{fmt(w)}</td>
                <td className="muted">{fmtGrad(grads.weights[l - 1][i][k])}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </MathDetails>
    </div>
  )
}
