import { useEffect, useRef, useState } from 'react'
import { Asterisk } from '../brand'
import type { Minutes, Mode, Turn } from '../capture'
import { getKey } from '../capture'
import type { Module } from '../modules'
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
  module: mod,
  mode,
  minutes,
  working,
  turns,
  onTurns,
  onDone,
}: {
  /* the situation they picked, which is what the assistant works from */
  module: Module
  /* which of the three ways of working this is */
  mode: Mode
  /* what they said they had time for, which sets how long a reply runs */
  minutes: Minutes
  /* their own line about their instance of it, when they gave one */
  working?: string
  turns: Turn[]
  onTurns: (t: Turn[]) => void
  onDone: () => void
}) {
  const copy = modes[mode]
  const [draft, setDraft] = useState('')
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

  async function send() {
    const text = draft.trim()
    if (!text || busy) return

    const next: Turn[] = [...turns, { role: 'user', content: text }]
    onTurns(next)
    setDraft('')
    setBusy(true)
    setFailed(false)
    setNoKey(false)
    setRefused('')
    setStreaming('')

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-app-key': getKey() },
        body: JSON.stringify({
          moduleId: mod.id,
          mode,
          minutes,
          working: working || undefined,
          messages: next,
        }),
      })
      if (res.status === 401) {
        setNoKey(true)
        setDraft(text)
        onTurns(turns)
        return
      }
      if (!res.ok) {
        const said = (await res.text()).trim().slice(0, 200)
        setRefused(said || work.failed)
        setDraft(text)
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
      /* drop the user turn back into the box so nothing they typed is lost */
      setDraft(text)
      onTurns(turns)
    } finally {
      setStreaming('')
      setBusy(false)
    }
  }

  return (
    <section>
      <div className="recall">
        <div className="eyebrow">{copy.head}</div>
        {/* Their situation, and their own line about it when they gave one.
            Their words, never ours summarising them back. */}
        <p className="recall-said">{working || mod.title}</p>
      </div>

      <div className="thread">
        {turns.length === 0 && !busy && <p className="lead">{copy.empty}</p>}

        {turns.map((t, i) => (
          <div key={i} className={`turn turn-${t.role}`}>
            <div className="turn-who">{t.role === 'user' ? work.you : work.them}</div>
            <div className="turn-text">{t.content}</div>
          </div>
        ))}

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

      {failed && <p className="field-note field-error">{work.failed}</p>}
      {refused && <p className="field-note field-error">{refused}</p>}
      {noKey && <p className="field-note field-error">{work.noKey}</p>}

      <div className="field">
        <label className="visually-hidden" htmlFor="draft">{copy.placeholder}</label>
        <textarea
          id="draft"
          className="area"
          rows={3}
          value={draft}
          placeholder={copy.placeholder}
          disabled={busy}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault()
              void send()
            }
          }}
        />
      </div>

      <div className="actions">
        <button
          className="btn btn-lg btn-primary"
          type="button"
          disabled={!draft.trim() || busy}
          onClick={() => void send()}
        >
          {work.send}
        </button>
        {turns.length > 0 && !busy && (
          <button className="btn btn-subtle" type="button" onClick={onDone}>
            {work.done}
          </button>
        )}
      </div>
    </section>
  )
}
