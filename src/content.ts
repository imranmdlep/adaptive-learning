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
  narrow: 'Narrow the sidebar',
  widen: 'Widen the sidebar',
  back: 'Back',
  close: 'Close',
  collapse: 'Fold this back down',
  expand: 'Make this taller',
  shrink: 'Make this smaller',
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
/* HOME IS HERS.
 *
 * Not the session, and not a schedule. Opening on the booked event makes this a
 * runbook for one afternoon, which is what the current product already is and
 * what the phase-1 interviews name as the problem. The thing that earns a
 * return visit is a place that serves what someone is actually going after.
 *
 * So Home is a library she picks from, and the room lives on Practice. */
/* The top of the page. What she is about to have to do, in her own words. */
export const coming = {
  head: 'Coming up',
  empty: 'Nothing planned yet. Whatever you work on below ends up here.',
  with: 'with',
  runIt: 'Run it through',
  howDidItGo: 'How did it go?',
}

export const home = {
  head: 'What is on your plate?',
  sessionHead: 'Your session',
  skills: 'Or pick something to pursue',
  unsure: 'Not sure yet',
  unsureCta: 'Help me work out what to focus on',
  /* Sent as the opening turn, so the thread starts as a conversation about
     them rather than as an empty box they have to fill. */
  unsureAsk:
    'I am not sure what I want to get better at. Help me work it out from what my week actually looks like.',
  /* The record. Her own trail, most recent first, and nothing else: no count,
     no streak, no progress. None of those are true of conversations that keep
     happening to a person. */
  recordHead: 'What you have worked on',
  /* The question after the fact, quoting their own words back. A generic "how
     did that go" has nothing to compare against; theirs does. This is the pair
     the whole follow-up rests on. */
  followUpAsk: (what: string) =>
    `I had the conversation I planned: ${what}. Ask me how it actually went, one thing at a time.`,
  recordEmpty: 'Whatever you work on shows up here.',
  /* Threads from before a skill could be resolved, so nothing is ever lost. */
  recordLoose: 'Everything else',
  today: 'Today',
  yesterday: 'Yesterday',
}

/* The session, which lives on Practice as something to look into. */
export const session = {
  with: 'with',
  more: 'What is in it',
  less: 'Close',
  inIt: 'What you will actually do',
  why: 'Why it is a room and not a video',
}

export const rail = {
  home: 'Home',
}

/* The second page. Home is where her week is; this is where she starts
 * something. */
export const chat = {
  greet: (who: string) => (who ? `Ready when you are, ${who}.` : 'Ready when you are.'),
  help: 'Write the conversation you are actually facing.',
  recents: 'Picking up where you left off',
  recipes: 'Ways to work on it',
  untitled: 'Untitled',
}

/* The ask bar, which is the only way in.
 *
 * A menu made someone choose a format before they had said anything, which is
 * teaching before attempting and is backwards. Here they write what is actually
 * happening, and the format is decided from that. */
export const ask = {
  placeholder: 'What is coming up?',
  send: 'Send',
  working: 'Working',
  recipesLabel: 'Ways to work on it',
  /* The product name in the interface is Lepaya, so the disclosure uses it too
     rather than saying "the AI", which would name a thing that is not here. */
  note: 'Lepaya uses AI and can get things wrong.',
  about: 'About',
}

/* The recipes: the same three formats, no longer a gate, plus the one that
 * matters commercially.
 *
 * Available on demand, never required. Auto picks unless somebody overrides it,
 * and whether Auto's pick beats the one people choose for themselves is the
 * finding. Order never changes and none is recommended.
 *
 * THE AUTHORED ONE. A recipe with a trainer's name on it is the human premium
 * packaged: it scales the person who ran the room into the weeks afterwards
 * without replacing them, and it gives the trainer surface something to be for,
 * which is authoring these. Everyone named is invented; no real trainer's name
 * goes on behaviour they did not do. */
export const recipes = [
  { mode: 'pointers' as const, label: 'Give me pointers' },
  { mode: 'quiz' as const, label: 'Check what I remember' },
  { mode: 'conversation' as const, label: 'Talk it through' },
]

