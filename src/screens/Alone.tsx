import { useState } from 'react'
import { alone } from '../content'

/* One go at it with nothing helping.
 *
 * This screen carries the only signal here that can tell learning from
 * copying. In the strongest study on this, people using a plain assistant did
 * well while they had it and worse than people who never had it at all once it
 * was taken away, because they had been copying rather than learning. Every
 * other number this prototype collects is hard to defend without this one.
 *
 * It is framed as the genuinely useful thing it also is: writing the line you
 * are actually going to say. Nothing scores it, nothing responds to it, and
 * nobody is told how they did. Skipping is one tap, and a skip is itself worth
 * knowing, so it is recorded rather than treated as nothing happening. */
export default function Alone({
  working,
  onNext,
  onSkip,
}: {
  /* their own words, shown back so the line they write is for THAT situation */
  working: string
  onNext: (text: string) => void
  onSkip: () => void
}) {
  const [text, setText] = useState('')

  return (
    <section>
      <div className="eyebrow">{working}</div>
      <h1 className="h1">{alone.ask}</h1>
      <p className="lead">{alone.help}</p>

      <div className="field">
        <label className="visually-hidden" htmlFor="alone">{alone.help}</label>
        <textarea
          id="alone"
          className="area"
          rows={4}
          value={text}
          placeholder={alone.placeholder}
          onChange={(e) => setText(e.target.value)}
        />
        <p className="hint">{alone.note}</p>
      </div>

      <div className="actions">
        <button
          className="btn btn-lg btn-primary"
          type="button"
          disabled={!text.trim()}
          onClick={() => onNext(text.trim())}
        >
          {alone.commit}
        </button>
        <button className="btn btn-subtle" type="button" onClick={onSkip}>
          {alone.skip}
        </button>
      </div>
    </section>
  )
}
