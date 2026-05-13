// /api/brgmcp-submit
// Handles BRGMCP application form submissions.
// Writes to KV (binding: BRGMCP_KV) and sends an email to mike@bottlerocketgrowth.com
// via Cloudflare's send_email binding (binding: SEB).
//
// Required Cloudflare Pages bindings (set in dashboard):
//   - KV namespace binding "BRGMCP_KV" (create namespace, attach to brg-site Pages project)
//   - Email binding "SEB" with destination address mike@bottlerocketgrowth.com
//     (verify the destination address in Email Routing first; then add the binding under
//     Pages > Settings > Functions > Bindings > Send Email)
//
// If the email binding is missing or fails, the function still writes to KV and returns
// success so the user never sees a broken form. Email failures are logged.

export async function onRequestPost({ request, env }) {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  let payload;
  try {
    payload = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: cors });
  }

  const required = ['full_name','role','company','website','email','linkedin','offer','price','sales_motion','icp','tam','senders','why_fit'];
  for (const field of required) {
    if (!payload[field] || String(payload[field]).trim() === '') {
      return new Response(JSON.stringify({ error: `Missing required field: ${field}` }), { status: 400, headers: cors });
    }
  }

  // Light email format check
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email);
  if (!emailOk) {
    return new Response(JSON.stringify({ error: 'Invalid email address' }), { status: 400, headers: cors });
  }

  const now = new Date();
  const ts = now.toISOString();
  const id = crypto.randomUUID();
  const submission = {
    id,
    submitted_at: ts,
    page: 'BRGMCP',
    ip: request.headers.get('CF-Connecting-IP') || '',
    user_agent: request.headers.get('User-Agent') || '',
    referer: request.headers.get('Referer') || '',
    ...payload
  };

  // 1. Write to KV (primary persistence)
  if (!env.BRGMCP_KV) {
    return new Response(JSON.stringify({ error: 'Storage not configured' }), { status: 500, headers: cors });
  }

  try {
    const key = `brgmcp:submission:${ts}:${id}`;
    await env.BRGMCP_KV.put(key, JSON.stringify(submission));
    // Also maintain an index of recent submissions for fast listing
    const indexKey = 'brgmcp:index';
    let index = [];
    try {
      const existing = await env.BRGMCP_KV.get(indexKey);
      if (existing) index = JSON.parse(existing);
    } catch (e) { index = []; }
    index.unshift({ id, key, submitted_at: ts, company: submission.company, full_name: submission.full_name, email: submission.email });
    if (index.length > 500) index = index.slice(0, 500);
    await env.BRGMCP_KV.put(indexKey, JSON.stringify(index));
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Failed to persist submission' }), { status: 500, headers: cors });
  }

  // 2. Send notification email (best-effort; non-blocking on failure)
  try {
    if (env.SEB) {
      const { EmailMessage } = await import('cloudflare:email');
      const subject = `BRGMCP application: ${submission.company} (${submission.full_name})`;
      const body = buildEmailBody(submission);
      const raw = buildRawMime({
        from: 'BRGMCP <brgmcp@bottlerocketgrowth.com>',
        to: 'mike@bottlerocketgrowth.com',
        subject,
        text: body
      });
      const message = new EmailMessage('brgmcp@bottlerocketgrowth.com', 'mike@bottlerocketgrowth.com', raw);
      await env.SEB.send(message);
    }
  } catch (e) {
    // Log only; submission already saved to KV
    console.error('SEB email send failed:', e && e.message ? e.message : e);
  }

  return new Response(JSON.stringify({ ok: true, id }), { status: 200, headers: cors });
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

function buildEmailBody(s) {
  return [
    `New BRGMCP application received.`,
    ``,
    `Submitted: ${s.submitted_at}`,
    `Submission ID: ${s.id}`,
    ``,
    `--- APPLICANT ---`,
    `Name:        ${s.full_name}`,
    `Role:        ${s.role}`,
    `Email:       ${s.email}`,
    `LinkedIn:    ${s.linkedin}`,
    ``,
    `--- COMPANY ---`,
    `Company:     ${s.company}`,
    `Website:     ${s.website}`,
    ``,
    `--- OFFER ---`,
    `Price tier:  ${s.price}`,
    `Sales:       ${s.sales_motion}`,
    `TAM:         ${s.tam}`,
    `Senders:     ${s.senders}`,
    ``,
    `What they sell:`,
    s.offer,
    ``,
    `ICP:`,
    s.icp,
    ``,
    `Why a fit:`,
    s.why_fit,
    ``,
    `Notes:`,
    s.notes || '(none)',
    ``,
    `--- META ---`,
    `IP:          ${s.ip}`,
    `Referer:     ${s.referer}`,
    `UA:          ${s.user_agent}`
  ].join('\n');
}

function buildRawMime({ from, to, subject, text }) {
  // Minimal RFC 822 message. Headers separated from body by a blank line.
  const lines = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/plain; charset="utf-8"`,
    `Content-Transfer-Encoding: 7bit`,
    `Date: ${new Date().toUTCString()}`,
    ``,
    text
  ];
  return lines.join('\r\n');
}
