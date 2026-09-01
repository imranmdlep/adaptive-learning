/* Where everything lands.
 *
 * Posts to our own /api/log, which writes to storage. The browser only ever
 * talks to our own origin, so the storage credential stays on the server.
 *
 * Every send is mirrored to localStorage BEFORE the network call. Someone on
 * office wifi will hit a failed request at some point, and a lost record is the
 * one thing this app cannot recover from: it is the whole point of building it.
 *
 * WHAT THIS FILE IS FOR, because it is easy to lose. This prototype exists to
 * find out which format fits which learning problem. Every field below earns
 * its place by answering one of four questions:
 *
 *   Q1  Where in the journey does the problem occur?
 *   Q2  What is the problem at that moment?
 *   Q3  Which interaction format is the right response?
 *   Q4  How should those interactions be sequenced?
 *
 * A field that answers none of them does not belong here. */

const LOCAL_KEY = 'al.log'
const WHO_KEY = 'al.who'
const KEY_KEY = 'al.key'
const OPEN_KEY = 'al.open'
const DONE_KEY = 'al.done'
const PLANS_KEY = 'al.plans'

export type Turn = { role: 'user' | 'assistant'; content: string }

/* The envelope: what the person tells us before anything opens.
 *
 * Declared, never inferred. How long someone has and what they want right now
 * is the half of the signal only they can give us.
 *
 * On willingness, which was named as a fourth thing to capture: it is expressed
 * here as the FORMAT someone reaches for, not as a rating. A number attached to
 * a person is the line we do not cross. A choice they made is a fact about the
 * work, and reaching for pointers over a conversation says the same thing a
 * willingness score would, without asking anyone to grade themselves. */
export type Minutes = 'few' | 'some' | 'proper'
export type Mode = 'conversation' | 'quiz' | 'pointers'

export type Entry = {
  id: string
  who: string
  /* The situation, when one was resolved from what they wrote. Absent when
   * nothing in the library fits, which is itself worth knowing. */
  moduleId: string
  /* Their own words about the real instance of it, when they gave any. */
  working?: string
  /* ---- the envelope, declared ------------------------------------------- */
  minutes?: Minutes
  wanted?: Mode
  /* What actually opened. Held apart from `wanted` deliberately: the difference
   * between the two is the only check we have on a self-reported answer, and
   * fusing them would destroy it before anyone had looked. Q3. */
  used?: Mode
  /* Whether Auto picked the format or she reached for a recipe. The comparison
   * between the two is the whole experiment, so it cannot be inferred later. */
  auto?: boolean
  /* ---- observed ---------------------------------------------------------- */
  turns?: Turn[]
  /* Whether they reached the end of the interaction or left partway. Q2, Q3. */
  ending?: 'finished' | 'left'
  /* The unassisted beat: one short go with nothing helping. The only signal
   * here that separates learning from copying, which is why it is not
   * optional. */
  unassisted?: string
  unassistedSkipped?: boolean
  /* When they said they would actually have it. A date on its own did nothing
   * in the research; a date AND a time worked. So both, or neither. */
  when?: string
  startedAt: string
  /* Touched on every exchange. */
  lastAt?: string
  closedAt?: string
}

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) as T : fallback
  } catch {
    return fallback
  }
}

function writeLocal(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* private mode, quota, whatever. The network copy is the real one. */
  }
}

/* ---- who ---------------------------------------------------------------- */

export function getWho(): string {
  const q = new URLSearchParams(window.location.search).get('who')
  if (q) {
    writeLocal(WHO_KEY, q)
    return q
  }
  return readLocal<string>(WHO_KEY, '')
}

export function setWho(name: string) {
  writeLocal(WHO_KEY, name)
}

/* The shared access code, carried in each person's link as ?k= and remembered
 * after the first visit so a bookmark without it still works. */
export function getKey(): string {
  const q = new URLSearchParams(window.location.search).get('k')
  if (q) {
    writeLocal(KEY_KEY, q)
    return q
  }
  return readLocal<string>(KEY_KEY, '')
}

