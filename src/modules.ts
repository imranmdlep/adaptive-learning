/* One topic, a few modules, which is what the first internal test needs.
 *
 * TOPIC: Feedback and coaching. Leslie's content strategy deck (Aug 2026) names
 * it as a capability cluster and describes it as the behaviours managers use
 * most often and practise least. It is also the pilot Kasia named. Nothing was
 * invented here.
 *
 * WHAT A MODULE IS ON SCREEN. A situation somebody recognises from their own
 * week, never a skill name and never a course name. Showing a learner "Giving
 * feedback: 2 trainings" is the catalogue-as-front-door pattern that the
 * phase-1 interviews name as the problem. The skill binding underneath is
 * plumbing, so the record can join to assessment and content later.
 *
 * WHY BIND TO SKILLS AND NOT MODULE NAMES. The content strategy retires 35
 * modules in Q3 2026 and replaces 32 more through 2027, while the skill layer
 * is anchored to WEF and ESCO. Leslie's own comment: the module counts "keep
 * changing anyway".
 *
 * WHERE THE CONTENT COMES FROM. Read across Drive on 2026-08-24. Two named
 * models are current and are used here as written:
 *   SBI (Situation, Behavior, Impact), the feedback prebite, LXD, May 2025.
 *   Consideration and Commitment, Difficult Client Conversations, v1.0
 *   updated Jan 2026.
 * The BIO model (2018) and the 5-step model (a 2024 experiment) are lineage,
 * not current practice, so neither appears here.
 *
 * The pattern that held across all four eras of this curriculum, even as the
 * branding changed, is the one every module below is built on: separate the
 * observable behaviour from your interpretation of it, state the effect, then
 * propose or co-develop the next step. */

import type { SkillId } from './taxonomy'

export const TOPIC = 'Feedback and coaching' as const

export type ModuleId =
  | 'missing-the-mark'
  | 'wont-want-to-hear'
  | 'got-heated'
  | 'five-minutes'
  | 'jumped-to-solving'

export type Module = {
  id: ModuleId
  /* what the person reads: their situation, in their words, not ours */
  title: string
  /* one line, so the list can be scanned without opening anything */
  blurb: string
  /* Never rendered. The join to assessment and content later. */
  skills: SkillId[]
  /* What this module actually teaches, for the assistant to work from. Written
   * as behaviours a person could carry out, not as theory to be recalled. */
  substance: string
}

export const MODULES: Module[] = [
  {
    id: 'missing-the-mark',
    title: 'Their work keeps missing what you asked for',
    blurb: 'The same thing, more than once.',
    skills: ['giving-feedback'],
    substance: `Separate what was observable from your interpretation of it. "The last three drafts came back without the pricing section" is observable. "You are not taking this seriously" is an interpretation, and it is the thing that starts an argument.

Then state the effect it had, on the work or on you, in one sentence. Not the effect in general, the effect this time.

Then stop and let them respond before proposing anything. The step people skip is the pause.

The current model in the curriculum is Situation, Behavior, Impact: where and when it happened, what they actually did, what followed from it.`,
  },
  {
    id: 'wont-want-to-hear',
    title: 'You have to say something they will not want to hear',
    blurb: 'A decision, a no, or news that lands badly.',
    skills: ['difficult-conversations', 'managing-emotions'],
    substance: `Deliver the message first and plainly. Softening it into a preamble means they spend the conversation working out what you are actually saying.

Then express consideration, which is not an apology and not a justification. It is showing you understand what this costs them.

Then understand why it lands the way it does, by asking rather than assuming, before any solution is on the table.

Then co-develop what happens next, so the next step is theirs as well as yours. Follow up proactively afterwards rather than waiting to be chased.

That sequence is the Consideration and Commitment model, which is current in the difficult conversations course.`,
  },
  {
    id: 'got-heated',
    title: 'A conversation got heated and you have to go back to it',
    blurb: 'Something was said, and it has been sitting there since.',
    skills: ['managing-emotions', 'difficult-conversations'],
    substance: `Name what happened without relitigating who was right. The purpose of reopening it is the working relationship, not the verdict.

Say what you noticed in yourself, which is the part that lowers the temperature. Describing their state back to them raises it.

Ask what it looked like from where they were sitting, and let the answer be different from yours without correcting it.

Agree one specific thing about how the next one goes. Something that could actually be done differently, not a general commitment to communicate better.`,
  },
  {
    id: 'five-minutes',
    title: 'Your point has to land with someone who has five minutes',
    blurb: 'A decision-maker, a corridor, a meeting already running late.',
    skills: ['structured-communication'],
    substance: `Lead with the conclusion. The build-up that makes sense when you write it is the thing that loses the room when you say it.

Then the two or three reasons it holds, in the order that matters to them and not the order you discovered them.

Then what you need from them, stated as a decision they can actually make in the time available.

Detail comes on request. Offering it unasked reads as not being sure.`,
  },
  {
    id: 'jumped-to-solving',
    title: 'They brought you a problem and you jumped to solving it',
    blurb: 'When what they wanted was to think out loud.',
    skills: ['active-listening', 'asking-questions'],
    substance: `Find out what they came for before answering. Sometimes it is a decision, sometimes it is a sounding board, and the two need opposite things from you.

Ask open questions that move it forward rather than questions that confirm what you already think. "What have you tried?" opens. "Have you tried X?" closes.

Say back what you understood, in your words, and let them correct it. Being corrected here is the point.

Silence after a question is working. Filling it is the habit to break.`,
  },
]

export function moduleById(id: string): Module | undefined {
  return MODULES.find((m) => m.id === id)
}

/* Which situation somebody is in, worked out from the sentence they wrote
 * rather than chosen from a list.
 *
 * Deliberately crude: word overlap, first match wins, and a default when
 * nothing hits. A better resolver is a model call, and that is worth doing once
 * we know people write sentences worth resolving. Getting this wrong is cheap,
 * because the assistant reads their actual words too and the situation only
 * sets which substance it works from. */
const CUES: Record<ModuleId, string[]> = {
  'missing-the-mark': ['again', 'still', 'keeps', 'same mistake', 'sloppy', 'late', 'quality', 'missed'],
  'wont-want-to-hear': ['no', 'reject', 'turn down', 'bad news', 'decline', 'cut', 'push back', 'deadline'],
  'got-heated': ['heated', 'argument', 'row', 'snapped', 'awkward', 'tense', 'upset', 'angry'],
  'five-minutes': ['pitch', 'present', 'exec', 'board', 'five minutes', 'quick', 'stakeholder', 'decision'],
  'jumped-to-solving': ['listen', 'vent', 'advice', 'solve', 'jumped in', 'sounding board', 'coach'],
}

export function pickModule(text: string): ModuleId {
  const t = text.toLowerCase()
  for (const m of MODULES) {
    if (CUES[m.id].some((c) => t.includes(c))) return m.id
  }
  /* Nothing matched. The most common conversation people bring is the one they
   * have been avoiding, so that is the honest default. */
  return 'wont-want-to-hear'
}
