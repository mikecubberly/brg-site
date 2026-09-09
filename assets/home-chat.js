/* BRG's visitor-initiated Botpress assistant. Public embed handles only. */
(function () {
  'use strict';
  if (document.getElementById('bp-toggle-chat')) return;
  var cta = document.getElementById('gitBtn');
  var label = document.getElementById('chat-cta-label');
  var launcher = document.createElement('button');
  launcher.id = 'bp-toggle-chat';
  launcher.type = 'button';
  launcher.setAttribute('aria-label', "Chat with Mike's AI assistant at Bottle Rocket Growth");
  launcher.setAttribute('aria-haspopup', 'dialog');
  launcher.innerHTML = '<img src="/racing/mike-cubberly.png" alt="" width="46" height="46"><span><strong>Worth a conversation?</strong><small>Ask Mike\'s AI assistant</small></span>';
  document.body.appendChild(launcher);
  var status = document.createElement('div');
  status.id = 'brg-ai-status';
  status.hidden = true;
  status.setAttribute('role', 'status');
  document.body.appendChild(status);
  var loading = false;
  var ready = false;
  var timer;
  var returnFocus = launcher;
  function reset() {
    clearTimeout(timer);
    loading = false;
    launcher.removeAttribute('aria-busy');
    if (cta) cta.removeAttribute('aria-busy');
    if (label) label.textContent = 'Get in Touch';
  }
  function fallback() {
    reset();
    status.innerHTML = 'Chat is unavailable right now. <a href="/contact.html">Send Mike a note instead</a>.';
    status.hidden = false;
    launcher.hidden = false;
  }
  function loadScript(src, onload) {
    var script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = onload;
    script.onerror = fallback;
    document.head.appendChild(script);
  }
  function openChat(event) {
    if (event && (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)) return;
    if (event) event.preventDefault();
    returnFocus = event ? event.currentTarget : launcher;
    status.hidden = true;
    if (ready) {
      // Botpress owns this custom launcher's toggle once initialized.
      if (!event || event.currentTarget !== launcher) window.botpress.open();
      return;
    }
    if (loading) return;
    loading = true;
    launcher.setAttribute('aria-busy', 'true');
    if (cta) cta.setAttribute('aria-busy', 'true');
    if (label) label.textContent = 'Opening chat…';
    status.textContent = 'Opening your conversation…';
    status.hidden = false;
    timer = setTimeout(fallback, 20000);
    loadScript('https://cdn.botpress.cloud/webchat/v5.0/inject.js', function () {
      window.botpress.on('webchat:initialized', function () {
        ready = true;
        reset();
        status.hidden = true;
        window.botpress.open();
      });
      window.botpress.on('webchat:opened', function () { launcher.hidden = true; });
      window.botpress.on('webchat:closed', function () {
        launcher.hidden = false;
        if (returnFocus) returnFocus.focus({ preventScroll: true });
      });
      window.botpress.on('error', fallback);
      loadScript('https://files.bpcontent.cloud/2026/09/09/14/20260909144452-K1GZ0C6Y.js');
    });
  }
  launcher.addEventListener('click', openChat);
  if (cta) cta.addEventListener('click', openChat);
}());
