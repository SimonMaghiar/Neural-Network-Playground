import { useState } from 'react'
import { CircleCheck, CircleX } from 'lucide-react'
import type { SimProps } from '../../types'

type Kind = 'vend' | 'calc' | 'chess' | 'face' | 'spell' | 'auto' | 'chat'
type Choice = 'ai' | 'machine'

interface Thing {
  id: Kind
  name: string
  scene: string
  ai: boolean
  why: string
}

const THINGS: Thing[] = [
  {
    id: 'vend',
    name: 'Vending machine',
    scene: 'Press B4. The crisps fall down.',
    ai: false,
    why: 'Every button has one right outcome, written down before the machine was even switched on.',
  },
  {
    id: 'calc',
    name: 'Calculator',
    scene: 'You type 2 + 2. It says 4.',
    ai: false,
    why: 'Arithmetic used to be a human job, but it has an exact recipe that is always right. Nothing to judge.',
  },
  {
    id: 'chess',
    name: 'Chess computer',
    scene: 'You play white. It plays black, and it fights back.',
    ai: true,
    why: 'There are more possible games than atoms in the observable universe. It cannot check them all, so it judges which moves look best.',
  },
  {
    id: 'face',
    name: 'Face unlock',
    scene: 'You look at the phone. If it is your face, it opens.',
    ai: true,
    why: 'Your face is never the same twice: new light, new angle, glasses. It has to judge "close enough to you".',
  },
  {
    id: 'spell',
    name: 'Dictionary spellcheck',
    scene: 'It underlines any word that is not on its list.',
    ai: false,
    why: 'Is the word on the list? Yes or no. A lookup, not a judgment.',
  },
  {
    id: 'auto',
    name: 'Autocorrect',
    scene: 'You type "teh". It changes it to "the".',
    ai: true,
    why: '"teh" could be the, tea or ten. It guesses what you meant, which is why it sometimes guesses wrong.',
  },
  {
    id: 'chat',
    name: 'Chatbot',
    scene: 'You ask what to cook. It answers in sentences.',
    ai: true,
    why: 'Nobody wrote down the right answer to every possible question. It has to put one together.',
  },
]

const isRight = (t: Thing, c?: Choice) => c === (t.ai ? 'ai' : 'machine')

export function BigQuestion({ onTaskDone }: SimProps) {
  const [answers, setAnswers] = useState<Partial<Record<Kind, Choice>>>({})

  const choose = (id: Kind, choice: Choice) => {
    const next = { ...answers, [id]: choice }
    setAnswers(next)
    if (THINGS.every((t) => isRight(t, next[t.id]))) onTaskDone()
  }

  const spotted = THINGS.filter((t) => isRight(t, answers[t.id])).length

  return (
    <div className="sim">
      <p className="sim-note">
        For each machine, ask: is there an exact recipe that always gives the right answer? If not, it has to make a
        judgment call, and that is AI.
      </p>
      <div className="bq-board">
        {THINGS.map((t) => {
          const picked = answers[t.id]
          const right = isRight(t, picked)
          return (
            <article key={t.id} className={`bq-card${picked ? (right ? ' is-right' : ' is-wrong') : ''}`}>
              <div className="bq-art" aria-hidden>
                <Scene kind={t.id} />
              </div>
              <h4>{t.name}</h4>
              <p className="bq-scene">{t.scene}</p>
              <div className="pill-group">
                <button className={picked === 'machine' ? 'is-active' : ''} onClick={() => choose(t.id, 'machine')}>
                  Exact recipe: not AI
                </button>
                <button className={picked === 'ai' ? 'is-active' : ''} onClick={() => choose(t.id, 'ai')}>
                  Judgment call: AI
                </button>
              </div>
              {picked && (
                <p className={`ai-feedback ${right ? 'ai-right' : 'ai-wrong'}`}>
                  {right ? <CircleCheck size={14} /> : <CircleX size={14} />} {!right && 'Not quite. '}
                  {t.why}
                </p>
              )}
            </article>
          )
        })}
      </div>
      <div className="big-stats">
        <div>
          <span>Spotted correctly</span>
          <b className={spotted === THINGS.length ? 'good' : ''}>
            {spotted} / {THINGS.length}
          </b>
        </div>
      </div>
    </div>
  )
}

