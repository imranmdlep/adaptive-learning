import { useState } from 'react'
import type { Mode, Past } from '../capture'
import type { Session } from '../session'
import { home, practice, recipes } from '../content'
import { moduleById } from '../modules'
import { SKILL_ICON, SKILL_ORDER } from '../skills'
import { SKILLS } from '../taxonomy'
import AskBar from '../parts/AskBar'
import Record from '../parts/Record'
import SessionCard from '../parts/SessionCard'

/* One page.
 *
 * Practice used to be its own page in a rail, which made two things out of one
 * and put a second input on screen that looked identical to this one and did
 * something different. Everything a person can do now lives in one column, in
 * the order they would reach for it:
 *
 *   the box        say what is on your plate, and get helped
 *   pursue         pick a skill instead, if that is the way in
 *   not sure       the way in for somebody who cannot name it, which is most
 *   practice       run it, with the other side played straight, and the room
 *   record         what they have already worked on
 *
 * The session sits inside practice rather than at the top, because the room is
 * the same act with a real person in it. Opening the page on the booked event
 * makes this a runbook for one afternoon, which is what the current product
 * already is. */
export default function Home({
  session,
  past,
  onAsk,
  onRehearse,
  onOpen,
  onRecipe,
}: {
  session: Session | null
  past: Past[]
  onAsk: (text: string, mode: Mode | 'auto') => void
  onRehearse: (setup: string) => void
  onOpen: (id: string) => void
  onRecipe: (label: string) => void
}) {
  const [setup, setSetup] = useState('')

  /* Which skills her own threads have touched, derived rather than stored, so
     nothing has to be kept in sync and nothing accumulates into a profile. */
  const pursuing = new Set(past.flatMap((p) => moduleById(p.moduleId)?.skills ?? []))

  return (
    <div className="stream stream-center">
      <h1 className="greet">{home.head}</h1>

      <AskBar recipes={recipes} onAsk={onAsk} onRecipe={onRecipe} inline />

      <section className="block">
        <h2 className="block-sub">{home.skills}</h2>
        <div className="skills">
          {SKILL_ORDER.map((id) => {
            const Icon = SKILL_ICON[id]
            return (
              <button
                key={id}
                type="button"
                className={`skill${pursuing.has(id) ? ' skill-on' : ''}`}
                /* Tapping a skill is the same act as writing a sentence: it
                   opens a thread, with Auto choosing the format. */
                onClick={() => onAsk(SKILLS[id].name, 'auto')}
              >
                <Icon size={18} stroke={1.6} aria-hidden />
                <span>{SKILLS[id].name}</span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="block">
        <h2 className="block-sub">{home.unsure}</h2>
        {/* Most people cannot name what they are after cold, which is why
            asking them to is a bad front door and why this is a conversation
            rather than a box. */}
        <button type="button" className="recipe" onClick={() => onAsk(home.unsureAsk, 'conversation')}>
          {home.unsureCta}
        </button>
      </section>

      {/* Practice, embedded. Everything above is talking about the conversation.
          This is running it, and the other side does not help. */}
      <section className="block block-practice">
        <h2 className="block-head">{practice.head}</h2>
        <p className="lead">{practice.help}</p>

        <div className="setup">
          <label className="field-label" htmlFor="setup">{practice.who}</label>
          <textarea
            id="setup"
            className="area"
            rows={3}
            value={setup}
            placeholder={practice.whoPlaceholder}
            onChange={(e) => setSetup(e.target.value)}
          />
          <div className="actions">
            <button
              className="btn btn-lg btn-primary"
              type="button"
              disabled={!setup.trim()}
              onClick={() => onRehearse(setup.trim())}
            >
              {practice.start}
            </button>
          </div>
        </div>

        {/* The room, and the only navy panel in the app. Same act, real person,
            and the reason the rehearsal above is worth running first. */}
        {session && <SessionCard session={session} />}
      </section>

      {past.length > 0 && (
        <section className="block">
          <h2 className="block-sub">{home.recordHead}</h2>
          <Record past={past} onOpen={onOpen} />
        </section>
      )}
    </div>
  )
}
