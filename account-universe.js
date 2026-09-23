(() => {
  const app = document.getElementById('market-map-app');
  if (!app) return;

  // This is a fictional product demonstration. Every company, person, signal, and score is illustrative.
  const canvasWidth = 980;
  const canvasHeight = 560;
  const offsets = [[-74,-42],[-12,-72],[61,-46],[-96,22],[-29,12],[44,28],[92,66],[-5,78]];
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
  clusterDefinitions.forEach((cluster,clusterIndex) => {
    cluster.accounts.forEach((raw,index) => {
      const [name,fit,view,signal,employees] = raw;
      const [dx,dy] = offsets[index];
      const id = `${cluster.key}-${index}`;
      const signalStrength = view === 'priority' ? 96 : view === 'strong' ? 78 + (index % 9) : view === 'explore' ? 58 : 28;
      const people = name === 'Northline Fabrication' ? peoplePools[0] : peoplePools[(clusterIndex + 1) % peoplePools.length];
      accounts.push({id,name,sector:cluster.key,sectorLabel:cluster.label,x:cluster.center[0]+dx,y:cluster.center[1]+dy,fit,view,signal,signalStrength,employees,people});
    });
  });

  const viewport = document.getElementById('market-map-viewport');
  const canvas = document.getElementById('market-map-canvas');
  const nodesLayer = document.getElementById('market-map-nodes');
  const connections = document.getElementById('market-map-connections');
  const clustersLayer = document.getElementById('market-map-clusters');
  const committeeLayer = document.getElementById('market-map-committee');
  const detail = document.getElementById('market-map-detail');
  let sectorFilter = 'all';
  let viewFilter = 'all';
  let selectedId = accounts.find(account => account.name === 'Northline Fabrication').id;

  const visible = account => (sectorFilter === 'all' || account.sector === sectorFilter) && (viewFilter === 'all' || account.view === viewFilter);
  const selectedAccount = () => accounts.find(account => account.id === selectedId);
  const make = (tag,className,text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };

  function renderClusters() {
    clustersLayer.replaceChildren();
    clusterDefinitions.forEach(cluster => {
      if (sectorFilter !== 'all' && cluster.key !== sectorFilter) return;
      const label = make('span','universe-cluster',cluster.label);
      label.style.left = `${cluster.center[0]}px`;
      label.style.top = `${cluster.center[1] - 116}px`;
      clustersLayer.append(label);
    });
  }

  function drawLine(from,to,className) {
    const path = document.createElementNS('http://www.w3.org/2000/svg','path');
    const bend = Math.min(24,Math.abs(from.x - to.x) * .08);
    path.setAttribute('d',`M ${from.x} ${from.y} Q ${(from.x + to.x) / 2} ${(from.y + to.y) / 2 - bend} ${to.x} ${to.y}`);
    path.setAttribute('class',className);
    connections.append(path);
  }

  function renderConnections() {
    connections.replaceChildren();
    const selected = selectedAccount();
    clusterDefinitions.forEach(cluster => {
      const clusterAccounts = accounts.filter(account => account.sector === cluster.key);
      [[0,1],[1,4],[4,5],[2,6]].forEach(([a,b]) => {
        const from = clusterAccounts[a];
        const to = clusterAccounts[b];
        if (!visible(from) || !visible(to)) return;
        const related = from.id === selected.id || to.id === selected.id;
        drawLine(from,to,`universe-edge${related ? ' is-related' : ' is-muted'}`);
      });
    });
  }

  function nodeSize(account) {
    return Math.round(Math.max(11,Math.min(25,11 + (account.fit - 55) * .32)));
  }

  function renderNodes() {
    nodesLayer.replaceChildren();
    const selected = selectedAccount();
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
      button.classList.toggle('has-label',account.view === 'priority' || account.fit >= 88);
      button.setAttribute('aria-pressed',String(account.id === selected.id));
      button.setAttribute('aria-label',`${account.name}. Fit score ${account.fit}. ${account.signal}.`);
      button.append(make('span','account-satellite'),make('span','account-label',account.name));
      button.addEventListener('click',() => {
        selectedId = account.id;
        render();
      });
      nodesLayer.append(button);
    });
  }

  function renderCommittee() {
    committeeLayer.replaceChildren();
    const account = selectedAccount();
    if (!visible(account)) return;
    const placements = [[-62,-49],[61,-48],[67,48],[-60,51]];
    account.people.slice(0,4).forEach((person,index) => {
      const [name,,,,portrait] = person;
      const [dx,dy] = placements[index];
      const satellite = make('div','committee-node');
      satellite.style.left = `${account.x + dx}px`;
      satellite.style.top = `${account.y + dy}px`;
      const image = document.createElement('img');
      image.src = portraitPath(portrait);
      image.alt = '';
      image.width = 24;
      image.height = 24;
      satellite.append(image,make('span','',name.split(' ')[0]));
      committeeLayer.append(satellite);
      drawLine(account,{x:account.x+dx,y:account.y+dy},'committee-edge');
    });
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

  function render() {
    ensureSelectedVisible();
    renderClusters();
    renderNodes();
    renderConnections();
    renderCommittee();
    renderDetail();
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
})();
