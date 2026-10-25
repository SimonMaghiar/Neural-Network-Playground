import { useState, type ReactNode } from 'react'
import { glossary, type GlossaryTerm } from './glossary'

const TIP_WIDTH = 270

/** A word with a dotted underline that explains itself on hover. */
export function Term({ t, children }: { t: GlossaryTerm; children?: ReactNode }) {
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null)
  const show = (el: HTMLElement) => {
    const r = el.getBoundingClientRect()
    const left = Math.min(window.innerWidth - TIP_WIDTH - 8, Math.max(8, r.left + r.width / 2 - TIP_WIDTH / 2))
    setPos({ left, top: r.bottom + 6 })
  }
  return (
    <span
      className="term"
      tabIndex={0}
      onMouseEnter={(e) => show(e.currentTarget)}
      onFocus={(e) => show(e.currentTarget)}
      onMouseLeave={() => setPos(null)}
      onBlur={() => setPos(null)}
    >
      {children ?? t}
      {pos && (
        <span className="term-tip" role="tooltip" style={{ left: pos.left, top: pos.top, width: TIP_WIDTH }}>
          <b>{t}</b>
          {glossary[t]}
        </span>
      )}
    </span>
  )
}
