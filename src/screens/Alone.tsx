import { useState } from 'react'
import { alone } from '../content'

/* The end of a thread, and it asks two things.
 *
 * ONE GO WITH NOTHING HELPING. In the strongest study on this, people using a
 * plain assistant did well while they had it and worse than people who never
 * had it once it was taken away, because they had been copying. Without one
 * unaided attempt, nothing else captured here can tell learning from copying.
 *
 * AND WHEN THEY WILL ACTUALLY DO IT. Self written plans changed nothing in the
 * research. Prescriptive ones worked. Asking for a date changed nothing; asking
 * for a date AND a time worked. So the time is not optional decoration, it is
 * the half that carries the effect.
 *
 * Neither is scored and neither is fed back. Skipping is one tap, and a skip is
 * itself worth knowing, so it is recorded rather than treated as nothing. */
export default function Alone({
  working,
  onNext,
  onSkip,
}: {
  working: string
  onNext: (line: string, day: string, time: string) => void
  onSkip: () => void
}) {
  const [line, setLine] = useState('')
  const [day, setDay] = useState('')
  const [time, setTime] = useState('')

  /* The next five working days, named the way somebody would say them. A date
     picker asks for a calendar decision; this asks which day. */
  const days = nextDays()

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
          value={line}
          placeholder={alone.placeholder}
          onChange={(e) => setLine(e.target.value)}
        />
        <p className="hint">{alone.note}</p>
      </div>

      <div className="field">
        <span className="field-label" id="when-label">{alone.when}</span>
        <div className="opts opts-row" role="group" aria-labelledby="when-label">
          {days.map((d) => (
            <button
              key={d.iso}
              type="button"
              className={`opt opt-inline${day === d.iso ? ' opt-on' : ''}`}
              aria-pressed={day === d.iso}
              onClick={() => setDay(d.iso)}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Only after a day, because a time with no day attached is the half that
          does nothing on its own. */}
      {day && (
        <div className="field">
          <label className="field-label" htmlFor="time">{alone.time}</label>
          <input
            id="time"
            className="input input-time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
          <p className="hint">{alone.timeNote}</p>
        </div>
      )}

      <div className="actions">
        <button
          className="btn btn-lg btn-primary"
          type="button"
          disabled={!line.trim() || !day || !time}
          onClick={() => onNext(line.trim(), day, time)}
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

function nextDays(): { iso: string; label: string }[] {
  const out: { iso: string; label: string }[] = []
  const d = new Date()
  while (out.length < 5) {
    d.setDate(d.getDate() + 1)
    const wd = d.getDay()
    if (wd === 0 || wd === 6) continue
    out.push({
      iso: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      label: d.toLocaleDateString('en-GB', { weekday: 'short' }),
    })
  }
  return out
}
