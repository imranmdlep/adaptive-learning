import type { Mode, Past, Plan } from '../capture'
import type { Session } from '../session'
import { home, recipes } from '../content'
import { moduleById } from '../modules'
import { SKILL_ICON, SKILL_ORDER } from '../skills'
import { SKILLS } from '../taxonomy'
import AskBar from '../parts/AskBar'
import ComingUp from '../parts/ComingUp'
import Record from '../parts/Record'

/* One page.
 *
 * Everything a person can do lives in one column, in the order they would
 * reach for it:
 *
 *   the box        say what is on your plate, and get helped
 *   pursue         pick a skill instead, if that is the way in
 *   not sure       the way in for somebody who cannot name it, which is most
 *   session        the room that is booked
 *   record         what they have already worked on
 *
 * The session is near the bottom rather than at the top on purpose. Opening the
 * page on the booked event makes this a runbook for one afternoon, which is
 * what the current product already is and what the interviews call the
 * problem. */
export default function Home({
  session,
  plans,
  past,
  onAsk,
  onOpen,
  onRecipe,
}: {
  session: Session | null
  plans: Plan[]
  past: Past[]
  onAsk: (text: string, mode: Mode | 'auto') => void
  onOpen: (id: string) => void
  onRecipe: (label: string) => void
}) {
  /* Which skills her own threads have touched, derived rather than stored, so
     nothing has to be kept in sync and nothing accumulates into a profile. */
  const pursuing = new Set(past.flatMap((p) => moduleById(p.moduleId)?.skills ?? []))

  return (
    <>
      <div className="stream">
        <ComingUp
          plans={plans}
          session={session}
          onFollowUp={(p) => onAsk(home.followUpAsk(p.what), 'conversation')}
          onPrepare={(p) => onAsk(p.what, 'auto')}
        />

        <section className="block">
          <h2 className="block-sub">{home.skills}</h2>
        <div className="skills">
          {SKILL_ORDER.map((id) => {
            const Icon = SKILL_ICON[id]
            return (
              <button
                key={id}
                type="button"
                className={`skill${pursuing.has(id) ? ' skill-on' : ''}`}
                /* Tapping a skill is the same act as writing a sentence: it
                   opens a thread, with Auto choosing the format. */
                onClick={() => onAsk(SKILLS[id].name, 'auto')}
              >
                <Icon size={18} stroke={1.6} aria-hidden />
                <span>{SKILLS[id].name}</span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="block">
        <h2 className="block-sub">{home.unsure}</h2>
        {/* Most people cannot name what they are after cold, which is why
            asking them to is a bad front door and why this is a conversation
            rather than a box. */}
        <button type="button" className="recipe" onClick={() => onAsk(home.unsureAsk, 'conversation')}>
          {home.unsureCta}
        </button>
      </section>

        {past.length > 0 && (
          <section className="block">
            <h2 className="block-sub">{home.recordHead}</h2>
            <Record past={past} onOpen={onOpen} />
          </section>
        )}
      </div>

      {/* Pinned. One input, in the same place, on every screen it appears. */}
      <AskBar recipes={recipes} onAsk={onAsk} onRecipe={onRecipe} />
    </>
  )
}
