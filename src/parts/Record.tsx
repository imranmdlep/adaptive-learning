import type { Past } from '../capture'
import { moduleById } from '../modules'
import { home, modes } from '../content'
import { SKILL_ICON, SKILL_ORDER } from '../skills'
import { SKILLS } from '../taxonomy'
import type { SkillId } from '../taxonomy'

/* Her own trail, gathered under what it was about.
 *
 * This is not decoration and it is not progress. Apps holding a person's own
 * record kept people at a month; apps holding only activity kept nobody. The
 * list IS the retention mechanism, which is why it gets the space it does.
 *
 * GROUPED, NOT FILED. A folder someone has to maintain is work, and there is
 * nothing here yet worth the effort of filing. Each thread already resolves to
 * a skill, so the grouping is free and nobody is asked to do admin. When the
 * record is deep enough that automatic grouping stops being right, that is the
 * moment to let her make her own, and not before.
 *
 * A thread sits under one skill, its first, rather than appearing under each
 * one it touches. The same conversation showing up three times reads as three
 * conversations. */
export default function Record({ past, onOpen }: { past: Past[]; onOpen: (id: string) => void }) {
  if (past.length === 0) {
    return <p className="record-empty">{home.recordEmpty}</p>
  }

  const groups = new Map<SkillId, Past[]>()
  const loose: Past[] = []
  for (const p of [...past].reverse()) {
    const skill = moduleById(p.moduleId)?.skills[0]
    if (!skill) {
      loose.push(p)
      continue
    }
    const list = groups.get(skill)
    if (list) list.push(p)
    else groups.set(skill, [p])
  }

  /* Fixed skill order, never sorted by how much is in each. Sorting by volume
     turns a record into a leaderboard of yourself. */
  const ordered = SKILL_ORDER.filter((id) => groups.has(id))

  return (
    <div className="record">
      {ordered.map((id) => {
        const Icon = SKILL_ICON[id]
        return (
          <section className="record-group" key={id}>
            <h3 className="record-skill">
              <Icon size={16} stroke={1.6} aria-hidden />
              <span>{SKILLS[id].name}</span>
            </h3>
            {groups.get(id)!.map((p) => <Row key={p.id} p={p} onOpen={onOpen} />)}
          </section>
        )
      })}

      {loose.length > 0 && (
        <section className="record-group">
          <h3 className="record-skill"><span>{home.recordLoose}</span></h3>
          {loose.map((p) => <Row key={p.id} p={p} onOpen={onOpen} />)}
        </section>
      )}
    </div>
  )
}

function Row({ p, onOpen }: { p: Past; onOpen: (id: string) => void }) {
  return (
    <button type="button" className="record-row" onClick={() => onOpen(p.id)}>
      <span className="record-main">
        {/* Her words, never a label we invented for her. */}
        <span className="record-title">{p.working || moduleById(p.moduleId)?.title || ''}</span>
        <span className="record-sub">{modes[p.used].head}</span>
      </span>
      <span className="record-time">{when(p.at)}</span>
    </button>
  )
}

/* Relative, because "3d" says how warm a thread is and a timestamp makes
   somebody do the subtraction. */
function when(iso: string): string {
  const mins = Math.max(1, Math.round((Date.now() - Date.parse(iso)) / 60_000))
  if (mins < 60) return `${mins}m`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.round(hours / 24)
  if (days < 7) return `${days}d`
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}
