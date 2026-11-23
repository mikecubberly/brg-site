(function () {
  'use strict';
  const form = document.getElementById('contact-form');
  const submit = document.getElementById('contact-submit');
  const status = document.getElementById('contact-status');
  const success = document.getElementById('contact-success');
  const fallback = document.getElementById('contact-fallback');
  const verification = document.getElementById('contact-verification');
  const verificationStatus = document.getElementById('contact-verification-status');
  const linkedin = form.elements.linkedin;
  const params = new URLSearchParams(window.location.search);
  const racing = params.get('from') === 'racing';
  if (racing && params.get('embed') === '1' && window.parent !== window) {
    document.documentElement.classList.add('contact-embedded');
  }
  if (racing) {
    form.elements.note.placeholder = 'Tell us about the team, racing series, and sponsorship goals.';
    document.getElementById('contact-heading').textContent = 'Let’s talk racing.';
  }
  let sending = false;
  let token = '';
  let widgetId;
  let submissionId = crypto.randomUUID();

  function updateVerification(responseToken, message = '') {
    token = responseToken;
    verificationStatus.textContent = message;
    submit.disabled = sending || !token;
  }

  const verificationUnavailable = () => updateVerification('', 'Verification is unavailable. Reload the page to try again or email Mike directly.');
  const turnstileScript = document.createElement('script');
  turnstileScript.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=brgContactTurnstileReady';
  turnstileScript.async = true;
  turnstileScript.addEventListener('error', verificationUnavailable);
  window.brgContactTurnstileReady = () => {
    delete window.brgContactTurnstileReady;
    try {
      widgetId = window.turnstile.render(verification, {
        sitekey: verification.dataset.sitekey,
        action: 'brg_contact',
        size: verification.clientWidth < 300 ? 'compact' : 'flexible',
        theme: 'auto',
        'response-field': false,
        'refresh-expired': 'auto',
        'refresh-timeout': 'auto',
        callback: responseToken => updateVerification(responseToken),
        'expired-callback': () => updateVerification('', 'Refreshing verification…'),
        'timeout-callback': () => updateVerification('', 'Please complete verification to send your message.'),
        'error-callback': verificationUnavailable,
      });
    } catch { verificationUnavailable(); }
  };
  linkedin.addEventListener('input', () => linkedin.setCustomValidity(''));
  linkedin.addEventListener('blur', () => {
    const value = linkedin.value.trim();
    if (/^(www\.)?linkedin\.com\//i.test(value)) linkedin.value = 'https://' + value;
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || !token) return;
    const profileValue = linkedin.value.trim();
    let profile;
    try { profile = new URL(profileValue); } catch {}
    const validProfile = !profileValue || profile && profile.protocol === 'https:' && /^(www\.)?linkedin\.com$/i.test(profile.hostname) && profile.pathname.length > 1 && !profile.username && !profile.password && !profile.port;
    linkedin.setCustomValidity(validProfile ? '' : 'Enter a LinkedIn URL, such as https://www.linkedin.com/in/your-name.');
    if (!form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form));
    if (racing) data.source = ['Bottle Rocket Racing', data.source.trim()].filter(Boolean).join(' | ').slice(0, 160);
    sending = true;
    submit.disabled = true;
    form.setAttribute('aria-busy', 'true');
    status.dataset.error = 'false';
    status.textContent = 'Sending your message…';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(form.action, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'omit',
        body: JSON.stringify({ ...data, submissionId, turnstileToken: token }), signal: controller.signal
      });
      const result = await response.json();
      if (!response.ok || result.success !== true) throw new Error(result.error || 'Your message could not be sent. Please try again, or email Mike directly.');
      window.brgTrackLead?.();
      form.hidden = true;
      success.hidden = false;
      success.focus();
      form.reset();
      submissionId = crypto.randomUUID();
    } catch (error) {
      status.dataset.error = 'true';
      status.textContent = error.name === 'AbortError' || error instanceof TypeError
        ? 'We could not confirm your message was sent. Please try again, or email Mike directly.'
        : error.message;
    } finally {
      clearTimeout(timeout);
      sending = false;
      form.removeAttribute('aria-busy');
      if (!form.hidden) {
        updateVerification('', 'Refreshing verification…');
        window.turnstile.reset(widgetId);
      }
    }
  });
  form.hidden = false;
  if (fallback) fallback.hidden = true;
  document.head.append(turnstileScript);
})();
