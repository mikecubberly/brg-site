(() => {
  const app = document.getElementById('market-map-app');
  if (!app) return;

  // All accounts, people, logos, and signals in this example are fictional.
  const accounts = [
    { id:'aster', name:'Aster Vale Systems', segment:'Operations software', fit:'strong', x:95,y:112, logo:'aster', signalShort:'New operations leader', rationale:'A multi-site operating model and a new operations owner make this a strong account to research now.', people:'VP Operations · IT Director', next:'Validate the leadership change and reporting scope before building the account brief.' },
    { id:'marrow', name:'Marrowline Cloud', segment:'Operations software', fit:'strong', x:355,y:72, logo:'marrow', signalShort:'Product expansion', rationale:'A growing service operation may need tighter handoffs between product, support, and revenue teams.', people:'COO · Revenue Operations', next:'Confirm how the expansion changes the workflow, then test a focused message.' },
    { id:'pine', name:'Pineward Logic', segment:'Operations software', fit:'explore', x:36,y:278, logo:'pine', signalShort:'Footprint unclear', rationale:'The use case looks relevant, but the operating footprint and buying structure still need evidence.', people:'Head of Operations · Systems Manager', next:'Verify site count and operating model before moving this account into a campaign.' },
    { id:'cinder', name:'Cinderfold Works', segment:'Industrial technology', fit:'strong', x:675,y:142, logo:'cinder', signalShort:'Facility modernization', rationale:'Several plants and an active modernization program suggest a timely coordination problem.', people:'VP Manufacturing · Program Director', next:'Verify project scope and timing, then map the people who own the initiative.' },
    { id:'tarn', name:'Tarn & Alder Labs', segment:'Industrial technology', fit:'explore', x:658,y:300, logo:'tarn', signalShort:'Relevant hiring pattern', rationale:'The team may have a coordination need, but hiring alone does not prove a funded project.', people:'General Manager · Engineering Lead', next:'Review the roles and clarify the operating model before prioritizing the account.' },
    { id:'bell', name:'Bellwether Field Co.', segment:'Field services', fit:'strong', x:330,y:294, logo:'bell', signalShort:'New service region', rationale:'A new region creates plausible handoff, dispatch, and reporting needs across a distributed team.', people:'Regional VP · Service Director', next:'Validate the launch plan and prepare a coordinated marketing and sales approach.' },
    { id:'lumen', name:'Lumenbrook Service', segment:'Field services', fit:'watch', x:548,y:422, logo:'lumen', signalShort:'No current trigger', rationale:'The company fits the segment, but there is not enough evidence to create urgency today.', people:'COO · Field Operations', next:'Keep it in the universe and revisit when a relevant change appears.' }
  ];
  const fitNames = { strong:'Strong fit', explore:'Explore', watch:'Watch' };
  const edges = [['aster','marrow'],['aster','pine'],['marrow','cinder'],['marrow','bell'],['cinder','tarn'],['pine','bell'],['bell','lumen'],['tarn','lumen']];
  const viewport = document.getElementById('market-map-viewport');
  const canvas = document.getElementById('market-map-canvas');
  const nodes = document.getElementById('market-map-nodes');
  const connections = document.getElementById('market-map-connections');
  const detail = document.getElementById('market-map-detail');
  const buttons = new Map();
  let selected = 'aster';
  let filter = 'all';

  const make = (tag, className, value) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (value !== undefined) element.textContent = value;
    return element;
  };

  const logo = (account, extra = '') => {
    const frame = make('span', `market-map-logo logo-${account.id} ${extra}`);
    const image = document.createElement('img');
    image.src = `/assets/market-map/${account.logo}.svg`;
    image.alt = '';
    image.width = 36;
    image.height = 36;
    frame.append(image);
    return frame;
  };

  function drawConnections() {
    connections.replaceChildren();
    edges.forEach(([from, to], index) => {
      const start = accounts.find(account => account.id === from);
      const end = accounts.find(account => account.id === to);
      const x1 = start.x + 94;
      const y1 = start.y + 34;
      const x2 = end.x + 94;
      const y2 = end.y + 34;
      const curve = Math.min(42, Math.abs(x1 - x2) * .1);
      const pathData = `M ${x1} ${y1} Q ${(x1 + x2) / 2} ${(y1 + y2) / 2 - curve} ${x2} ${y2}`;
      ['connection-base', 'connection-flow'].forEach(kind => {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('class', kind);
        path.setAttribute('d', pathData);
        path.style.animationDelay = `${index * -.65}s`;
        const muted = filter !== 'all' && (start.fit !== filter || end.fit !== filter);
        path.classList.toggle('is-muted', muted);
        path.classList.toggle('is-linked', from === selected || to === selected);
        connections.append(path);
      });
    });
  }

  function renderDetail(id) {
    const account = accounts.find(item => item.id === id);
    if (!account) return;
    selected = id;
    buttons.forEach((button, key) => button.setAttribute('aria-pressed', String(key === id)));
    detail.replaceChildren();

    const top = make('div', 'detail-top');
    const identity = make('div', 'detail-identity');
    identity.append(make('p', 'detail-eyebrow', 'Selected account'), make('h3', '', account.name), make('p', 'detail-segment', account.segment));
    top.append(logo(account, 'detail-logo'), identity, make('span', `market-map-fit fit-${account.fit}`, fitNames[account.fit]));
    const signal = make('div', 'detail-signal');
    signal.append(make('span', 'detail-label', 'Signal'), make('strong', '', account.signalShort));
    const why = make('div', 'detail-line');
    why.append(make('span', 'detail-label', 'Why now'), make('p', '', account.rationale));
    const people = make('div', 'detail-line');
    people.append(make('span', 'detail-label', 'People'), make('p', '', account.people));
    const next = make('div', 'detail-next');
    next.append(make('span', 'detail-label', 'Next move'), make('p', '', account.next));
    detail.append(top, signal, why, people, next, make('p', 'detail-note', 'Illustrative only. Real account work requires sources and human review.'));
    drawConnections();
  }

  function setFilter(value) {
    filter = value;
    app.querySelectorAll('[data-map-filter]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mapFilter === value)));
    accounts.forEach(account => {
      buttons.get(account.id).hidden = value !== 'all' && account.fit !== value;
    });
    const active = accounts.find(account => account.id === selected);
    if (value !== 'all' && active?.fit !== value) renderDetail(accounts.find(account => account.fit === value).id);
    drawConnections();
  }

  accounts.forEach((account, index) => {
    const button = make('button', 'market-map-node');
    button.type = 'button';
    button.dataset.account = account.id;
    button.style.left = `${account.x}px`;
    button.style.top = `${account.y}px`;
    button.style.setProperty('--node-delay', `${index * 85}ms`);
    button.style.setProperty('--drift-delay', `${index * -1.1}s`);
    button.setAttribute('aria-label', `Explore ${account.name}, ${fitNames[account.fit]}, ${account.signalShort}`);
    const copy = make('span', 'node-identity');
    copy.append(make('strong', '', account.name), make('span', 'node-meta', account.signalShort));
    const status = make('span', `node-status fit-${account.fit}`);
    status.setAttribute('aria-hidden', 'true');
    button.append(logo(account), copy, status);
    button.addEventListener('click', () => renderDetail(account.id));
    nodes.append(button);
    buttons.set(account.id, button);
  });

  function fitCanvas() {
    const availableWidth = viewport.clientWidth;
    const scale = Math.min(1, availableWidth / 940);
    const left = Math.max(0, (availableWidth - 940 * scale) / 2);
    canvas.style.transform = `translateX(${left}px) scale(${scale})`;
  }

  app.querySelectorAll('[data-map-filter]').forEach(button => button.addEventListener('click', () => setFilter(button.dataset.mapFilter)));
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(fitCanvas, 100);
  });
  renderDetail(selected);
  fitCanvas();
})();
