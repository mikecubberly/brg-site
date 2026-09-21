export function stepBodies(bodies, width, height, dt) {
  for (const b of bodies) {
    if (b.delay > 0) { b.delay -= dt; continue; }
    b.vy += 620 * dt;
    b.vx += (width / 2 - b.x) * .32 * dt;
    b.x += b.vx * dt; b.y += b.vy * dt;
    b.angle += b.spin * dt;
    b.angle = Math.max(-1.15, Math.min(1.15, b.angle));
    b.spin *= Math.pow(.92, dt);
  }
  for (let pass = 0; pass < 5; pass++) {
    for (let i = 0; i < bodies.length; i++) for (let j = i + 1; j < bodies.length; j++) {
      const a = bodies[i], b = bodies[j];
      if (a.delay > 0 || b.delay > 0) continue;
      const dx = b.x - a.x, dy = b.y - a.y;
      const ox = (a.w + b.w) / 2 - Math.abs(dx), oy = (a.h + b.h) / 2 - Math.abs(dy);
      if (ox <= 0 || oy <= 0) continue;
      if (oy < ox) {
        const s = dy >= 0 ? 1 : -1;
        a.y -= s * oy / 2; b.y += s * oy / 2;
        const speed = (a.vy + b.vy) / 2;
        const impact = Math.min(90, Math.abs(a.vy - b.vy));
        a.vy = speed * .65; b.vy = speed * .65;
        if (pass === 0 && impact > 15) {
          a.vx -= Math.sign(dx || 1) * impact * .22; b.vx += Math.sign(dx || 1) * impact * .22;
          a.spin -= Math.sign(dx || 1) * impact * .006; b.spin += Math.sign(dx || 1) * impact * .006;
        }
        a.vx *= .97; b.vx *= .97; a.spin *= .97; b.spin *= .97;
      } else {
        const s = dx >= 0 ? 1 : -1;
        a.x -= s * ox / 2; b.x += s * ox / 2;
        a.vx *= -.4; b.vx *= -.4;
      }
    }
    for (const b of bodies) {
      if (b.delay > 0) continue;
      const halfW = Math.max(b.w, Math.abs(Math.cos(b.angle)) * (b.vw || b.w) + Math.abs(Math.sin(b.angle)) * (b.vh || b.h)) / 2;
      const halfH = Math.max(b.h, Math.abs(Math.sin(b.angle)) * (b.vw || b.w) + Math.abs(Math.cos(b.angle)) * (b.vh || b.h)) / 2;
      if (b.y + halfH > height) { b.y = height - halfH; b.vy = -Math.abs(b.vy) * .22; b.vx *= .9; b.spin *= .85; }
      b.y = Math.max(halfH, b.y);
      if (b.x < halfW || b.x > width - halfW) { b.x = Math.max(halfW, Math.min(width - halfW, b.x)); b.vx *= -.35; }
    }
  }
}

if (typeof document !== 'undefined') {
 const arena = document.querySelector('.event-conference-logos');
 if (arena && 'IntersectionObserver' in window) {
  const items = [...arena.children], motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let timer, returnTimer, frame, bodies = [], visible = false, played = false, last, elapsed = 0, restoring = false, restored = false;
  let returns = [];
  function reset() {
    returns.forEach(animation => animation.cancel()); returns = [];
    restoring = false; restored = false;
    clearTimeout(timer); clearTimeout(returnTimer); cancelAnimationFrame(frame); played = false; bodies = [];
    arena.classList.remove('gravity-active');
    items.forEach(item => { item.style.transform = ''; });
  }
  function restoreGrid() {
    if (!played || !visible || document.hidden || restoring || restored || motion.matches) return;
    cancelAnimationFrame(frame);
    restoring = true;
    returns = items.map((item, i) => item.animate([
      { transform: item.style.transform || 'none' },
      { transform: 'translate(0px,0px) rotate(0rad) scale(1)' }
    ], { duration: 2600, delay: (i % 4) * 90 + Math.floor(i / 4) * 55, easing: 'cubic-bezier(.22,.61,.36,1)', fill: 'forwards' }));
    Promise.all(returns.map(animation => animation.finished)).then(() => {
      items.forEach(item => { item.style.transform = ''; });
      arena.classList.remove('gravity-active');
      returns.forEach(animation => animation.cancel()); returns = [];
      restoring = false; restored = true;
    }).catch(() => {});
  }
  function start() {
    if (!visible || motion.matches || document.hidden || played) return;
    played = true;
    const box = arena.getBoundingClientRect();
    bodies = items.map((item, i) => {
      const r = item.getBoundingClientRect(), x = r.left - box.left + r.width / 2, y = r.top - box.top + r.height / 2;
      return { x, y, ox: x, oy: y, w: r.width * .66, h: r.height * .6, vw: r.width * .84, vh: r.height * .84, vx: (box.width / 2 - x) * .35 + Math.sin(i * 3) * 90, vy: 0, angle: 0, spin: Math.sin(i * 7) * 2.2, delay: (i * 7 % 11) * .035 };
    });
    arena.classList.add('gravity-active'); last = null; elapsed = 0;
    returnTimer = setTimeout(restoreGrid, 3000);
    function tick(time) {
      const dt = last === null ? 0 : Math.min((time - last) / 1000, 1 / 30); last = time; elapsed += dt;
      stepBodies(bodies, box.width, box.height, dt);
      bodies.forEach((b, i) => { items[i].style.transform = `translate(${b.x - b.ox}px,${b.y - b.oy}px) rotate(${b.angle}rad) scale(.84)`; });
      if (elapsed < 9) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
  }
  function schedule() { clearTimeout(timer); if (visible && !motion.matches && !document.hidden && !played) timer = setTimeout(start, 1250); }
  new IntersectionObserver(entries => {
    const entry = entries[0];
    if (!entry.isIntersecting) { visible = false; reset(); }
    else if (entry.intersectionRatio >= .45) { visible = true; schedule(); }
  }, { threshold: [0, .45] }).observe(arena);
  motion.addEventListener('change', () => { reset(); schedule(); });
  window.addEventListener('resize', () => { reset(); schedule(); });
  document.addEventListener('visibilitychange', () => { reset(); schedule(); });
 }
}
