/* Open the BRG Tawk.to widget from the homepage contact CTA. */
(function () {
  'use strict';
  var cta = document.getElementById('gitBtn');
  var label = document.getElementById('chat-cta-label');
  if (!cta || !label) return;
  var api = window.Tawk_API = window.Tawk_API || {};
  var ready = false;
  var loading = false;
  var failed = false;
  var timer;

  function reset() {
    clearTimeout(timer);
    loading = false;
    label.textContent = 'Get in Touch';
    cta.removeAttribute('aria-busy');
  }
  function open() {
    api.showWidget();
    api.maximize();
  }
  function fallback() {
    if (ready) return;
    failed = true;
    reset();
    label.textContent = 'Open Chat';
    cta.removeAttribute('aria-haspopup');
  }
  api.onLoad = function () {
    ready = true;
    failed = false;
    reset();
    cta.setAttribute('aria-haspopup', 'dialog');
    open();
  };
  api.onChatMinimized = function () {
    api.hideWidget();
    cta.focus({ preventScroll: true });
  };
  cta.addEventListener('click', function (event) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || failed) return;
    event.preventDefault();
    if (ready) { open(); return; }
    if (loading) return;
    loading = true;
    label.textContent = 'Opening chat…';
    cta.setAttribute('aria-busy', 'true');
    window.Tawk_LoadStart = new Date();
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://embed.tawk.to/6aa052f9fd82573442c931ec/1k21487g4';
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');
    script.onerror = fallback;
    timer = setTimeout(fallback, 15000);
    document.head.appendChild(script);
  });
}());
