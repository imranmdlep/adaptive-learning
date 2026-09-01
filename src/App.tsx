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
import type { Session } from './session'
import { getSession } from './session'
import Alone from './screens/Alone'
import Home from './screens/Home'
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
  | { kind: 'home' }
  /* She has already said what she wants and how long she has, by tapping an
   * offer. Those ride on the screen until there is an entry to write them to. */
  | { kind: 'pick'; mode: Mode; minutes: Minutes }
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
  const [screen, setScreen] = useState<Screen>(() => (getOpen() ? { kind: 'work' } : { kind: 'home' }))
  /* Lepaya scheduled the session, so Lepaya knows when it is. Reading it here
   * rather than asking is the whole of what makes the first screen adaptive. */
  const [session] = useState<Session | null>(getSession)

  useEffect(() => {
    if (dark === null) return
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
  }, [dark])

  /* Tapping an offer declares the format and the time in one move. Recorded
   * here, before she has picked a conversation, so somebody who taps an offer
   * and then backs out still tells us what they reached for. */
  function onOffer(name: string, mode: Mode, minutes: Minutes) {
    setWho(name)
    setWhoState(name)
    void send('offer', { who: name, wanted: mode, minutes, hasSession: !!session })
    setScreen({ kind: 'pick', mode, minutes })
  }

  function onPicked(mode: Mode, minutes: Minutes, moduleId: string, working: string) {
    const entry = startEntry(who, moduleId, working, { minutes, wanted: mode })
    setOpen(entry)
    void send('started', entry)
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

  function goHome() {
    setScreen({ kind: 'home' })
  }

  function screenContent() {
    if (screen.kind === 'home') {
      return <Home who={who} session={session} past={past} onOffer={onOffer} />
    }
    if (screen.kind === 'pick') {
      const { mode, minutes } = screen
      return (
        <Pick
          onNext={(moduleId, working) => onPicked(mode, minutes, moduleId, working)}
          onBack={goHome}
        />
      )
    }
    if (screen.kind === 'landed') {
      return <Landed onAnother={goHome} />
    }

    /* work and alone both need the open session; without one there is nothing
     * to show, so fall back to the front door rather than rendering empty. */
    const mod = open ? moduleById(open.moduleId) : undefined
    if (!open || !mod || !open.used || !open.minutes) {
      return <Home who={who} session={session} past={past} onOffer={onOffer} />
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
