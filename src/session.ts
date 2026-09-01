/* The session Maria has coming up, or does not.
 *
 * This is the thing that makes the app adaptive without asking anybody
 * anything. Lepaya already knows when someone's session is and who is running
 * it, because Lepaya scheduled it. Putting that on the first screen costs
 * nothing and is the difference between a place that knows where you are and a
 * form that asks you to supply the context.
 *
 * In the real product this comes from the platform. Here it is read from the
 * link so both states can be looked at:
 *
 *   ?session=soon    a session in the next few days
 *   ?session=today   the day of
 *   (nothing)        no session, which is most weeks
 *
 * Everyone named here is invented. No real trainer's name goes on behaviour
 * they did not do. */

export type Session = {
  /* how it reads on screen, already resolved, because a date needs saying the
     way a person would say it rather than formatting on the fly */
  when: string
  /* Just the day, for the heading above the offers. Held separately rather than
     parsed back out of `when`, because a date needs saying the way a person
     would say it and that is not something to reconstruct. */
  day: string
  topic: string
  trainer: string
  /* the thing that makes it worth turning up to, in one line */
  shape: string
  today: boolean
}

const SOON: Session = {
  when: 'Thursday, 2pm',
  day: 'Thursday',
  topic: 'Giving feedback',
  trainer: 'Noor',
  shape: 'A room, a trainer, and someone to practise the hard part on.',
  today: false,
}

const TODAY: Session = {
  when: 'Today, 2pm',
  day: 'today',
  topic: 'Giving feedback',
  trainer: 'Noor',
  shape: 'A room, a trainer, and someone to practise the hard part on.',
  today: true,
}

export function getSession(): Session | null {
  const q = new URLSearchParams(window.location.search).get('session')
  if (q === 'soon') return SOON
  if (q === 'today') return TODAY
  return null
}
