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
  /* What is actually in the room. Not an agenda: the things she will do. */
  inIt: string[]
  /* Why it is worth her afternoon, said in her terms rather than ours. */
  helps: string
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
  inIt: [
    'You bring a conversation you are actually dreading.',
    'You run it with an actor, who does not make it easy.',
    'Noor stops it where it goes wrong and you run that bit again.',
    'You leave with the opening line you are going to use.',
  ],
  helps:
    'The hard part of feedback is not knowing the model. It is the first ten seconds, out loud, with someone reacting. That is the part you cannot practise alone, and it is the whole reason this is a room and not a video.',
  today: false,
}

const TODAY: Session = { ...SOON, dayNum: '1', day: 'Tue', today: true }

export function getSession(): Session | null {
  const q = new URLSearchParams(window.location.search).get('session')
  if (q === 'soon') return SOON
  if (q === 'today') return TODAY
  return null
}
