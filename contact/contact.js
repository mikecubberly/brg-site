(function () {
  'use strict';
  const form = document.getElementById('contact-form');
  const submit = document.getElementById('contact-submit');
  const status = document.getElementById('contact-status');
  const success = document.getElementById('contact-success');
  const linkedin = form.elements.linkedin;
  let sending = false;
  let submissionId = crypto.randomUUID();
  submit.disabled = false;
  linkedin.addEventListener('input', () => linkedin.setCustomValidity(''));
  linkedin.addEventListener('blur', () => {
    const value = linkedin.value.trim();
    if (/^(www\.)?linkedin\.com\//i.test(value)) linkedin.value = 'https://' + value;
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending) return;
    let profile;
    try { profile = new URL(linkedin.value.trim()); } catch {}
    const validProfile = profile && profile.protocol === 'https:' && /^(www\.)?linkedin\.com$/i.test(profile.hostname) && profile.pathname.length > 1 && !profile.username && !profile.password && !profile.port;
    linkedin.setCustomValidity(validProfile ? '' : 'Enter a LinkedIn URL, such as https://www.linkedin.com/in/your-name.');
    if (!form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form));
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
        body: JSON.stringify({ ...data, submissionId }), signal: controller.signal
      });
      const result = await response.json();
      if (!response.ok || result.success !== true) throw new Error(result.error || 'Your message could not be sent. Please try again, or email Mike directly.');
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
      submit.disabled = false;
      form.removeAttribute('aria-busy');
    }
  });
})();
