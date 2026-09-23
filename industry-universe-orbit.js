(() => {
  const app = document.getElementById('market-map-app');
  if (!app) return;

  // This is a fictional product demonstration. Every company, person, signal, and score is illustrative.
  const canvasWidth = 980;
  const canvasHeight = 560;
  const clusterDefinitions = [
    {
      key:'manufacturing', label:'Manufacturing', center:[175,150],
      accounts:[
        ['Aster Vale Systems',89,'strong','New operations leader',510],
        ['Forgewell Components',75,'explore','Plant expansion',240],
        ['Alloy Peak Works',86,'strong','Capacity program',690],
        ['Meridian Assembly',61,'watch','Stable footprint',320],
        ['Northline Fabrication',94,'priority','ERP modernization',380],
        ['Redcrest Manufacturing',82,'strong','MES rollout',460],
        ['Timberline Precision',68,'watch','No current trigger',190],
        ['Harbor Forge',73,'explore','Pricing model change',275]
      ]
    },
    {
      key:'supply-chain', label:'Supply chain', center:[500,142],
      accounts:[
        ['Linkfield Network',92,'priority','Supplier consolidation',620],
        ['Arcwell Planning',88,'strong','New planning VP',410],
        ['Sable Route Systems',74,'explore','Network redesign',285],
        ['Keystone Inventory',60,'watch','Stable footprint',340],
        ['Crestline Sourcing',84,'strong','Category reset',530],
        ['Threadmark Supply',78,'explore','Forecasting review',225],
        ['Openfield Materials',65,'watch','No current trigger',175],
        ['Tracepoint Network',81,'strong','Vendor risk program',455]
      ]
    },
    {
      key:'logistics', label:'Logistics', center:[805,158],
      accounts:[
        ['Pineward Logistics',91,'priority','New regional hub',740],
        ['Cinderfold Freight',76,'explore','TMS review',430],
        ['Harborlane 3PL',87,'strong','Customer expansion',980],
        ['Lumenbrook Delivery',58,'watch','No current trigger',360],
        ['Stonepath Transport',83,'strong','Fleet expansion',525],
        ['Relay North',72,'explore','New service region',245],
        ['Atlas Dockworks',66,'watch','Stable footprint',310],
        ['Clearway Fulfillment',80,'strong','Warehouse automation',670]
      ]
    },
    {
      key:'industrial-tech', label:'Industrial technology', center:[185,405],
      accounts:[
        ['Cinderfold Works',90,'priority','Facility modernization',560],
        ['Tarn & Alder Labs',77,'explore','Relevant hiring pattern',220],
        ['Volterra Controls',85,'strong','Channel expansion',445],
        ['Kepler Motion',62,'watch','No current trigger',180],
        ['Signal Ridge Systems',82,'strong','Product launch',390],
        ['Foundry Grid',71,'explore','Partner program',265],
        ['Exacta Robotics',79,'strong','New plant customer',515],
        ['Halcyon Sensors',64,'watch','Stable leadership',205]
      ]
    },
    {
      key:'software', label:'Software', center:[510,410],
      accounts:[
        ['Marrowline Cloud',93,'priority','Product expansion',460],
        ['Nexora Systems',79,'explore','New RevOps leader',315],
        ['Tandem Peak AI',88,'strong','Enterprise motion',205],
        ['Blue Atlas Platform',63,'watch','No current trigger',280],
        ['Northstar Logic',84,'strong','Pricing redesign',370],
        ['Vectorlane Data',75,'explore','Vertical launch',190],
        ['Commonfield Ops',81,'strong','Sales team growth',425],
        ['Kiteframe Software',67,'watch','Stable footprint',155]
      ]
    },
    {
      key:'services', label:'Services', center:[815,405],
      accounts:[
        ['Bellwether Advisory',90,'priority','New practice launch',185],
        ['Cedarworks Digital',86,'strong','Vertical expansion',240],
        ['Westward Studio',74,'explore','Senior sales hire',95],
        ['Northstar Enablement',59,'watch','Stable team',125],
        ['Fieldnote Partners',82,'strong','Market repositioning',160],
        ['Juniper Collective',71,'explore','Service line launch',110],
        ['Mosaic Revenue Group',80,'strong','Partner expansion',145],
        ['Granite Bridge Co.',64,'watch','No current trigger',85]
      ]
    }
  ];

  const portraitPath = number => `/assets/market-map/people/person-${String(number).padStart(2,'0')}.png`;
  const signalDetails = {
    'New operations leader':['New operations leader','Leadership mandate appears broader than the previous role','Operating model review is likely underway'],
    'Plant expansion':['New production capacity announced','Operations hiring increased','Systems ownership is still unconfirmed'],
    'ERP modernization':['ERP modernization','CTO hired 5 months ago','3 ERP-related roles opened'],
    'Product expansion':['Second product line introduced','Customer operations team is growing','Revenue handoffs are being redesigned'],
    'New regional hub':['New regional hub announced','Launch hiring is active','Regional systems ownership is visible'],
    'Supplier consolidation':['Supplier consolidation program','Procurement leadership is newly aligned','Vendor governance roles are expanding']
  };
  const peoplePools = [
    [
      ['Dana Ellis','COO','Economic Buyer','Priority',5,'Executive sponsor'],
      ['Owen Reed','Director of Technology','Technical Champion','ERP research signal',6,'Active'],
      ['Rachel Kim','CFO','Financial Buyer','No active signal',43,'Quiet'],
      ['Malik Turner','Program Management Director','Project Champion','New role',44,'Active']
    ],
    [
      ['Nina Solis','Chief Supply Chain Officer','Economic Buyer','Priority',9,'Executive sponsor'],
      ['Kiran Moss','VP Procurement','Business Champion','Program activity',10,'Active'],
      ['Seth Quinn','Director of Analytics','Technical Evaluator','Research signal',12,'Active'],
      ['Grace Han','VP Operations','Alternative Route','No active signal',44,'Quiet']
    ],
    [
      ['Caleb Ford','Chief Operating Officer','Economic Buyer','Priority',17,'Executive sponsor'],
      ['Imani Brooks','Regional VP','Business Champion','Expansion signal',18,'Active'],
      ['Marcus Hill','Director of Technology','Technical Evaluator','Systems review',20,'Active'],
      ['Camille Ross','Implementation Lead','Project Champion','Launch activity',51,'Active']
    ],
    [
      ['Caroline Wu','Chief Operating Officer','Economic Buyer','Priority',25,'Executive sponsor'],
      ['Evan Brooks','VP Revenue Operations','Business Champion','Workflow signal',26,'Active'],
      ['Hana Kim','Director of Customer Operations','Project Champion','Hiring signal',53,'Active'],
      ['Grant Holloway','VP Product','Alternative Route','No active signal',32,'Quiet']
    ],
    [
      ['Mateo Silva','Managing Partner','Economic Buyer','Priority',33,'Executive sponsor'],
      ['Rina Shah','Practice Lead','Business Champion','Launch signal',34,'Active'],
      ['Omar Patel','Head of Demand Generation','Activation Lead','Campaign build',58,'Active'],
      ['Nicole Grant','Strategy Director','Alternative Route','No active signal',59,'Quiet']
    ]
  ];

  const accounts = [];
  let globalAccountIndex = 0;
  clusterDefinitions.forEach((cluster,clusterIndex) => {
    cluster.accounts.forEach((raw,index) => {
      const [name,fit,view,signal,employees] = raw;
      const id = `${cluster.key}-${index}`;
      const signalStrength = view === 'priority' ? 96 : view === 'strong' ? 78 + (index % 9) : view === 'explore' ? 58 : 28;
      const people = name === 'Northline Fabrication' ? peoplePools[0] : peoplePools[(clusterIndex + 1) % peoplePools.length];
      const portraits = name === 'Northline Fabrication' ? people.map(person => person[4]) : [0,1,2].map(offset => ((globalAccountIndex * 3 + offset) % 60) + 1);
      accounts.push({id,name,sector:cluster.key,sectorLabel:cluster.label,x:cluster.center[0],y:cluster.center[1],fit,view,signal,signalStrength,employees,people,portraits,logoSeed:globalAccountIndex});
      globalAccountIndex += 1;
    });
  });

  const viewport = document.getElementById('market-map-viewport');
  const canvas = document.getElementById('market-map-canvas');
  const nodesLayer = document.getElementById('market-map-nodes');
  const connections = document.getElementById('market-map-connections');
  const clustersLayer = document.getElementById('market-map-clusters');
  const committeeLayer = document.getElementById('market-map-committee');
  const detail = document.getElementById('market-map-detail');
  const identityCount = app.querySelector('.market-map-identity span');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let sectorFilter = 'manufacturing';
  let viewFilter = 'all';
  let selectedId = accounts.find(account => account.name === 'Northline Fabrication').id;
  let activeOrbitRings = [];
  let nodeButtons = new Map();
  let orbitPaused = false;
  let lastOrbitFrame = 0;

  const visible = account => (sectorFilter === 'all' || account.sector === sectorFilter) && (viewFilter === 'all' || account.view === viewFilter);
  const selectedAccount = () => accounts.find(account => account.id === selectedId);
  const make = (tag,className,text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };

  const sectorPalettes = {
    manufacturing:['#6d55d8','#f0a44b'],
    'supply-chain':['#13a777','#51c4d6'],
    logistics:['#2f77dc','#f2bd42'],
    'industrial-tech':['#ee684f','#f3a1aa'],
    software:['#169bd6','#8866e8'],
    services:['#d95d9f','#f0a34a']
  };

  function logoMark(account) {
    const frame = make('span','account-logo');
    const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('viewBox','0 0 32 32');
    svg.setAttribute('aria-hidden','true');
    const palette = sectorPalettes[account.sector];
    const variant = account.logoSeed % 6;
    const add = (tag,attributes) => {
      const shape = document.createElementNS('http://www.w3.org/2000/svg',tag);
      Object.entries(attributes).forEach(([key,value]) => shape.setAttribute(key,value));
      svg.append(shape);
    };
    if (variant === 0) {
      add('circle',{cx:12,cy:16,r:7,fill:palette[0]});
      add('circle',{cx:21,cy:16,r:7,fill:palette[1],opacity:.9});
    } else if (variant === 1) {
      add('rect',{x:7,y:7,width:18,height:18,rx:5,fill:palette[0]});
      add('path',{d:'M11 20 L16 10 L21 20 Z',fill:'#fff'});
    } else if (variant === 2) {
      add('path',{d:'M7 22 L13 8 H18 L12 22 Z',fill:palette[0]});
      add('path',{d:'M15 22 L21 8 H26 L20 22 Z',fill:palette[1]});
    } else if (variant === 3) {
      add('path',{d:'M16 5 L27 16 L16 27 L5 16 Z',fill:palette[0]});
      add('circle',{cx:16,cy:16,r:4.5,fill:'#fff'});
    } else if (variant === 4) {
      add('circle',{cx:16,cy:16,r:10,fill:'none',stroke:palette[0],'stroke-width':4});
      add('path',{d:'M8 18 C12 9 20 9 24 18',fill:'none',stroke:palette[1],'stroke-width':3,'stroke-linecap':'round'});
    } else {
      add('rect',{x:5,y:5,width:22,height:22,rx:11,fill:palette[0]});
      const text = document.createElementNS('http://www.w3.org/2000/svg','text');
      text.setAttribute('x','16');
      text.setAttribute('y','20.5');
      text.setAttribute('text-anchor','middle');
      text.setAttribute('fill','#fff');
      text.setAttribute('font-size','13');
      text.setAttribute('font-weight','800');
      text.setAttribute('font-family','Arial, sans-serif');
      text.textContent = account.name.charAt(0);
      svg.append(text);
    }
    frame.append(svg);
    return frame;
  }

  function layoutAccounts() {
    const shown = accounts.filter(visible);
    const rings = shown.length > 28
      ? [
          {count:10,rx:155,ry:90,offset:-Math.PI/2,speed:.000055},
          {count:16,rx:280,ry:162,offset:-Math.PI/2+.12,speed:-.000038},
          {count:Infinity,rx:408,ry:232,offset:-Math.PI/2+.05,speed:.000026}
        ]
      : shown.length > 10
        ? [
            {count:8,rx:190,ry:108,offset:-Math.PI/2,speed:.00005},
            {count:Infinity,rx:350,ry:202,offset:-Math.PI/2+.12,speed:-.000032}
          ]
        : [{count:Infinity,rx:322,ry:188,offset:-Math.PI/2,speed:.000042}];
    activeOrbitRings = [];
    let cursor = 0;
    rings.forEach(ring => {
      const remaining = shown.length - cursor;
      const count = Math.min(ring.count,remaining);
      if (count > 0) activeOrbitRings.push({...ring,count});
      for (let index = 0; index < count; index += 1) {
        const account = shown[cursor + index];
        const angle = ring.offset + (Math.PI * 2 * index / count);
        account.orbit = {rx:ring.rx,ry:ring.ry,angle,speed:ring.speed};
        account.x = canvasWidth / 2 + Math.cos(angle) * ring.rx;
        account.y = canvasHeight / 2 + Math.sin(angle) * ring.ry;
      }
      cursor += count;
    });
  }

  function renderClusters() {
    clustersLayer.replaceChildren();
  }

  function renderConnections() {
    connections.replaceChildren();
    activeOrbitRings.forEach(({rx,ry},index) => {
      const ellipse = document.createElementNS('http://www.w3.org/2000/svg','ellipse');
      ellipse.setAttribute('cx',String(canvasWidth / 2));
      ellipse.setAttribute('cy',String(canvasHeight / 2));
      ellipse.setAttribute('rx',String(rx));
      ellipse.setAttribute('ry',String(ry));
      ellipse.setAttribute('class',`universe-orbit orbit-${index + 1}`);
      connections.append(ellipse);
    });
  }

  function nodeSize(account) {
    const shownCount = accounts.filter(visible).length;
    if (shownCount <= 10) return account.id === selectedId ? 78 : Math.round(59 + (account.fit - 55) * .17);
    if (shownCount <= 24) return account.id === selectedId ? 66 : Math.round(46 + (account.fit - 55) * .12);
    return account.id === selectedId ? 56 : Math.round(36 + (account.fit - 55) * .08);
  }

  function renderNodes() {
    nodesLayer.replaceChildren();
    nodeButtons = new Map();
    const selected = selectedAccount();
    const shownCount = accounts.filter(visible).length;
    nodesLayer.dataset.density = shownCount > 24 ? 'dense' : shownCount > 10 ? 'medium' : 'focused';
    accounts.forEach(account => {
      const button = make('button',`account-node view-${account.view}`);
      button.type = 'button';
      button.style.left = `${account.x}px`;
      button.style.top = `${account.y}px`;
      button.style.setProperty('--node-size',`${nodeSize(account)}px`);
      button.style.setProperty('--heat',String(account.signalStrength));
      button.classList.toggle('is-selected',account.id === selected.id);
      button.classList.toggle('is-muted',account.id !== selected.id);
      button.classList.toggle('is-filtered',!visible(account));
      button.classList.toggle('has-label',account.view === 'priority');
      button.setAttribute('aria-pressed',String(account.id === selected.id));
      button.setAttribute('aria-label',`${account.name}. Fit score ${account.fit}. ${account.signal}.`);
      const people = make('span','account-people');
      const portraits = account.id === selected.id ? account.portraits.slice(0,4) : account.portraits.slice(0,3);
      portraits.forEach(number => {
        const image = document.createElement('img');
        image.src = portraitPath(number);
        image.alt = '';
        image.width = 16;
        image.height = 16;
        people.append(image);
      });
      button.append(
        logoMark(account),
        make('span','account-score',`${account.fit} out of 100`),
        people,
        make('span','account-label',account.name)
      );
      button.addEventListener('click',() => {
        selectedId = account.id;
        render();
      });
      button.addEventListener('mouseenter',() => { orbitPaused = true; });
      button.addEventListener('mouseleave',() => { orbitPaused = false; });
      button.addEventListener('focus',() => { orbitPaused = true; });
      button.addEventListener('blur',() => { orbitPaused = false; });
      nodesLayer.append(button);
      nodeButtons.set(account.id,button);
    });
  }

  function renderCommittee() {
    committeeLayer.replaceChildren();
  }

  function detailSignals(account) {
    return signalDetails[account.signal] || [account.signal,`${account.sectorLabel} activity is above its recent baseline`,account.view === 'watch' ? 'No verified trigger yet' : 'Relevant buying-group activity is visible'];
  }

  function renderDetail() {
    const account = selectedAccount();
    const signals = detailSignals(account);
    const play = account.name === 'Northline Fabrication' ? 'ERP modernization outbound' : `${account.signal} account play`;
    detail.replaceChildren();

    const head = make('div','intel-head');
    const identity = make('div','');
    identity.append(make('p','intel-eyebrow','Selected account'),make('h3','',account.name),make('p','intel-meta',`${account.sectorLabel} · ${account.employees} employees`));
    const score = make('div','intel-score');
    score.append(make('strong','',`${account.fit} / 100`),make('span','', 'Fit'));
    head.append(identity,score);

    const why = make('section','intel-section');
    why.append(make('div','intel-section-title','Why now'));
    const signalList = make('ul','signal-list');
    signals.forEach(signal => signalList.append(make('li','',signal)));
    why.append(signalList);

    const committee = make('section','intel-section');
    const committeeTitle = make('div','intel-section-title','Buying committee');
    committeeTitle.append(make('span','',`${account.people.length}/6 mapped`));
    committee.append(committeeTitle);
    const peopleList = make('div','committee-list');
    account.people.forEach(person => {
      const [name,title,role,status,portrait,state] = person;
      const row = make('div','committee-row');
      const image = document.createElement('img');
      image.src = portraitPath(portrait);
      image.alt = `${name}, fictional professional`;
      image.width = 30;
      image.height = 30;
      const copy = make('div','committee-copy');
      copy.append(make('strong','',name),make('span','',`${title} · ${role}`));
      row.append(image,copy,make('div',`committee-status${state === 'Active' || state === 'Executive sponsor' ? ' is-active' : ''}`,status));
      peopleList.append(row);
    });
    committee.append(peopleList);

    const recommended = make('section','intel-section');
    recommended.append(make('div','intel-section-title','Recommended play'),make('div','recommended-play',play));
    detail.append(head,why,committee,recommended,make('p','intel-note','Illustrative demo. All companies, people, signals, scores, and recommendations are fictional.'));
  }

  function ensureSelectedVisible() {
    if (visible(selectedAccount())) return;
    const next = accounts.find(visible);
    if (next) selectedId = next.id;
  }

  function updateInterfaceCopy() {
    const shown = accounts.filter(visible);
    const sector = clusterDefinitions.find(cluster => cluster.key === sectorFilter);
    const descriptor = sector ? sector.label.toLowerCase() : 'cross-sector';
    identityCount.textContent = `${shown.length} fictional ${descriptor} ${shown.length === 1 ? 'account' : 'accounts'}`;
  }

  function render() {
    ensureSelectedVisible();
    layoutAccounts();
    updateInterfaceCopy();
    renderClusters();
    renderNodes();
    renderConnections();
    renderCommittee();
    renderDetail();
  }

  function animateOrbit(timestamp) {
    if (!lastOrbitFrame) lastOrbitFrame = timestamp;
    const elapsed = Math.min(48,timestamp - lastOrbitFrame);
    lastOrbitFrame = timestamp;
    if (!orbitPaused && !reduceMotion.matches) {
      accounts.filter(visible).forEach(account => {
        if (!account.orbit) return;
        account.orbit.angle += account.orbit.speed * elapsed;
        account.x = canvasWidth / 2 + Math.cos(account.orbit.angle) * account.orbit.rx;
        account.y = canvasHeight / 2 + Math.sin(account.orbit.angle) * account.orbit.ry;
        const button = nodeButtons.get(account.id);
        if (button) {
          button.style.left = `${account.x}px`;
          button.style.top = `${account.y}px`;
        }
      });
    }
    window.requestAnimationFrame(animateOrbit);
  }

  function setSector(value) {
    sectorFilter = value;
    app.querySelectorAll('[data-map-sector]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.mapSector === value)));
    render();
  }

  function setView(value) {
    viewFilter = value;
    app.querySelectorAll('[data-map-filter]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.mapFilter === value)));
    render();
  }

  function fitCanvas() {
    const scale = Math.min(1,viewport.clientWidth / canvasWidth);
    const left = Math.max(0,(viewport.clientWidth - canvasWidth * scale) / 2);
    canvas.style.transform = `translateX(${left}px) scale(${scale})`;
    if (window.innerWidth <= 760) viewport.style.height = `${Math.max(320,canvasHeight * scale)}px`;
    else viewport.style.removeProperty('height');
  }

  app.querySelectorAll('[data-map-sector]').forEach(button => button.addEventListener('click',() => setSector(button.dataset.mapSector)));
  app.querySelectorAll('[data-map-filter]').forEach(button => button.addEventListener('click',() => setView(button.dataset.mapFilter)));
  let resizeTimer;
  window.addEventListener('resize',() => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(fitCanvas,100);
  });

  render();
  fitCanvas();
  window.requestAnimationFrame(animateOrbit);
})();
