import type { Activation, Example, LayerSpec } from './network'

export type PresetKind = 'regression' | 'binary'

export interface Preset {
  id: string
  name: string
  summary: string
  lesson: string[]
  kind: PresetKind
  inputLabels: string[]
  outputLabel: string
  /** Raw inputs are divided by these before entering the network. */
  inputScales: number[]
  /** Slider range for each input in the playground. */
  inputRanges: [number, number][]
  defaultInput: number[]
  hidden: LayerSpec[]
  outputActivation: Activation
  learningRate: number
  data: Example[]
  /** The "true" answer for any input, when one is known. */
  target: (x: number[]) => number | undefined
  /** Starting weights used instead of random ones, so a lesson always starts the same way. */
  fixedInit?: { weights: number[][][]; biases: number[][] }
}

const range = (from: number, to: number, step: number) => {
  const out: number[] = []
  for (let v = from; v <= to + 1e-9; v += step) out.push(Number(v.toFixed(6)))
  return out
}

const isBit = (v: number) => v === 0 || v === 1

const gate = (fn: (a: number, b: number) => number) => (x: number[]) =>
  isBit(x[0]) && isBit(x[1]) ? fn(x[0], x[1]) : undefined

const bits: [number, number][] = [
  [0, 0],
  [0, 1],
  [1, 0],
  [1, 1],
]

export const presets: Preset[] = [
  {
    id: 'double',
    name: 'Double it (y = 2x)',
    summary: 'Your predit.js model: one neuron learns to double numbers from 0 to 20.',
    lesson: [
      'One neuron computes input × weight + bias. That can only ever draw a straight line, which is all doubling needs.',
      'Inputs are shrunk first (divided by 20), because big numbers make learning jumpy. So the weight has to become 40: 40 × (x ÷ 20) = 2x.',
      'Watch the bias head towards 0: doubling a number needs no extra amount added.',
    ],
    kind: 'regression',
    inputLabels: ['x'],
    outputLabel: 'y',
    inputScales: [20],
    inputRanges: [[-10, 30]],
    defaultInput: [7],
    hidden: [],
    outputActivation: 'linear',
    learningRate: 0.1,
    data: range(0, 20, 1).map((x) => ({ x: [x], y: 2 * x })),
    target: (x) => 2 * x[0],
  },
  {
    id: 'celsius',
    name: 'Celsius → Fahrenheit',
    summary: 'Convert temperatures. One neuron, and the bias really matters: F = 1.8 × C + 32.',
    lesson: [
      '0 °C is 32 °F, not 0. So the bias has to learn to add 32, like the base price in the pizza lesson.',
      'Inputs are divided by 100 first, so the weight has to become 180 (180 × C ÷ 100 = 1.8 × C).',
      'The bias learns more slowly than the weight. Try a bigger step size, but not too big!',
    ],
    kind: 'regression',
    inputLabels: ['°C'],
    outputLabel: '°F',
    inputScales: [100],
    inputRanges: [[-50, 120]],
    defaultInput: [25],
    hidden: [],
    outputActivation: 'linear',
    learningRate: 0.05,
    data: range(-40, 100, 10).map((c) => ({ x: [c], y: 1.8 * c + 32 })),
    target: (x) => 1.8 * x[0] + 32,
  },
  {
    id: 'and',
    name: 'Both yes? (AND)',
    summary: 'Answer yes (1) only when both inputs are yes, like the beach-day lesson.',
    lesson: [
      'The sigmoid squish turns any number into something between 0 (no) and 1 (yes).',
      'To say yes only when both inputs are 1, the weights grow big and positive and the bias grows big and negative.',
      'On the map, the border between orange and blue is where the neuron changes its mind.',
    ],
    kind: 'binary',
    inputLabels: ['A', 'B'],
    outputLabel: 'A AND B',
    inputScales: [1, 1],
    inputRanges: [
      [0, 1],
      [0, 1],
    ],
    defaultInput: [1, 1],
    hidden: [],
    outputActivation: 'sigmoid',
    learningRate: 2,
    data: bits.map(([a, b]) => ({ x: [a, b], y: a & b })),
    target: gate((a, b) => a & b),
  },
  {
    id: 'xor',
    name: 'Exactly one yes? (XOR)',
    summary: 'Yes when exactly one input is yes (the hallway light). Needs helper neurons.',
    lesson: [
      'No single straight line on the map can separate the yes answers from the no answers, so one neuron is not enough.',
      'Each helper neuron learns a simpler question (like "at least one?" or "both?") and the output combines them.',
      'Try deleting the hidden layer and watch it get stuck. If it gets stuck even with helpers, press Random start.',
    ],
    kind: 'binary',
    inputLabels: ['A', 'B'],
    outputLabel: 'A XOR B',
    inputScales: [1, 1],
    inputRanges: [
      [0, 1],
      [0, 1],
    ],
    defaultInput: [1, 0],
    hidden: [{ size: 3, activation: 'tanh' }],
    outputActivation: 'sigmoid',
    learningRate: 1,
    data: bits.map(([a, b]) => ({ x: [a, b], y: a ^ b })),
    target: gate((a, b) => a ^ b),
  },
  {
    id: 'abs',
    name: 'Make it positive (absolute value)',
    summary: 'Turn negative numbers positive (−3 → 3). Two helpers bend a line into a V.',
    lesson: [
      'The ReLU squish is simple: negative numbers become 0, positive numbers stay the same.',
      'One helper can learn to handle positive inputs and the other negative inputs. Added together they make a V shape.',
      'Sometimes a helper ends up outputting 0 for every example and stops learning (a "dead" neuron). Press Random start if the V never appears.',
    ],
    kind: 'regression',
    inputLabels: ['x'],
    outputLabel: '|x|',
    inputScales: [5],
    inputRanges: [[-6, 6]],
    defaultInput: [-3],
    hidden: [{ size: 2, activation: 'relu' }],
    outputActivation: 'linear',
    learningRate: 0.1,
    data: range(-5, 5, 0.5).map((x) => ({ x: [x], y: Math.abs(x) })),
    target: (x) => Math.abs(x[0]),
  },
  {
    id: 'sine',
    name: 'Sine wave',
    summary: 'Learn a wavy curve. Six helpers each add one S-shaped bend.',
    lesson: [
      'Each tanh helper produces one smooth S-shaped curve. The output adds them up with different weights to build the wave.',
      'More helpers make a more flexible curve. Try 2 helpers and then 8, and compare the chart.',
      'This one takes a while. Turn up the speed and watch the blue line wrap around the green dots.',
    ],
    kind: 'regression',
    inputLabels: ['x'],
    outputLabel: 'sin(x)',
    inputScales: [Math.PI],
    inputRanges: [[-Math.PI, Math.PI]],
    defaultInput: [1],
    hidden: [{ size: 6, activation: 'tanh' }],
    outputActivation: 'linear',
    learningRate: 0.1,
    data: range(-Math.PI, Math.PI, Math.PI / 12).map((x) => ({ x: [x], y: Math.sin(x) })),
    target: (x) => Math.sin(x[0]),
  },
]

