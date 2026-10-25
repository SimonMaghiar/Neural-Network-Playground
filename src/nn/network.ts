export type Activation = 'linear' | 'relu' | 'sigmoid' | 'tanh'

export interface Layer {
  /** weights[neuron][input] */
  weights: number[][]
  biases: number[]
  activation: Activation
}

export interface Network {
  inputSize: number
  layers: Layer[]
}

export interface LayerSpec {
  size: number
  activation: Activation
}

export interface Example {
  x: number[]
  y: number
}

/**
 * Everything computed during one forward pass.
 * `a[0]` is the (scaled) input, `a[l + 1]` / `z[l]` belong to `layers[l]`.
 */
export interface ForwardTrace {
  z: number[][]
  a: number[][]
}

export interface Gradients {
  weights: number[][][]
  biases: number[][]
}

export interface EpochResult {
  loss: number
  gradients: Gradients
}

export const activations: Record<
  Activation,
  { fn: (z: number) => number; derivative: (z: number, a: number) => number; formula: string }
> = {
  linear: { fn: (z) => z, derivative: () => 1, formula: 'f(z) = z' },
  relu: { fn: (z) => Math.max(0, z), derivative: (z) => (z > 0 ? 1 : 0), formula: 'f(z) = max(0, z)' },
  sigmoid: {
    fn: (z) => 1 / (1 + Math.exp(-z)),
    derivative: (_z, a) => a * (1 - a),
    formula: 'f(z) = 1 / (1 + e^-z)',
  },
  tanh: { fn: (z) => Math.tanh(z), derivative: (_z, a) => 1 - a * a, formula: 'f(z) = tanh(z)' },
}

/** Small seeded PRNG so "reset" can reproduce the same starting weights. */
export function mulberry32(seed: number): () => number {
  let t = seed >>> 0
  return () => {
    t = (t + 0x6d2b79f5) >>> 0
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

export function createNetwork(
  inputSize: number,
  specs: LayerSpec[],
  seed: number,
  fixed?: { weights: number[][][]; biases: number[][] },
): Network {
  if (fixed) {
    return {
      inputSize,
      layers: specs.map((spec, l) => ({
        weights: fixed.weights[l].map((row) => [...row]),
        biases: [...fixed.biases[l]],
        activation: spec.activation,
      })),
    }
  }
  const random = mulberry32(seed)
  let fanIn = inputSize
  const layers = specs.map((spec) => {
    const limit = Math.sqrt(6 / (fanIn + spec.size))
    const layer: Layer = {
      weights: Array.from({ length: spec.size }, () =>
        Array.from({ length: fanIn }, () => (random() * 2 - 1) * limit),
      ),
      biases: Array.from({ length: spec.size }, () => (random() * 2 - 1) * 0.5),
      activation: spec.activation,
    }
    fanIn = spec.size
    return layer
  })
  return { inputSize, layers }
}

export function cloneNetwork(net: Network): Network {
  return {
    inputSize: net.inputSize,
    layers: net.layers.map((l) => ({
      weights: l.weights.map((row) => [...row]),
      biases: [...l.biases],
      activation: l.activation,
    })),
  }
}

export function forward(net: Network, input: number[]): ForwardTrace {
  const z: number[][] = []
  const a: number[][] = [input]
  for (const layer of net.layers) {
    const prev = a[a.length - 1]
    const f = activations[layer.activation].fn
    const layerZ = layer.weights.map(
      (row, j) => row.reduce((sum, w, i) => sum + w * prev[i], 0) + layer.biases[j],
    )
    z.push(layerZ)
    a.push(layerZ.map(f))
  }
  return { z, a }
}

export function output(net: Network, input: number[]): number {
  const { a } = forward(net, input)
  return a[a.length - 1][0]
}

function zeroGradients(net: Network): Gradients {
  return {
    weights: net.layers.map((l) => l.weights.map((row) => row.map(() => 0))),
    biases: net.layers.map((l) => l.biases.map(() => 0)),
  }
}

/**
 * One full-batch gradient descent step on mean squared error,
 * the same procedure as predit.js but generalised to any number of layers.
 * `scaleInput` turns a raw example input into what the network sees.
 */
export function trainEpoch(
  net: Network,
  data: Example[],
  learningRate: number,
  scaleInput: (x: number[]) => number[],
): EpochResult {
  const grads = zeroGradients(net)
  let totalLoss = 0
  const L = net.layers.length

  for (const example of data) {
    const { z, a } = forward(net, scaleInput(example.x))
    const error = a[L][0] - example.y
    totalLoss += error * error

    // delta = dLoss/dz for the current layer, walking backwards.
    let delta = [2 * error * activations[net.layers[L - 1].activation].derivative(z[L - 1][0], a[L][0])]
    for (let l = L - 1; l >= 0; l--) {
      const layer = net.layers[l]
      const prevA = a[l]
      for (let j = 0; j < layer.weights.length; j++) {
        grads.biases[l][j] += delta[j]
        for (let i = 0; i < prevA.length; i++) grads.weights[l][j][i] += delta[j] * prevA[i]
      }
      if (l > 0) {
        const prevLayer = net.layers[l - 1]
        const derivative = activations[prevLayer.activation].derivative
        delta = prevA.map((ai, i) => {
          let sum = 0
          for (let j = 0; j < layer.weights.length; j++) sum += layer.weights[j][i] * delta[j]
          return sum * derivative(z[l - 1][i], ai)
        })
      }
    }
  }

  const n = data.length
  net.layers.forEach((layer, l) => {
    layer.weights.forEach((row, j) => {
      row.forEach((_, i) => {
        grads.weights[l][j][i] /= n
        row[i] -= learningRate * grads.weights[l][j][i]
      })
      grads.biases[l][j] /= n
      layer.biases[j] -= learningRate * grads.biases[l][j]
    })
  })

  return { loss: totalLoss / n, gradients: grads }
}

export function meanLoss(net: Network, data: Example[], scaleInput: (x: number[]) => number[]): number {
  let total = 0
  for (const ex of data) {
    const e = output(net, scaleInput(ex.x)) - ex.y
    total += e * e
  }
  return total / data.length
}

/** Flattens all parameters (layer by layer: weights then biases) for history tracking. */
export function flattenParams(net: Network): number[] {
  const out: number[] = []
  for (const layer of net.layers) {
    for (const row of layer.weights) out.push(...row)
    out.push(...layer.biases)
  }
  return out
}

export function weightIndex(net: Network, layer: number, neuron: number, input: number): number {
  let offset = 0
  for (let l = 0; l < layer; l++) {
    const ly = net.layers[l]
    offset += ly.weights.length * ly.weights[0].length + ly.biases.length
  }
  return offset + neuron * net.layers[layer].weights[0].length + input
}

export function biasIndex(net: Network, layer: number, neuron: number): number {
  let offset = 0
  for (let l = 0; l < layer; l++) {
    const ly = net.layers[l]
    offset += ly.weights.length * ly.weights[0].length + ly.biases.length
  }
  const ly = net.layers[layer]
  return offset + ly.weights.length * ly.weights[0].length + neuron
}