/* ---- the open session ---------------------------------------------------- */

export function getOpen(): Entry | null {
  return readLocal<Entry | null>(OPEN_KEY, null)
}

export function clearOpen() {
  writeLocal(OPEN_KEY, null)
}

export type Envelope = { minutes: Minutes; wanted: Mode; auto: boolean }

export function startEntry(who: string, moduleId: string, working: string, env: Envelope): Entry {
  const entry: Entry = {
    id: uid(),
    who,
    moduleId,
    working: working || undefined,
    minutes: env.minutes,
    wanted: env.wanted,
    used: env.wanted,
    auto: env.auto,
    startedAt: new Date().toISOString(),
  }
  writeLocal(OPEN_KEY, entry)
  return entry
}

export function updateOpen(patch: Partial<Entry>): Entry | null {
  const current = getOpen()
  if (!current) return null
  const next = { ...current, ...patch }
  writeLocal(OPEN_KEY, next)
  return next
}

/* ---- what someone has already done, so a second visit can be sequenced ---- */

/* Q4 lives here. Which situations someone has been through, in order, with
 * which format each time. Kept as a list rather than a count: the ORDER is the
 * thing worth knowing, and a count throws it away. */
export type Past = {
  id: string
  /* her own words about what she brought, which is what the row shows */
  working: string
  moduleId: string
  used: Mode
  at: string
}

export function getPast(): Past[] {
  return readLocal<Past[]>(DONE_KEY, [])
}

export function rememberPast(entry: Entry) {
  if (!entry.used) return
  const past = getPast()
  past.push({
    id: entry.id,
    working: entry.working ?? '',
    moduleId: entry.moduleId,
    used: entry.used,
    at: new Date().toISOString(),
  })
  writeLocal(DONE_KEY, past)
}

/* ---- what she said she would do -------------------------------------------
 *
 * The one mechanic the research is clearest about. Self written plans changed
 * nothing. Prescriptive ones worked. Asking for a date changed nothing; asking
 * for a date AND a time worked. So a plan here is always a specific
 * conversation, with a day and a time on it, and never a goal.
 *
 * It is also what makes the top of the page worth opening: a person is looking
 * at the thing they are about to have to do, in their own words. */
export type Plan = {
  id: string
  /* their own words about the conversation */
  what: string
  /* the day, as they picked it */
  day: string
  time: string
  /* sortable, so the list is in the order the week happens */
  at: string
  madeAt: string
}

export function getPlans(): Plan[] {
  const now = Date.now()
  /* Anything whose moment has passed drops off on read. A list that keeps
     showing yesterday's conversation turns into a pile of things you failed to
     do, which is the opposite of what this is for. */
  return readLocal<Plan[]>(PLANS_KEY, []).filter((p) => Date.parse(p.at) > now - 86_400_000)
}

export function addPlan(what: string, day: string, time: string, at: string): Plan {
  const plan: Plan = { id: uid(), what, day, time, at, madeAt: new Date().toISOString() }
  const plans = getPlans()
  plans.push(plan)
  plans.sort((a, b) => a.at.localeCompare(b.at))
  writeLocal(PLANS_KEY, plans)
  return plan
}

export function dropPlan(id: string) {
  writeLocal(PLANS_KEY, getPlans().filter((p) => p.id !== id))
}

/* ---- sending ------------------------------------------------------------- */

export async function send(kind: string, entry: Partial<Entry> & Record<string, unknown>) {
  const record = { kind, at: new Date().toISOString(), ...entry }

  /* Local copy first, always. */
  const log = readLocal<unknown[]>(LOCAL_KEY, [])
  log.push(record)
  writeLocal(LOCAL_KEY, log)

  try {
    await fetch('/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-app-key': getKey() },
      body: JSON.stringify(record),
    })
  } catch {
    /* The local mirror already has it. */
  }
}

export function localLog(): unknown[] {
  return readLocal<unknown[]>(LOCAL_KEY, [])
}
