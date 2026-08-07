import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

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
      // Handle every method here — never call next(), or Vite would fall
      // through and serve api/lead.js as a transformed module (leaking the
      // source and answering 200 where production answers 405).
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

export default defineConfig(({ mode }) => {
  // Load every var (not just VITE_*) into process.env so the dev API handler
  // above can read TELEGRAM_BOT_TOKEN / RECAPTCHA_SECRET. Vite still only
  // inlines VITE_* into the client bundle, so these stay server-side.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''))

  return {
    plugins: [react(), devApi()],
  }
})
