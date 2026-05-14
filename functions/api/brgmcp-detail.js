// /api/brgmcp-detail?id=<submission_id>
// Returns the full submission record by id.
// Auth: header X-Auth-Token or ?token= query param, must equal env.MCP_DIAG_TOKEN.

export async function onRequestGet({ request, env }) {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store'
  };

  if (!env.MCP_DIAG_TOKEN) {
    return new Response(JSON.stringify({ error: 'Auth not configured' }), { status: 503, headers: cors });
  }
  if (!env.BRGmcp_KV) {
    return new Response(JSON.stringify({ error: 'Storage not configured' }), { status: 500, headers: cors });
  }

  const url = new URL(request.url);
  const provided = request.headers.get('X-Auth-Token') || url.searchParams.get('token') || '';
  if (provided !== env.MCP_DIAG_TOKEN) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: cors });
  }

  const id = url.searchParams.get('id');
  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing id param' }), { status: 400, headers: cors });
  }

  try {
    // Look up the key in the index since full record key includes timestamp
    const indexRaw = await env.BRGmcp_KV.get('brgmcp:index');
    const index = indexRaw ? JSON.parse(indexRaw) : [];
    const entry = index.find(e => e.id === id);
    if (!entry || !entry.key) {
      return new Response(JSON.stringify({ error: 'Submission not found' }), { status: 404, headers: cors });
    }
    const recordRaw = await env.BRGmcp_KV.get(entry.key);
    if (!recordRaw) {
      return new Response(JSON.stringify({ error: 'Record missing in storage' }), { status: 404, headers: cors });
    }
    const submission = JSON.parse(recordRaw);
    return new Response(JSON.stringify({ ok: true, submission }), { status: 200, headers: cors });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Failed to read record' }), { status: 500, headers: cors });
  }
}
