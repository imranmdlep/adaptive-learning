import { useState } from 'react'
import type { Minutes, Mode } from '../capture'
import type { Module } from '../modules'
import { envelope } from '../content'

/* Two questions between picking a situation and starting: how long they have,
 * and what they want right now. Plus one optional line about their own case.
 *
 * This screen is the instrument. Everything downstream is decided by what
 * people answer here, and by whether what they open turns out to be what they
 * said they wanted. So: no preselection, no recommended option, no reordering
 * by what is popular. A default answers the question the prototype exists to
 * ask.
 *
 * The three formats read as three ways of spending the same time, never as
 * three difficulty levels. Nobody is picking the easy one. */
export default function Envelope({
  module: mod,
  onNext,
}: {
  module: Module
  onNext: (minutes: Minutes, wanted: Mode, working: string) => void
}) {
  const [minutes, setMinutes] = useState<Minutes | null>(null)
  const [wanted, setWanted] = useState<Mode | null>(null)
  const [working, setWorking] = useState('')

  return (
    <section>
      {/* Their situation stays on screen, so the choices below are made about
          something concrete rather than in the abstract. */}
      <div className="eyebrow">{mod.title}</div>
      <h1 className="h1">{envelope.ask}</h1>
      <p className="lead">{envelope.help}</p>

      <div className="field">
        <span className="field-label" id="env-time">{envelope.timeLabel}</span>
        <div className="opts" role="group" aria-labelledby="env-time">
          {envelope.timeOptions.map((o) => (
            <button
              key={o.id}
              type="button"
              className={`opt${minutes === o.id ? ' opt-on' : ''}`}
              aria-pressed={minutes === o.id}
              onClick={() => setMinutes(o.id as Minutes)}
            >
              {o.text}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <span className="field-label" id="env-want">{envelope.wantLabel}</span>
        <div className="opts" role="group" aria-labelledby="env-want">
          {envelope.wantOptions.map((o) => (
            <button
              key={o.id}
              type="button"
              className={`opt${wanted === o.id ? ' opt-on' : ''}`}
              aria-pressed={wanted === o.id}
              onClick={() => setWanted(o.id as Mode)}
            >
              {o.text}
            </button>
          ))}
        </div>
        <p className="hint">{envelope.note}</p>
      </div>

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

      <div className="actions">
        <button
          className="btn btn-lg btn-primary"
          type="button"
          disabled={!minutes || !wanted}
          onClick={() => { if (minutes && wanted) onNext(minutes, wanted, working.trim()) }}
        >
          {envelope.commit}
        </button>
      </div>
    </section>
  )
}
