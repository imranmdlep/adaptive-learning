import {
  IconEar,
  IconHelpCircle,
  IconListTree,
  IconMessages,
  IconUsers,
  IconWaveSine,
} from '@tabler/icons-react'
import type { SkillId } from './taxonomy'

/* A mark per skill, from Tabler.
 *
 * Tabler because it is what Lepaya already uses: the live Portal (`flower`),
 * `monorepo/apps/client-platform`, the styled-system and both companion
 * prototypes all pull @tabler/icons-react. Hand drawing six of our own would
 * have been a private icon set nobody else could extend.
 *
 * Each mark is about the ACT, never about the person doing it. Nothing here is
 * a badge, a level or a score, and none of them should be readable as one.
 * Moods and faces are deliberately avoided: an expression on a chip turns a
 * thing someone is pursuing into a comment on how they are doing. */
export const SKILL_ICON: Record<SkillId, typeof IconMessages> = {
  /* something said, and something coming back */
  'giving-feedback': IconMessages,
  /* the point first, then what holds it up */
  'structured-communication': IconListTree,
  /* turned toward what is being said */
  'active-listening': IconEar,
  /* the mark itself, opening rather than closing */
  'asking-questions': IconHelpCircle,
  /* steady, with the temperature coming down */
  'managing-emotions': IconWaveSine,
  /* two people, and the thing between them */
  'difficult-conversations': IconUsers,
}

/* The order they appear in. Fixed, and never reordered by what is popular or by
 * what someone has already done: which one people reach for first is a finding
 * we would destroy by sorting the list for them. */
export const SKILL_ORDER: SkillId[] = [
  'giving-feedback',
  'difficult-conversations',
  'active-listening',
  'asking-questions',
  'structured-communication',
  'managing-emotions',
]
