import type { Plan } from '../capture'
import type { Session } from '../session'
import { coming } from '../content'

/* The top of the page: what she is about to have to do.
 *
 * Two kinds of thing, in one dated list. The conversations she said she would
 * have, and the room that is booked. They belong together because they are the
 * same shape: a real thing, with a person, at a time.
 *
 * This is the one mechanic the research is clearest about. Self written plans
 * changed nothing. Prescriptive ones worked. A date on its own changed nothing;
 * a date AND a time worked. So every row here carries both, and a row without
 * them cannot exist.
 *
 * THE NEAREST ROW GETS AN ACTION. Everything else is quiet. A list where every
 * row shouts is a list nobody reads, and the only one that can be acted on
 * right now is the one that is about to happen. */
export default function ComingUp({
  plans,
  session,
  onFollowUp,
  onPrepare,
}: {
  plans: Plan[]
  session: Session | null
  /* the one that has passed: the only question worth asking afterwards */
  onFollowUp: (plan: Plan) => void
  /* the one that has not: run it through before it happens */
  onPrepare: (plan: Plan) => void
}) {
  const rows = buildRows(plans, session)

  return (
    <section className="block">
      <h1 className="block-head">{coming.head}</h1>

      <div className="card">
        {rows.length === 0
          ? <p className="card-empty">{coming.empty}</p>
          : rows.map((r, i) => (
            <div className="up-row" key={r.key}>
              <div className="up-date">
                <span className="up-day">{r.dayNum}</span>
                <span className="up-month">{r.month}</span>
                <span className="up-weekday">{r.weekday}</span>
              </div>

              <div className="up-body">
                <p className="up-title">{r.title}</p>
                <p className="up-meta">{r.meta}</p>
              </div>

              {/* Only the first row, and only when there is something to do
                  about it. Everything below it stays quiet. */}
              {i === 0 && r.plan && (
                <button
                  className="up-action"
                  type="button"
                  onClick={() => (r.past ? onFollowUp(r.plan!) : onPrepare(r.plan!))}
                >
                  {r.past ? coming.howDidItGo : coming.runIt}
                </button>
              )}
            </div>
          ))}
      </div>
    </section>
  )
}

type Row = {
  key: string
  dayNum: string
  month: string
  weekday: string
  title: string
  meta: string
  plan?: Plan
  past: boolean
}

function buildRows(plans: Plan[], session: Session | null): Row[] {
  const now = Date.now()
  const rows: Row[] = plans.map((p) => {
    const d = new Date(p.at)
    return {
      key: p.id,
      dayNum: String(d.getDate()),
      month: d.toLocaleDateString('en-GB', { month: 'long' }),
      weekday: d.toLocaleDateString('en-GB', { weekday: 'short' }),
      title: p.what,
      meta: `${p.time}`,
      plan: p,
      past: Date.parse(p.at) < now,
    }
  })

  if (session) {
    rows.push({
      key: 'session',
      dayNum: session.dayNum,
      month: session.month,
      weekday: session.day,
      title: `${session.topic}, ${coming.with} ${session.trainer}`,
      meta: session.time,
      past: false,
    })
  }

  /* Anything that has already happened sorts to the top, because the only
     useful thing left to do with it is say whether it happened. */
  return rows.sort((a, b) => Number(b.past) - Number(a.past))
}
