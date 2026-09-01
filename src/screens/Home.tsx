import type { Mode, Past } from '../capture'
import type { Session } from '../session'
import { authoredRecipe, recipes } from '../content'
import AskBar from '../parts/AskBar'
import ComingUp from '../parts/ComingUp'
import Record from '../parts/Record'

/* Home: the future at the top, her own record below, one input at the bottom.
 *
 * A place with her own things in it, rather than a menu of things she could do.
 * The record is not decoration: apps holding a person's own record kept people
 * at a month, activity-only apps kept nobody. It IS the retention mechanism.
 *
 * No format menu anywhere on this screen. She writes what is actually
 * happening, and the format is decided from that or reached for as a recipe.
 * Making somebody choose a format before they have said anything is teaching
 * before attempting, which is backwards. */
export default function Home({
  session,
  past,
  onAsk,
  onOpen,
  onRecipe,
}: {
  session: Session | null
  past: Past[]
  onAsk: (text: string, mode: Mode | 'auto') => void
  onOpen: (id: string) => void
  onRecipe: (label: string) => void
}) {
  /* The authored recipe appears only when a trainer has actually run a session
     for this person, so the name on it means something. */
  const authored = session ? authoredRecipe(session.trainer) : null
  const all = authored ? [...recipes, { mode: authored.mode, label: authored.label }] : recipes

  return (
    <>
      <div className="stream">
        <ComingUp session={session} />
        <Record past={past} onOpen={onOpen} />
      </div>
      <AskBar recipes={all} authoredLabel={authored?.label} onAsk={onAsk} onRecipe={onRecipe} />
    </>
  )
}
