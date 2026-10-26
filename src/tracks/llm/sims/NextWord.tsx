import { useState } from 'react'
import { Dices, RotateCcw } from 'lucide-react'
import type { SimProps } from '../../types'
import { pct, sampleIndex } from '../math'

const CORPUS = [
  'the cat sat on the mat .',
  'the cat chased the mouse .',
  'the dog sat on the rug .',
  'the dog chased the cat .',
  'the mouse ate the cheese .',
  'a cat ate the fish .',
  'the dog ate the bone .',
  'the cat likes the warm sun .',
  'the dog likes the long walk .',
  'a mouse likes the cheese .',
  'the cat slept on the warm mat .',
  'the dog slept on the rug .',
]
const START = '<start>'
const TARGET_WORDS = 6

/** For every word, how often each other word came right after it in the corpus. */
const follows = new Map<string, Map<string, number>>()
for (const sentence of CORPUS) {
  const words = [START, ...sentence.split(' ')]
  for (let i = 0; i < words.length - 1; i++) {
    const next = follows.get(words[i]) ?? new Map<string, number>()
    next.set(words[i + 1], (next.get(words[i + 1]) ?? 0) + 1)
    follows.set(words[i], next)
  }
}

function predictions(last: string) {
  const counts = [...(follows.get(last) ?? new Map<string, number>()).entries()]
  const total = counts.reduce((s, [, c]) => s + c, 0)
  return counts.map(([word, c]) => ({ word, p: c / total, count: c })).sort((a, b) => b.p - a.p)
}

export function NextWord({ onTaskDone }: SimProps) {
  const [words, setWords] = useState<string[]>([])
  const [showCorpus, setShowCorpus] = useState(false)

  const last = words.length ? words[words.length - 1] : START
  const finished = last === '.'
  const options = finished ? [] : predictions(last)

  const add = (w: string) => {
    const next = [...words, w]
    setWords(next)
    if (w === '.' && next.length - 1 >= TARGET_WORDS) onTaskDone()
  }

  return (
    <div className="sim">
      <div className="sentence-box">
        {words.length === 0 && <span className="muted">Pick the first word…</span>}
        {words.map((w, i) => (
          <span key={i} className="word-chip">
            {w}
          </span>
        ))}
        {!finished && <span className="caret" />}
      </div>

      {!finished ? (
        <>
          <div className="sim-label">
            The model has only seen the word <b>“{last === START ? 'start of sentence' : last}”</b>. Here's what it thinks
            comes next:
          </div>
          <div className="prob-list">
            {options.map((o) => (
              <button key={o.word} className="prob-row" onClick={() => add(o.word)}>
                <span className="prob-word">{o.word}</span>
                <span className="prob-bar">
                  <span style={{ width: `${o.p * 100}%` }} />
                </span>
                <span className="prob-value">{pct(o.p)}</span>
              </button>
            ))}
          </div>
          <div className="sim-row">
            <button className="btn primary" onClick={() => add(options[sampleIndex(options.map((o) => o.p))].word)}>
              <Dices size={16} /> Let the model pick
            </button>
            <button className="btn" onClick={() => setWords([])}>
              <RotateCcw size={16} /> Start over
            </button>
          </div>
        </>
      ) : (
        <div className="sim-row">
          <div className={`verdict-box ${words.length - 1 >= TARGET_WORDS ? 'gpu' : 'cpu'}`}>
            {words.length - 1 >= TARGET_WORDS
              ? `A ${words.length - 1}-word sentence, built one word at a time.`
              : `Only ${words.length - 1} words. Try again and aim for at least ${TARGET_WORDS}.`}
          </div>
          <button className="btn" onClick={() => setWords([])}>
            <RotateCcw size={16} /> New sentence
          </button>
        </div>
      )}

      <button className="link-btn left" onClick={() => setShowCorpus(!showCorpus)}>
        {showCorpus ? 'Hide' : 'Show'} the {CORPUS.length} sentences this model learned from
      </button>
      {showCorpus && (
        <ul className="corpus">
          {CORPUS.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      )}
      <p className="sim-note">
        This tiny model only looks at the last word and counts what followed it. A real LLM looks at everything written
        so far, learned from trillions of words.
      </p>
    </div>
  )
}
