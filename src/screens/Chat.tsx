import type { Mode, Past } from '../capture'
import type { Session } from '../session'
import { authoredRecipe, chat, recipes } from '../content'
import AskBar from '../parts/AskBar'

/* The second page: a greeting, one input, what she was last in the middle of,
 * and the recipes laid out rather than tucked above the bar.
 *
 * Home is where her week is. This is where she starts something. Splitting them
 * keeps Home from turning into a launcher, and gives the recipes somewhere to
 * be browsed rather than only reached for. */
export default function Chat({
  who,
  session,
  past,
  onAsk,
  onOpen,
  onRecipe,
}: {
  who: string
  session: Session | null
  past: Past[]
  onAsk: (text: string, mode: Mode | 'auto') => void
  onOpen: (id: string) => void
  onRecipe: (label: string) => void
}) {
  const authored = session ? authoredRecipe(session.trainer) : null
  const all = authored ? [...recipes, { mode: authored.mode, label: authored.label }] : recipes
  const recents = [...past].reverse().slice(0, 3)

  return (
    <>
      <div className="stream stream-center">
        <h1 className="greet">{chat.greet(who)}</h1>

        <AskBar recipes={[]} onAsk={onAsk} onRecipe={onRecipe} inline />

        {recents.length > 0 && (
          <section className="block">
            <h2 className="block-sub">{chat.recents}</h2>
            {recents.map((p) => (
              <button key={p.id} type="button" className="record-row" onClick={() => onOpen(p.id)}>
                <span className="record-main">
                  <span className="record-title">{p.working || chat.untitled}</span>
                </span>
                <span className="record-time">{ago(p.at)}</span>
              </button>
            ))}
          </section>
        )}

        <section className="block">
          <h2 className="block-sub">{chat.recipes}</h2>
          <div className="recipe-grid">
            {all.map((r) => (
              <button
                key={r.label}
                type="button"
                className={`recipe${authored && r.label === authored.label ? ' recipe-authored' : ''}`}
                onClick={() => onRecipe(r.label)}
              >
                {r.label}
              </button>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}

/* Relative, because "55m" tells someone how warm a thread is and a timestamp
   makes them do the subtraction. */
function ago(iso: string): string {
  const mins = Math.max(1, Math.round((Date.now() - Date.parse(iso)) / 60_000))
  if (mins < 60) return `${mins}m`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours}h`
  return `${Math.round(hours / 24)}d`
}
