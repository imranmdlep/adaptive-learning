import { useEffect, useState } from 'react'
import type { Entry, Mode, Past, Plan, Turn } from './capture'
import {
  addPlan,
  clearOpen,
  getOpen,
  getPast,
  getPlans,
  getRailOpen,
  getWho,
  rememberPast,
  send,
  setRailOpen_,
  startEntry,
  updateOpen,
} from './capture'
import {
  IconArrowsDiagonal,
  IconArrowsDiagonalMinimize2,
  IconChevronDown,
  IconHome,
  IconLayoutSidebar,
} from '@tabler/icons-react'
import { Asterisk, Wordmark } from './brand'
import { app, rail } from './content'
import { pickModule } from './modules'
import type { Session } from './session'
import { getSession } from './session'
import AskBar from './parts/AskBar'
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
/* Matches the fold animation in app.css. Kept here so the two cannot drift. */
const FOLD_MS = 180

type Screen = { kind: 'page' } | { kind: 'work' } | { kind: 'alone' } | { kind: 'landed' }

export default function App() {
  const [who] = useState(getWho)
  const [open, setOpen] = useState<Entry | null>(getOpen)
  const [past, setPast] = useState<Past[]>(getPast)
  /* What she said she would do, which is what the top of the page is for. */
  const [plans, setPlans] = useState<Plan[]>(getPlans)
  const [screen, setScreen] = useState<Screen>(() => (getOpen() ? { kind: 'work' } : { kind: 'page' }))
  const [sheet, setSheet] = useState<string | null>(null)
  /* What the docked bar has sent. The bar owns the typing, the thread owns the
   * streaming, and neither draws the other's chrome. */
  const [outbox, setOutbox] = useState({ text: '', n: 0 })
  /* A thread starts at the size of the bar it grew out of, and can be taken
   * full height when somebody wants to read rather than glance. */
  const [big, setBig] = useState(false)
  /* Kept mounted for the length of the fold so it can animate out. Without it
   * the element unmounts on the same frame the class is removed, so opening
   * eased and closing snapped, which is worse than neither. */
  const [folding, setFolding] = useState(false)
  const [busy, setBusy] = useState(false)
  /* Whether the rail is open. Remembered, because a person who narrows it wants
   * it narrow tomorrow as well, and re-collapsing it every visit is the kind of
   * small rudeness that adds up. */
  const [railOpen, setRailOpen] = useState(getRailOpen)

  useEffect(() => {
    setRailOpen_(railOpen)
  }, [railOpen])
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
  /* Typing into the bar continues the open thread, or starts one if there is
   * none. One input, and what it does depends only on where you already are. */
  function onBar(text: string, mode: Mode | 'auto') {
    if (screen.kind === 'work' && open) {
      setOutbox((o) => ({ text, n: o.n + 1 }))
      return
    }
    onAsk(text, mode)
  }

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
    setOutbox({ text, n: 0 })
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

  /* Fold the thread back into the bar, letting the animation finish first. */
  function fold() {
    if (folding) return
    setBig(false)
    setFolding(true)
    window.setTimeout(() => {
      setFolding(false)
      goHome()
    }, FOLD_MS)
  }

  function renderPage() {
    return (
      <Home
        session={session}
        plans={plans}
        past={past}
        onAsk={onAsk}
        onOpen={() => setScreen({ kind: 'page' })}
      />
    )
  }

  /* A thread opens OVER home, never instead of it.
   *
   * Replacing the page with a bare conversation flattens the hierarchy: home
   * disappears, every screen sits at the same level, and somebody who followed
   * one thought has lost the place they were standing. As a panel, the ground
   * stays visible behind it and closing is obviously a way back rather than a
   * navigation. */
  function panel() {
    if (screen.kind === 'landed') {
      return <Landed onAnother={goHome} />
    }

    if (screen.kind === 'work' || screen.kind === 'alone') {
      if (!open || !open.used) return null
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
          outbox={outbox}
          onBusy={setBusy}
          onEnd={onDone}
          onMode={onMode}
        />
      )
    }

    return null
  }

  return (
    <div className="app">
      <nav className={railOpen ? 'rail' : 'rail rail-narrow'} aria-label={app.name}>
        <div className="rail-top">
          <span className="rail-brand">
            {/* The full wordmark needs room. Narrow, the asterisk carries it,
                which is the same mark the brand already uses on its own. */}
            {railOpen ? <Wordmark /> : <Asterisk size={20} />}
          </span>
          <button
            type="button"
            className="icon-btn"
            aria-label={railOpen ? app.narrow : app.widen}
            aria-expanded={railOpen}
            onClick={() => setRailOpen((v) => !v)}
          >
            {/* One glyph for both directions. The panel either has a rail or
                it does not, and swapping the drawing on every press makes the
                control look like two different buttons in the same place. */}
            <IconLayoutSidebar size={18} stroke={1.6} aria-hidden />
          </button>
        </div>

        <ul className="rail-list">
          <li>
            <button
              type="button"
              className={`rail-item${screen.kind === 'page' ? ' rail-on' : ''}`}
              aria-current={screen.kind === 'page' ? 'page' : undefined}
              /* Narrow, the label is gone but the name still has to reach a
                 screen reader and a tooltip. */
              title={railOpen ? undefined : rail.home}
              aria-label={railOpen ? undefined : rail.home}
              onClick={goHome}
            >
              <IconHome size={18} stroke={1.6} aria-hidden />
              {railOpen && <span>{rail.home}</span>}
            </button>
          </li>
        </ul>

        <div className="rail-foot">
          {who && (
            <span className="whoami" title={railOpen ? undefined : who}>
              {railOpen ? who : who.slice(0, 1).toUpperCase()}
            </span>
          )}
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
        {renderPage()}

        {/* THE DOCK. The bar and the thread are one thing: the bar grows
            upward into the conversation and the input stays where it already
            was. It is not a dialog. There is no scrim, the page behind stays
            fully lit, and closing collapses it back to a bar rather than
            dismissing a window. */}
        <div
          className={`dock${screen.kind === 'page' ? '' : ' dock-open'}${big ? ' dock-big' : ''}${folding ? ' dock-folding' : ''}`}
        >
          {/* The body is always in the tree, even collapsed and empty. A grid row
              can only animate from 0fr if a 0fr frame was ever rendered, and
              mounting it already open gives the browser nothing to move from. */}
          {screen.kind !== 'page' && (
            <div className="dock-bar">
              <button
                type="button"
                className="icon-btn"
                aria-label={app.collapse}
                onClick={fold}
              >
                <IconChevronDown size={17} stroke={1.6} aria-hidden />
              </button>
              <button
                type="button"
                className="icon-btn"
                aria-label={big ? app.shrink : app.expand}
                onClick={() => setBig((v) => !v)}
              >
                {big
                  ? <IconArrowsDiagonalMinimize2 size={16} stroke={1.6} aria-hidden />
                  : <IconArrowsDiagonal size={16} stroke={1.6} aria-hidden />}
              </button>
            </div>
          )}
          <div className="dock-body">
            <div className="dock-scroll">{panel()}</div>
          </div>
          <AskBar onAsk={onBar} busy={busy} docked />
        </div>
      </main>

      {sheet && <RecipeSheet label={sheet} session={session} onClose={() => setSheet(null)} />}
    </div>
  )
}
