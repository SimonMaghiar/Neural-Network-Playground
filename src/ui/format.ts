export function fmt(v: number | undefined, digits?: number): string {
  if (v === undefined || Number.isNaN(v)) return '—'
  if (!Number.isFinite(v)) return v > 0 ? '∞' : '−∞'
  const abs = Math.abs(v)
  const d = digits ?? (abs >= 100 ? 1 : abs >= 10 ? 2 : 3)
  const s = v.toFixed(d)
  return Number(s) === 0 ? (0).toFixed(d) : s.replace('-', '−')
}

export function fmtSigned(v: number, digits?: number): string {
  const s = fmt(v, digits)
  return v > 0 && Number(v.toFixed(digits ?? 3)) !== 0 ? `+${s}` : s
}

export function fmtGrad(v: number): string {
  if (v !== 0 && Math.abs(v) < 0.001) return v.toExponential(1).replace('-', '−')
  return fmt(v, 4)
}

export function fmtLoss(v: number): string {
  if (!Number.isFinite(v)) return 'diverged'
  if (v === 0) return '0'
  return v < 0.001 || v >= 1e5 ? v.toExponential(2) : v.toFixed(4)
}

const POS: [number, number, number] = [56, 189, 248]
const NEG: [number, number, number] = [251, 146, 60]

/** Blue for positive, orange for negative; stronger colour for larger magnitudes. */
export function signColor(v: number, alpha = 1): string {
  const [r, g, b] = v >= 0 ? POS : NEG
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function intensity(v: number, softness = 1): number {
  return Math.tanh(Math.abs(v) / softness)
}

export const neuronName = (displayLayer: number, index: number, totalLayers: number, inputLabels: string[]) => {
  if (displayLayer === 0) return inputLabels[index] === 'input' ? 'Input' : `Input "${inputLabels[index]}"`
  if (displayLayer === totalLayers - 1) return 'Output'
  return totalLayers > 3 ? `Helper ${displayLayer}.${index + 1}` : `Helper ${index + 1}`
}
