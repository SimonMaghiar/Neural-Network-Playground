import { useRef, useState, type PointerEvent as ReactPointerEvent, type TransitionEvent } from 'react'
import { flushSync } from 'react-dom'

const PACK = ['learn', 'gold', 'green', 'pink'] as const
type PackId = (typeof PACK)[number]

/** Shift of each card behind the front one, as a percentage of the card itself. */
const STEP_X = 6.8
const STEP_Y = 2.4
const rest = (i: number) => `translate(calc(${i} * ${STEP_X}%), calc(${i} * ${STEP_Y}%)) rotate(0deg)`

const LABEL: Record<PackId, string> = {
  learn: 'Will it learn?',
  gold: 'Why GPUs?',
  green: 'Next token',
  pink: 'Attention',
}

type Pose = { transform: string; transition: string; z: number }

function Sticker({ lines, fill = '#fcba28' }: { lines: [string, string]; fill?: string }) {
  return (
    <g transform="translate(62,256) rotate(-7)">
      <rect width="168" height="78" rx="12" fill={fill} stroke="#231f20" strokeWidth="4" />
      <text x="84" y="32" textAnchor="middle" fill="#231f20" fontFamily="Paytone One, sans-serif" fontSize="18">
        {lines[0]}
      </text>
      <text
        x="84"
        y="58"
        textAnchor="middle"
        fill="#231f20"
        fontFamily="Paytone One, sans-serif"
        fontSize={lines[1].length > 8 ? 15 : 22}
      >
        {lines[1]}
      </text>
    </g>
  )
}

function CardFace({ id }: { id: PackId }) {
  if (id === 'learn') {
    return (
      <svg viewBox="-8 -8 308 396" aria-hidden="true">
        <rect width="292" height="380" rx="24" fill="#f9f4da" stroke="#231f20" strokeWidth="5" />
        <rect x="20" y="20" width="252" height="214" rx="16" fill="#7b5ea7" stroke="#231f20" strokeWidth="4" />
        <g stroke="#231f20" strokeWidth="4" fill="none" strokeLinecap="round">
          <line x1="64" y1="76" x2="122" y2="127" />
          <line x1="64" y1="127" x2="122" y2="127" />
          <line x1="64" y1="178" x2="122" y2="127" />
          <line x1="170" y1="127" x2="218" y2="127" />
        </g>
        <circle cx="50" cy="76" r="14" fill="#12b5e5" stroke="#231f20" strokeWidth="4" />
        <circle cx="50" cy="127" r="14" fill="#fcba28" stroke="#231f20" strokeWidth="4" />
        <circle cx="50" cy="178" r="14" fill="#f38ba3" stroke="#231f20" strokeWidth="4" />
        <circle cx="146" cy="127" r="36" fill="#12b5e5" stroke="#231f20" strokeWidth="4" />
        <circle cx="134" cy="120" r="4" fill="#231f20" />
        <circle cx="158" cy="120" r="4" fill="#231f20" />
        <path d="M132 136c6 10 22 10 28 0" fill="none" stroke="#231f20" strokeWidth="3" strokeLinecap="round" />
        <circle cx="230" cy="127" r="16" fill="#fcba28" stroke="#231f20" strokeWidth="4" />
        <Sticker lines={['WILL IT', 'LEARN?']} />
      </svg>
    )
  }

  if (id === 'gold') {
    return (
      <svg viewBox="-8 -8 308 396" aria-hidden="true">
        <rect width="292" height="380" rx="24" fill="#fcba28" stroke="#231f20" strokeWidth="5" />
        <rect x="20" y="20" width="252" height="214" rx="16" fill="#231f20" />
        <polygon
          points="152,46 182,46 162,112 204,112 132,204 162,128 118,128"
          fill="#fcba28"
          stroke="#f9f4da"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <Sticker lines={['WHY', 'GPUS?']} fill="#f9f4da" />
      </svg>
    )
  }

  if (id === 'green') {
    return (
      <svg viewBox="-8 -8 308 396" aria-hidden="true">
        <rect width="292" height="380" rx="24" fill="#0ba95b" stroke="#231f20" strokeWidth="5" />
        <rect x="20" y="20" width="252" height="214" rx="16" fill="#231f20" />
        <rect x="46" y="104" width="58" height="40" rx="20" fill="#f9f4da" stroke="#231f20" strokeWidth="4" />
        <rect x="118" y="104" width="58" height="40" rx="20" fill="#fcba28" stroke="#231f20" strokeWidth="4" />
        <rect x="190" y="104" width="58" height="40" rx="20" fill="#12b5e5" stroke="#231f20" strokeWidth="4" />
        <Sticker lines={['NEXT', 'TOKEN']} />
      </svg>
    )
  }

  return (
    <svg viewBox="-8 -8 308 396" aria-hidden="true">
      <rect width="292" height="380" rx="24" fill="#f38ba3" stroke="#231f20" strokeWidth="5" />
      <rect x="20" y="20" width="252" height="214" rx="16" fill="#231f20" />
      <g stroke="#f38ba3" strokeWidth="4" strokeLinecap="round">
        <line x1="78" y1="78" x2="146" y2="140" />
        <line x1="146" y1="68" x2="146" y2="140" />
        <line x1="214" y1="86" x2="146" y2="140" />
      </g>
      <circle cx="78" cy="78" r="14" fill="#fcba28" stroke="#f9f4da" strokeWidth="4" />
      <circle cx="146" cy="68" r="14" fill="#12b5e5" stroke="#f9f4da" strokeWidth="4" />
      <circle cx="214" cy="86" r="14" fill="#0ba95b" stroke="#f9f4da" strokeWidth="4" />
      <circle cx="146" cy="148" r="22" fill="#f38ba3" stroke="#f9f4da" strokeWidth="4" />
      <Sticker lines={['PAY', 'ATTENTION']} />
    </svg>
  )
}

