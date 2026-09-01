import type { Mode, Past } from '../capture'
import { MODULES } from '../modules'
import { home, recipes } from '../content'
import AskBar from '../parts/AskBar'
import Record from '../parts/Record'

/* Home: what she wants to get better at, and what she has already worked on.
 *
 * Not the session. Opening on the booked event makes this a runbook for one
 * afternoon, which is what the current product already does and what the
 * phase-1 interviews name as the problem. The room lives on Practice.
 *
 * The list is a library, not a curriculum. Nothing is locked, nothing is
 * ordered by difficulty, nothing is recommended, and none of it says a skill
 * name: every row is a situation somebody recognises from their own week.
 * Picking one is going after something, never admitting to a shortfall.
 *
 * The bar underneath is the way out of the library. Somebody whose week is not
 * on the list can just say what it is, and that is the more interesting signal
 * of the two. */
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
  return (
    <>
      <div className="stream">
        <section className="block">
          <h1 className="block-head">{home.head}</h1>
          <p className="lead">{home.help}</p>

          <div className="opts" role="group" aria-label={home.head}>
            {MODULES.map((m) => (
              <button
                key={m.id}
                type="button"
                className="opt opt-stack"
                /* Picking a row is the same act as writing a sentence: it opens
                   a thread on that situation, with Auto choosing the format. */
                onClick={() => onAsk(m.title, 'auto')}
              >
                <span className="opt-title">{m.title}</span>
                <span className="opt-blurb">{m.blurb}</span>
              </button>
            ))}
          </div>
        </section>

        {past.length > 0 && (
          <section className="block">
            <h2 className="block-sub">{home.recordHead}</h2>
            <Record past={past} onOpen={onOpen} />
          </section>
        )}
      </div>

      <AskBar recipes={recipes} onAsk={onAsk} onRecipe={onRecipe} />
    </>
  )
}
