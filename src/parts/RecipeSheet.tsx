import { useEffect, useRef } from 'react'
import type { Session } from '../session'
import { authoredRecipe, recipeDetail, sheet } from '../content'

/* What a recipe actually is, before you run it.
 *
 * Two things make this worth a screen rather than a tooltip. First, the prompt
 * is shown. A recipe is somebody's method turned into instructions, and a
 * person about to be coached by it should be able to read what it says. Second,
 * an authored recipe names its author and says how to reach the actual person,
 * which is the whole commercial shape: the method scales, the human is what is
 * being sold. */
export default function RecipeSheet({
  label,
  session,
  onClose,
}: {
  label: string
  session: Session | null
  onClose: () => void
}) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const authored = session ? authoredRecipe(session.trainer) : null
  const isAuthored = authored?.label === label
  const detail = recipeDetail(label, session?.trainer)

  /* Focus lands on the sheet, and escape closes it, because a panel that traps
     a keyboard user is worse than no panel. */
  useEffect(() => {
    closeRef.current?.focus()
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="scrim" onClick={onClose}>
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-bar">
          <span className="sheet-kind">{sheet.kind}</span>
          <button ref={closeRef} className="icon-btn" type="button" aria-label={sheet.close} onClick={onClose}>
            {'✕'}
          </button>
        </div>

        <div className="sheet-body">
          <div className="sheet-head">
            <h2 className="sheet-title">{label}</h2>
            {isAuthored && authored && (
              <span className="sheet-by">{sheet.by} {authored.by}</span>
            )}
          </div>

          <p className="sheet-desc">{detail.description}</p>

          {/* The author block. On an authored recipe the route back to the real
              person is the point, not an upsell bolted on the end. */}
          {isAuthored && authored && (
            <div className="sheet-about">
              <p className="sheet-about-head">{sheet.about} {authored.by}</p>
              <p>{detail.about}</p>
            </div>
          )}

          {/* The prompt, readable. Somebody about to be coached by a set of
              instructions is entitled to read the instructions. */}
          <div className="sheet-prompt">
            <p className="sheet-prompt-head">{sheet.prompt}</p>
            <pre className="sheet-prompt-body">{detail.prompt}</pre>
          </div>
        </div>
      </div>
    </div>
  )
}
