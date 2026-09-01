/* The only place the API key exists.
 *
 * Runs as a Vercel Serverless Function on the Node runtime. The browser posts
 * the conversation here; this proxies it to Anthropic and streams the reply
 * back. ANTHROPIC_API_KEY is a Vercel environment variable and is never sent to
 * the client.
 *
 * Node rather than Edge, and not by preference: the Anthropic SDK imports
 * node:fs and node:path, which the Edge runtime refuses to bundle. That also
 * fixes the handler shape, since Node expects (req, res) and rejects a
 * web-standard Request handler at invocation time.
 *
 * This endpoint is reachable by anyone who has the URL, so it caps what a
 * single request can cost. The caps are a blast radius, not a security
 * boundary: the real backstop is a spend limit set on the key itself. */

import Anthropic from '@anthropic-ai/sdk'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { checkKey } from './_auth.js'
/* The module content is shared with the client, so it lives in src and is
 * imported here rather than duplicated. Relative imports inside api/ need the
 * .js extension or Node's ESM loader rejects them at module load. */
import { moduleById } from '../src/modules.js'

/* Sized for the job: one person working through one task at work. */
const MAX_MESSAGES = 40
const MAX_CHARS_PER_MESSAGE = 20_000
const MAX_CHARS_TOTAL = 120_000
const MAX_WORKING_CHARS = 500

/* What the helper is for. Deliberately short: it is here to help someone do a
 * real task at work, not to run a lesson.
 *
 * The formatting paragraph is doing real work. Work.tsx renders replies as plain
 * text node with `white-space: pre-wrap` and no markdown parser, so asterisks
 * and hashes would appear on screen as themselves. The em-dash line is the
 * standing copy rule: Claude's replies are the highest-volume copy in this app,
 * so the rule has to be enforced here rather than in content.ts. */
const SYSTEM = `You are helping a colleague at Lepaya with a real conversation they have to have at work.

They picked a situation they recognise from their own week. Work on that situation with them.

Skip preamble. Do not restate their question back to them. Skip caveats unless they change what the person should do.

Talk about what they would actually say and do. Never explain the theory, never name a model, never mention Lepaya, a course, a module or a skill name. If they ask what a model is called, answer plainly and go back to their situation.

Never tell someone how they are doing overall, never rate them, and never give a score. Anything you say about quality is about the specific thing they just wrote, not about them.

The screen renders your reply as plain text with no markdown parser. Write prose. No bold, no headings, no bullet characters, no tables. If you need a list, put each item on its own line.

Never use em dashes. Use a comma, a colon or a full stop.

If they ask you something you cannot verify, say so plainly rather than guessing.`

/* The three ways of working, which is where the formats actually differ. The
 * screen changes a heading; this changes what comes back.
 *
 * Restraint about what the ASSISTANT produces is supported by the research we
 * checked. Restraint about what the LEARNER is asked to produce is not, so
 * every mode below still asks the person to do the thinking. */
const MODES: Record<string, string> = {
  conversation: `They want to talk this through.

Do not hand them the answer. Ask one question at a time and wait for their reply before the next one. When they have worked something out, say so plainly and move on.

If they ask you to just tell them, give them the smallest thing that unblocks them and put the next question back to them.

Keep your turns shorter than theirs.`,

  quiz: `They want to check what they remember.

Ask one question at a time about handling this situation. Wait for their answer before the next one. Never list several questions at once.

They answer in their own words, so accept an answer that is right in substance and worded differently from how you would put it.

After each answer, say what was right in it and what was missing, about THAT ANSWER only. No score, no running tally, nothing about how they are doing.

Four or five questions is a full round. At the end, say in one line what held up and what is worth another look.`,

  pointers: `They want the short version, and they are probably about to walk into the real thing.

Give them a handful of specific pointers for this exact situation. Each one on its own line, each one something they could actually say or do.

No preamble, no theory, no explaining why the pointers are the pointers. Do not ask them a question at the end.

Stop when you have given the pointers. If they come back with something else, answer that.`,
}

/* What Auto is choosing between, in the words it decides on. Kept next to the
 * modes it maps to so the two cannot drift apart. */
const CHOOSING = `pointers: they are about to walk into it and need specific things to say. Short notice, practical, no discussion wanted.
quiz: they want to check what they retained. They are not in a hurry and there is no specific conversation imminent.
conversation: they want to work something through, or the situation has any complexity, feeling or history in it.`

/* Auto: pick the format from what they actually wrote.
 *
 * A separate, small, fast call rather than letting the main reply decide,
 * because the choice has to be known BEFORE the answer starts streaming: it
 * selects the instructions, and it is recorded as `used` so it can be compared
 * against what people pick for themselves.
 *
 * A strict TOOL, never output_config json_schema. Measured on Opus 5, the
 * json_schema path degenerates roughly one call in four and stop_reason cannot
 * detect it; the tool path did not fail once in sixteen.
 *
 * Haiku because this is a three way classification on one sentence, and a
 * second of latency in front of every first reply is worse than a rare wrong
 * pick that the person can override with a recipe. */
