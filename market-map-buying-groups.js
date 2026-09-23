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

  const buyingGroups = {
    'mfg-aster': [
      ['Priority','Mock signal: recently discussed standardizing performance reporting across sites.','Likely owns the operating outcome and can confirm urgency.'],
      ['Champion','Mock signal: appears on the internal systems steering team.','Close to the systems and handoffs that would make the work actionable.'],
      ['Quinn Foster','Director of Business Transformation','2 years',41,'Alternative','Mock signal: led a cross-functional process redesign last quarter.','A credible route into the initiative if the executive owner is not accessible.']
    ],
    'mfg-forge': [
      ['Priority','Mock signal: sponsored the new production-line announcement.','Likely accountable for the expansion and its operating model.'],
      ['Champion','Mock signal: is listed on the plant systems implementation team.','Can validate workflow friction and the current technology landscape.'],
      ['Sofia Martinez','Continuous Improvement Director','4 years',42,'Alternative','Mock signal: shared a process-improvement scorecard with plant leaders.','Can connect the expansion to measurable operational priorities.']
    ],
    'mfg-northline': [
      ['Priority','Mock signal: named executive sponsor for the modernization program.','Owns the business case and cross-site alignment.'],
      ['Champion','Mock signal: leads the technical workstream for the ERP program.','Has direct evidence of system gaps, dependencies, and timing.'],
      ['Malik Turner','Program Management Director','3 years',43,'Alternative','Mock signal: coordinates the first-phase rollout across facilities.','Can verify scope and provide a practical path to the wider team.']
    ],
    'mfg-meridian': [
      ['Priority','Mock signal: oversees capacity and delivery across contract sites.','Likely owns the operating priorities if a trigger emerges.'],
      ['Champion','Mock signal: runs the continuous-improvement cadence.','Would see process friction early and help quantify it.'],
      ['Grace Han','VP Supply Chain','5 years',44,'Alternative','Mock signal: recently reviewed supplier and production planning controls.','Offers a second executive route when the issue crosses operations and supply chain.']
    ],
    'sc-linkfield': [
      ['Priority','Mock signal: announced the supplier-consolidation program.','Likely owns the program outcome and executive alignment.'],
      ['Champion','Mock signal: leads vendor segmentation and sourcing governance.','Can explain the supplier decisions, process, and data required.'],
      ['Olivia Brooks','Director of Supplier Strategy','4 years',45,'Alternative','Mock signal: published a supplier scorecard framework internally.','A practical alternate route with direct evidence of the program design.']
    ],
    'sc-arcwell': [
      ['Priority','Mock signal: hired to establish a global planning function.','The new mandate makes this person the most likely owner of change.'],
      ['Champion','Mock signal: built the forecasting dashboard used in monthly reviews.','Can validate data quality, adoption, and handoff problems.'],
      ['Adrian Keller','Finance Transformation Lead','3 years',46,'Alternative','Mock signal: supports the planning and finance operating-model review.','Can connect forecast quality to financial impact and executive priorities.']
    ],
    'sc-sable': [
      ['Priority','Mock signal: leads the network-redesign workstream.','Likely owns the problem definition and desired future state.'],
      ['Champion','Mock signal: is evaluating the systems required for the redesign.','Can validate technical constraints and implementation readiness.'],
      ['Naomi Price','Supply Chain Program Lead','2 years',47,'Alternative','Mock signal: coordinates stakeholder interviews across the network.','A strong alternate route with visibility into the full decision group.']
    ],
    'sc-keystone': [
      ['Priority','Mock signal: owns enterprise inventory performance.','Most likely to sponsor action when a meaningful trigger appears.'],
      ['Champion','Mock signal: runs weekly inventory exception reviews.','Close to the daily symptoms and measurable operational impact.'],
      ['Ethan Park','Inventory Systems Manager','6 years',48,'Alternative','Mock signal: maintains the systems behind replenishment and reporting.','Can verify the data and workflow issues behind any future initiative.']
    ],
    'log-pineward': [
      ['Priority','Mock signal: executive sponsor for the new regional hub.','Likely owns launch success, capacity, and operating readiness.'],
      ['Champion','Mock signal: is staffing and standing up the region.','Has direct visibility into launch dependencies and early bottlenecks.'],
      ['Tessa Morgan','Hub Launch Director','1 year',49,'Alternative','Mock signal: coordinates the hub opening plan across functions.','A timely alternate contact with hands-on responsibility for execution.']
    ],
    'log-cinder': [
      ['Priority','Mock signal: requested a review of brokerage workflows.','Likely owns the operational case for a TMS change.'],
      ['Champion','Mock signal: is documenting current integrations and process gaps.','Can provide the technical proof needed to qualify the initiative.'],
      ['Victor Shah','Chief Technology Officer','4 years',50,'Alternative','Mock signal: referenced platform consolidation in a leadership update.','An executive alternative who can confirm priority, scope, and timing.']
    ],
    'log-harborlane': [
      ['Priority','Mock signal: sponsors the enterprise customer experience program.','Likely owns the commercial impact of onboarding performance.'],
      ['Champion','Mock signal: tracks warehouse readiness for new customer launches.','Can pinpoint the operating handoffs that create risk.'],
      ['Camille Ross','Enterprise Implementation Lead','3 years',51,'Alternative','Mock signal: manages launch plans for the largest new accounts.','A practical route to evidence, timing, and the working team.']
    ],
    'log-lumen': [
      ['Priority','Mock signal: owns delivery performance across the network.','Most likely to sponsor action when expansion or service changes occur.'],
      ['Champion','Mock signal: runs the network capacity and exception process.','Can validate where operational pressure is building.'],
      ['Daniel Reyes','VP Customer Operations','5 years',52,'Alternative','Mock signal: leads service reviews for strategic customers.','Can connect operational issues to retention and customer impact.']
    ],
    'sw-marrow': [
      ['Priority','Mock signal: announced the operating plan for a second product line.','Likely owns cross-functional readiness and the executive outcome.'],
      ['Champion','Mock signal: is redesigning pipeline and customer handoffs.','Can validate where the expansion is stressing the revenue system.'],
      ['Hana Kim','Director of Customer Operations','4 years',53,'Alternative','Mock signal: built the new-product onboarding checklist.','A direct route to customer journey evidence and implementation detail.']
    ],
    'sw-nexora': [
      ['Priority','Mock signal: joined with a mandate to rebuild revenue operations.','The new role is the clearest owner of the potential change.'],
      ['Champion','Mock signal: is testing new acquisition channels and segments.','Can connect market experiments to operational needs.'],
      ['Andre Lewis','Chief Revenue Officer','2 years',54,'Alternative','Mock signal: referenced predictable growth as a current company priority.','An executive route for confirming urgency, budget, and sponsorship.']
    ],
    'sw-tandem': [
      ['Priority','Mock signal: is leading the move into enterprise accounts.','Likely owns the commercial outcome and buying decision.'],
      ['Champion','Mock signal: is building the first enterprise sales playbook.','Close to the daily motion and able to validate execution gaps.'],
      ['Elena Vasquez','Director of GTM Strategy','2 years',55,'Alternative','Mock signal: mapped the initial enterprise segments and use cases.','A strong route into targeting, positioning, and market-priority evidence.']
    ],
    'sw-atlas': [
      ['Priority','Mock signal: owns retention and expansion across the customer base.','Most likely to sponsor work when a customer trigger appears.'],
      ['Champion','Mock signal: leads roadmap reviews with strategic customers.','Can surface unmet needs and product-workflow friction.'],
      ['Marcus Boyd','Revenue Systems Lead','3 years',56,'Alternative','Mock signal: maintains the customer and revenue data model.','Can verify the operational data behind any growth initiative.']
    ],
    'svc-bellwether': [
      ['Priority','Mock signal: announced the launch of a new advisory practice.','Likely owns the investment, positioning, and early revenue target.'],
      ['Champion','Mock signal: is developing the new practice offer and delivery model.','Can validate buyer fit, proof points, and launch needs.'],
      ['Rachel Chen','Director of Practice Operations','4 years',57,'Alternative','Mock signal: built the practice launch plan and operating cadence.','A practical alternate route with direct visibility into execution.']
    ],
    'svc-cedar': [
      ['Priority','Mock signal: selected the first vertical for expansion.','Likely owns the growth target and final prioritization decision.'],
      ['Champion','Mock signal: is adapting the offer for the new buyer group.','Can validate messaging, proof, and client-fit requirements.'],
      ['Omar Patel','Head of Demand Generation','2 years',58,'Alternative','Mock signal: is building the first vertical campaign.','A direct route into channel readiness, targeting, and early response data.']
    ],
    'svc-westward': [
      ['Priority','Mock signal: joined to build a more repeatable sales motion.','The new hire is the clearest day-to-day owner of growth change.'],
      ['Champion','Mock signal: sponsors the commercial plan and account strategy.','Can provide executive context and open the wider leadership team.'],
      ['Nicole Grant','Strategy Director','5 years',59,'Alternative','Mock signal: leads positioning work for the studio’s priority sectors.','Can connect market focus to client proof and sales conversations.']
    ],
    'svc-northstar': [
      ['Priority','Mock signal: owns the company strategy and service portfolio.','Most likely to sponsor action when a meaningful trigger emerges.'],
      ['Champion','Mock signal: runs the customer feedback and renewal cadence.','Can identify recurring buyer needs and service gaps.'],
      ['Peter Wallace','VP Partnerships','3 years',60,'Alternative','Mock signal: is testing new routes to market with ecosystem partners.','An alternate path into growth priorities and external demand signals.']
    ]
  };

  Object.values(sectors).forEach(sector => {
    sector.accounts.forEach(account => {
      const group = buyingGroups[account.id];
      account.people = account.people.map((person,index) => [...person,...group[index]]);
      account.people.push(group[2]);
    });
  });

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
    const [name,title,tenure,,rank,proof,reason] = person;
    const card = make('div','detail-person');
    const copy = make('div','detail-person-copy');
    copy.append(make('span',`person-rank rank-${rank.toLowerCase()}`,rank),make('strong','',name),make('span','',title),make('small','',`${tenure} at company`));
    const linkedIn = make('span','person-linkedin','in');
    linkedIn.setAttribute('role','img');
    linkedIn.setAttribute('aria-label','LinkedIn profile indicator, illustrative only');
    linkedIn.title = 'Illustrative profile, not a live link';
    const evidence = make('div','person-evidence');
    evidence.append(make('p','person-proof',proof),make('p','person-reason',`Why mapped: ${reason}`));
    card.append(portrait(person,'detail-person-photo'),copy,linkedIn,evidence);
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
    people.append(make('span','detail-label','Ranked buying group'),make('p','detail-people-note','Priority, Champion, and Alternative with fictional evidence to illustrate the research model.'));
    account.people.forEach(person => people.append(personCard(person)));
    const why = make('div','detail-line');
    why.append(make('span','detail-label','Why now'),make('p','',account.why));
    const next = make('div','detail-next');
    next.append(make('span','detail-label','Next move'),make('p','',account.next));
    detail.append(top,signal,people,why,next,make('p','detail-note','Illustrative only. Companies, people, roles, tenure, signals, and evidence are fictional.'));
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
      account.people.forEach(person => {
        const image = portrait(person,'node-person-photo');
        image.title = `${person[0]} · ${person[4]}`;
        people.append(image);
      });
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