/** The homepage card stack. Drag the front card; releasing it sends that card to the back. */
export function HeroDeck() {
  const [order, setOrder] = useState<PackId[]>([...PACK])
  const [poses, setPoses] = useState<Partial<Record<PackId, Pose>> | null>(null)
  const [dragging, setDragging] = useState(false)
  const [measuring, setMeasuring] = useState(false)
  const orderRef = useRef(order)
  orderRef.current = order
  const deckRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<Partial<Record<PackId, HTMLDivElement>>>({})
  const origin = useRef({ x: 0, y: 0 })
  const drag = useRef({ x: 0, y: 0, rot: 0 })
  const draggingRef = useRef(false)
  const busy = useRef(false)
  const flying = useRef<PackId | null>(null)
  const tuck = useRef<number | undefined>(undefined)

  const sendToBack = (rot = 0) => {
    if (busy.current && !draggingRef.current) return
    const cards = orderRef.current
    const frontId = cards[0]
    const first = new Map<PackId, DOMRect>()
    for (const id of cards) {
      const node = cardRefs.current[id]
      if (node) first.set(id, node.getBoundingClientRect())
    }
    const next = [...cards.slice(1), frontId]
    draggingRef.current = false
    setDragging(false)
    flushSync(() => {
      setMeasuring(true)
      setOrder(next)
      setPoses(null)
    })
    const inverses: Partial<Record<PackId, Pose>> = {}
    next.forEach((id, i) => {
      const node = cardRefs.current[id]
      const before = first.get(id)
      if (!node || !before) return
      const after = node.getBoundingClientRect()
      inverses[id] = {
        transform: `translate(${before.left - after.left}px, ${before.top - after.top}px) rotate(${id === frontId ? rot : 0}deg)`,
        transition: 'none',
        z: id === frontId ? 8 : next.length - i,
      }
    })
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setMeasuring(false)
      busy.current = false
      flying.current = null
      return
    }
    busy.current = true
    flying.current = frontId
    flushSync(() => {
      setMeasuring(false)
      setPoses(inverses)
    })
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const targets: Partial<Record<PackId, Pose>> = {}
        next.forEach((id, i) => {
          targets[id] = {
            transform: rest(i),
            transition: 'transform 0.48s cubic-bezier(0.22, 0.8, 0.28, 1)',
            z: id === frontId ? 8 : next.length - i,
          }
        })
        setPoses(targets)
        tuck.current = window.setTimeout(() => {
          setPoses((current) => {
            const pose = current?.[frontId]
            if (!pose) return current
            return { ...current, [frontId]: { ...pose, z: 1 } }
          })
        }, 200)
      })
    })
  }

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 || busy.current) return
    event.preventDefault()
    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // The pointer can already be gone. Dragging still follows later move events.
    }
    origin.current = { x: event.clientX, y: event.clientY }
    drag.current = { x: 0, y: 0, rot: 0 }
    draggingRef.current = true
    busy.current = true
    setDragging(true)
    setPoses({
      [orderRef.current[0]]: {
        transform: 'translate(0px, 0px) rotate(0deg) scale(1.03)',
        transition: 'none',
        z: 8,
      },
    })
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return
    const x = event.clientX - origin.current.x
    const y = event.clientY - origin.current.y
    const rot = Math.max(-14, Math.min(14, x / 16))
    drag.current = { x, y, rot }
    setPoses({
      [orderRef.current[0]]: {
        transform: `translate(${x}px, ${y}px) rotate(${rot}deg) scale(1.03)`,
        transition: 'none',
        z: 8,
      },
    })
  }

  const onPointerUp = () => {
    if (!draggingRef.current) return
    sendToBack(drag.current.rot)
  }

  const onTransitionEnd = (event: TransitionEvent<HTMLDivElement>, id: PackId) => {
    if (event.propertyName !== 'transform' || event.target !== event.currentTarget) return
    if (flying.current !== id) return
    if (tuck.current) window.clearTimeout(tuck.current)
    flying.current = null
    busy.current = false
    setPoses(null)
  }

  return (
    <div
      className={`hero-art hero-deck${dragging ? ' is-dragging' : ''}${measuring ? ' is-measuring' : ''}`}
      ref={deckRef}
    >
      <svg className="hero-bolts" viewBox="0 0 460 460" aria-hidden="true">
        <g fill="#fcba28" stroke="#231f20" strokeWidth="3" strokeLinejoin="round">
          <polygon points="28,78 52,78 40,108 62,108 24,156 40,118 18,118" />
          <polygon points="400,300 424,300 412,330 434,330 396,378 412,340 390,340" />
        </g>
      </svg>
      {order.map((id, index) => {
        const front = index === 0
        const pose = poses?.[id]
        return (
          <div
            key={id}
            ref={(node) => {
              cardRefs.current[id] = node ?? undefined
            }}
            className={front ? 'deck-card is-front' : 'deck-card'}
            style={{
              zIndex: pose?.z ?? order.length - index,
              transform: pose?.transform ?? rest(index),
              transition: pose?.transition,
            }}
            role={front ? 'button' : undefined}
            tabIndex={front ? 0 : undefined}
            aria-hidden={front ? undefined : true}
            aria-label={front ? `${LABEL[id]}. Drag the card and release to send it to the back of the pack.` : undefined}
            onPointerDown={front ? onPointerDown : undefined}
            onPointerMove={front ? onPointerMove : undefined}
            onPointerUp={front ? onPointerUp : undefined}
            onPointerCancel={front ? onPointerUp : undefined}
            onKeyDown={
              front
                ? (event) => {
                    if (event.key !== 'Enter' && event.key !== ' ') return
                    event.preventDefault()
                    sendToBack()
                  }
                : undefined
            }
            onTransitionEnd={(event) => onTransitionEnd(event, id)}
          >
            <CardFace id={id} />
          </div>
        )
      })}
    </div>
  )
}
