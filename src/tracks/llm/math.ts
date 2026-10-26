/** Turns raw scores into probabilities that add up to 1. Lower temperature = sharper. */
export function softmax(scores: number[], temperature = 1): number[] {
  const scaled = scores.map((s) => s / temperature)
  const max = Math.max(...scaled)
  const exps = scaled.map((s) => Math.exp(s - max))
  const sum = exps.reduce((a, b) => a + b, 0)
  return exps.map((e) => e / sum)
}

/** Picks an index at random, weighted by `probs`. */
export function sampleIndex(probs: number[], random = Math.random): number {
  let r = random() * probs.reduce((a, b) => a + b, 0)
  for (let i = 0; i < probs.length; i++) {
    r -= probs[i]
    if (r <= 0) return i
  }
  return probs.length - 1
}

export const pct = (p: number) => (p >= 0.995 ? '100%' : p < 0.001 ? '<0.1%' : `${(p * 100).toFixed(p < 0.1 ? 1 : 0)}%`)
