import { useEffect, useRef, useState } from 'react'
import { Asterisk } from '../brand'
import type { Mode, Turn } from '../capture'
import { getKey } from '../capture'
import { moduleById } from '../modules'
import { modes, work } from '../content'

/* Appended by api/chat.ts when the stream breaks after it has already started.
 * At that point the HTTP status has been sent, so the body is the only channel
 * left to signal failure. */
const FAILED_MARKER = ' STREAM_FAILED'

/* The middle of the app: they do their real task here, with Claude in the page.
 *
 * The reply streams in as plain text from /api/chat rather than as JSON events,
 * because the only thing this screen needs is the text. The transcript is
 * lifted to the parent after every exchange so a closed tab loses nothing. */
export default function Work({
  moduleId,
  mode,
  auto,
  past,
  working,
  turns,
  onTurns,
  outbox,
  onBusy,
  onEnd,
  onMode,
}: {
  /* the situation resolved from what they wrote, never shown as a skill */
  moduleId: string
  mode: Mode
  /* whether the format was chosen for them, which the header says out loud */
  auto: boolean
  /* how many threads are behind this one, for the coverage line */
  past: number
  /* their own words, which is the thread's title */
  working: string
  turns: Turn[]
  onTurns: (t: Turn[]) => void
  /* Bumped by the shell each time the docked bar sends. The thread owns the
   * streaming, the bar owns the typing, and neither draws the other's chrome. */
  outbox: { text: string; n: number }
  /* The bar has no send button to disable, so it is told when a reply is on
   * its way and says so itself. */
  onBusy: (b: boolean) => void
  /* Offered inside the conversation once there is one, never as a button in
   * the chrome. Ending a thread is a thing she decides, not a control. */
  onEnd: () => void
  /* told what Auto actually chose, once the server has chosen it */
  onMode: (m: Mode) => void
}) {
  const copy = modes[mode]
  const mod = moduleById(moduleId)
  const [streaming, setStreaming] = useState('')
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  const [noKey, setNoKey] = useState(false)
  /* The server already words its own refusals for a person, and it is the only
   * side that knows WHICH limit was hit. Echoing it beats a fixed client string
   * that told everyone their conversation was too long when the real cause was
   * one long paste, and then advised starting over, which loses the draft. */
  const [refused, setRefused] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [turns.length, streaming])

  /* Every send arrives the same way: the opening line the shell handed over,
   * and every line typed into the docked bar afterwards. The ref guard is
   * because React runs effects twice in development and a duplicated turn is
   * not recoverable. */
  const sent = useRef(0)
  useEffect(() => {
    if (outbox.n === sent.current || !outbox.text.trim()) return
    sent.current = outbox.n
    void send(outbox.text.trim())
  }, [outbox.n])

  async function send(given: string) {
    const text = given.trim()
    if (!text || busy) return

    const next: Turn[] = [...turns, { role: 'user', content: text }]
    onTurns(next)
    setBusy(true)
    onBusy(true)
    setFailed(false)
    setNoKey(false)
    setRefused('')
    setStreaming('')

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-app-key': getKey() },
        body: JSON.stringify({
          moduleId,
          mode: auto ? 'auto' : mode,
          working: working || undefined,
          messages: next,
        }),
      })
      /* What Auto picked, when it picked. The browser records what actually
         opened rather than what was asked for, which is the only check on a
         self-reported answer. */
      const picked = res.headers.get('x-mode')
      if (picked && picked !== mode) onMode(picked as Mode)

      if (res.status === 401) {
        setNoKey(true)
          onTurns(turns)
        return
      }
      if (!res.ok) {
        const said = (await res.text()).trim().slice(0, 200)
        setRefused(said || work.failed)
          onTurns(turns)
        return
      }
      if (!res.body) throw new Error('no body')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let acc = ''
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        acc += decoder.decode(value, { stream: true })
        setStreaming(acc.replace(FAILED_MARKER, ''))
      }

      /* The stream had already started when it broke, so the status code was
       * long gone and the server could only say so in the body. Never record
       * that marker as something Claude said. */
      if (acc.endsWith(FAILED_MARKER)) throw new Error('stream ended early')

      onTurns([...next, { role: 'assistant', content: acc }])
    } catch (err) {
      console.warn('[work] send failed', err)
      setFailed(true)
      onTurns(turns)
    } finally {
      setStreaming('')
      setBusy(false)
      onBusy(false)
    }
  }

  return (
    <section>
      <div className="thread-head">
        {/* Says which way of working this is, and whether it was chosen for
            them. Machinery that picks something should name itself. */}
        <p className="thread-mode">{copy.head}{auto ? work.autoTag : ''}</p>
        {/* Their own words are the title. Never ours summarising them back. */}
        <p className="recall-said">{working || mod?.title}</p>
        {/* What this is drawing on, and what it is not. Saying so is why it
            reads as knowing rather than guessing, and it is the same rule the
            research left us: show what a claim came from. */}
        <p className="coverage">{work.coverage(past)}</p>
      </div>

      <div className="thread">
        {turns.length === 0 && !busy && <p className="lead">{copy.empty}</p>}

        {turns.map((t, i) => {
          /* The first user turn is the line they wrote on the way in, and it is
             already the title above. Showing it again in a bubble says the same
             thing twice in two type styles. */
          if (i === 0 && t.role === 'user' && t.content === working.trim()) return null
          return (
            <div key={i} className={`turn turn-${t.role}`}>
              <div className="turn-who">{t.role === 'user' ? work.you : work.them}</div>
              <div className="turn-text">{t.content}</div>
            </div>
          )
        })}

        {busy && (
          <div className="turn turn-assistant">
            <div className="turn-who">{work.them}</div>
            <div className="turn-text">
              {streaming || (
                <span className="thinking">
                  <Asterisk size={14} />
                  <span className="thinking-label">{work.thinking}</span>
                </span>
              )}
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Once there has been a real exchange, the next useful thing is naming
          when she is actually having it. Offered as a line in the conversation
          rather than a button in the toolbar, because it is a step forward and
          not a way to dismiss something. */}
      {!busy && turns.filter((t) => t.role === 'assistant').length >= 1 && (
        <button type="button" className="thread-next" onClick={onEnd}>
          {work.plan}
        </button>
      )}

      {failed && <p className="field-note field-error">{work.failed}</p>}
      {refused && <p className="field-note field-error">{refused}</p>}
      {noKey && <p className="field-note field-error">{work.noKey}</p>}
    </section>
  )
}
