# Adaptive learning

A lightweight prototype for finding out which interaction format fits which
learning problem. Someone picks a situation from their own week, says how long
they have and what would help, and gets that. Then one short go at it alone.

Early build, made to learn from. Internal only.

## Why it is shaped this way

**It is an instrument before it is a product.** Nothing here is recommended,
preselected or ordered by popularity, because a default would answer the
question the build exists to ask. What people reach for, and whether it is what
helped, is the finding.

**The learner declares the envelope. The app decides the action inside it.**
How long you have and what you want is yours to say and nobody else can know
it. What specifically to do inside that is prescribed, because self-written
plans do nothing in the research and prescriptive ones work.

**Situations, never a catalogue.** Every row on the front door is something
someone recognises from their week. No skill names, no module names, no
progress. The skill binding in `src/taxonomy.ts` is plumbing so the record can
join to assessment later, and it is never rendered.

**One go with nothing helping.** People using a plain assistant score well
while they have it and worse than people who never had it once it is removed,
because they copy. Without `Alone`, nothing else captured here can tell
learning from copying.

## The flow

| | |
|---|---|
| **Pick** | A situation from your own week |
| **Envelope** | How long you have, what would help, optionally your own case |
| **Work** | That format, on that situation |
| **Alone** | Write the line you would actually say, unaided |
| **Saved** | Come back any time |

## The three formats

One surface, three ways of working in it. They differ in what comes back, set
in the system prompt in `api/chat.ts`, not in chrome.

- **Talk it through** withholds the answer and asks one question at a time
- **Check what I remember** asks one question at a time and says what was right
  in *that answer*, never how the person is doing
- **Just the pointers** gives a short list for the real situation and stops

Which of these earns its own screen is a thing to learn from use. Avatar is
deliberately absent: it is a delivery of the conversation format, so it is a
question about production cost, and it can wait until conversation earns its
place.

## What gets captured

Declared, from the envelope: time available, format wanted, their own line.
Observed: format actually opened, whether it matched what was wanted, whether
they reached the end or left partway, whether they came back, what they did
next, and the unassisted attempt.

`wanted` and `used` are stored separately on purpose. The difference between
them is the only check on a self-reported answer.

Records go to `/api/log`, mirrored to `localStorage` first. Moving this to
PostHog, and deciding whether free text ever leaves the browser, is a call to
settle with Dennis before anyone is recruited.

## The content

One topic: Feedback and coaching. Named as a capability cluster in the Aug 2026
content strategy and described there as the behaviours managers use most often
and practise least.

Two named models are current and are used as written: SBI (Situation,
Behavior, Impact) from the feedback prebite, and Consideration and Commitment
from Difficult Client Conversations v1.0. BIO (2018) and the 5-step model (a
2024 experiment) are lineage, not current practice, and do not appear.

## Running it

```sh
pnpm install
pnpm dev          # http://localhost:5183
pnpm check        # tsc + oxlint, the gate
```

`ANTHROPIC_API_KEY` must be set for the formats to return anything. With no
`APP_PASSCODE` the endpoints are open, so local development needs no other
setup.

## Things that will bite

**Node runtime, not Edge.** The Anthropic SDK imports `node:fs`, which Edge
refuses to bundle, so handlers take `(req, res)`.

**Relative imports in `api/` need the `.js` extension**, including
`../src/modules.js`. Node's ESM loader rejects them without it and every
request 500s at module load. `tsc` does not catch this.

**`tsconfig.json` includes `api` as well as `src`.** Without it the serverless
code is never typechecked.

**Copy lives in `src/content.ts`, except the assistant's replies.** Those are
the highest-volume text anyone reads here, and their rules are enforced in the
system prompt in `api/chat.ts`.
