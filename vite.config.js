import { readFile } from 'node:fs/promises'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const fromRoot = (path) => fileURLToPath(new URL(path, import.meta.url))

/** Client-side routes that should end up in the sitemap. */
const PAGES = ['/', '/privacy']

/**
 * A sitemap needs absolute URLs, so a bare host like
 * "example.pages.dev" is not usable — it has to carry the scheme.
 */
function normaliseSiteUrl(raw) {
  const value = String(raw || '')
    .trim()
    .replace(/\/+$/, '')

  if (!value) return { url: '', problem: 'VITE_SITE_URL is not set' }

  if (!/^https?:\/\//i.test(value)) {
    return {
      url: '',
      problem:
        `VITE_SITE_URL is missing the scheme ("${value}") — sitemap URLs ` +
        'must be absolute, so search engines would reject the file',
    }
  }

  return { url: value, problem: '' }
}

/**
 * Cloudflare adapter, emitted into the build output as dist/_worker.js.
 *
 * The documented `functions/` directory only works if Pages discovers it at the
 * project root — which it did not here, and that is invisible from the repo.
 * The output directory is always published, whatever the deploy method, so the
 * worker goes there instead. public/_routes.json still limits it to /api/*, so
 * static assets are served directly and never pass through this code.
 *
 * shared/lead.js has no imports of its own, so it is inlined verbatim rather
 * than bundled — no extra tooling, and the core stays the single source of
 * truth for Vercel, Cloudflare and dev alike.
 */
const WORKER_ENTRY = `
function workerJson(payload, status) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export default {
  async fetch(request, env) {
    if (new URL(request.url).pathname !== '/api/lead') {
      // Safety net: _routes.json should stop static requests reaching here.
      return env.ASSETS.fetch(request)
    }
    if (request.method !== 'POST') {
      return workerJson(METHOD_NOT_ALLOWED.body, METHOD_NOT_ALLOWED.status)
    }
    const body = await request.json().catch(() => ({}))
    const result = await handleLead({ body, env })
    return workerJson(result.body, result.status)
  },
}
`

function cloudflareWorker() {
  return {
    name: 'cloudflare-worker',
    apply: 'build',
    async generateBundle() {
      const core = await readFile(fromRoot('shared/lead.js'), 'utf8')
      this.emitFile({
        type: 'asset',
        fileName: '_worker.js',
        source: `${core}\n${WORKER_ENTRY}`,
      })
    },
  }
}

/**
 * Neither host's function runtime exists during `npm run dev`, so this mounts
 * the shared core directly — a third, local adapter alongside api/lead.js
 * (Vercel) and dist/_worker.js (Cloudflare). Loading the core rather than
 * either adapter means dev exercises the code both platforms run.
 */
function devApi() {
  return {
    name: 'dev-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/lead', async (req, res) => {
        const send = (status, payload) => {
          res.statusCode = status
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(payload))
        }

        try {
          const { handleLead, METHOD_NOT_ALLOWED } =
            await server.ssrLoadModule('/shared/lead.js')

          if (req.method !== 'POST') {
            return send(METHOD_NOT_ALLOWED.status, METHOD_NOT_ALLOWED.body)
          }

          let raw = ''
          for await (const chunk of req) raw += chunk
          let body = {}
          try {
            body = raw ? JSON.parse(raw) : {}
          } catch {
            body = {}
          }

          const result = await handleLead({ body, env: process.env })
          send(result.status, result.body)
        } catch (error) {
          send(500, { success: false, error: String(error) })
        }
      })
    },
  }
}

/**
 * Emits robots.txt and sitemap.xml at build time so the canonical host lives
 * in one env var instead of being hardcoded in several files.
 *
 * Without a usable VITE_SITE_URL the sitemap is skipped rather than written
 * with a guessed or malformed domain — search engines reject sitemaps whose
 * URLs point elsewhere or omit the scheme, so a wrong one is worse than none.
 */
function seoFiles({ url: siteUrl, problem: siteUrlProblem }) {
  return {
    name: 'seo-files',
    apply: 'build',
    generateBundle() {
      const robots = [
        'User-agent: *',
        'Allow: /',
        'Disallow: /api/',
        siteUrl ? `\nSitemap: ${siteUrl}/sitemap.xml` : '',
      ]
        .filter(Boolean)
        .join('\n')

      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: robots + '\n',
      })

      if (!siteUrl) {
        this.warn(
          `${siteUrlProblem} — sitemap.xml was skipped and robots.txt has no ` +
            'Sitemap line. Set VITE_SITE_URL to the production origin, ' +
            'including the scheme (e.g. https://skylineceilings.ca), and rebuild.'
        )
        return
      }

      const urls = PAGES.map((page) => {
        const loc = page === '/' ? `${siteUrl}/` : `${siteUrl}${page}`
        const priority = page === '/' ? '1.0' : '0.3'
        return `  <url>\n    <loc>${loc}</loc>\n    <priority>${priority}</priority>\n  </url>`
      }).join('\n')

      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source:
          '<?xml version="1.0" encoding="UTF-8"?>\n' +
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
          `${urls}\n` +
          '</urlset>\n',
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  // Load every var (not just VITE_*) into process.env so the dev API handler
  // can read TELEGRAM_BOT_TOKEN / RECAPTCHA_SECRET. Vite still only inlines
  // VITE_* into the client bundle, so these stay server-side.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))

  const siteUrl = normaliseSiteUrl(process.env.VITE_SITE_URL)

  return {
    // Single page app: Vite's dev and preview servers fall back to index.html
    // for unknown paths, which is what react-router needs. Production gets the
    // same behaviour from the rewrite in vercel.json.
    plugins: [react(), devApi(), seoFiles(siteUrl), cloudflareWorker()],
  }
})
