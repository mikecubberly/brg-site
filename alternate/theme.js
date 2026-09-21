(function () {
  'use strict';

  var root = document.documentElement;
  var toggle = document.getElementById('theme-toggle');
  var label = document.getElementById('theme-toggle-label');
  var themeColor = document.querySelector('meta[name="theme-color"]');

  function applyTheme(dark) {
    root.dataset.theme = dark ? 'dark' : 'light';
    toggle.setAttribute('aria-checked', String(dark));
    label.textContent = dark ? 'Dark' : 'Light';
    themeColor.setAttribute('content', dark ? '#050506' : '#ffffff');
  }
  // Keep the selected theme while navigating between the homepage and contact.
  try { applyTheme(sessionStorage.getItem('brg-theme') !== 'light'); } catch (_) {}
  toggle.addEventListener('click', function () {
    var dark = root.dataset.theme !== 'dark';
    applyTheme(dark);
    try { sessionStorage.setItem('brg-theme', dark ? 'dark' : 'light'); } catch (_) {}
  });
})();
