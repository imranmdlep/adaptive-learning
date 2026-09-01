/* Serves api/*.ts during `pnpm dev`. Development only, never bundled.
 *
 * In production those files are Vercel Serverless Functions and the platform
 * routes /api/<name> to api/<name>.ts for us. Vite's dev server knows nothing
 * about that convention, so without this every /api call 404s locally and the
 * app can only be reviewed as far as its first request. Reviewing on localhost
 * before anything is committed is the whole workflow, so the gap was worth
 * closing once rather than reaching for `vercel dev` each time.
 *
 * The handlers are written against VercelRequest and VercelResponse, which are
 * Node's IncomingMessage and ServerResponse plus a few conveniences. So this
 * adds exactly those conveniences and hands the real Node objects over. */

import type { Plugin } from 'vite'

/* Same cap as the largest handler's own limit, so an oversized body is refused
 * here rather than buffered into memory first. */
const MAX_BODY_BYTES = 200_000

function readBody(req: NodeJS.ReadableStream & { headers?: unknown }): Promise<string> {
  return new Promise((resolve, reject) => {
    let size = 0
    const chunks: Buffer[] = []
    req.on('data', (c: Buffer) => {
      size += c.length
      if (size > MAX_BODY_BYTES) {
        reject(new Error('body too large'))
        return
      }
      chunks.push(c)
    })
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

export function devApi(): Plugin {
  return {
    name: 'dev-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ?? ''
        if (!url.startsWith('/api/')) return next()

        /* Route to a file the same way Vercel does, and refuse anything with a
         * path separator or a leading underscore: `_auth.ts` and `_skills.ts`
         * are shared modules, not endpoints, and should not be reachable even
         * in development. */
        const name = url.split('?')[0].slice('/api/'.length)
        if (!/^[a-z0-9-]+$/i.test(name)) {
          res.statusCode = 404
          res.end('Not found')
          return
        }

        try {
          const raw = req.method === 'POST' || req.method === 'PUT' ? await readBody(req) : ''

          /* The handlers accept a string body and parse it themselves, so this
           * hands the raw text over rather than guessing at the content type. */
          const request = Object.assign(req, { body: raw, query: {}, cookies: {} })

          const response = Object.assign(res, {
            status(code: number) {
              res.statusCode = code
              return response
            },
            json(value: unknown) {
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(value))
              return response
            },
            send(value: unknown) {
              if (typeof value === 'string' || Buffer.isBuffer(value)) res.end(value)
              else response.json(value)
              return response
            },
          })

          /* ssrLoadModule compiles the TypeScript on demand and picks up edits
           * without a restart, so the endpoints reload like the rest of the app. */
          const mod = await server.ssrLoadModule(`/api/${name}.ts`)
          const handler = (mod as { default?: unknown }).default
          if (typeof handler !== 'function') {
            res.statusCode = 404
            res.end('Not found')
            return
          }

          await (handler as (q: unknown, s: unknown) => unknown)(request, response)
        } catch (err) {
          server.config.logger.error(`[dev-api] ${name} failed: ${String(err)}`)
          if (!res.headersSent) {
            res.statusCode = 500
            res.end('Handler failed, see the terminal.')
          } else {
            res.end()
          }
        }
      })
    },
  }
}
