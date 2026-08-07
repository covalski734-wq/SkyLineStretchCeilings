import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

/** Client-side routes that should end up in the sitemap. */
const PAGES = ['/', '/privacy']

/**
 * Vercel runs everything in /api for us in production, but the Vite dev server
 * knows nothing about it. This mounts the same handler during `npm run dev`,
 * with a minimal Express-style (req, res) shim, so the contact form is
 * testable locally instead of 404-ing.
 */
function devApi() {
  return {
    name: 'dev-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/lead', async (req, res) => {
        let raw = ''
        if (req.method === 'POST') {
          for await (const chunk of req) raw += chunk
        }
        try {
          req.body = raw ? JSON.parse(raw) : {}
        } catch {
          req.body = {}
        }

        res.status = (code) => {
          res.statusCode = code
          return res
        }
        res.json = (payload) => {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(payload))
          return res
        }

        try {
          const mod = await server.ssrLoadModule('/api/lead.js')
          await mod.default(req, res)
        } catch (error) {
          res.status(500).json({ success: false, error: String(error) })
        }
      })
    },
  }
}

/**
 * Emits robots.txt and sitemap.xml at build time so the canonical host lives
 * in one env var instead of being hardcoded in several files.
 *
 * Without VITE_SITE_URL the sitemap is skipped rather than written with a
 * guessed domain — search engines reject sitemaps whose URLs point elsewhere,
 * so a wrong one is worse than none.
 */
function seoFiles(siteUrl) {
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
          'VITE_SITE_URL is not set — sitemap.xml was skipped and robots.txt ' +
            'has no Sitemap line. Set it to the production origin ' +
            '(e.g. https://skylineceilings.ca) and rebuild.'
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

  const siteUrl = (process.env.VITE_SITE_URL || '').trim().replace(/\/+$/, '')

  return {
    // Single page app: Vite's dev and preview servers fall back to index.html
    // for unknown paths, which is what react-router needs. Production gets the
    // same behaviour from the rewrite in vercel.json.
    plugins: [react(), devApi(), seoFiles(siteUrl)],
  }
})
