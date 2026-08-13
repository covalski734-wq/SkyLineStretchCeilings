// Vercel adapter. Vercel picks up /api automatically for any framework.
// All the logic lives in shared/lead.js so Cloudflare Pages can run the exact
// same code — see functions/api/lead.js.

import { handleLead, METHOD_NOT_ALLOWED } from '../shared/lead.js'

/** Vercel pre-parses JSON bodies, but not for every content-type. */
async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body)
    } catch {
      return {}
    }
  }
  let raw = ''
  for await (const chunk of req) raw += chunk
  try {
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(METHOD_NOT_ALLOWED.status).json(METHOD_NOT_ALLOWED.body)
  }

  const { status, body } = await handleLead({
    body: await readBody(req),
    env: process.env,
  })

  return res.status(status).json(body)
}
