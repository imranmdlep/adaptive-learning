/* Shared gate for the two write endpoints.
 *
 * It used to live twice, copied, and returned "allowed" whenever APP_PASSCODE
 * was unset so that local development needed no setup. That is fail-open: a
 * variable deleted or mistyped in the dashboard would have silently opened both
 * endpoints to anyone, with nothing in the response to say so.
 *
 * Now the convenience only applies off-platform. On Vercel a missing passcode
 * is a misconfiguration and the endpoint refuses to serve. */

export type Gate =
  | { ok: true }
  | { ok: false; status: 401 | 503; message: string }

export function checkKey(given: unknown): Gate {
  const expected = process.env.APP_PASSCODE

  if (!expected) {
    /* VERCEL is set on every deployment, so this branch is local only. */
    if (process.env.VERCEL) {
      console.error('[auth] APP_PASSCODE is not set on a deployed environment')
      return { ok: false, status: 503, message: 'This link is not set up yet. Nothing you did.' }
    }
    return { ok: true }
  }

  const key = typeof given === 'string' ? given : ''
  if (key.length !== expected.length) return { ok: false, status: 401, message: 'Not authorised' }

  /* Compares every character regardless of an early mismatch, so the time taken
   * does not leak how much of the code was right. */
  let diff = 0
  for (let i = 0; i < expected.length; i++) {
    diff |= key.charCodeAt(i) ^ expected.charCodeAt(i)
  }
  return diff === 0 ? { ok: true } : { ok: false, status: 401, message: 'Not authorised' }
}

/** Anything reaching a storage path or a filename. Never trust the client's shape. */
export function safeId(value: unknown, max = 40): string {
  return typeof value === 'string' ? value.replace(/[^a-zA-Z0-9-]/g, '').slice(0, max) : ''
}
