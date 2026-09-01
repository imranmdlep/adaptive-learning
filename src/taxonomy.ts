/* The binding between what someone does here and Lepaya's real skill vocabulary.
 *
 * PROVENANCE, because the last time we needed a skill name we invented one
 * ("Saying no without losing the relationship") and it turned out to be three
 * real skills that already existed:
 *
 *   Cluster        Leslie's Content Strategy deck (Aug 2026), Decision 2:
 *                  "7 capability clusters as top-level structure".
 *   Skill names    Lepaya Skills Taxonomy sheet, Taxonomy tab, skills column
 *                  of the rows whose capability cluster is Feedback & coaching.
 *   Definitions    Skill library tab, copied verbatim.
 *
 * NOTHING IN THIS FILE IS EVER RENDERED TO A LEARNER. Resolving a module to a
 * skill is plumbing: it lets the record join to assessment, content and
 * reporting later. The learner sees a situation they recognise. */

export const CLUSTER = 'Feedback & coaching' as const

export type SkillId =
  | 'giving-feedback'
  | 'structured-communication'
  | 'active-listening'
  | 'asking-questions'
  | 'managing-emotions'
  | 'difficult-conversations'

export type Skill = {
  id: SkillId
  name: string
  /** verbatim from the Skill library tab */
  definition: string
}

export const SKILLS: Record<SkillId, Skill> = {
  'giving-feedback': {
    id: 'giving-feedback',
    name: 'Giving feedback',
    definition: 'Offering clear, constructive feedback that helps others improve.',
  },
  'structured-communication': {
    id: 'structured-communication',
    name: 'Structured communication',
    definition:
      'Organising a message logically (e.g. the Pyramid Principle) so it is clear and easy to follow.',
  },
  'active-listening': {
    id: 'active-listening',
    name: 'Active listening',
    definition:
      'Fully concentrating on, understanding and responding to a speaker to build shared understanding.',
  },
  'asking-questions': {
    id: 'asking-questions',
    name: 'Asking questions',
    definition: 'Using effective, open questions to explore, understand and move a conversation forward.',
  },
  'managing-emotions': {
    id: 'managing-emotions',
    name: 'Managing emotions',
    definition: 'Recognising and regulating emotions in oneself and others.',
  },
  'difficult-conversations': {
    id: 'difficult-conversations',
    name: 'Difficult conversations',
    definition:
      'Delivering sensitive or challenging messages with care while protecting the relationship.',
  },
}