function Scene({ kind }: { kind: Kind }) {
  return (
    <svg viewBox="0 0 120 72" width="120" height="72">
      {kind === 'vend' && (
        <>
          <rect x="36" y="6" width="48" height="60" rx="4" className="bq-body" />
          <rect x="42" y="12" width="26" height="24" rx="2" className="bq-glass" />
          <circle cx="76" cy="18" r="3" className="bq-accent" />
          <circle cx="76" cy="28" r="3" className="bq-muted" />
          <rect x="44" y="42" width="32" height="5" rx="1" className="bq-slot" />
          <rect x="52" y="50" width="16" height="10" rx="2" className="bq-snack" />
        </>
      )}
      {kind === 'calc' && (
        <>
          <rect x="28" y="8" width="64" height="56" rx="6" className="bq-body" />
          <rect x="36" y="14" width="48" height="14" rx="2" className="bq-glass" />
          <text x="78" y="25" textAnchor="end" className="bq-readout">
            4
          </text>
          {[0, 1, 2].map((row) =>
            [0, 1, 2].map((col) => (
              <rect
                key={`${row}-${col}`}
                x={38 + col * 16}
                y={34 + row * 9}
                width="12"
                height="6"
                rx="1"
                className="bq-key"
              />
            )),
          )}
        </>
      )}
      {kind === 'chess' && (
        <>
          {[0, 1, 2, 3].map((row) =>
            [0, 1, 2, 3].map((col) => (
              <rect
                key={`${row}-${col}`}
                x={28 + col * 16}
                y={4 + row * 16}
                width="16"
                height="16"
                className={(row + col) % 2 ? 'bq-dark' : 'bq-light'}
              />
            )),
          )}
          <circle cx="52" cy="28" r="5" className="bq-piece" />
          <circle cx="84" cy="44" r="5" className="bq-piece you" />
        </>
      )}
      {kind === 'face' && (
        <>
          <rect x="40" y="4" width="40" height="64" rx="6" className="bq-body" />
          <circle cx="60" cy="30" r="12" className="bq-glass" />
          <circle cx="55" cy="28" r="1.6" className="bq-eye" />
          <circle cx="65" cy="28" r="1.6" className="bq-eye" />
          <path d="M55 34 Q60 38 65 34" className="bq-smile" />
          <rect x="54" y="58" width="12" height="3" rx="1" className="bq-accent" />
        </>
      )}
      {kind === 'spell' && (
        <>
          <rect x="16" y="14" width="88" height="44" rx="4" className="bq-body" />
          <text x="26" y="36" className="bq-words">
            recieve
          </text>
          <path d="M28 40 q4 4 8 0 t8 0 t8 0 t8 0" className="bq-squiggle" />
        </>
      )}
      {kind === 'auto' && (
        <>
          <rect x="6" y="22" width="34" height="26" rx="4" className="bq-body" />
          <text x="23" y="40" textAnchor="middle" className="bq-words">
            teh
          </text>
          {[16, 36, 56].map((y) => (
            <path key={y} d={`M42 35 L70 ${y}`} className="bq-arrow" />
          ))}
          <text x="74" y="20" className="bq-words small reply">
            the
          </text>
          <text x="74" y="40" className="bq-words small">
            tea
          </text>
          <text x="74" y="60" className="bq-words small">
            ten
          </text>
        </>
      )}
      {kind === 'chat' && (
        <>
          <rect x="6" y="8" width="104" height="22" rx="8" className="bq-glass" />
          <text x="12" y="23" className="bq-words small">
            What can I cook?
          </text>
          <rect x="28" y="40" width="86" height="22" rx="8" className="bq-body" />
          <text x="36" y="55" className="bq-words reply small">
            Try a soup.
          </text>
        </>
      )}
    </svg>
  )
}
