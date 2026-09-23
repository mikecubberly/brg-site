(() => {
  const app = document.getElementById('market-map-app');
  if (!app) return;

  // Every record below is invented for this visual example.
  const accounts = [
    { id: 'aster', name: 'Aster Vale Systems', segment: 'Operations software', fit: 'Strong', x: 120, y: 150, signal: 'Illustrative signal: a new operations leader is evaluating reporting workflows.', people: 'Maya Rowan, VP Operations; Leo Venn, IT Director', owner: 'Marketing + account executive', next: 'Build an account brief, then test a tailored operations campaign.' },
    { id: 'marrow', name: 'Marrowline Cloud', segment: 'Operations software', fit: 'Strong', x: 285, y: 272, signal: 'Illustrative signal: a product expansion creates a possible workflow gap.', people: 'Nina Solis, COO; Theo March, RevOps Lead', owner: 'Marketing', next: 'Validate the expansion and add the account to the relevant ABM audience.' },
    { id: 'pine', name: 'Pineward Logic', segment: 'Operations software', fit: 'Explore', x: 20, y: 293, signal: 'No verified change yet. Fit is plausible, timing is unknown.', people: 'Amira Vale, Head of Operations; Owen Reed, Systems Manager', owner: 'Research', next: 'Confirm company fit and monitor for a specific trigger before outreach.' },
    { id: 'cinder', name: 'Cinderfold Works', segment: 'Industrial technology', fit: 'Strong', x: 500, y: 159, signal: 'Illustrative signal: a facility modernization project has been announced.', people: 'Jules Mercer, VP Manufacturing; Priya Hale, Program Director', owner: 'Account executive', next: 'Verify project scope and prepare a focused account plan.' },
    { id: 'tarn', name: 'Tarn & Alder Labs', segment: 'Industrial technology', fit: 'Explore', x: 620, y: 282, signal: 'Illustrative signal: a relevant hiring pattern, with no confirmed initiative.', people: 'Elena Park, General Manager; Seth Quinn, Engineering Lead', owner: 'Research', next: 'Review the underlying roles and decide whether the hypothesis holds.' },
    { id: 'bell', name: 'Bellwether Field Co.', segment: 'Field services', fit: 'Strong', x: 382, y: 385, signal: 'Illustrative signal: a new service region may require team coordination.', people: 'Rae Collins, Regional VP; Kiran Moss, Service Director', owner: 'Marketing + sales', next: 'Test a regional campaign and prepare a relevant sales follow-up.' },
    { id: 'lumen', name: 'Lumenbrook Service', segment: 'Field services', fit: 'Watch', x: 585, y: 450, signal: 'No verified near-term signal. Account appears to fit the segment.', people: 'Dana Ellis, COO; Morgan Lee, Field Operations Lead', owner: 'Marketing', next: 'Keep in the account universe and review at the next refresh.' }
  ];

  const viewport = document.getElementById('market-map-viewport');
  const canvas = document.getElementById('market-map-canvas');
  const nodes = document.getElementById('market-map-nodes');
  const detail = document.getElementById('market-map-detail');
  const zoomLabel = document.getElementById('market-map-zoom');
  const positions = new Map(accounts.map(account => [account.id, { x: account.x, y: account.y }]));
  const buttons = new Map();
  let scale = 1;
  let pan = { x: 0, y: 0 };
  let selected = accounts[0].id;
  let gesture = null;

  function renderTransform() {
    canvas.style.transform = `translate(${pan.x}px, ${pan.y}px) scale(${scale})`;
    zoomLabel.textContent = `${Math.round(scale * 100)}%`;
  }

  function resetView(resetPositions = false) {
    if (resetPositions) accounts.forEach(account => positions.set(account.id, { x: account.x, y: account.y }));
    const narrow = viewport.clientWidth < 560;
    scale = narrow ? .85 : Math.min(1, (viewport.clientWidth - 18) / 820, (viewport.clientHeight - 18) / 570);
    pan = narrow ? { x: 0, y: -35 } : { x: (viewport.clientWidth - 820 * scale) / 2, y: (viewport.clientHeight - 570 * scale) / 2 };
    buttons.forEach((button, id) => place(button, positions.get(id)));
    renderTransform();
  }

  function place(button, point) {
    button.style.left = `${point.x}px`;
    button.style.top = `${point.y}px`;
  }

  function infoRow(label, value) {
    const row = document.createElement('div');
    const dt = document.createElement('dt');
    const dd = document.createElement('dd');
    dt.textContent = label;
    dd.textContent = value;
    row.append(dt, dd);
    return row;
  }

  function select(id) {
    const account = accounts.find(item => item.id === id);
    if (!account) return;
    selected = id;
    buttons.forEach((button, key) => button.setAttribute('aria-pressed', String(key === id)));
    detail.replaceChildren();
    const eyebrow = document.createElement('span');
    eyebrow.className = 'detail-eyebrow';
    eyebrow.textContent = 'Account intelligence / fictional';
    const title = document.createElement('h3');
    title.textContent = account.name;
    const segment = document.createElement('p');
    segment.className = 'detail-segment';
    segment.textContent = account.segment;
    const list = document.createElement('dl');
    list.append(
      infoRow('Account fit', account.fit),
      infoRow('Buying roles', account.people),
      infoRow('Evidence to examine', account.signal),
      infoRow('Suggested owner', account.owner),
      infoRow('Next action', account.next)
    );
    const note = document.createElement('p');
    note.className = 'detail-note';
    note.textContent = 'Example only. In real work, every signal and person would need a source, date, and review status.';
    detail.append(eyebrow, title, segment, list, note);
  }

  accounts.forEach(account => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'market-map-node';
    button.dataset.account = account.id;
    button.setAttribute('aria-label', `Explore ${account.name}, ${account.segment}`);
    const top = document.createElement('span');
    top.className = 'node-top';
    const category = document.createElement('span');
    category.textContent = account.segment;
    const dot = document.createElement('span');
    dot.className = 'node-dot';
    dot.setAttribute('aria-hidden', 'true');
    top.append(category, dot);
    const name = document.createElement('strong');
    name.textContent = account.name;
    const foot = document.createElement('span');
    foot.className = 'node-foot';
    foot.textContent = `${account.fit} fit · View account`;
    button.append(top, name, foot);
    place(button, positions.get(account.id));
    button.addEventListener('click', event => { if (event.detail === 0) select(account.id); });
    nodes.append(button);
    buttons.set(account.id, button);
  });

  viewport.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    const button = event.target.closest('.market-map-node');
    gesture = { id: button?.dataset.account || null, x: event.clientX, y: event.clientY, startPan: { ...pan }, startPoint: button ? { ...positions.get(button.dataset.account) } : null, moved: false };
    viewport.setPointerCapture(event.pointerId);
    viewport.classList.add('is-dragging');
    button?.classList.add('is-dragging');
    event.preventDefault();
  });

  viewport.addEventListener('pointermove', event => {
    if (!gesture) return;
    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;
    if (Math.hypot(dx, dy) > 4) gesture.moved = true;
    if (!gesture.moved) return;
    if (gesture.id) {
      const point = { x: Math.max(0, Math.min(650, gesture.startPoint.x + dx / scale)), y: Math.max(0, Math.min(485, gesture.startPoint.y + dy / scale)) };
      positions.set(gesture.id, point);
      place(buttons.get(gesture.id), point);
    } else {
      pan = { x: gesture.startPan.x + dx, y: gesture.startPan.y + dy };
      renderTransform();
    }
  });

  function finishGesture() {
    if (!gesture) return;
    if (gesture.id && !gesture.moved) select(gesture.id);
    buttons.forEach(button => button.classList.remove('is-dragging'));
    viewport.classList.remove('is-dragging');
    gesture = null;
  }
  viewport.addEventListener('pointerup', finishGesture);
  viewport.addEventListener('pointercancel', finishGesture);

  app.querySelectorAll('[data-map-zoom]').forEach(button => button.addEventListener('click', () => {
    const next = Math.max(.6, Math.min(1.45, scale + (button.dataset.mapZoom === 'in' ? .15 : -.15)));
    const centre = { x: viewport.clientWidth / 2, y: viewport.clientHeight / 2 };
    pan = { x: centre.x - (centre.x - pan.x) * next / scale, y: centre.y - (centre.y - pan.y) * next / scale };
    scale = next;
    renderTransform();
  }));
  app.querySelector('[data-map-reset]').addEventListener('click', () => resetView(true));
  let resizeTimer;
  window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => resetView(), 120); });
  select(selected);
  resetView();
})();
