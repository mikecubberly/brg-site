// /api/brgmcp-submit
// Handles BRGmcp application form submissions.
// Writes to KV (binding: BRGmcp_KV) and posts a Slack notification to the
// channel tied to the SLACK_MCP_WEBHOOK incoming webhook URL.
//
// Required Cloudflare Pages bindings (set in dashboard):
//   - KV namespace binding "BRGmcp_KV"
//   - Secret env var "SLACK_MCP_WEBHOOK" (Slack incoming webhook URL)
//
// If the Slack post fails for any reason, the submission still saves to KV
// and the function returns success. Slack failures are logged to KV under
// brgmcp:slack_errors_index (retrievable via /api/brgmcp-slack-errors).

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

  // 2. Post Slack notification via incoming webhook (best-effort; non-blocking on failure)
  // Webhooks accept the same { text, blocks } payload as chat.postMessage but
  // don't require OAuth scopes -- they post to whichever channel the webhook was created for.
  const slackStatus = { ok: false, error: null, attempted: false };
  try {
    if (env.SLACK_MCP_WEBHOOK) {
      slackStatus.attempted = true;
      const slackPayload = {
        text: `New BRGmcp application: ${submission.company} (${submission.full_name})`,
        blocks: buildSlackBlocks(submission)
      };
      const resp = await fetch(env.SLACK_MCP_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(slackPayload)
      });
      // Slack webhooks return 200 with body "ok" on success.
      const bodyText = await resp.text().catch(() => '');
      if (resp.ok && bodyText.trim().toLowerCase() === 'ok') {
        slackStatus.ok = true;
      } else {
        slackStatus.error = `webhook_${resp.status}_${bodyText.slice(0, 120) || 'no_body'}`;
        console.error('Slack webhook failed:', resp.status, bodyText);
      }
    } else {
      slackStatus.error = 'webhook_not_configured';
      console.error('SLACK_MCP_WEBHOOK env var not set; skipping Slack notification');
    }
  } catch (e) {
    slackStatus.error = (e && e.message) ? e.message : 'slack_exception';
    console.error('Slack notify error:', e && e.message ? e.message : e);
  }

  // Persist Slack failures to KV so they're retrievable without Pages log tailing
  if (!slackStatus.ok) {
    try {
      const errKey = `brgmcp:slack_error:${ts}:${id}`;
      await env.BRGmcp_KV.put(errKey, JSON.stringify({
        submission_id: id,
        submitted_at: ts,
        company: submission.company,
        full_name: submission.full_name,
        email: submission.email,
        slack_error: slackStatus.error,
        attempted: slackStatus.attempted
      }), { expirationTtl: 60 * 60 * 24 * 90 }); // 90 day retention

      const errIndexKey = 'brgmcp:slack_errors_index';
      let errIndex = [];
      try {
        const existing = await env.BRGmcp_KV.get(errIndexKey);
        if (existing) errIndex = JSON.parse(existing);
      } catch (e) { errIndex = []; }
      errIndex.unshift({
        submission_id: id,
        submitted_at: ts,
        company: submission.company,
        slack_error: slackStatus.error
      });
      if (errIndex.length > 50) errIndex = errIndex.slice(0, 50);
      await env.BRGmcp_KV.put(errIndexKey, JSON.stringify(errIndex));
    } catch (e) {
      console.error('Failed to write slack error log to KV:', e && e.message ? e.message : e);
    }
  }

  return new Response(JSON.stringify({ ok: true, id, slack: slackStatus }), { status: 200, headers: cors });
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
