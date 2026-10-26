import { useState } from 'react'
import { CircleCheck, CircleX } from 'lucide-react'
import type { SimProps } from '../../types'

interface Email {
  text: string
  spam: boolean
}

/** What the model learns from, in the order it sees them. */
const EXAMPLES: Email[] = [
  { text: 'You are a WINNER! Claim your FREE prize now!!!', spam: true },
  { text: 'Lunch tomorrow? The new pizza place opened', spam: false },
  { text: 'Click here to claim your cash reward today', spam: true },
  { text: 'Meeting notes from today, see attached', spam: false },
  { text: 'Urgent: your account needs verification, click the link', spam: true },
  { text: 'Happy birthday! Hope you have a great day', spam: false },
  { text: 'Cheap watches, best price, buy now', spam: true },
  { text: 'Can you send me the photos from the trip?', spam: false },
  { text: 'Congratulations, you won a gift card, claim it now', spam: true },
  { text: 'Team dinner on Friday, who is coming?', spam: false },
  { text: 'Are you free for a call tomorrow?', spam: false },
  { text: 'Cake in the kitchen, help yourself', spam: false },
]

/** Emails neither the rules nor the model have seen before. */
const NEW_EMAILS: Email[] = [
  { text: 'Claim your reward: click now to get your prize', spam: true },
  { text: 'FREE coffee in the kitchen today!!!', spam: false },
  { text: 'Your account: verify now or lose access', spam: true },
  { text: 'Photos from the birthday dinner are ready', spam: false },
  { text: 'Best price on cheap phones, buy today', spam: true },
  { text: 'Are we still on for lunch on Friday?', spam: false },
]

const RULES = [
  { id: 'free', label: 'Contains "free"', test: (t: string) => /\bfree\b/i.test(t) },
  { id: 'winner', label: 'Contains "winner"', test: (t: string) => /winner/i.test(t) },
  { id: 'bang', label: 'Has "!!!"', test: (t: string) => t.includes('!!!') },
  { id: 'click', label: 'Contains "click"', test: (t: string) => /click/i.test(t) },
]

const SKIP = new Set('a an the to on in of is are for from it you me we i and or can see who have has be at'.split(' '))
const words = (text: string) =>
  text
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((w) => w && !SKIP.has(w))

/** The whole "learning": every word scores +1 each time it appears in spam and −1 each time in a normal email. */
function learn(examples: Email[]): Map<string, number> {
  const scores = new Map<string, number>()
  for (const e of examples) for (const w of words(e.text)) scores.set(w, (scores.get(w) ?? 0) + (e.spam ? 1 : -1))
  return scores
}

const scoreOf = (scores: Map<string, number>, text: string) => words(text).reduce((s, w) => s + (scores.get(w) ?? 0), 0)

export function SpamSorter({ onTaskDone }: SimProps) {
  const [rules, setRules] = useState<Set<string>>(() => new Set())
  const [seen, setSeen] = useState(0)
  const [triedRules, setTriedRules] = useState(false)

  const scores = learn(EXAMPLES.slice(0, seen))
  const byRules = (text: string) => RULES.some((r) => rules.has(r.id) && r.test(text))
  const byModel = (text: string) => scoreOf(scores, text) > 0
  const rulesRight = NEW_EMAILS.filter((e) => byRules(e.text) === e.spam).length
  const modelRight = NEW_EMAILS.filter((e) => byModel(e.text) === e.spam).length
  const learned = [...scores.entries()].filter(([, s]) => s !== 0).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
  const spammy = learned.filter(([, s]) => s > 0).slice(0, 6)
  const normal = learned.filter(([, s]) => s < 0).slice(0, 6)

  const toggleRule = (id: string) => {
    const next = new Set(rules)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setRules(next)
    setTriedRules(true)
    if (seen === EXAMPLES.length) onTaskDone()
  }
  const changeSeen = (n: number) => {
    setSeen(n)
    if (n === EXAMPLES.length && triedRules) onTaskDone()
  }

  return (
    <div className="sim">
      <div className="ai-two-col">
        <section className="ai-panel">
          <h4>Traditional software: you write the rules</h4>
          <p className="sim-note">Mark an email as spam if it matches any rule you switch on:</p>
          <div className="pill-group">
            {RULES.map((r) => (
              <button key={r.id} className={rules.has(r.id) ? 'is-active' : ''} onClick={() => toggleRule(r.id)}>
                {r.label}
              </button>
            ))}
          </div>
        </section>
        <section className="ai-panel">
          <h4>Machine learning: it learns from examples</h4>
          <label className="slider wide">
            <span>
              Labelled examples it has seen: <b>{seen}</b> of {EXAMPLES.length}
            </span>
            <input
              type="range"
              min={0}
              max={EXAMPLES.length}
              value={seen}
              onChange={(e) => changeSeen(Number(e.target.value))}
            />
          </label>
          {seen === 0 ? (
            <p className="sim-note">It knows nothing yet, so it calls everything normal.</p>
          ) : (
            <div className="ai-learned">
              <div>
                <span>Spam words it found</span>
                {spammy.map(([w, s]) => (
                  <span key={w} className="ai-word spam">
                    {w} +{s}
                  </span>
                ))}
              </div>
              <div>
                <span>Normal words it found</span>
                {normal.map(([w, s]) => (
                  <span key={w} className="ai-word ham">
                    {w} {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      <h4 className="sim-subtitle">New emails nobody has seen before</h4>
      <table className="ai-table">
        <thead>
          <tr>
            <th>Email</th>
            <th>Really</th>
            <th>Your rules</th>
            <th>Learned</th>
          </tr>
        </thead>
        <tbody>
          {NEW_EMAILS.map((e) => (
            <tr key={e.text}>
              <td>{e.text}</td>
              <td>{e.spam ? 'spam' : 'normal'}</td>
              <Verdict spam={byRules(e.text)} right={byRules(e.text) === e.spam} />
              <Verdict spam={byModel(e.text)} right={byModel(e.text) === e.spam} />
            </tr>
          ))}
        </tbody>
      </table>

      <div className="big-stats">
        <div>
          <span>Your rules: correct</span>
          <b className={rulesRight === NEW_EMAILS.length ? 'good' : ''}>
            {rulesRight} / {NEW_EMAILS.length}
          </b>
        </div>
        <div>
          <span>Learned model: correct</span>
          <b className={modelRight === NEW_EMAILS.length ? 'good' : ''}>
            {modelRight} / {NEW_EMAILS.length}
          </b>
        </div>
      </div>
      <p className="sim-note">
        The "learning" here is simple on purpose: each word gets +1 every time it appears in a spam example and −1 every
        time it appears in a normal one. An email is spam if its words add up to more than 0.
      </p>
    </div>
  )
}

function Verdict({ spam, right }: { spam: boolean; right: boolean }) {
  return (
    <td className={right ? 'ai-right' : 'ai-wrong'}>
      {right ? <CircleCheck size={14} /> : <CircleX size={14} />} {spam ? 'spam' : 'normal'}
    </td>
  )
}
