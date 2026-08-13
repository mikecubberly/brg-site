const COOKIE_NAME = 'brd_access';
const SESSION_SECONDS = 60 * 60 * 12;

export async function onRequest(context) {
  const { request, env, next } = context;
  const url = new URL(request.url);

  if (!env.DIRECT_PASSWORD) {
    return pageResponse(loginPage('Access is temporarily unavailable.'), 503);
  }

  if (request.method === 'POST' && url.pathname === '/direct/access') {
    return handleLogin(request, env.DIRECT_PASSWORD);
  }

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method not allowed', {
      status: 405,
      headers: { Allow: 'GET, HEAD, POST' }
    });
  }

  if (!(await hasValidSession(request, env.DIRECT_PASSWORD))) {
    const acceptsHtml = (request.headers.get('Accept') || '').includes('text/html');
    if (!acceptsHtml && url.pathname !== '/direct' && url.pathname !== '/direct/') {
      return new Response('Unauthorized', {
        status: 401,
        headers: protectedHeaders('text/plain; charset=UTF-8')
      });
    }
    return pageResponse(loginPage(''), 200);
  }

  const response = await next();
  const headers = new Headers(response.headers);
  headers.set('Cache-Control', 'private, no-store, max-age=0');
  headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

async function handleLogin(request, configuredPassword) {
  let submitted = '';

  try {
    const contentType = request.headers.get('Content-Type') || '';
    if (contentType.includes('application/json')) {
      const payload = await request.json();
      submitted = String(payload.password || '');
    } else {
      const form = await request.formData();
      submitted = String(form.get('password') || '');
    }
  } catch {
    return pageResponse(loginPage('Enter the password to continue.'), 400);
  }

  const valid = safeEqual(normalize(submitted), normalize(configuredPassword));
  if (!valid) {
    return pageResponse(loginPage('That password did not match.'), 401);
  }

  const token = await sessionToken(configuredPassword);
  return new Response(null, {
    status: 303,
    headers: {
      Location: '/direct/',
      'Cache-Control': 'no-store',
      'Set-Cookie': `${COOKIE_NAME}=${token}; Path=/direct; Max-Age=${SESSION_SECONDS}; HttpOnly; Secure; SameSite=Strict`
    }
  });
}

async function hasValidSession(request, configuredPassword) {
  const cookies = request.headers.get('Cookie') || '';
  const provided = cookies
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_NAME}=`))
    ?.slice(COOKIE_NAME.length + 1);

  if (!provided) return false;
  const expected = await sessionToken(configuredPassword);
  return safeEqual(provided, expected);
}

async function sessionToken(password) {
  const bytes = new TextEncoder().encode(`bottle-rocket-direct:${normalize(password)}`);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function normalize(value) {
  return String(value || '').trim().toLocaleUpperCase('en-US');
}

function safeEqual(left, right) {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return mismatch === 0;
}

function protectedHeaders(contentType) {
  return {
    'Cache-Control': 'private, no-store, max-age=0',
    'Content-Type': contentType,
    'Referrer-Policy': 'no-referrer',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-Robots-Tag': 'noindex, nofollow, noarchive'
  };
}

function pageResponse(html, status) {
  return new Response(html, {
    status,
    headers: protectedHeaders('text/html; charset=UTF-8')
  });
}

function loginPage(errorMessage) {
  const error = errorMessage
    ? `<p class="error" role="alert">${escapeHtml(errorMessage)}</p>`
    : '<p class="error" aria-hidden="true"></p>';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow, noarchive">
  <title>Bottle Rocket Direct | Private access</title>
  <style>
    :root { color-scheme: dark; --black: #080806; --ivory: #f2ede3; --gold: #d7b260; --muted: #9f998f; }
    * { box-sizing: border-box; }
    body { background: var(--black); color: var(--ivory); display: grid; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; margin: 0; min-height: 100vh; place-items: center; }
    main { max-width: 520px; padding: 3rem 1.5rem; text-align: center; width: 100%; }
    .mark { color: var(--gold); font-family: Georgia, serif; font-size: 1.65rem; letter-spacing: .08em; margin: 0 auto 1.5rem; width: 74px; }
    .diamond { align-items: center; border: 1.5px solid var(--gold); display: flex; height: 43px; justify-content: center; margin: 0 auto 12px; transform: rotate(45deg); width: 43px; }
    .diamond span { transform: rotate(-45deg); }
    .chevron { border-bottom: 1.5px solid var(--gold); border-right: 1.5px solid var(--gold); height: 30px; margin: -20px auto 4px; transform: rotate(45deg); width: 30px; }
    .cross { height: 42px; margin: -11px auto 0; position: relative; width: 42px; }
    .cross::before, .cross::after { background: var(--gold); content: ""; height: 1.5px; left: -5px; position: absolute; top: 20px; width: 52px; }
    .cross::before { transform: rotate(45deg); }
    .cross::after { transform: rotate(-45deg); }
    .eyebrow { color: var(--gold); font-family: "SFMono-Regular", Consolas, monospace; font-size: .63rem; letter-spacing: .16em; margin: 0; text-transform: uppercase; }
    h1 { font-size: clamp(2.7rem, 9vw, 4.7rem); letter-spacing: -.065em; line-height: .94; margin: 1.25rem 0 0; }
    .intro { color: var(--muted); font-size: .94rem; line-height: 1.7; margin: 1.4rem auto 2rem; max-width: 410px; }
    form { display: grid; gap: .75rem; margin: 0 auto; max-width: 380px; }
    label { font-size: .72rem; font-weight: 700; text-align: left; }
    input { background: #12110e; border: 1px solid rgba(215, 178, 96, .48); border-radius: 0; color: var(--ivory); font: inherit; min-height: 52px; padding: .85rem 1rem; width: 100%; }
    input:focus { border-color: var(--gold); outline: 2px solid rgba(215, 178, 96, .2); outline-offset: 2px; }
    button { background: var(--gold); border: 0; border-radius: 0; color: var(--black); cursor: pointer; font-size: .76rem; font-weight: 800; min-height: 52px; padding: .9rem 1rem; }
    button:hover { background: #edcc7d; }
    .error { color: #e8ab9d; font-size: .75rem; min-height: 1.15rem; }
  </style>
</head>
<body>
  <main>
    <div class="mark" aria-hidden="true"><div class="diamond"><span>D</span></div><div class="chevron"></div><div class="cross"></div></div>
    <p class="eyebrow">Bottle Rocket Direct</p>
    <h1>Private access.</h1>
    <p class="intro">Enter the beta password to view Bottle Rocket Direct.</p>
    <form method="post" action="/direct/access">
      <label for="password">Password</label>
      <input id="password" name="password" type="password" autocomplete="current-password" autofocus required>
      <button type="submit">Enter Bottle Rocket Direct</button>
      ${error}
    </form>
  </main>
</body>
</html>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
