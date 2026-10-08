(() => {
  const buttons = Array.from(document.querySelectorAll('[data-panel]'));
  const panels = Array.from(document.querySelectorAll('.demo-panel'));
  function show() {
    const requested = location.hash.slice(1);
    const selected = panels.some(panel => panel.id === requested) ? requested : 'audience';
    panels.forEach(panel => { panel.hidden = panel.id !== selected; });
    buttons.forEach(button => {
      if (button.dataset.panel === selected) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
  }
  buttons.forEach(button => button.addEventListener('click', () => {
    history.replaceState(null, '', '#' + button.dataset.panel);
    show();
  }));
  window.addEventListener('hashchange', show);
  show();
})();
