import { useEffect, useMemo } from 'react'
import {
  Background,
  BaseEdge,
  Controls,
  EdgeLabelRenderer,
  Handle,
  Position,
  ReactFlow,
  getStraightPath,
  useReactFlow,
  useStore,
  type Edge,
  type EdgeProps,
  type Node,
  type NodeProps,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import type { Activation, ForwardTrace, Network } from '../nn/network'
import { fmt, fmtSigned, intensity, signColor } from './format'

export type Selection =
  | { kind: 'neuron'; layer: number; index: number }
  | { kind: 'edge'; layer: number; to: number; from: number }

type NeuronData = {
  role: 'input' | 'hidden' | 'output'
  label: string
  value: number
  bias?: number
  biasDelta?: number
  activation?: Activation
  rawInput?: number
  scale?: number
  target?: number
  prediction?: number
  revealed: boolean
  active: boolean
  selected: boolean
}

type WeightData = {
  weight: number
  delta?: number
  revealed: boolean
  active: boolean
  selected: boolean
  showLabel: boolean
  animKey: number
}

type LabelData = { title: string; subtitle: string }

type NeuronNode = Node<NeuronData, 'neuron'>
type LabelNode = Node<LabelData, 'layerLabel'>
type WeightEdge = Edge<WeightData, 'weight'>

const LAYER_GAP = 250
const NEURON_GAP = 120
const NEURON_SIZE = 72
const LABEL_WIDTH = 160

const activationShort: Record<Activation, string> = { linear: '', relu: 'ReLU', sigmoid: 'sigmoid', tanh: 'tanh' }

function LayerLabelView({ data }: NodeProps<LabelNode>) {
  return (
    <div className="layer-label">
      <b>{data.title}</b>
      <span>{data.subtitle}</span>
    </div>
  )
}

function NeuronNodeView({ data }: NodeProps<NeuronNode>) {
  const shown = data.revealed
  const fill = shown ? signColor(data.value, 0.15 + 0.6 * intensity(data.value)) : 'transparent'
  const display = data.role === 'output' && data.prediction !== undefined ? data.prediction : data.value
  return (
    <div
      className={`neuron neuron-${data.role}${data.active ? ' is-active' : ''}${data.selected ? ' is-selected' : ''}`}
    >
      <Handle type="target" position={Position.Left} className="neuron-handle" isConnectable={false} />
      <div className="neuron-tag">
        {data.label}
        {data.activation && data.activation !== 'linear' && (
          <span className="neuron-act"> · {activationShort[data.activation]}</span>
        )}
      </div>
      <div className="neuron-body" style={{ background: fill, width: NEURON_SIZE, height: NEURON_SIZE }}>
        <span className="neuron-value">{shown ? fmt(display) : '?'}</span>
        {data.role === 'output' && data.target !== undefined && (
          <span className="neuron-sub">target {fmt(data.target)}</span>
        )}
      </div>
      {data.role === 'input' && data.rawInput !== undefined && data.scale !== undefined && data.scale !== 1 && (
        <div className="neuron-bias">
          {fmt(data.rawInput, 2)} ÷ {Math.abs(data.scale - Math.PI) < 1e-9 ? 'π' : data.scale}
        </div>
      )}
      {data.bias !== undefined && (
        <div className="neuron-bias">
          bias {fmt(data.bias)}
          {data.biasDelta !== undefined && Math.abs(data.biasDelta) > 5e-5 && (
            <span className={data.biasDelta > 0 ? 'delta-up' : 'delta-down'}> {fmtSigned(data.biasDelta)}</span>
          )}
        </div>
      )}
      <Handle type="source" position={Position.Right} className="neuron-handle" isConnectable={false} />
    </div>
  )
}

function WeightEdgeView({ sourceX, sourceY, targetX, targetY, data }: EdgeProps<WeightEdge>) {
  const [path] = getStraightPath({ sourceX, sourceY, targetX, targetY })
  if (!data) return null
  const w = data.weight
  const strength = intensity(w, 2)
  const t = 0.3
  const lx = sourceX + (targetX - sourceX) * t
  const ly = sourceY + (targetY - sourceY) * t
  return (
    <>
      <BaseEdge
        path={path}
        style={{
          stroke: signColor(w, data.revealed ? 0.25 + 0.75 * strength : 0.12),
          strokeWidth: 1 + 6 * strength + (data.selected ? 2 : 0),
          filter: data.selected ? 'drop-shadow(0 0 4px rgba(255,255,255,0.8))' : undefined,
        }}
      />
      {data.active && (
        <circle key={data.animKey} r={5} className="signal-dot">
          <animateMotion dur="0.7s" fill="freeze" path={path} />
        </circle>
      )}
      {data.showLabel && (
        <EdgeLabelRenderer>
          <div
            className={`weight-label${data.selected ? ' is-selected' : ''}`}
            style={{ transform: `translate(-50%, -50%) translate(${lx}px, ${ly}px)`, color: signColor(w) }}
          >
            {fmt(w)}
            {data.delta !== undefined && Math.abs(data.delta) > 5e-5 && (
              <span className={data.delta > 0 ? 'delta-up' : 'delta-down'}> {fmtSigned(data.delta)}</span>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}

const nodeTypes = { neuron: NeuronNodeView, layerLabel: LayerLabelView }

const FIT_OPTIONS = { padding: 0.3, maxZoom: 1.3 }

/** Keeps the whole network in view when the canvas is resized (e.g. lessons reveal more panels). */
function AutoFit() {
  const width = useStore((s) => s.width)
  const height = useStore((s) => s.height)
  const { fitView } = useReactFlow()
  useEffect(() => {
    if (width > 0 && height > 0) fitView({ ...FIT_OPTIONS, duration: 250 })
  }, [width, height, fitView])
  return null
}
const edgeTypes = { weight: WeightEdgeView }

interface Props {
  net: Network
  prev: Network | null
  showDeltas: boolean
  trace: ForwardTrace
  rawInput: number[]
  inputScales: number[]
  inputLabels: string[]
  outputLabel: string
  target: number | undefined
  /** Index of the layer currently being computed in the forward-pass animation, or null when not animating. */
  propStep: number | null
  selection: Selection | null
  onSelect: (s: Selection | null) => void
  showWeights: boolean
}

export function NetworkView(props: Props) {
  const {
    net,
    prev,
    showDeltas,
    trace,
    rawInput,
    inputScales,
    inputLabels,
    outputLabel,
    target,
    propStep,
    selection,
    showWeights,
    onSelect,
  } = props

  const nodes = useMemo<(NeuronNode | LabelNode)[]>(() => {
    const layerSizes = [net.inputSize, ...net.layers.map((l) => l.weights.length)]
    const lastLayer = layerSizes.length - 1
    const tallest = Math.max(...layerSizes)
    const layerGap = Math.max(LAYER_GAP, tallest * 65)
    const out: (NeuronNode | LabelNode)[] = []
    layerSizes.forEach((size, l) => {
      const hiddenCount = lastLayer - 1
      out.push({
        id: `label-${l}`,
        type: 'layerLabel',
        position: { x: l * layerGap + NEURON_SIZE / 2 - LABEL_WIDTH / 2, y: -((tallest - 1) / 2) * NEURON_GAP - 105 },
        draggable: false,
        selectable: false,
        data:
          l === 0
            ? { title: 'Input', subtitle: 'the question' }
            : l === lastLayer
              ? { title: 'Output', subtitle: 'the answer' }
              : {
                  title: hiddenCount > 1 ? `Hidden layer ${l}` : 'Hidden layer',
                  subtitle: 'helper neurons',
                },
      })
      for (let i = 0; i < size; i++) {
        const isInput = l === 0
        const isOutput = l === lastLayer
        const layer = isInput ? undefined : net.layers[l - 1]
        const bias = layer?.biases[i]
        out.push({
          id: `n-${l}-${i}`,
          type: 'neuron',
          position: { x: l * layerGap, y: (i - (size - 1) / 2) * NEURON_GAP },
          draggable: false,
          data: {
            role: isInput ? 'input' : isOutput ? 'output' : 'hidden',
            label: isInput
              ? inputLabels[i]
              : isOutput
                ? outputLabel
                : lastLayer > 2
                  ? `helper ${l}.${i + 1}`
                  : `helper ${i + 1}`,
            value: trace.a[l][i],
            bias,
            biasDelta: showDeltas && prev && bias !== undefined ? bias - prev.layers[l - 1].biases[i] : undefined,
            activation: layer?.activation,
            rawInput: isInput ? rawInput[i] : undefined,
            scale: isInput ? inputScales[i] : undefined,
            target: isOutput ? target : undefined,
            revealed: propStep === null || l <= propStep,
            active: propStep === l,
            selected: selection?.kind === 'neuron' && selection.layer === l && selection.index === i,
          },
        })
      }
    })
    return out
  }, [net, prev, showDeltas, trace, rawInput, inputScales, inputLabels, outputLabel, target, propStep, selection])

  const edges = useMemo<WeightEdge[]>(() => {
    const out: WeightEdge[] = []
    net.layers.forEach((layer, l) => {
      layer.weights.forEach((row, j) => {
        row.forEach((w, i) => {
          out.push({
            id: `e-${l + 1}-${j}-${i}`,
            source: `n-${l}-${i}`,
            target: `n-${l + 1}-${j}`,
            type: 'weight',
            data: {
              weight: w,
              delta: showDeltas && prev ? w - prev.layers[l].weights[j][i] : undefined,
              revealed: propStep === null || l + 1 <= propStep,
              active: propStep === l + 1,
              selected:
                selection?.kind === 'edge' && selection.layer === l + 1 && selection.to === j && selection.from === i,
              showLabel: showWeights,
              animKey: propStep ?? -1,
            },
          })
        })
      })
    })
    return out
  }, [net, prev, showDeltas, propStep, selection, showWeights])

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      fitView
      fitViewOptions={FIT_OPTIONS}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      minZoom={0.3}
      maxZoom={2}
      colorMode="dark"
      onNodeClick={(_, node) => {
        if (node.type !== 'neuron') return
        const [, l, i] = node.id.split('-').map(Number)
        onSelect({ kind: 'neuron', layer: l, index: i })
      }}
      onEdgeClick={(_, edge) => {
        const [, l, j, i] = edge.id.split('-').map(Number)
        onSelect({ kind: 'edge', layer: l, to: j, from: i })
      }}
      onPaneClick={() => onSelect(null)}
    >
      <Background gap={24} size={1} color="#262b3a" />
      <Controls showInteractive={false} fitViewOptions={FIT_OPTIONS} />
      <AutoFit />
    </ReactFlow>
  )
}
