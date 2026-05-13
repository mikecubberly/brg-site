// /api/brgmcp-submit
// Handles BRGmcp application form submissions.
// Writes to KV (binding: BRGmcp_KV) and posts a Slack DM to Mike (U716RS96E)
// via chat.postMessage using the SLACK_USER_TOKEN env var.
//
// Required Cloudflare Pages bindings (set in dashboard):
//   - KV namespace binding "BRGmcp_KV"
//   - Plaintext/secret env var "SLACK_USER_TOKEN" (xoxp- token with chat:write,
//     im:write scopes)
//
// If Slack post fails for any reason, the submission still saves to KV and the
// function returns success. Slack failures are logged.

const MIKE_SLACK_USER_ID = 'U716RS96E';

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

  const required = ['full_name','role','company','website','email','linkedin','offer','price','sales_motion','icp','tam','why_fit'];
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
    page: 'BRGmcp',
    ip: request.headers.get('CF-Connecting-IP') || '',
    user_agent: request.headers.get('User-Agent') || '',
    referer: request.headers.get('Referer') || '',
    ...payload
  };

  // 1. Write to KV (primary persistence)
  if (!env.BRGmcp_KV) {
    return new Response(JSON.stringify({ error: 'Storage not configured' }), { status: 500, headers: cors });
  }

  try {
    const key = `brgmcp:submission:${ts}:${id}`;
    await env.BRGmcp_KV.put(key, JSON.stringify(submission));
    const indexKey = 'brgmcp:index';
    let index = [];
    try {
      const existing = await env.BRGmcp_KV.get(indexKey);
      if (existing) index = JSON.parse(existing);
    } catch (e) { index = []; }
    index.unshift({
      id,
      key,
      submitted_at: ts,
      company: submission.company,
      full_name: submission.full_name,
      email: submission.email
    });
    if (index.length > 500) index = index.slice(0, 500);
    await env.BRGmcp_KV.put(indexKey, JSON.stringify(index));
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Failed to persist submission' }), { status: 500, headers: cors });
  }

  // 2. Post Slack DM to Mike (best-effort; non-blocking on failure)
  try {
    if (env.SLACK_USER_TOKEN) {
      const slackPayload = {
        channel: MIKE_SLACK_USER_ID,
        text: `New BRGmcp application: ${submission.company} (${submission.full_name})`,
        blocks: buildSlackBlocks(submission)
      };
      const resp = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.SLACK_USER_TOKEN}`,
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify(slackPayload)
      });
      const result = await resp.json().catch(() => ({}));
      if (!result.ok) {
        console.error('Slack post failed:', result.error || 'unknown', JSON.stringify(result));
      }
    } else {
      console.error('SLACK_USER_TOKEN env var not set; skipping Slack notification');
    }
  } catch (e) {
    console.error('Slack notify error:', e && e.message ? e.message : e);
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

function buildSlackBlocks(s) {
  const trunc = (v, n = 500) => {
    const str = String(v || '');
    return str.length > n ? str.slice(0, n) + '...' : str;
  };

  return [
    {
      type: 'header',
      text: { type: 'plain_text', text: 'New BRGmcp Application', emoji: false }
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Company:*\n${s.company}` },
        { type: 'mrkdwn', text: `*Website:*\n${s.website}` },
        { type: 'mrkdwn', text: `*Applicant:*\n${s.full_name}` },
        { type: 'mrkdwn', text: `*Role:*\n${s.role}` },
        { type: 'mrkdwn', text: `*Email:*\n${s.email}` },
        { type: 'mrkdwn', text: `*LinkedIn:*\n${s.linkedin}` }
      ]
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Price tier:*\n${s.price}` },
        { type: 'mrkdwn', text: `*Sales motion:*\n${s.sales_motion}` },
        { type: 'mrkdwn', text: `*TAM:*\n${s.tam}` }
      ]
    },
    { type: 'divider' },
    {
      type: 'section',
      text: { type: 'mrkdwn', text: `*What they sell:*\n${trunc(s.offer)}` }
    },
    {
      type: 'section',
      text: { type: 'mrkdwn', text: `*ICP:*\n${trunc(s.icp)}` }
    },
    {
      type: 'section',
      text: { type: 'mrkdwn', text: `*Why a fit:*\n${trunc(s.why_fit)}` }
    },
    ...(s.notes && String(s.notes).trim() ? [{
      type: 'section',
      text: { type: 'mrkdwn', text: `*Notes:*\n${trunc(s.notes)}` }
    }] : []),
    { type: 'divider' },
    {
      type: 'context',
      elements: [
        { type: 'mrkdwn', text: `Submitted ${s.submitted_at} \u00b7 ID: \`${s.id}\`` }
      ]
    }
  ];
}