async function chooseMode(client: Anthropic, working: string, said: string): Promise<Mode> {
  try {
    const res = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      tool_choice: { type: 'tool', name: 'choose' },
      tools: [{
        name: 'choose',
        description: 'Choose how to help this person right now.',
        input_schema: {
          type: 'object',
          properties: {
            mode: { type: 'string', enum: ['pointers', 'quiz', 'conversation'] },
          },
          required: ['mode'],
        },
      }],
      system:
        `Someone at work wrote the line below about a conversation they have to have. Choose how to help them right now.\n\n${CHOOSING}\n\nWhen it is genuinely unclear, choose conversation.`,
      messages: [{ role: 'user', content: `${working}\n\n${said}`.slice(0, 2000) }],
    })
    const block = res.content.find((c) => c.type === 'tool_use')
    const picked = block && 'input' in block ? (block.input as { mode?: string }).mode : undefined
    return picked === 'pointers' || picked === 'quiz' ? picked : 'conversation'
  } catch {
    /* A classifier that fails must not take the reply down with it. The
     * fallback is the format that is wrong least often. */
    return 'conversation'
  }
}

type Mode = 'pointers' | 'quiz' | 'conversation'

type Turn = { role: 'user' | 'assistant'; content: string }

function tooBig(messages: Turn[]): string | null {
  if (messages.length > MAX_MESSAGES) return 'This conversation is full. Press Done to save it, then work on something else.'
  if (messages.some((m) => m.content.length > MAX_CHARS_PER_MESSAGE)) {
    return 'That message is too long to send. Try a shorter one.'
  }
  const total = messages.reduce((n, m) => n + m.content.length, 0)
  if (total > MAX_CHARS_TOTAL) return 'This conversation is full. Press Done to save it, then work on something else.'
  return null
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).send('Method not allowed')
    return
  }

  const gate = checkKey(req.headers['x-app-key'])
  if (!gate.ok) {
    res.status(gate.status).send(gate.message)
    return
  }

  /* Vercel parses a JSON body for us, but a string body arrives on some
   * content types, so handle both rather than trusting one. */
  let body: {
    working?: string
    messages?: Turn[]
    moduleId?: string
    mode?: string
  }
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body ?? {})
  } catch {
    res.status(400).send('Bad request')
    return
  }

  const messages = (body.messages ?? [])
    .filter((m) => m?.content?.trim())
    .filter((m) => m.role === 'user' || m.role === 'assistant')
  if (messages.length === 0) {
    res.status(400).send('No messages')
    return
  }

  const oversized = tooBig(messages)
  if (oversized) {
    res.status(413).send(oversized)
    return
  }

  /* What they said they were working on rides in the system prompt rather than
   * as a first user turn, so it stays in view for the whole conversation and
   * does not read as something they typed. Truncated because it is one line by
   * design, and it is caller-controlled text entering the system prompt. */
  const working = (body.working ?? '').slice(0, MAX_WORKING_CHARS).trim()
  /* The optional context answer rides the same way, and with the same cap
   * logic: caller-controlled text entering the system prompt, so truncated. */
  /* Looked up in fixed tables, never interpolated, so caller text cannot reach
   * the system prompt through them. Only `working` does, and it is capped. */
  const mod = typeof body.moduleId === 'string' ? moduleById(body.moduleId) : undefined

  const client = new Anthropic()

  /* Auto only decides on the opening turn. After that the thread has a shape
   * and switching it mid conversation would be disorienting. */
  let chosen: Mode | undefined
  if (body.mode === 'auto' && messages.length === 1) {
    chosen = await chooseMode(client, working, messages[0]?.content ?? '')
  } else if (typeof body.mode === 'string' && body.mode in MODES) {
    chosen = body.mode as Mode
  }

  const mode = chosen ? MODES[chosen] ?? '' : ''

  const system = [
    SYSTEM,
    mod ? `The situation they picked: ${mod.title}` : '',
    mod ? `What good looks like here, which is yours to work from and never to recite:\n\n${mod.substance}` : '',
    working ? `Their own words about their case: ${working}` : '',
    mode,
  ].filter(Boolean).join('\n\n')

  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  /* What Auto picked, so the browser can record what actually opened rather
   * than what was asked for. Set before any body is written, because after the
   * stream starts no header can be sent. */
  if (chosen) res.setHeader('x-mode', chosen)

  try {
    const stream = client.messages.stream({
      model: 'claude-opus-5',
      /* Well under the 64k streaming default on purpose: short answers are the
       * point here, and on Opus 5 this cap covers thinking and reply together. */
      max_tokens: 16000,
      output_config: { effort: 'medium' },
      system,
      messages,
    })

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        res.write(event.delta.text)
      }
    }

    const final = await stream.finalMessage()
    if (final.stop_reason === 'refusal') {
      res.write('\n\nI did not answer that one. Try asking a different way.')
    }
    res.end()
  } catch (err) {
    console.error('[chat] stream failed', err)
    /* If nothing has been written yet the status is still ours to set. Once
     * the stream has started it is not, and the marker in the body is the only
     * channel left; Work.tsx strips it and treats it as a failure rather than
     * recording it as something Claude said. */
    if (res.headersSent) {
      res.write(' STREAM_FAILED')
      res.end()
    } else {
      res.status(502).send('That did not come back. Send it again.')
    }
  }
}
