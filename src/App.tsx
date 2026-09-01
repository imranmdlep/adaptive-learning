import { useEffect, useState } from 'react'
import type { Entry, Minutes, Mode, Past, Turn } from './capture'
import {
  clearOpen,
  getOpen,
  getPast,
  getWho,
  rememberPast,
  send,
  setWho,
  startEntry,
  updateOpen,
} from './capture'
import { Wordmark } from './brand'
import { app } from './content'
import { moduleById } from './modules'
import Alone from './screens/Alone'
import Envelope from './screens/Envelope'
import Landed from './screens/Landed'
import Pick from './screens/Pick'
import Work from './screens/Work'

/* The whole flow, and it is deliberately short:
 *
 *   pick        a situation from your own week
 *   envelope    how long you have, what you want, optionally your own case
 *   work        that format, on that situation
 *   alone       one go with nothing helping
 *   landed      saved, come back any time
 *
 * There is no course, no lesson and no completion. Someone can arrive with
 * three minutes and leave having done something real with three minutes, which
 * is the thing the research says the weeks after a class actually need.
 *
 * WHAT THIS BUILD IS FOR. It is an instrument before it is a product: it
 * exists to find out which format fits which problem, and whether what people
 * ask for is what helps them. That is why nothing here is recommended or
 * preselected. */
type Screen =
  | { kind: 'pick' }
  | { kind: 'envelope'; moduleId: string }
  | { kind: 'work' }
  | { kind: 'alone' }
  | { kind: 'landed' }

export default function App() {
  const [who, setWhoState] = useState(getWho)
  const [open, setOpen] = useState<Entry | null>(getOpen)
  const [past, setPast] = useState<Past[]>(getPast)
  const [dark, setDark] = useState<boolean | null>(null)
  /* A session left open resumes where it was, so closing a tab mid-conversation
   * costs nobody their thread. */
  const [screen, setScreen] = useState<Screen>(() => (getOpen() ? { kind: 'work' } : { kind: 'pick' }))

  useEffect(() => {
    if (dark === null) return
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
  }, [dark])

  function onPicked(name: string, moduleId: string) {
    setWho(name)
    setWhoState(name)
    /* Recorded before the envelope, so a situation someone opened and then
     * backed out of still tells us they opened it. Which situations get looked
     * at and abandoned is worth as much as which get finished. */
    void send('picked', { who: name, moduleId })
    setScreen({ kind: 'envelope', moduleId })
  }

  function onEnvelope(moduleId: string, minutes: Minutes, wanted: Mode, working: string) {
    const entry = startEntry(who, moduleId, working, { minutes, wanted })
    setOpen(entry)
    /* The declared answer on its own, so what someone asked for survives even
     * if they never send a single turn. */
    void send('envelope', entry)
    setScreen({ kind: 'work' })
  }

  /* Persisted after every exchange rather than at the end, so a closed tab or a
   * flat battery still leaves the conversation up to that point. */
  function onTurns(turns: Turn[]) {
    const next = updateOpen({ turns, lastAt: new Date().toISOString() })
    setOpen(next)
    if (next && turns.at(-1)?.role === 'assistant') void send('turn', next)
  }

  function onDone() {
    const next = updateOpen({ ending: 'finished' })
    setOpen(next)
    if (next) void send('finished', next)
    setScreen({ kind: 'alone' })
  }

  function finish(patch: Partial<Entry>) {
    const next = updateOpen({ ...patch, closedAt: new Date().toISOString() })
    if (next) {
      void send('closed', next)
      rememberPast(next)
      setPast(getPast())
    }
    clearOpen()
    setOpen(null)
    setScreen({ kind: 'landed' })
  }

  function screenContent() {
    if (screen.kind === 'pick') {
      return <Pick who={who} past={past} onNext={onPicked} />
    }
    if (screen.kind === 'envelope') {
      const mod = moduleById(screen.moduleId)
      if (!mod) return <Pick who={who} past={past} onNext={onPicked} />
      return (
        <Envelope
          module={mod}
          onNext={(minutes, wanted, working) => onEnvelope(mod.id, minutes, wanted, working)}
        />
      )
    }
    if (screen.kind === 'landed') {
      return <Landed onAnother={() => setScreen({ kind: 'pick' })} />
    }

    /* work and alone both need the open session; without one there is nothing
     * to show, so fall back to the front door rather than rendering empty. */
    const mod = open ? moduleById(open.moduleId) : undefined
    if (!open || !mod || !open.used || !open.minutes) {
      return <Pick who={who} past={past} onNext={onPicked} />
    }

    if (screen.kind === 'alone') {
      return (
        <Alone
          module={mod}
          onNext={(text) => finish({ unassisted: text })}
          onSkip={() => finish({ unassistedSkipped: true })}
        />
      )
    }

    return (
      <Work
        module={mod}
        mode={open.used}
        minutes={open.minutes}
        working={open.working}
        turns={open.turns ?? []}
        onTurns={onTurns}
        onDone={onDone}
      />
    )
  }

  return (
    <div className="app">
      <header className="topbar">
        <span className="brand"><Wordmark /></span>
        <div className="topbar-right">
          {who && <span className="whoami">{who}</span>}
          <button
            className="icon-btn"
            type="button"
            aria-label={app.theme}
            onClick={() =>
              setDark((d) =>
                d === null ? !window.matchMedia('(prefers-color-scheme: dark)').matches : !d
              )}
          >
            ◐
          </button>
        </div>
      </header>

      <main className="main">{screenContent()}</main>

      <footer className="footnote">{app.pilot}</footer>
    </div>
  )
}
