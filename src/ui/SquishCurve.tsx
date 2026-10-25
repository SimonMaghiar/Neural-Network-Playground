import { activations, type Activation } from '../nn/network'
import { fmt } from './format'

const W = 240
const H = 120
const PAD = 18
const Z_MIN = -6
const Z_MAX = 6

/** Draws an activation ("squish") function and, optionally, where the current value sits on it. */
export function SquishCurve({ activation, z }: { activation: Activation; z?: number }) {
  const f = activations[activation].fn
  const [yMin, yMax] = activation === 'sigmoid' ? [0, 1] : activation === 'tanh' ? [-1, 1] : [-1, 6]
  const px = (v: number) => PAD + ((v - Z_MIN) / (Z_MAX - Z_MIN)) * (W - 2 * PAD)
  const py = (v: number) => H - PAD - ((Math.min(yMax, Math.max(yMin, v)) - yMin) / (yMax - yMin)) * (H - 2 * PAD)
  const points: string[] = []
  for (let k = 0; k <= 60; k++) {
    const v = Z_MIN + ((Z_MAX - Z_MIN) * k) / 60
    points.push(`${px(v).toFixed(1)},${py(f(v)).toFixed(1)}`)
  }
  const zc = z === undefined ? undefined : Math.min(Z_MAX, Math.max(Z_MIN, z))
  return (
    <svg className="squish" width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <line x1={PAD} x2={W - PAD} y1={py(0)} y2={py(0)} className="squish-axis" />
      <line x1={px(0)} x2={px(0)} y1={PAD - 6} y2={H - PAD} className="squish-axis" />
      {activation === 'sigmoid' && <line x1={PAD} x2={W - PAD} y1={py(1)} y2={py(1)} className="squish-guide" />}
      <polyline points={points.join(' ')} className="squish-line" />
      <text x={W - PAD} y={py(0) + 12} textAnchor="end" className="squish-text">
        number in →
      </text>
      <text x={px(0) + 4} y={PAD - 6} className="squish-text">
        number out
      </text>
      {zc !== undefined && (
        <>
          <line x1={px(zc)} x2={px(zc)} y1={py(0)} y2={py(f(zc))} className="squish-guide" />
          <circle cx={px(zc)} cy={py(f(zc))} r={5} className="squish-dot" />
          <text x={px(zc)} y={py(f(zc)) - 9} textAnchor="middle" className="squish-text strong">
            {fmt(f(z!), 2)}
          </text>
        </>
      )}
    </svg>
  )
}
