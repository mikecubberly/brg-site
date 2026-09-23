(() => {
  const app = document.getElementById('market-map-app');
  if (!app) return;

  // Every company, person, signal, logo, and tenure below is fictional.
  const sectors = {
    manufacturing: {
      clusters: ['Production', 'Industrial technology', 'Operations'],
      accounts: [
        { id:'mfg-aster', name:'Aster Vale Systems', segment:'Industrial manufacturing', fit:'strong', x:95,y:115, logo:'aster', signal:'New operations leader', why:'A multi-site operating model and a new operations owner make this a strong account to research now.', next:'Validate the leadership change and reporting scope before building the account brief.', people:[['Maya Rowan','VP Operations','3 years',1],['Leo Venn','IT Director','6 years',2]] },
        { id:'mfg-forge', name:'Forgewell Components', segment:'Precision components', fit:'explore', x:375,y:70, logo:'cinder', signal:'Plant expansion', why:'A new production line could create coordination needs, but ownership and timing still need evidence.', next:'Confirm the expansion scope and identify the operational owner before activating the account.', people:[['Priya Hale','VP Manufacturing','5 years',3],['Jon Mercer','Plant Systems Lead','2 years',4]] },
        { id:'mfg-northline', name:'Northline Fabrication', segment:'Metal fabrication', fit:'strong', x:665,y:145, logo:'bell', signal:'ERP modernization', why:'Several facilities and an active systems initiative suggest a timely workflow problem.', next:'Map the modernization team and verify which plants are in the first phase.', people:[['Dana Ellis','Chief Operating Officer','4 years',5],['Owen Reed','Director of Technology','7 years',6]] },
        { id:'mfg-meridian', name:'Meridian Assembly', segment:'Contract manufacturing', fit:'watch', x:335,y:320, logo:'lumen', signal:'No current trigger', why:'The company fits the segment, but there is not enough evidence to create urgency today.', next:'Keep it in the universe and revisit when a relevant operational change appears.', people:[['Rae Collins','SVP Operations','8 years',7],['Theo March','Continuous Improvement Lead','3 years',8]] }
      ]
    },
    'supply-chain': {
      clusters: ['Planning', 'Procurement', 'Inventory'],
      accounts: [
        { id:'sc-linkfield', name:'Linkfield Network', segment:'Supply chain planning', fit:'strong', x:95,y:115, logo:'marrow', signal:'Supplier consolidation', why:'A supplier consolidation program creates a clear need for shared planning and visibility.', next:'Verify the program timeline and map planning, procurement, and finance ownership.', people:[['Nina Solis','Chief Supply Chain Officer','2 years',9],['Kiran Moss','VP Procurement','5 years',10]] },
        { id:'sc-arcwell', name:'Arcwell Planning', segment:'Demand planning', fit:'strong', x:375,y:70, logo:'tarn', signal:'New global planning role', why:'A newly created planning role suggests a broader effort to standardize forecasting and handoffs.', next:'Confirm the mandate behind the role and identify the systems already in place.', people:[['Elena Park','VP Global Planning','1 year',11],['Seth Quinn','Director of Analytics','4 years',12]] },
        { id:'sc-sable', name:'Sable Route Systems', segment:'Supply network technology', fit:'explore', x:665,y:145, logo:'pine', signal:'Network redesign', why:'The redesign is relevant, but the buying problem and decision process remain unconfirmed.', next:'Research the initiative and separate the technical evaluators from the business owner.', people:[['Amira Vale','Head of Network Design','3 years',13],['Morgan Lee','Enterprise Systems Director','6 years',14]] },
        { id:'sc-keystone', name:'Keystone Inventory', segment:'Inventory operations', fit:'watch', x:335,y:320, logo:'aster', signal:'Stable footprint', why:'The operating model fits, but no current change suggests that the account needs attention now.', next:'Monitor for leadership, facility, or systems changes before prioritizing outreach.', people:[['Jules Mercer','SVP Inventory','9 years',15],['Tara Wynn','Director of Operations','5 years',16]] }
      ]
    },
    logistics: {
      clusters: ['Freight', 'Warehousing', 'Last mile'],
      accounts: [
        { id:'log-pineward', name:'Pineward Logistics', segment:'Regional logistics', fit:'strong', x:95,y:115, logo:'pine', signal:'New regional hub', why:'A new hub creates immediate questions around staffing, systems, customer handoffs, and capacity.', next:'Verify the launch date and map the leaders responsible for the new region.', people:[['Caleb Ford','Chief Operating Officer','4 years',17],['Imani Brooks','Regional VP','2 years',18]] },
        { id:'log-cinder', name:'Cinderfold Freight', segment:'Freight brokerage', fit:'explore', x:375,y:70, logo:'cinder', signal:'TMS review', why:'A technology review may be relevant, but the scope and executive sponsor are not yet clear.', next:'Confirm whether the review is active and identify the operational and technical owners.', people:[['Avery Chen','VP Brokerage Operations','5 years',19],['Marcus Hill','Director of Technology','3 years',20]] },
        { id:'log-harborlane', name:'Harborlane 3PL', segment:'Third-party logistics', fit:'strong', x:665,y:145, logo:'marrow', signal:'Customer expansion', why:'New enterprise customers can expose gaps across implementation, warehouse, and account teams.', next:'Map the onboarding workflow and validate where customer handoffs are slowing down.', people:[['Lena Ortiz','Chief Customer Officer','2 years',21],['David Kim','VP Warehouse Operations','7 years',22]] },
        { id:'log-lumen', name:'Lumenbrook Delivery', segment:'Last-mile delivery', fit:'watch', x:335,y:320, logo:'lumen', signal:'No current trigger', why:'The account fits the broad profile, but there is no verified change to support immediate action.', next:'Keep the account monitored and reassess when a new market or service launches.', people:[['Simone Grant','SVP Delivery','6 years',23],['Arjun Mehta','Director of Network Operations','4 years',24]] }
      ]
    },
    software: {
      clusters: ['Cloud platforms', 'Revenue systems', 'AI workflows'],
      accounts: [
        { id:'sw-marrow', name:'Marrowline Cloud', segment:'Operations software', fit:'strong', x:95,y:115, logo:'marrow', signal:'Product expansion', why:'A second product line may require tighter handoffs between product, support, and revenue teams.', next:'Confirm how the expansion changes the customer journey, then test a focused message.', people:[['Caroline Wu','Chief Operating Officer','3 years',25],['Evan Brooks','VP Revenue Operations','2 years',26]] },
        { id:'sw-nexora', name:'Nexora Systems', segment:'Revenue software', fit:'explore', x:375,y:70, logo:'tarn', signal:'New RevOps leader', why:'The leadership change is relevant, but current priorities and budget are still unknown.', next:'Validate the new leader’s mandate and research the existing growth systems.', people:[['Danielle Price','VP Revenue Operations','1 year',27],['Noah Fischer','Director of Growth','4 years',28]] },
        { id:'sw-tandem', name:'Tandem Peak AI', segment:'Applied AI software', fit:'strong', x:665,y:145, logo:'aster', signal:'Enterprise motion', why:'A move upmarket creates new demands across targeting, enablement, and sales execution.', next:'Map the enterprise team and clarify which market segments are being prioritized.', people:[['Aisha Rahman','Chief Revenue Officer','2 years',29],['Lucas Bennett','VP Enterprise Sales','3 years',30]] },
        { id:'sw-atlas', name:'Blue Atlas Platform', segment:'Workflow software', fit:'watch', x:335,y:320, logo:'bell', signal:'No current trigger', why:'The company fits the market, but there is too little evidence to prioritize it now.', next:'Review during the next market refresh or when a relevant hiring or product signal appears.', people:[['Meera Nair','Chief Customer Officer','5 years',31],['Grant Holloway','VP Product','6 years',32]] }
      ]
    },
    services: {
      clusters: ['Advisory', 'Digital services', 'Enablement'],
      accounts: [
        { id:'svc-bellwether', name:'Bellwether Advisory', segment:'Business advisory', fit:'strong', x:95,y:115, logo:'bell', signal:'New practice launch', why:'A new practice needs a clear market, credible positioning, and a coordinated path to early pipeline.', next:'Define the target market and map the partners responsible for the launch.', people:[['Mateo Silva','Managing Partner','8 years',33],['Rina Shah','Practice Lead','2 years',34]] },
        { id:'svc-cedar', name:'Cedarworks Digital', segment:'Digital services', fit:'strong', x:375,y:70, logo:'pine', signal:'Vertical expansion', why:'A vertical expansion creates a timely need for account mapping, proof points, and focused outreach.', next:'Confirm the first vertical and build an evidence-based account universe around it.', people:[['Jordan Cole','Chief Growth Officer','3 years',35],['Fatima Adeyemi','VP Client Strategy','5 years',36]] },
        { id:'svc-westward', name:'Westward Studio', segment:'Brand and experience', fit:'explore', x:665,y:145, logo:'tarn', signal:'Senior sales hire', why:'The hire suggests growth intent, but the target market and sales motion are still unclear.', next:'Research the new leader’s remit and separate service fit from simple hiring activity.', people:[['Claire Donovan','VP Business Development','1 year',37],['Kenji Sato','Managing Director','7 years',38]] },
        { id:'svc-northstar', name:'Northstar Enablement', segment:'Sales enablement', fit:'watch', x:335,y:320, logo:'lumen', signal:'Stable team', why:'The company matches the category, but no visible change supports immediate prioritization.', next:'Keep it in the universe and revisit when leadership, positioning, or service scope changes.', people:[['Malik Johnson','Founder and CEO','10 years',39],['Yuna Lee','Director of Client Success','4 years',40]] }
      ]
    }
  };

  const fitNames = { strong:'Strong fit', explore:'Explore', watch:'Watch' };
  const edgeIndexes = [[0,1],[0,3],[1,2],[1,3],[2,3]];
  const viewport = document.getElementById('market-map-viewport');
  const canvas = document.getElementById('market-map-canvas');
  const nodes = document.getElementById('market-map-nodes');
  const connections = document.getElementById('market-map-connections');
  const detail = document.getElementById('market-map-detail');
  const clusterLabels = [...canvas.querySelectorAll('.market-map-cluster')];
  let sectorKey = 'manufacturing';
  let filter = 'all';
  let selectedId = sectors[sectorKey].accounts[0].id;
  let buttons = new Map();

  const make = (tag, className, value) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (value !== undefined) element.textContent = value;
    return element;
  };

  const portraitPath = number => `/assets/market-map/people/person-${String(number).padStart(2,'0')}.png`;
  const portrait = ([name,,,number], className = '') => {
    const image = document.createElement('img');
    image.className = className;
    image.src = portraitPath(number);
    image.alt = `${name}, fictional professional`;
    image.width = 48;
    image.height = 48;
    image.loading = 'lazy';
    return image;
  };

  const logo = (account, extra = '') => {
    const frame = make('span', `market-map-logo logo-${account.logo} ${extra}`);
    const image = document.createElement('img');
    image.src = `/assets/market-map/${account.logo}.svg`;
    image.alt = '';
    image.width = 36;
    image.height = 36;
    frame.append(image);
    return frame;
  };

  function activeAccounts() {
    return sectors[sectorKey].accounts;
  }

  function drawConnections() {
    connections.replaceChildren();
    const accounts = activeAccounts();
    edgeIndexes.forEach(([fromIndex,toIndex], index) => {
      const start = accounts[fromIndex];
      const end = accounts[toIndex];
      const x1 = start.x + 94;
      const y1 = start.y + 34;
      const x2 = end.x + 94;
      const y2 = end.y + 34;
      const curve = Math.min(42, Math.abs(x1 - x2) * .1);
      const pathData = `M ${x1} ${y1} Q ${(x1 + x2) / 2} ${(y1 + y2) / 2 - curve} ${x2} ${y2}`;
      ['connection-base','connection-flow'].forEach(kind => {
        const path = document.createElementNS('http://www.w3.org/2000/svg','path');
        path.setAttribute('class', kind);
        path.setAttribute('d', pathData);
        path.style.animationDelay = `${index * -.75}s`;
        const muted = filter !== 'all' && (start.fit !== filter || end.fit !== filter);
        path.classList.toggle('is-muted', muted);
        path.classList.toggle('is-linked', start.id === selectedId || end.id === selectedId);
        connections.append(path);
      });
    });
  }

  function personCard(person) {
    const [name,title,tenure] = person;
    const card = make('div','detail-person');
    const copy = make('div','detail-person-copy');
    copy.append(make('strong','',name),make('span','',title),make('small','',`${tenure} at company`));
    const linkedIn = make('span','person-linkedin','in');
    linkedIn.setAttribute('role','img');
    linkedIn.setAttribute('aria-label','LinkedIn profile indicator, illustrative only');
    linkedIn.title = 'Illustrative profile, not a live link';
    card.append(portrait(person,'detail-person-photo'),copy,linkedIn);
    return card;
  }

  function renderDetail(id) {
    const account = activeAccounts().find(item => item.id === id);
    if (!account) return;
    selectedId = id;
    buttons.forEach((button,key) => button.setAttribute('aria-pressed',String(key === id)));
    detail.replaceChildren();
    const top = make('div','detail-top');
    const identity = make('div','detail-identity');
    identity.append(make('p','detail-eyebrow','Selected account'),make('h3','',account.name),make('p','detail-segment',account.segment));
    top.append(logo(account,'detail-logo'),identity,make('span',`market-map-fit fit-${account.fit}`,fitNames[account.fit]));
    const signal = make('div','detail-signal');
    signal.append(make('span','detail-label','Signal'),make('strong','',account.signal));
    const people = make('div','detail-people');
    people.append(make('span','detail-label','People to map'));
    account.people.forEach(person => people.append(personCard(person)));
    const why = make('div','detail-line');
    why.append(make('span','detail-label','Why now'),make('p','',account.why));
    const next = make('div','detail-next');
    next.append(make('span','detail-label','Next move'),make('p','',account.next));
    detail.append(top,signal,people,why,next,make('p','detail-note','Illustrative only. Companies, people, roles, tenure, and signals are fictional.'));
    drawConnections();
  }

  function renderNodes() {
    nodes.replaceChildren();
    buttons = new Map();
    activeAccounts().forEach((account,index) => {
      const button = make('button','market-map-node');
      button.type = 'button';
      button.dataset.account = account.id;
      button.style.left = `${account.x}px`;
      button.style.top = `${account.y}px`;
      button.style.setProperty('--node-delay',`${index * 90}ms`);
      button.style.setProperty('--drift-delay',`${index * -1.25}s`);
      button.setAttribute('aria-label',`Explore ${account.name}, ${fitNames[account.fit]}, ${account.signal}`);
      const copy = make('span','node-identity');
      copy.append(make('strong','',account.name),make('span','node-meta',account.signal));
      const status = make('span',`node-status fit-${account.fit}`);
      status.setAttribute('aria-hidden','true');
      const people = make('span','node-people');
      people.setAttribute('aria-hidden','true');
      account.people.forEach(person => people.append(portrait(person,'node-person-photo')));
      button.append(logo(account),copy,status,people);
      button.addEventListener('click',() => renderDetail(account.id));
      nodes.append(button);
      buttons.set(account.id,button);
    });
  }

  function setFilter(value) {
    filter = value;
    app.querySelectorAll('[data-map-filter]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.mapFilter === value)));
    activeAccounts().forEach(account => {
      buttons.get(account.id).hidden = value !== 'all' && account.fit !== value;
    });
    const selected = activeAccounts().find(account => account.id === selectedId);
    if (value !== 'all' && selected?.fit !== value) renderDetail(activeAccounts().find(account => account.fit === value).id);
    drawConnections();
  }

  function setSector(value) {
    if (!sectors[value]) return;
    sectorKey = value;
    filter = 'all';
    selectedId = activeAccounts()[0].id;
    app.querySelectorAll('[data-map-sector]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.mapSector === value)));
    app.querySelectorAll('[data-map-filter]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.mapFilter === 'all')));
    sectors[value].clusters.forEach((label,index) => { clusterLabels[index].textContent = label; });
    renderNodes();
    renderDetail(selectedId);
    fitCanvas();
  }

  function fitCanvas() {
    if (window.innerWidth <= 520) {
      canvas.style.transform = 'none';
      return;
    }
    const scale = Math.min(1,viewport.clientWidth / 940);
    const left = Math.max(0,(viewport.clientWidth - 940 * scale) / 2);
    canvas.style.transform = `translateX(${left}px) scale(${scale})`;
  }

  app.querySelectorAll('[data-map-filter]').forEach(button => button.addEventListener('click',() => setFilter(button.dataset.mapFilter)));
  app.querySelectorAll('[data-map-sector]').forEach(button => button.addEventListener('click',() => setSector(button.dataset.mapSector)));
  let resizeTimer;
  window.addEventListener('resize',() => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(fitCanvas,100);
  });

  setSector(sectorKey);
})();
