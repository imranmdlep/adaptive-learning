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
  onAsk,
  busy = false,
  docked = false,
}: {
  onAsk: (text: string, mode: Mode | 'auto') => void
  /* A reply is coming. There is no send button to disable, so the row itself
   * says what is happening rather than going quiet. */
  busy?: boolean
  /* Inside the dock the surrounding card already provides the chrome, so the
   * bar drops its own border and background and becomes just the row. */
  docked?: boolean
}) {
  const [text, setText] = useState('')

  function submit() {
    const t = text.trim()
    if (!t) return
    onAsk(t, 'auto')
    setText('')
  }

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
      {busy && <span className="ask-busy">{ask.working}</span>}
    </div>
  )

  /* Pinned to the bottom of a page the chips sit above the box, because that is
     the direction the eye already travels to reach it. On the front door the
     box is the first thing and everything else stays quiet underneath. */
  return (
    <div className={docked ? 'askbar askbar-docked' : 'askbar'}>
      {box}
      {/* Under the box, where somebody looks when they are deciding whether to
          trust what came back. Says it plainly once rather than hedging inside
          every reply. */}
      <p className="ask-note">{ask.note}</p>
    </div>
  )
}
