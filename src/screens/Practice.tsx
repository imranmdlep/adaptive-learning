import { useState } from 'react'
import type { Past } from '../capture'
import type { Session } from '../session'
import { practice } from '../content'
import SessionCard from '../parts/SessionCard'

/* Practice: the room that is booked, and the rehearsal she can run today.
 *
 * NOT A SECOND CHAT. There is one conversation surface in this app and it is
 * on Home, where she talks about a situation and gets helped. This page is the
 * other thing entirely: running it, with the other side played straight.
 *
 * So there is no ask bar here. A setup and a button, which is how a scene
 * starts, rather than an input that looks identical to the one on Home and does
 * something completely different.
 *
 * The session sits above it because it is the same act with a real person in
 * the room. That is the thing this page points at, and the rehearsal is what
 * she can do about it before Thursday. */
export default function Practice({
  session,
  past,
  onRehearse,
  onOpen,
}: {
  session: Session | null
  past: Past[]
  onRehearse: (setup: string) => void
  onOpen: (id: string) => void
}) {
  const [setup, setSetup] = useState('')
  const rehearsals = [...past].reverse().filter((p) => p.used === 'rehearsal')

  return (
    <div className="stream">
      {session && <SessionCard session={session} />}

      <section className="block">
        <h1 className="block-head">{practice.head}</h1>
        <p className="lead">{practice.help}</p>

        <div className="setup">
          <label className="field-label" htmlFor="setup">{practice.who}</label>
          <textarea
            id="setup"
            className="area"
            rows={3}
            value={setup}
            placeholder={practice.whoPlaceholder}
            onChange={(e) => setSetup(e.target.value)}
          />
          <div className="actions">
            <button
              className="btn btn-lg btn-primary"
              type="button"
              disabled={!setup.trim()}
              onClick={() => onRehearse(setup.trim())}
            >
              {practice.start}
            </button>
          </div>
        </div>
      </section>

      {rehearsals.length > 0 && (
        <section className="block">
          <h2 className="block-sub">{practice.recents}</h2>
          {rehearsals.slice(0, 5).map((p) => (
            <button key={p.id} type="button" className="record-row" onClick={() => onOpen(p.id)}>
              <span className="record-main">
                <span className="record-title">{p.working}</span>
              </span>
            </button>
          ))}
        </section>
      )}
    </div>
  )
}
