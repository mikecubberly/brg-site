export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  url.pathname = '/all-systems-geo.html';
  const response = await env.ASSETS.fetch(new Request(url.toString(), request));
  const headers = new Headers(response.headers);
  headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
