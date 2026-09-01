import type { Mode, Past } from '../capture'
import { home, recipes } from '../content'
import { moduleById } from '../modules'
import { SKILL_ICON, SKILL_ORDER } from '../skills'
import { SKILLS } from '../taxonomy'
import AskBar from '../parts/AskBar'
import Record from '../parts/Record'

/* Home, minimal: a line, one input, and the skills as marks underneath.
 *
 * It used to open with five heavy cards, which is a wall to read before you can
 * do anything. The shape here is a greeting, the box, then small chips: the
 * page has one obvious thing to do and everything else is quiet until wanted.
 *
 * SKILLS ARE PURSUED, NEVER ASSIGNED. Naming one is not admitting to a
 * shortfall. Someone wanting to get better at difficult conversations might
 * have a new team, a harder client or plain interest, so the word on this
 * screen is pursuing and there is no level, score or progress anywhere on it.
 *
 * A skill someone has already worked on is marked, and marked only: it says
 * they have been here, not how they did. */
export default function Home({
  past,
  onAsk,
  onOpen,
  onRecipe,
}: {
  past: Past[]
  onAsk: (text: string, mode: Mode | 'auto') => void
  onOpen: (id: string) => void
  onRecipe: (label: string) => void
}) {
  /* Which skills her own threads have touched, derived rather than stored, so
     nothing has to be kept in sync and nothing accumulates into a profile. */
  const pursuing = new Set(
    past.flatMap((p) => moduleById(p.moduleId)?.skills ?? []),
  )

  return (
    <>
      <div className="stream stream-center">
        <h1 className="greet">{home.head}</h1>

        <AskBar recipes={recipes} onAsk={onAsk} onRecipe={onRecipe} inline />

        <section className="block">
          <h2 className="block-sub">{home.skills}</h2>
          <div className="skills">
            {SKILL_ORDER.map((id) => {
              const Icon = SKILL_ICON[id]
              const on = pursuing.has(id)
              return (
                <button
                  key={id}
                  type="button"
                  className={`skill${on ? ' skill-on' : ''}`}
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
          {/* The way in for somebody who cannot name what they are after. Most
              people cannot, cold, which is why asking them to is a bad front
              door and why this is a conversation rather than a form. */}
          <button
            type="button"
            className="recipe"
            onClick={() => onAsk(home.unsureAsk, 'conversation')}
          >
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
    </>
  )
}