/** Simpler versions used by the guided lessons: raw numbers, everyday examples. */
export const lessonPresets = {
  double: {
    id: 'lesson-double',
    name: 'Double it',
    summary: 'Teach one neuron to double a number.',
    lesson: [],
    kind: 'regression',
    inputLabels: ['input'],
    outputLabel: 'output',
    inputScales: [1],
    inputRanges: [[0, 5]],
    defaultInput: [3],
    hidden: [],
    outputActivation: 'linear',
    learningRate: 0.05,
    data: range(0, 5, 1).map((x) => ({ x: [x], y: 2 * x })),
    target: (x) => 2 * x[0],
    fixedInit: { weights: [[[0.5]]], biases: [[1]] },
  },
  pizza: {
    id: 'lesson-pizza',
    name: 'Pizza price',
    summary: '€5 for the base plus €2 per topping.',
    lesson: [],
    kind: 'regression',
    inputLabels: ['toppings'],
    outputLabel: 'price €',
    inputScales: [1],
    inputRanges: [[0, 5]],
    defaultInput: [2],
    hidden: [],
    outputActivation: 'linear',
    learningRate: 0.05,
    data: range(0, 5, 1).map((x) => ({ x: [x], y: 2 * x + 5 })),
    target: (x) => 2 * x[0] + 5,
    fixedInit: { weights: [[[0.5]]], biases: [[0]] },
  },
  beach: {
    id: 'lesson-beach',
    name: 'Beach day',
    summary: 'Go to the beach only if it is sunny AND warm.',
    lesson: [],
    kind: 'binary',
    inputLabels: ['sunny?', 'warm?'],
    outputLabel: 'beach?',
    inputScales: [1, 1],
    inputRanges: [
      [0, 1],
      [0, 1],
    ],
    defaultInput: [1, 1],
    hidden: [],
    outputActivation: 'sigmoid',
    learningRate: 2,
    data: bits.map(([a, b]) => ({ x: [a, b], y: a & b })),
    target: gate((a, b) => a & b),
    fixedInit: { weights: [[[0.3, -0.2]]], biases: [[0.1]] },
  },
  hallway: {
    id: 'lesson-hallway',
    name: 'Hallway light',
    summary: 'Two switches, one light. Flipping either switch toggles the light.',
    lesson: [],
    kind: 'binary',
    inputLabels: ['switch 1', 'switch 2'],
    outputLabel: 'light on?',
    inputScales: [1, 1],
    inputRanges: [
      [0, 1],
      [0, 1],
    ],
    defaultInput: [1, 0],
    hidden: [],
    outputActivation: 'sigmoid',
    learningRate: 1,
    data: bits.map(([a, b]) => ({ x: [a, b], y: a ^ b })),
    target: gate((a, b) => a ^ b),
  },
} satisfies Record<string, Preset>

export const scaleInputFor = (preset: Preset) => (x: number[]) => x.map((v, i) => v / preset.inputScales[i])
