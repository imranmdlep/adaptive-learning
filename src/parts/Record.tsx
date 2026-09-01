import type { Past } from '../capture'
import { moduleById } from '../modules'
import { home, modes } from '../content'

/* Her own trail, most recent first, grouped by day.
 *
 * This is not decoration and it is not a progress bar. Apps that hold a
 * person's own record kept people at a month; apps that only held activity kept
 * nobody. The list IS the retention mechanism, which is why it gets the space
 * it does and why nothing here counts, scores or congratulates.
 *
 * Every row says what she brought and what she did with it. Her words, never a
 * label we invented for her. */
export default function Record({ past, onOpen }: { past: Past[]; onOpen: (id: string) => void }) {
  if (past.length === 0) {
    return <p className="record-empty">{home.recordEmpty}</p>
  }

  /* Newest first, and grouped under the day heading a person would say out
     loud: Today, Yesterday, then the date. */
  const groups = new Map<string, Past[]>()
  for (const p of [...past].reverse()) {
    const label = dayLabel(p.at)
    const list = groups.get(label)
    if (list) list.push(p)
    else groups.set(label, [p])
  }

  return (
    <div className="record">
      {[...groups.entries()].map(([label, rows]) => (
        <section className="record-group" key={label}>
          <h2 className="record-day">{label}</h2>
          {rows.map((p) => (
            <button
              key={p.id}
              type="button"
              className="record-row"
              onClick={() => onOpen(p.id)}
            >
              <span className="record-main">
                <span className="record-title">{p.working || moduleById(p.moduleId)?.title || ''}</span>
                <span className="record-sub">{modes[p.used].head}</span>
              </span>
              <span className="record-time">{clock(p.at)}</span>
            </button>
          ))}
        </section>
      ))}
    </div>
  )
}

function dayLabel(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const days = Math.floor(
    (startOfDay(now).getTime() - startOfDay(d).getTime()) / 86_400_000,
  )
  if (days <= 0) return home.today
  if (days === 1) return home.yesterday
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function clock(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}
