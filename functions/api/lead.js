// Cloudflare Pages Functions adapter. This file's path makes it the endpoint
// /api/lead — the same URL Vercel serves from api/lead.js — so the client
// never needs to know which platform it is talking to.
//
// A single onRequest handler (rather than onRequestPost) keeps the method
// check explicit and identical to the Vercel adapter.

import { handleLead, METHOD_NOT_ALLOWED } from '../../shared/lead.js'

function json(payload, status) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function onRequest(context) {
  const { request, env } = context

  if (request.method !== 'POST') {
    return json(METHOD_NOT_ALLOWED.body, METHOD_NOT_ALLOWED.status)
  }

  // Cloudflare hands over the raw request; nothing is pre-parsed.
  const body = await request.json().catch(() => ({}))

  const { status, body: payload } = await handleLead({ body, env })
  return json(payload, status)
}
