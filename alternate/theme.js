(function () {
  'use strict';

  var root = document.documentElement;
  var toggle = document.getElementById('theme-toggle');
  var label = document.getElementById('theme-toggle-label');
  var themeColor = document.querySelector('meta[name="theme-color"]');

  // Each visit opens in the original white theme. Switching stays on this page.
  toggle.addEventListener('click', function () {
    var dark = root.dataset.theme !== 'dark';
    root.dataset.theme = dark ? 'dark' : 'light';
    toggle.setAttribute('aria-checked', String(dark));
    label.textContent = dark ? 'Dark' : 'Light';
    themeColor.setAttribute('content', dark ? '#050506' : '#ffffff');
  });
})();
