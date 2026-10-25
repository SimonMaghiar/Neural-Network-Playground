import { useCallback, useEffect, useRef, useState } from 'react'
import { cloneNetwork, flattenParams, meanLoss, trainEpoch, type Example, type Network } from '../nn/network'
import type { ParamTarget } from './NeuronRecipe'

export interface HistoryPoint {
  epoch: number
  loss: number
  params: number[]
}

export interface Snapshot {
  net: Network
  /** Network before the most recent training step(s), for showing what changed. */
  prev: Network | null
  epoch: number
  loss: number
  history: HistoryPoint[]
  diverged: boolean
}

interface Core {
  net: Network
  epoch: number
  history: HistoryPoint[]
  interval: number
}

const MAX_HISTORY = 400

export function useTrainer(
  initial: Network,
  data: Example[],
  scaleInput: (x: number[]) => number[],
  learningRate: number,
  epochsPerSecond: number,
) {
  const core = useRef<Core | null>(null)
  const [running, setRunning] = useState(false)
  const [snapshot, setSnapshot] = useState<Snapshot>(() => {
    const loss = meanLoss(initial, data, scaleInput)
    return {
      net: initial,
      prev: null,
      epoch: 0,
      loss,
      history: [{ epoch: 0, loss, params: flattenParams(initial) }],
      diverged: false,
    }
  })

  const getCore = useCallback(
    () =>
      (core.current ??= {
        net: cloneNetwork(initial),
        epoch: 0,
        history: [{ epoch: 0, loss: meanLoss(initial, data, scaleInput), params: flattenParams(initial) }],
        interval: 1,
      }),
    [initial, data, scaleInput],
  )

  const edit = useCallback(
    (target: ParamTarget, value: number) => {
      setRunning(false)
      const c = getCore()
      const layer = c.net.layers[target.layer]
      if (target.kind === 'weight') layer.weights[target.to][target.from] = value
      else layer.biases[target.index] = value
      const loss = meanLoss(c.net, data, scaleInput)
      setSnapshot((s) => ({ ...s, net: cloneNetwork(c.net), prev: null, loss, diverged: false }))
    },
    [getCore, data, scaleInput],
  )

  const advance = useCallback(
    (count: number) => {
      const c = getCore()
      const prev = cloneNetwork(c.net)
      for (let i = 0; i < count; i++) {
        trainEpoch(c.net, data, learningRate, scaleInput)
        c.epoch++
        if (c.epoch % c.interval === 0) {
          c.history.push({ epoch: c.epoch, loss: meanLoss(c.net, data, scaleInput), params: flattenParams(c.net) })
          if (c.history.length > MAX_HISTORY) {
            c.history = c.history.filter((_, idx) => idx % 2 === 0)
            c.interval *= 2
          }
        }
      }
      const loss = meanLoss(c.net, data, scaleInput)
      const diverged = !Number.isFinite(loss) || loss > 1e12
      if (diverged) setRunning(false)
      setSnapshot({
        net: cloneNetwork(c.net),
        prev,
        epoch: c.epoch,
        loss,
        history: [...c.history],
        diverged,
      })
    },
    [getCore, data, scaleInput, learningRate],
  )

  useEffect(() => {
    if (!running) return
    let last = performance.now()
    let carry = 0
    let id = requestAnimationFrame(function tick(now) {
      carry += ((now - last) / 1000) * epochsPerSecond
      last = now
      const n = Math.floor(carry)
      if (n > 0) {
        carry -= n
        advance(Math.min(n, 5000))
      }
      id = requestAnimationFrame(tick)
    })
    return () => cancelAnimationFrame(id)
  }, [running, epochsPerSecond, advance])

  return { snapshot, running, setRunning, advance, edit }
}
