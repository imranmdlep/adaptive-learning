import { useEffect, useState } from 'react'
import type { Entry, Mode, Past, Plan, Turn } from './capture'
import {
  addPlan,
  clearOpen,
  getOpen,
  getPast,
  getPlans,
  getWho,
  rememberPast,
  send,
  startEntry,
  updateOpen,
} from './capture'
import { Wordmark } from './brand'
import { app, rail } from './content'
import { pickModule } from './modules'
import type { Session } from './session'
import { getSession } from './session'
import RecipeSheet from './parts/RecipeSheet'
import Alone from './screens/Alone'
import Home from './screens/Home'
import Landed from './screens/Landed'
import Work from './screens/Work'

/* Two pages in the rail, and everything else is a thread.
 *
 *   Home       her week: the session coming up, and her own record below it
 *   Practice   a greeting, one input, what she was last in, the recipes
 *
 * Writing a sentence in either bar opens a thread. There is no format menu and
 * no situation picker: what she typed decides which situation this is, and Auto
 * decides the format unless she reached for a recipe. Making somebody choose a
 * format before they have said anything is teaching before attempting, which is
 * the wrong way round.
 *
 * A thread ends with one go at it alone, which is the only signal here that
 * separates learning from copying. Then it lands in her record. */
type Screen = { kind: 'page' } | { kind: 'work' } | { kind: 'alone' } | { kind: 'landed' }

export default function App() {
  const [who] = useState(getWho)
  const [open, setOpen] = useState<Entry | null>(getOpen)
  const [past, setPast] = useState<Past[]>(getPast)
  /* What she said she would do, which is what the top of the page is for. */
  const [plans, setPlans] = useState<Plan[]>(getPlans)
  const [screen, setScreen] = useState<Screen>(() => (getOpen() ? { kind: 'work' } : { kind: 'page' }))
  const [sheet, setSheet] = useState<string | null>(null)
  const [dark, setDark] = useState<boolean | null>(null)
  /* Lepaya scheduled the session, so Lepaya knows when it is. Reading it rather
   * than asking is the whole of what makes the first screen adaptive. */
  const [session] = useState<Session | null>(getSession)

  useEffect(() => {
    if (dark === null) return
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
  }, [dark])

  /* One sentence is the whole entry point. The situation is resolved from what
   * she wrote rather than chosen from a list, and `auto` means the format was
   * decided for her rather than reached for. */
  function onAsk(text: string, mode: Mode | 'auto') {
    const moduleId = pickModule(text)
    const wanted: Mode = mode === 'auto' ? 'conversation' : mode
    const entry = startEntry(who, moduleId, text, {
      minutes: 'some',
      wanted,
      auto: mode === 'auto',
    })
    setOpen(entry)
    void send('asked', entry)
    setScreen({ kind: 'work' })
  }

  /* What Auto actually opened, which is not necessarily what was asked for.
   * Recorded separately from `wanted` on purpose: the difference between the
   * two is the experiment. */
  function onMode(used: Mode) {
    const next = updateOpen({ used })
    setOpen(next)
    if (next) void send('mode', next)
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
    setScreen({ kind: 'page' })
  }

  function renderPage() {
    return (
      <Home
        session={session}
        plans={plans}
        past={past}
        onAsk={onAsk}
        onOpen={() => setScreen({ kind: 'page' })}
        onRecipe={setSheet}
      />
    )
  }

  function content() {
    if (screen.kind === 'landed') {
      return <Landed onAnother={goHome} />
    }

    if (screen.kind === 'work' || screen.kind === 'alone') {
      /* Without an open thread there is nothing to show, so fall back to her own
         page rather than rendering an empty conversation. */
      if (!open || !open.used) return renderPage()
      if (screen.kind === 'alone') {
        return (
          <Alone
            working={open.working ?? ''}
            onNext={(line, day, time) => {
              /* The plan is what makes the top of the page worth opening, so it
                 is written before the thread closes, never after. */
              const at = new Date(`${day}T${time}`).toISOString()
              addPlan(open.working ?? '', day, time, at)
              setPlans(getPlans())
              finish({ unassisted: line, when: at })
            }}
            onSkip={() => finish({ unassistedSkipped: true })}
          />
        )
      }
      return (
        <Work
          moduleId={open.moduleId}
          mode={open.used}
          auto={open.auto ?? false}
          past={past.length}
          working={open.working ?? ''}
          turns={open.turns ?? []}
          onTurns={onTurns}
          onDone={onDone}
          onBack={goHome}
          onMode={onMode}
        />
      )
    }

    return renderPage()
  }

  return (
    <div className="app">
      <nav className="rail" aria-label={app.name}>
        <span className="rail-brand"><Wordmark /></span>
        <ul className="rail-list">
          <li>
            <button
              type="button"
              className={`rail-item${screen.kind === 'page' ? ' rail-on' : ''}`}
              aria-current={screen.kind === 'page' ? 'page' : undefined}
              onClick={goHome}
            >
              {rail.home}
            </button>
          </li>
        </ul>
        <div className="rail-foot">
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
      </nav>

      {/* Home and Practice bring their own scrolling column plus a pinned bar.
          A thread is one column, so it gets the container here rather than
          rendering straight into the shell, which is what made it full bleed. */}
      <main className="main">
        {screen.kind === 'page' ? content() : <div className="stream">{content()}</div>}
      </main>

      {sheet && <RecipeSheet label={sheet} session={session} onClose={() => setSheet(null)} />}
    </div>
  )
}
