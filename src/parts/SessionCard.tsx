import { useState } from 'react'
import type { Session } from '../session'
import { session as copy } from '../content'

/* The session, on the practice page, as something she can look into.
 *
 * It sits here rather than on Home for a reason. Opening on the session makes
 * the app a runbook for one event, which is what the current product already
 * is and what the interviews name as the problem. Home is hers. This is the
 * room, and the room is the best thing that happens here.
 *
 * It gets the navy surface, which is where identity lives in the design system,
 * and it is the only place on any screen that gets it. If the trainer is the
 * premium then this is the moment worth spending it on.
 *
 * Closed it says when and who. Opened it says what she will actually do and why
 * it is worth an afternoon, in her terms. Nobody turns up to an agenda. */
export default function SessionCard({ session }: { session: Session }) {
  const [open, setOpen] = useState(false)

  return (
    <section className="session">
      <div className="session-eyebrow">{copy.eyebrow}</div>
      <p className="session-when">{session.dayNum} {session.month}, {session.time}</p>
      <h2 className="session-topic">{session.topic}, {copy.with} {session.trainer}</h2>
      <p className="session-shape">{session.shape}</p>

      <button
        type="button"
        className="session-more"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? copy.less : copy.more}
      </button>

      {open && (
        <div className="session-detail">
          <p className="session-detail-head">{copy.inIt}</p>
          <ul className="session-list">
            {session.inIt.map((line) => <li key={line}>{line}</li>)}
          </ul>

          <p className="session-detail-head">{copy.why}</p>
          <p className="session-helps">{session.helps}</p>
        </div>
      )}
    </section>
  )
}
