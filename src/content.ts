/* Every string a person reads, except the assistant's replies. Those are the
 * highest-volume text here, and the rules for them are enforced in the system
 * prompt in api/chat.ts instead.
 *
 * COPY RULES IN FORCE. No em dashes anywhere. Nothing is called proof, evidence
 * or a gap. Nobody is described as weak at anything: someone picking a
 * situation is telling us what they are going after, not admitting a deficit.
 * Nothing is marked complete, because nothing here is completable. The product
 * name in the interface is Lepaya, with no sub-label. */

export const app = {
  name: 'Lepaya',
  /* Says what this is without claiming it is finished. */
  pilot: 'An early build. What you do here shapes what gets made.',
  theme: 'Switch theme',
  back: 'Back',
}

/* The landing, in both states.
 *
 * She lands on HER, with the session in it. The other way round, where the
 * session frames everything and the app is its runbook, is what the product
 * already is and what the phase-1 interviews name as the problem.
 *
 * The session panel is the human moment made visible. If the trainer is the
 * premium, the room is the best thing that happens here and it should read
 * that way, not as a date in a list. */
export const home = {
  /* with a session coming */
  soonHead: (day: string) => `Before ${day}`,
  soonHelp: 'Anything here is worth doing on its own. None of it is homework.',
  todayHead: 'Before you go in',
  todayHelp: 'Ten minutes now is worth more than an hour last week.',
  /* the ordinary week, which is most weeks */
  openHead: 'What is coming up for you?',
  openHelp: 'Pick what fits the time you actually have.',
  sessionEyebrow: 'Your session',
  sessionWith: 'with',
  /* the quiet list of what she has already done */
  beenHead: 'What you have worked on',
}

/* The offers. Each one is a format with an honest time on it.
 *
 * This is the envelope, asked without a form. Tapping "Two minutes, pointers"
 * declares both the time available and the format wanted in one move, which is
 * the same signal a two question screen collected and one fewer thing standing
 * between someone and the thing they came for.
 *
 * Neither is recommended and the order never changes, because which one people
 * reach for is the finding. */
export const offers = [
  {
    mode: 'pointers' as const,
    minutes: 'few' as const,
    time: 'Two minutes',
    title: 'Pointers for something specific',
    blurb: 'For right before you walk into it.',
  },
  {
    mode: 'quiz' as const,
    minutes: 'some' as const,
    time: 'Ten minutes',
    title: 'Check what you remember',
    blurb: 'Questions one at a time, answered in your own words.',
  },
  {
    mode: 'conversation' as const,
    minutes: 'proper' as const,
    time: 'Twenty minutes',
    title: 'Talk a real one through',
    blurb: 'A conversation you have coming up, worked through properly.',
  },
]

export const pick = {
  ask: 'Which conversation?',
  help: 'The one closest to something real.',
  nameLabel: 'First name',
  namePlaceholder: 'Alex',
  again: 'You can come back to any of these.',
}

/* The envelope: two questions between picking a situation and starting.
 *
 * Neither is preselected and neither is recommended. A default would answer the
 * question this whole build exists to ask, which is which format people reach
 * for and whether it is the one that helps. */
export const envelope = {
  ask: 'How long have you got?',
  help: 'Two quick things, then we start.',
  timeLabel: 'Time',
  timeOptions: [
    { id: 'few', text: 'A few minutes' },
    { id: 'some', text: 'Fifteen or so' },
    { id: 'proper', text: 'A proper sitting' },
  ],
  wantLabel: 'What would help right now?',
  wantOptions: [
    { id: 'conversation', text: 'Talk it through' },
    { id: 'quiz', text: 'Check what I remember' },
    { id: 'pointers', text: 'Just the pointers' },
  ],
  detailLabel: 'Anything specific about yours?',
  detailPlaceholder: 'The timeline pushback with my stakeholder on Thursday',
  detailHelp: 'Optional. It makes everything after this about your situation instead of a general one.',
  commit: 'Start',
  note: 'You can pick something different next time.',
}

export const work = {
  send: 'Send',
  thinking: 'Working',
  done: 'Done',
  failed: 'That reply did not finish. Send again.',
  noKey: 'Open the full link you were sent.',
  you: 'You',
  them: 'Lepaya',
}

/* One surface, three ways of working in it. The heading and the opening line
 * say which one you are in; the rest of the difference is in what comes back.
 *
 * Deliberately not three separate screens yet. Which of these earns its own
 * surface is a thing to learn from use, and building three now would decide it
 * before anyone had chosen anything. */
export const modes = {
  conversation: {
    head: 'Talking it through',
    placeholder: 'Say what happened, or what you are about to walk into',
    empty: 'Tell me where you are with it.',
  },
  quiz: {
    head: 'What you remember',
    placeholder: 'Your answer',
    empty: 'One question at a time, answered in your own words.',
  },
  pointers: {
    head: 'Pointers',
    placeholder: 'Ask for anything else you need',
    empty: 'A few things worth having in mind, coming up.',
  },
}

/* The unassisted beat.
 *
 * This is the one screen that exists for a reason the learner does not share.
 * In the strongest study we found, people using a plain assistant did well
 * while they had it and worse than people who never had it once it was taken
 * away, because they were copying. Without one go at it alone, nothing else
 * captured here can tell learning from copying.
 *
 * So it is framed as the useful thing it also genuinely is: writing the actual
 * line you are going to say. Nothing scores it and nothing is fed back. */
export const alone = {
  ask: 'Your turn, on your own.',
  help: 'Write the opening line you would actually say. No help on this one.',
  placeholder: 'What you would say first',
  commit: 'Save it',
  skip: 'Skip this',
  note: 'Nothing marks this. It is yours.',
}

export const landed = {
  head: 'Saved.',
  line: 'Come back to this link any time.',
  again: 'Pick something else',
}
