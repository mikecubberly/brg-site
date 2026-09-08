/* Bottle Rocket launcher using the public Tawk.to JavaScript API. */
(function () {
  'use strict';
  if (document.getElementById('brg-chat-launcher')) return;
  var api = window.Tawk_API = window.Tawk_API || {};
  var button = document.createElement('button');
  button.id = 'brg-chat-launcher';
  button.type = 'button';
  button.hidden = true;
  button.setAttribute('aria-label', 'Open Bottle Rocket Racing chat');
  button.setAttribute('aria-haspopup', 'dialog');
  button.title = 'Chat with Bottle Rocket Racing';
  var logo = document.createElement('img');
  logo.src = '/brg-logo-mark-2x.png';
  logo.alt = '';
  logo.width = 42;
  logo.height = 42;
  button.appendChild(logo);
  document.body.appendChild(button);

  function hook(name, handler) {
    var previous = api[name];
    api[name] = function () {
      if (typeof previous === 'function') previous.apply(api, arguments);
      handler.apply(api, arguments);
    };
  }
  function showLauncher() {
    button.hidden = false;
  }
  function resetLauncher() {
    button.removeAttribute('data-unread');
    button.setAttribute('aria-label', 'Open Bottle Rocket Racing chat');
  }
  button.addEventListener('click', function () {
    resetLauncher();
    api.showWidget();
    api.maximize();
  });
  hook('onLoad', function () {
    if (api.isChatMaximized()) return;
    api.hideWidget();
    showLauncher();
  });
  hook('onChatMaximized', function () {
    resetLauncher();
    button.hidden = true;
  });
  hook('onChatMinimized', function () {
    api.hideWidget();
    showLauncher();
    button.focus({ preventScroll: true });
  });
  hook('onChatHidden', showLauncher);
  hook('onChatMessageAgent', function () {
    if (!api.isChatMaximized()) {
      button.setAttribute('data-unread', 'true');
      button.setAttribute('aria-label', 'New message from Bottle Rocket Racing. Open chat');
    }
  });
}());
