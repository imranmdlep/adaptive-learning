import { useState } from 'react'
import type { Mode } from '../capture'
import { ask } from '../content'

/* The one input, always in the same place.
 *
 * This replaces the format menu, and the replacement is the point. A menu made
 * someone choose pointers, questions or a conversation before they had said
 * anything at all, which is teaching before attempting and is the wrong way
 * round. Here they write the actual thing that is happening, and the format is
 * either decided for them or reached for afterwards.
 *
 * AUTO IS THE DEFAULT, and it is doing the adaptive work: what someone typed
 * plus how long they have decides what comes back. The recipes above are the
 * override, for the times a person already knows what they want. Which one
 * people use, and whether Auto's pick beats their own, is the finding this
 * whole build exists to get. */
export default function AskBar({
  recipes,
  authoredLabel,
  onAsk,
  onRecipe,
  inline = false,
}: {
  recipes: { mode: Mode; label: string }[]
  /* the one with a trainer's name on it, marked so it reads as authored */
  authoredLabel?: string
  onAsk: (text: string, mode: Mode | 'auto') => void
  /* opens the sheet showing who wrote a recipe and what it actually does */
  onRecipe: (label: string) => void
  /* Home pins this to the bottom; the practice page sits it in the flow. */
  inline?: boolean
}) {
  const [text, setText] = useState('')
  const [mode, setMode] = useState<Mode | 'auto'>('auto')

  function submit() {
    const t = text.trim()
    if (!t) return
    onAsk(t, mode)
    setText('')
  }

  const chips = recipes.length > 0
    ? (
      <div className="recipes" role="group" aria-label={ask.recipesLabel}>
        {recipes.map((r) => (
          <span key={r.label} className="recipe-wrap">
            <button
              type="button"
              className={`recipe${mode === r.mode ? ' recipe-on' : ''}${
                r.label === authoredLabel ? ' recipe-authored' : ''
              }`}
              aria-pressed={mode === r.mode}
              onClick={() => setMode((m) => (m === r.mode ? 'auto' : r.mode))}
            >
              {r.label}
            </button>
            {/* Every recipe can be opened rather than only run, because a
                prompt somebody wrote should be readable before it is used. */}
            <button
              type="button"
              className="recipe-open"
              aria-label={`${ask.about} ${r.label}`}
              onClick={() => onRecipe(r.label)}
            >
              {'i'}
            </button>
          </span>
        ))}
      </div>
    )
    : null

  const box = (
    <div className="ask">
      <label className="visually-hidden" htmlFor="ask">{ask.placeholder}</label>
      <textarea
        id="ask"
        className="ask-input"
        rows={1}
        value={text}
        placeholder={ask.placeholder}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            submit()
          }
        }}
      />
      {/* Says what is deciding. Auto until somebody says otherwise, and it names
          itself rather than being invisible machinery. */}
      <span className="ask-mode">
        {mode === 'auto' ? ask.auto : recipes.find((r) => r.mode === mode)?.label}
      </span>
      <button
        className="ask-send"
        type="button"
        disabled={!text.trim()}
        aria-label={ask.send}
        onClick={submit}
      >
        {'\u2191'}
      </button>
    </div>
  )

  /* Pinned to the bottom of a page the chips sit above the box, because that is
     the direction the eye already travels to reach it. On the front door the
     box is the first thing and everything else stays quiet underneath. */
  return (
    <div className={inline ? 'askbar askbar-inline' : 'askbar'}>
      {inline ? <>{box}{chips}</> : <>{chips}{box}</>}
    </div>
  )
}
