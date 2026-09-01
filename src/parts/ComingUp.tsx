import type { Session } from '../session'
import { home } from '../content'

/* The future, at the top, because that is what a person opens this to check.
 *
 * A dated list rather than a hero panel: the session is the biggest thing in it
 * but it sits in the same structure as everything else, which is what stops the
 * app becoming a runbook for one event. */
export default function ComingUp({ session }: { session: Session | null }) {
  return (
    <section className="block">
      <h1 className="block-head">{home.comingUp}</h1>

      <div className="card">
        {session
          ? (
            <div className="up-row">
              <div className="up-date">
                <span className="up-day">{session.dayNum}</span>
                <span className="up-month">{session.month}</span>
                <span className="up-weekday">{session.day}</span>
              </div>
              <div className="up-body">
                <p className="up-title">{session.topic}</p>
                <p className="up-meta">
                  {session.time}, {home.sessionWith} {session.trainer}
                </p>
                <p className="up-shape">{session.shape}</p>
              </div>
            </div>
          )
          : <p className="card-empty">{home.comingUpEmpty}</p>}
      </div>
    </section>
  )
}