/* Offered only when a trainer has actually run a session for this person, so
 * the name on it means something. */
export type Authored = { mode: 'conversation'; label: string; by: string; note: string }

export function authoredRecipe(trainer: string): Authored {
  return {
    mode: 'conversation',
    label: `Coach me like ${trainer}`,
    by: trainer,
    note: 'The way she pushed in the room, on whatever you bring.',
  }
}

/* The recipe sheet. */
export const sheet = {
  kind: 'Recipe',
  by: 'Recipe by',
  about: 'About',
  prompt: 'What it does',
  close: 'Close',
  collapse: 'Fold this back down',
  expand: 'Make this taller',
  shrink: 'Make this smaller',
}

/* What each recipe says about itself. The prompt shown here is the real one,
 * trimmed for reading; the full text lives in api/chat.ts, which is the only
 * place it can be enforced. Showing it is a trust move, and it is the same
 * craft rule the research left us: show what a claim came from. */
export function recipeDetail(label: string, trainer?: string) {
  if (trainer && label === `Coach me like ${trainer}`) {
    return {
      description:
        `The way ${trainer} pushes in the room, on whatever you bring. Built from the feedback and coaching curriculum she teaches, not from a general idea of coaching.`,
      about:
        `${trainer} runs the feedback and coaching sessions. She wrote this so the way she works keeps going after the room, and she is who you get if you book another session.`,
      prompt:
        'Work the way she does in the room.\n\nDo not hand them the answer. Ask one question at a time and wait.\n\nSeparate what was observable from their interpretation of it, and make them do that separation themselves.\n\nWhen they get somewhere, say so plainly and move on.\n\nKeep your turns shorter than theirs.',
    }
  }
  if (label === 'Give me pointers') {
    return {
      description: 'A handful of specific things to say or do, for right before you walk into it.',
      about: '',
      prompt:
        'Give a handful of specific pointers for this exact situation.\n\nEach one on its own line, each one something they could actually say.\n\nNo preamble, no theory. Do not ask a question at the end.',
    }
  }
  if (label === 'Check what I remember') {
    return {
      description: 'Questions one at a time, answered in your own words. Nothing scores you.',
      about: '',
      prompt:
        'Ask one question at a time about handling this situation, and wait for the answer.\n\nAccept an answer that is right in substance and worded differently.\n\nAfter each answer say what was right in it and what was missing, about THAT ANSWER only. No score, no tally, nothing about how they are doing.',
    }
  }
  return {
    description: 'A conversation you have coming up, worked through properly.',
    about: '',
    prompt:
      'Do not hand them the answer. Ask one question at a time and wait.\n\nIf they ask you to just tell them, give the smallest thing that unblocks them and put the next question back to them.\n\nKeep your turns shorter than theirs.',
  }
}

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
  back: 'Back',
  close: 'Close',
  collapse: 'Fold this back down',
  expand: 'Make this taller',
  shrink: 'Make this smaller',
  autoTag: ', chosen for you',
  /* What this thread is drawing on. An honest count, and it says nothing when
     there is nothing, rather than claiming context it does not have. */
  coverage: (past: number) =>
    past === 0
      ? 'Working from what you just wrote. Nothing else yet.'
      : past === 1
      ? 'Working from what you wrote, and the one conversation before this.'
      : `Working from what you wrote, and the ${past} conversations before this.`,
  send: 'Send',
  thinking: 'Working',
  done: 'Done',
  plan: 'Ready to say when you are having it',
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
    empty: '',
  },
  quiz: {
    head: 'What you remember',
    placeholder: 'Your answer',
    empty: '',
  },
  pointers: {
    head: 'Pointers',
    placeholder: 'Ask for anything else you need',
    empty: '',
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
  note: 'Nothing marks this. It is yours.',
  when: 'When are you having it?',
  time: 'What time?',
  /* Says why the time is being asked for, without lecturing. */
  timeNote: 'A day on its own tends to slide. A day and a time tends not to.',
  commit: 'That is the plan',
  skip: 'Not yet',
}

export const landed = {
  head: 'Saved.',
  line: 'Come back to this link any time.',
  again: 'Pick something else',
}
