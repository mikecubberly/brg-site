// /api/brgmcp-slack-errors
// Returns the last 50 BRGmcp submissions where the Slack DM notification failed.
// Requires header: X-Auth-Token matching env.MCP_DIAG_TOKEN, OR ?token= query param.
//
// If MCP_DIAG_TOKEN env var is not set, endpoint returns 503 (auth not configured)
// so the diagnostic list is never accidentally public.

export async function onRequestGet({ request, env }) {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  };

  if (!env.MCP_DIAG_TOKEN) {
    return new Response(JSON.stringify({ error: 'Diagnostic auth not configured' }), { status: 503, headers: cors });
  }
  if (!env.BRGmcp_KV) {
    return new Response(JSON.stringify({ error: 'Storage not configured' }), { status: 500, headers: cors });
  }

  const url = new URL(request.url);
  const provided = request.headers.get('X-Auth-Token') || url.searchParams.get('token') || '';
  if (provided !== env.MCP_DIAG_TOKEN) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: cors });
  }

  try {
    const raw = await env.BRGmcp_KV.get('brgmcp:slack_errors_index');
    const errors = raw ? JSON.parse(raw) : [];
    return new Response(JSON.stringify({ ok: true, count: errors.length, errors }), { status: 200, headers: cors });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Failed to read error log' }), { status: 500, headers: cors });
  }
}
