/* The session Maria has coming up, or does not.
 *
 * This is what makes the app adaptive without asking anybody anything. Lepaya
 * scheduled the session, so Lepaya knows when it is and who is running it.
 * Putting that at the top costs nothing and is the difference between a place
 * that knows where you are and a form that asks you to supply the context.
 *
 * In the real product this comes from the platform. Here it reads from the link
 * so both states can be looked at:
 *
 *   ?session=soon    a session in a few days
 *   ?session=today   the day of
 *   (nothing)        no session, which is most weeks
 *
 * Everyone named here is invented. No real trainer's name goes on behaviour
 * they did not do. */

export type Session = {
  /* Split rather than one string, because the row shows the date as a date. */
  dayNum: string
  month: string
  day: string
  time: string
  topic: string
  trainer: string
  /* what makes it worth turning up to, in one line */
  shape: string
  today: boolean
}

const SOON: Session = {
  dayNum: '3',
  month: 'September',
  day: 'Thu',
  time: '14:00',
  topic: 'Giving feedback',
  trainer: 'Noor',
  shape: 'A room, a trainer, and someone to practise the hard part on.',
  today: false,
}

const TODAY: Session = { ...SOON, dayNum: '1', day: 'Tue', today: true }

export function getSession(): Session | null {
  const q = new URLSearchParams(window.location.search).get('session')
  if (q === 'soon') return SOON
  if (q === 'today') return TODAY
  return null
}
