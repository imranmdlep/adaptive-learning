import { useState } from 'react'
import type { Minutes, Mode, Past } from '../capture'
import type { Session } from '../session'
import { moduleById } from '../modules'
import { home, offers, pick } from '../content'

/* Where Maria lands, in both states.
 *
 * She lands on her own place, with the session in it. Turning that round, so
 * the session frames everything and the app is its runbook, is what the current
 * product already does and what the phase-1 interviews name as the problem.
 *
 * THE SESSION PANEL. If the trainer is the premium, the room is the best thing
 * that happens here, and the screen should say so. It gets the navy surface,
 * which in the design system is where identity lives, and it names the person
 * running it. A date in a list would be admin. This is the thing everything
 * else is pointed at.
 *
 * THE OFFERS. Each is a format with an honest time on it, so tapping one
 * declares both how long she has and what she wants, in a single move. Nothing
 * is recommended, nothing is reordered by popularity, and the set never
 * changes, because which one people reach for is the finding. */
export default function Home({
  who,
  session,
  past,
  onOffer,
}: {
  who: string
  session: Session | null
  past: Past[]
  onOffer: (name: string, mode: Mode, minutes: Minutes) => void
}) {
  const [name, setName] = useState(who)
  const ready = name.trim().length > 0

  const head = session
    ? (session.today ? home.todayHead : home.soonHead(session.day))
    : home.openHead
  const help = session ? (session.today ? home.todayHelp : home.soonHelp) : home.openHelp

  return (
    <section>
      {/* Only when the link did not carry a name, so a per person link opens
          straight on her own place rather than on a form. */}
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

      {session && (
        <div className="session">
          <div className="session-eyebrow">{home.sessionEyebrow}</div>
          <p className="session-when">{session.when}</p>
          <h2 className="session-topic">
            {session.topic}, {home.sessionWith} {session.trainer}
          </h2>
          <p className="session-shape">{session.shape}</p>
        </div>
      )}

      <h1 className="h1">{head}</h1>
      <p className="lead">{help}</p>

      <div className="opts" role="group" aria-label={head}>
        {offers.map((o) => (
          <button
            key={o.mode}
            type="button"
            className="opt opt-stack"
            disabled={!ready}
            onClick={() => onOffer(name.trim(), o.mode, o.minutes)}
          >
            <span className="opt-time">{o.time}</span>
            <span className="opt-title">{o.title}</span>
            <span className="opt-blurb">{o.blurb}</span>
          </button>
        ))}
      </div>

      {/* Her own trail, and nothing more. No count, no streak, no progress bar:
          none of those are true of conversations that keep happening. */}
      {past.length > 0 && (
        <div className="been">
          <h2 className="been-head">{home.beenHead}</h2>
          <ul className="been-list">
            {past.slice(-4).reverse().map((p, i) => (
              <li key={i}>{moduleById(p.moduleId)?.title ?? p.moduleId}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
