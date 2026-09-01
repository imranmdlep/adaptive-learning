import { useState } from 'react'
import type { Past } from '../capture'
import { MODULES } from '../modules'
import { pick } from '../content'

/* The front door: a list of situations, not a catalogue of courses.
 *
 * Every row is something someone recognises from their own week. No skill
 * names, no module codes, no cluster headings. The phase-1 interviews name the
 * catalogue-as-front-door as the problem, and a list of skill names is that
 * problem with better typography.
 *
 * Nothing is locked, nothing is ordered by difficulty, nothing is recommended.
 * Which one someone reaches for first is a signal we would destroy by
 * suggesting one. */
export default function Pick({
  who,
  past,
  onNext,
}: {
  who: string
  past: Past[]
  onNext: (name: string, moduleId: string) => void
}) {
  const [name, setName] = useState(who)
  const ready = name.trim().length > 0
  const seen = new Set(past.map((p) => p.moduleId))

  return (
    <section>
      {!who && (
        <div className="field name-row">
          <label className="field-label" htmlFor="name">{pick.nameLabel}</label>
          <input
            id="name"
            className="input"
            value={name}
            placeholder={pick.namePlaceholder}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
      )}

      <h1 className="h1">{pick.ask}</h1>
      <p className="lead">{pick.help}</p>

      <div className="opts" role="group" aria-label={pick.ask}>
        {MODULES.map((m) => (
          <button
            key={m.id}
            type="button"
            className="opt opt-stack"
            disabled={!ready}
            onClick={() => onNext(name.trim(), m.id)}
          >
            <span className="opt-title">{m.title}</span>
            <span className="opt-blurb">{m.blurb}</span>
            {/* Says only that they have been here before. Not a tick, not a
                score, not progress: none of those are true of a situation that
                keeps happening. */}
            {seen.has(m.id) && <span className="opt-seen">Been here before</span>}
          </button>
        ))}
      </div>

      {past.length > 0 && <p className="hint">{pick.again}</p>}
    </section>
  )
}
