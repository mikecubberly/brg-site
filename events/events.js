(() => {
  // Keep completed events out of the upcoming section using UTC calendar dates.
  const today = new Date().toISOString().slice(0, 10);
  const cards = Array.from(document.querySelectorAll('[data-event-end]'));
  cards.forEach(card => { card.hidden = card.dataset.eventEnd < today; });
  const section = document.getElementById('upcoming');
  if (section && cards.length && cards.every(card => card.hidden)) section.hidden = true;
})();
