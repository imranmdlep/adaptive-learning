/* Where what people write actually lands.
 *
 * The client used to post straight to a configurable URL, but that URL had to
 * be a VITE_ variable to reach the browser, which means it ships inside the
 * public bundle and anyone can read it out and spam whatever is on the other
 * end. So the sink lives here instead, behind the same shared code as the chat,
 * and the browser only ever talks to our own origin.
 *
 * One blob per entry, overwritten as the conversation grows, so the store holds
 * the current state of each session rather than an append-only pile of deltas
 * that someone would have to reassemble. */

import { put } from '@vercel/blob'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { checkKey, safeId } from './_auth.js'

const MAX_BODY_CHARS = 200_000
const MAX_TURNS = 80
const MAX_TURN_CHARS = 20_000
const MAX_FIELD_CHARS = 2_000

type Turn = { role: 'user' | 'assistant'; content: string }

/** Only these fields are stored. Everything else a caller sends is discarded. */
type Stored = {
  id: string
  who: string
  kind: string
  working: string
  turns: Turn[]
  outcome: string
  outcomeNote: string
  /* the two optional context answers, riding on every record */
  aboutWork: string
  aboutAi: string
  startedAt: string
  at: string
}

function str(v: unknown, max = MAX_FIELD_CHARS): string {
  return typeof v === 'string' ? v.slice(0, max) : ''
}

/* An allow-list, not a spread. Spreading the request body would store whatever
 * arbitrary keys and sizes a caller invented, in a blob we later render. */
function clean(body: Record<string, unknown>): Stored | null {
  const id = safeId(body.id)
  if (!id) return null

  const rawTurns = Array.isArray(body.turns) ? body.turns : []
  const turns: Turn[] = rawTurns
    .slice(0, MAX_TURNS)
    .filter((t): t is Record<string, unknown> => typeof t === 'object' && t !== null)
    .filter((t) => t.role === 'user' || t.role === 'assistant')
    .map((t) => ({ role: t.role as Turn['role'], content: str(t.content, MAX_TURN_CHARS) }))

  return {
    id,
    who: str(body.who, 60) || 'unknown',
    kind: str(body.kind, 40),
    working: str(body.working),
    turns,
    outcome: str(body.outcome, 40),
    outcomeNote: str(body.outcomeNote),
    aboutWork: str(body.aboutWork, 200),
    aboutAi: str(body.aboutAi, 40),
    startedAt: str(body.startedAt, 40),
    at: new Date().toISOString(),
  }
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

  let body: Record<string, unknown>
  try {
    const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? {})
    if (raw.length > MAX_BODY_CHARS) {
      res.status(413).send('Too large')
      return
    }
    body = JSON.parse(raw) as Record<string, unknown>
  } catch {
    res.status(400).send('Bad request')
    return
  }

  const entry = clean(body)
  if (!entry) {
    res.status(400).send('No usable id')
    return
  }

  /* No token means storage was never provisioned. Say so rather than failing
   * silently: an entry that vanished without anyone noticing is the one outcome
   * this whole thing cannot recover from. */
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.warn('[log] BLOB_READ_WRITE_TOKEN unset, entry not stored', entry.id)
    res.status(501).send('No store configured')
    return
  }

  try {
    /* Both halves of the path are sanitised. They are caller-supplied, and an
     * unsanitised id containing slashes or dot-segments would write outside the
     * entries/ prefix. */
    const who = safeId(entry.who) || 'unknown'
    await put(`entries/${who}--${entry.id}.json`, JSON.stringify(entry), {
      /* Private: these are people's real work conversations, so a blob must
       * require a token to read rather than being served to anyone holding a
       * guessable URL. api/entries.ts reads them back through the SDK. */
      access: 'private',
      contentType: 'application/json',
      addRandomSuffix: false,
      allowOverwrite: true,
    })
    res.status(204).end()
  } catch (err) {
    console.error('[log] store failed', err)
    res.status(500).send('Store failed')
  }
}
