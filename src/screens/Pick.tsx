import { useState } from 'react'
import { MODULES } from '../modules'
import { envelope, pick } from '../content'

/* Which conversation, after she has already said what she wants and how long
 * she has by tapping an offer.
 *
 * Every row is a situation somebody recognises from their own week. No skill
 * names, no module names, no course names. The phase-1 interviews name the
 * catalogue as the problem, and a list of skill names is that problem with
 * better typography.
 *
 * The sub-lines describe the SITUATION, never the reader's failure inside it.
 * "You had the answer and the conversation ended there" is a verdict on a
 * person and it has no business here. Someone picking a row is telling us what
 * they are going after. */
export default function Pick({
  onNext,
  onBack,
}: {
  onNext: (moduleId: string, working: string) => void
  onBack: () => void
}) {
  const [chosen, setChosen] = useState<string | null>(null)
  const [working, setWorking] = useState('')

  return (
    <section>
      <h1 className="h1">{pick.ask}</h1>
      <p className="lead">{pick.help}</p>

      <div className="opts" role="group" aria-label={pick.ask}>
        {MODULES.map((m) => (
          <button
            key={m.id}
            type="button"
            className={`opt opt-stack${chosen === m.id ? ' opt-on' : ''}`}
            aria-pressed={chosen === m.id}
            onClick={() => setChosen(m.id)}
          >
            <span className="opt-title">{m.title}</span>
            <span className="opt-blurb">{m.blurb}</span>
          </button>
        ))}
      </div>

      {/* Appears once a row is chosen, because asking for detail about nothing
          in particular is how a form gets abandoned. Optional, and the whole
          thing works without it. */}
      {chosen && (
        <div className="field">
          <label className="field-label" htmlFor="detail">{envelope.detailLabel}</label>
          <textarea
            id="detail"
            className="area"
            rows={2}
            value={working}
            placeholder={envelope.detailPlaceholder}
            onChange={(e) => setWorking(e.target.value)}
          />
          <p className="hint">{envelope.detailHelp}</p>
        </div>
      )}

      <div className="actions">
        <button
          className="btn btn-lg btn-primary"
          type="button"
          disabled={!chosen}
          onClick={() => { if (chosen) onNext(chosen, working.trim()) }}
        >
          {envelope.commit}
        </button>
        <button className="btn btn-subtle" type="button" onClick={onBack}>
          {'Back'}
        </button>
      </div>
    </section>
  )
}
