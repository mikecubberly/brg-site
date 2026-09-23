(() => {
  const app = document.getElementById('market-map-app');
  if (!app) return;
  // All accounts, people, logos, and signals in this example are fictional.
  const accounts = [
    { id:'aster', name:'Aster Vale Systems', segment:'Operations software', fit:'strong', x:115,y:145, logo:'aster', signalShort:'New operations leader', profile:'A simulated six-site manufacturer with regional operations teams and separate reporting workflows.', rationale:'Multiple sites, cross-functional reporting, and an operations owner match the example platform’s target profile.', people:[['Maya Rowan','VP Operations','Decision maker'],['Leo Venn','IT Director','Technical reviewer']], signal:'Mock observation: a new operations leader is reviewing how weekly site reports are assembled.', activation:'Marketing could test a multi-site reporting guide. Sales could ask how site updates reach the executive team.', owner:'Marketing + account executive', next:'Validate the leadership change and reporting scope, then prepare a tailored account brief.' },
    { id:'marrow', name:'Marrowline Cloud', segment:'Operations software', fit:'strong', x:365,y:120, logo:'marrow', signalShort:'Product expansion', profile:'A fictional software operator adding a second product line and a larger customer-support footprint.', rationale:'A growing service operation creates a plausible need to coordinate product and support teams.', people:[['Nina Solis','Chief Operating Officer','Decision maker'],['Theo March','Revenue Operations Lead','Potential champion']], signal:'Mock observation: a product expansion was announced. The operational impact is still a hypothesis.', activation:'Marketing could compare two messages about cross-team handoffs. Sales could validate whether expansion changed the workflow.', owner:'Marketing', next:'Confirm the expansion and map affected teams before adding this account to a campaign.' },
    { id:'pine', name:'Pineward Logic', segment:'Operations software', fit:'explore', x:45,y:350, logo:'pine', signalShort:'Footprint unclear', profile:'A fictional systems firm that may serve distributed operations, with its internal site footprint unknown.', rationale:'The use case sounds relevant, but the number of sites and internal buying structure are unconfirmed.', people:[['Amira Vale','Head of Operations','Possible owner'],['Owen Reed','Systems Manager','Technical contact']], signal:'No mock trigger is confirmed. Timing remains unknown in this example.', activation:'Keep the company in research. An attractive segment label alone does not make it campaign-ready.', owner:'Research', next:'Verify site count, operating model, and a relevant business change before activation.' },
    { id:'cinder', name:'Cinderfold Works', segment:'Industrial technology', fit:'strong', x:640,y:205, logo:'cinder', signalShort:'Facility modernization', profile:'A simulated manufacturer coordinating maintenance and production across four plants.', rationale:'Plant-level coordination and several operational owners align with the example platform’s criteria.', people:[['Jules Mercer','VP Manufacturing','Decision maker'],['Priya Hale','Program Director','Project owner']], signal:'Mock observation: a facility modernization initiative was announced. Its workflow scope is unverified.', activation:'Marketing could offer a plant coordination checklist. Sales could investigate who owns the modernization plan.', owner:'Account executive', next:'Verify project scope and timing, then build a focused account plan.' },
    { id:'tarn', name:'Tarn & Alder Labs', segment:'Industrial technology', fit:'explore', x:625,y:405, logo:'tarn', signalShort:'Relevant hiring pattern', profile:'A fictional hardware lab expanding its engineering and field-support organization.', rationale:'The team may have coordination needs, but the buying problem and deployment footprint are not confirmed.', people:[['Elena Park','General Manager','Possible sponsor'],['Seth Quinn','Engineering Lead','Technical contact']], signal:'Mock observation: several operations-related roles appeared. Hiring does not establish a funded project.', activation:'Test the hypothesis through research first. Keep this account out of a high-priority campaign.', owner:'Research', next:'Read the underlying role descriptions and clarify the operating model.' },
    { id:'bell', name:'Bellwether Field Co.', segment:'Field services', fit:'strong', x:332,y:378, logo:'bell', signalShort:'New service region', profile:'A simulated field-service business opening a region with dispatch, service, and regional leadership teams.', rationale:'A distributed service model and new regional handoffs match the example platform’s use case.', people:[['Rae Collins','Regional VP','Decision maker'],['Kiran Moss','Service Director','Operational owner']], signal:'Mock observation: a new region is planned. Whether it creates a workflow problem needs a conversation.', activation:'Marketing could test a regional launch playbook. Sales could explore dispatch and reporting handoffs.', owner:'Marketing + sales', next:'Validate the region plan and prepare a coordinated campaign with a human follow-up.' },
    { id:'lumen', name:'Lumenbrook Service', segment:'Field services', fit:'watch', x:700,y:540, logo:'lumen', signalShort:'No current trigger', profile:'A fictional national service provider with a steady footprint and no visible near-term change.', rationale:'The company resembles the target segment, but there is too little evidence to prioritize it now.', people:[['Dana Ellis','Chief Operating Officer','Possible sponsor'],['Morgan Lee','Field Operations Lead','Possible owner']], signal:'No mock near-term signal. This is a watch account, not an active pursuit.', activation:'Keep it in the universe for periodic research. Do not manufacture urgency to justify outreach.', owner:'Marketing', next:'Review at the next audience refresh or when a relevant change appears.' }
  ];
  const fitNames = {strong:'Strong Fit',explore:'Explore Fit',watch:'Watch Fit'};
  const edges = [['aster','marrow'],['aster','pine'],['marrow','cinder'],['marrow','bell'],['cinder','tarn'],['pine','bell'],['bell','lumen'],['tarn','lumen']];
  const viewport = document.getElementById('market-map-viewport');
  const canvas = document.getElementById('market-map-canvas');
  const nodes = document.getElementById('market-map-nodes');
  const connections = document.getElementById('market-map-connections');
  const detail = document.getElementById('market-map-detail');
  const zoomLabel = document.getElementById('market-map-zoom');
  const positions = new Map(accounts.map(a => [a.id,{x:a.x,y:a.y}]));
  const buttons = new Map();
  const pathPairs = [];
  let scale = 1, pan = {x:0,y:0}, selected = 'aster', filter = 'all', gesture = null;
  const make = (tag, className, value) => { const el = document.createElement(tag); if(className) el.className=className; if(value !== undefined) el.textContent=value; return el; };
  const logo = (account, extra='') => { const frame=make('span',`market-map-logo logo-${account.id} ${extra}`); const img=document.createElement('img'); img.src=`/assets/market-map/${account.logo}.svg`; img.alt=''; img.draggable=false; img.width=46; img.height=46; frame.append(img); return frame; };
  const badge = account => make('span',`market-map-fit fit-${account.fit}`,fitNames[account.fit]);
  const place = (button,point) => {button.style.left=`${point.x}px`; button.style.top=`${point.y}px`;};
  const renderTransform = () => { canvas.style.transform=`translate(${pan.x}px, ${pan.y}px) scale(${scale})`; zoomLabel.textContent=`${Math.round(scale*100)}%`; };
  function drawConnections() {
    edges.forEach(([from,to],index) => {
      const a=positions.get(from), b=positions.get(to), x1=a.x+108, y1=a.y+68, x2=b.x+108, y2=b.y+68;
      const d=`M ${x1} ${y1} Q ${(x1+x2)/2} ${(y1+y2)/2-Math.min(62,Math.abs(x1-x2)*.12)} ${x2} ${y2}`;
      if(!pathPairs[index]) {
        pathPairs[index]=['connection-base','connection-flow'].map(kind=>{
          const path=document.createElementNS('http://www.w3.org/2000/svg','path');
          path.setAttribute('class',kind); path.style.animationDelay=`${index*-.55}s`;
          connections.append(path); return path;
        });
      }
      for(const path of pathPairs[index]) {
        path.setAttribute('d',d);
        path.classList.toggle('is-muted',filter!=='all' && (accounts.find(a=>a.id===from).fit!==filter || accounts.find(a=>a.id===to).fit!==filter));
        path.classList.toggle('is-linked',from===selected || to===selected);
      }
    });
  }
  function resetView(resetPositions=false) {
    if(resetPositions) accounts.forEach(a=>positions.set(a.id,{x:a.x,y:a.y}));
    const narrow=viewport.clientWidth<600;
    scale=narrow?.9:Math.min(1,(viewport.clientWidth-24)/940,(viewport.clientHeight-24)/680);
    pan=narrow?{x:-55,y:-48}:{x:(viewport.clientWidth-940*scale)/2,y:(viewport.clientHeight-680*scale)/2};
    buttons.forEach((button,id)=>place(button,positions.get(id)));
    drawConnections(); renderTransform();
  }
  function detailBlock(label,value,className='') { const block=make('div',`detail-block ${className}`); block.append(make('span','detail-label',label),make('p','',value)); return block; }
  function select(id) {
    const a=accounts.find(item=>item.id===id); if(!a)return;
    selected=id; buttons.forEach((button,key)=>button.setAttribute('aria-pressed',String(key===id)));
    detail.replaceChildren();
    const header=make('div','detail-header'), identity=make('div','detail-identity');
    identity.append(make('h3','',a.name),make('p','detail-segment',a.segment)); header.append(logo(a,'detail-logo'),identity);
    const fitLine=make('div','detail-fit-line'); fitLine.append(badge(a),make('span','',a.signalShort));
    const people=make('div','detail-block detail-people'); people.append(make('span','detail-label','Buying group to map'));
    a.people.forEach(([name,role,part])=>{const row=make('div','detail-person'), copy=make('span','detail-person-copy'); copy.append(make('strong','',name),make('span','',`${role} · ${part}`)); row.append(make('span','detail-avatar',name.split(' ').map(word=>word[0]).join('').slice(0,2)),copy); people.append(row);});
    const next=make('div','detail-next'); next.append(make('span','detail-label','Next move'),make('strong','',a.next),make('span','detail-owner',`Suggested owner: ${a.owner}`));
    detail.append(make('div','detail-eyebrow','Account brief / fictional example'),header,fitLine,detailBlock('Company snapshot',a.profile,'detail-profile'),detailBlock('Why it fits',a.rationale),people,detailBlock('Example signal to verify',a.signal,'detail-signal'),detailBlock('Campaign hypothesis',a.activation),next,make('p','detail-note','Illustrative only. Real account work requires sources, dates, and human review.'));
    drawConnections();
  }
  function setFilter(value) {
    filter=value;
    app.querySelectorAll('[data-map-filter]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.mapFilter===value)));
    accounts.forEach(a=>{buttons.get(a.id).hidden=value!=='all'&&a.fit!==value;});
    if(value!=='all'&&accounts.find(a=>a.id===selected)?.fit!==value) select(accounts.find(a=>a.fit===value).id);
    if(value==='all') resetView();
    else {
      const point=positions.get(selected);
      pan={x:viewport.clientWidth/2-(point.x+108)*scale,y:viewport.clientHeight/2-(point.y+68)*scale};
      renderTransform();
    }
    drawConnections();
  }
  accounts.forEach((a,index)=>{
    const button=make('button','market-map-node'); button.type='button'; button.dataset.account=a.id;
    button.style.setProperty('--node-delay',`${index*80}ms`);
    button.setAttribute('aria-label',`Explore ${a.name}, ${fitNames[a.fit]}, ${a.segment}. Drag or use arrow keys to move.`);
    const header=make('span','node-header'), copy=make('span','node-identity'); copy.append(make('strong','',a.name),make('span','node-segment',a.segment)); header.append(logo(a),copy);
    const signal=make('span','node-signal'); signal.append(make('span','node-signal-dot'),make('span','',a.signalShort));
    const foot=make('span','node-bottom'); foot.append(badge(a),make('span','node-open','View brief ↗'));
    button.append(header,signal,foot); place(button,positions.get(a.id));
    button.addEventListener('click',event=>{if(event.detail===0)select(a.id);});
    button.addEventListener('keydown',event=>{const dirs={ArrowLeft:[-12,0],ArrowRight:[12,0],ArrowUp:[0,-12],ArrowDown:[0,12]}; if(!dirs[event.key])return; event.preventDefault(); const p=positions.get(a.id),[dx,dy]=dirs[event.key],next={x:Math.max(0,Math.min(725,p.x+dx)),y:Math.max(0,Math.min(548,p.y+dy))}; positions.set(a.id,next);place(button,next);drawConnections();});
    nodes.append(button); buttons.set(a.id,button);
  });
  viewport.addEventListener('pointerdown',event=>{
    if(event.button!==0)return; const button=event.target.closest('.market-map-node');
    gesture={id:button?.dataset.account||null,x:event.clientX,y:event.clientY,startPan:{...pan},startPoint:button?{...positions.get(button.dataset.account)}:null,moved:false};
    viewport.setPointerCapture(event.pointerId); viewport.classList.add('is-dragging'); button?.classList.add('is-dragging'); event.preventDefault();
  });
  viewport.addEventListener('pointermove',event=>{
    if(!gesture)return; const dx=event.clientX-gesture.x,dy=event.clientY-gesture.y; if(Math.hypot(dx,dy)>4)gesture.moved=true; if(!gesture.moved)return;
    if(gesture.id){const p={x:Math.max(0,Math.min(725,gesture.startPoint.x+dx/scale)),y:Math.max(0,Math.min(548,gesture.startPoint.y+dy/scale))};positions.set(gesture.id,p);place(buttons.get(gesture.id),p);drawConnections();}
    else{pan={x:gesture.startPan.x+dx,y:gesture.startPan.y+dy};renderTransform();}
  });
  function finishGesture(){if(!gesture)return;if(gesture.id&&!gesture.moved)select(gesture.id);buttons.forEach(button=>button.classList.remove('is-dragging'));viewport.classList.remove('is-dragging');gesture=null;}
  viewport.addEventListener('pointerup',finishGesture); viewport.addEventListener('pointercancel',finishGesture);
  app.querySelectorAll('[data-map-filter]').forEach(button=>button.addEventListener('click',()=>setFilter(button.dataset.mapFilter)));
  app.querySelectorAll('[data-map-zoom]').forEach(button=>button.addEventListener('click',()=>{const next=Math.max(.65,Math.min(1.5,scale+(button.dataset.mapZoom==='in'?.15:-.15))),centre={x:viewport.clientWidth/2,y:viewport.clientHeight/2};pan={x:centre.x-(centre.x-pan.x)*next/scale,y:centre.y-(centre.y-pan.y)*next/scale};scale=next;renderTransform();}));
  app.querySelector('[data-map-reset]').addEventListener('click',()=>{resetView(true);setFilter('all');select('aster');});
  let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>resetView(),120);});
  select(selected);resetView();
})();
