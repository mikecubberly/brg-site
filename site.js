(function () {
  'use strict';
  var root = document.documentElement;
  var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  var stage = document.getElementById('orbit-stage');
  var nodes = Array.from(stage.querySelectorAll('.orbit-node'));
  var visible = false;
  var frame = null;
  var lastTime = null;
  var elapsed = 0;
  var stageWidth = 0;
  var stageHeight = 0;

  // Separate elliptical lanes keep the logo-only collection readable as it moves.
  function position(index, seconds, width, height) {
    var ring = index < 16 ? 0 : index < 28 ? 1 : 2;
    var slot = ring === 0 ? index : ring === 1 ? index - 16 : index - 28;
    var count = [16, 12, 8][ring];
    var angle = slot / count * Math.PI * 2 + [.3, .9, 1.2][ring] + seconds * [.045, -.06, .075][ring];
    var radius = width * [.44, .32, .20][ring];
    var x = Math.cos(angle) * radius;
    var y = Math.sin(angle) * radius * .86;
    var depth = Math.sin(angle);
    return { x: width / 2 + x, y: height / 2 + y, scale: .94 + (depth + 1) * .03, depth: depth };
  }
  function draw() {
    nodes.forEach(function (node, index) {
      var p = position(index, elapsed, stageWidth, stageHeight);
      node.style.left = '0'; node.style.top = '0';
      node.style.transform = 'translate(' + p.x.toFixed(2) + 'px,' + p.y.toFixed(2) + 'px) translate(-50%,-50%) scale(' + p.scale.toFixed(3) + ')';
      node.style.zIndex = String(Math.round((p.depth + 1) * 10) + 1);
    });
  }
  function canAnimate() { return visible && !document.hidden && !motionQuery.matches; }
  function animate(time) {
    frame = null;
    if (!canAnimate()) { lastTime = null; return; }
    if (lastTime !== null) elapsed += Math.min((time - lastTime) / 1000, .05);
    lastTime = time; draw(); frame = requestAnimationFrame(animate);
  }
  function restart() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null; lastTime = null;
    if (canAnimate()) frame = requestAnimationFrame(animate);
  }
  function syncMotion() {
    root.dataset.motion = motionQuery.matches || document.hidden ? 'paused' : 'running';
    document.dispatchEvent(new Event('brg:motion-change'));
    restart();
  }
  motionQuery.addEventListener('change', syncMotion);
  document.addEventListener('visibilitychange', syncMotion);
  function measure() { stageWidth = stage.clientWidth; stageHeight = stage.clientHeight; draw(); }
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(stage);
  else window.addEventListener('resize', measure);
  if ('IntersectionObserver' in window) new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; restart(); }, { rootMargin: '80px' }).observe(stage);
  else visible = true;
  measure(); syncMotion();

  if ('IntersectionObserver' in window) {
    var shimmerNodes = document.querySelectorAll('.event-shimmer, .hero .wordmark span, .page-section h2 span, .contact-section h2 span, .section-kicker, .market-questions dt, .event-stage, .commanders-wordmark h3 span, .step-number, .service-tag-label, .universe-outcomes li > span, .read-link');
    var shimmerObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        entry.target.classList.toggle('is-shimmering', entry.isIntersecting && !motionQuery.matches);
      });
    }, { threshold: .15 });
    shimmerNodes.forEach(function (node) {
      node.classList.toggle('accent-shimmer', true);
      shimmerObserver.observe(node);
    });
    motionQuery.addEventListener('change', function () {
      shimmerNodes.forEach(function (node) {
        node.classList.toggle('is-shimmering', false);
        shimmerObserver.unobserve(node);
        shimmerObserver.observe(node);
      });
    });
    var questionFlashes = new Map();
    function flashAccent(word) {
      if (motionQuery.matches || document.hidden) return;
      if (!word || typeof word.animate !== 'function') return;
      var previous = questionFlashes.get(word);
      if (previous && previous.playState === 'running') return;
      questionFlashes.set(word, word.animate([
        { filter: 'brightness(1) drop-shadow(0 0 0 transparent)' },
        { filter: 'brightness(1.65) drop-shadow(0 0 12px rgba(184,198,255,.65))', offset: .3 },
        { filter: 'brightness(1) drop-shadow(0 0 0 transparent)' }
      ], { duration: 850, easing: 'ease-out' }));
    }
    function flashQuestion(row) { flashAccent(row.querySelector('dt')); }
    var accentHoverNodes = document.querySelectorAll('.accent-shimmer, .service-card h3, .inline-link span, .event-splash-period');
    accentHoverNodes.forEach(function (word) {
      word.addEventListener('pointerenter', function () { flashAccent(word); });
      word.addEventListener('focusin', function () { flashAccent(word); });
    });
    var questionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) flashQuestion(entry.target);
      });
    }, { threshold: .65 });
    document.querySelectorAll('.market-questions > div').forEach(function (row) {
      questionObserver.observe(row);
      row.addEventListener('pointerenter', function () { flashQuestion(row); });
    });
    motionQuery.addEventListener('change', function () {
      if (motionQuery.matches) questionFlashes.forEach(function (animation) { animation.cancel(); });
    });
  }
})();

/* Section scroll pull: native scrolling stays in charge everywhere on the page. */
(function () {
  'use strict';
  var hero = document.getElementById('top');
  var content = document.getElementById('hero-pull-content');
  if (!hero || !content) return;
  var items = [{ section: hero, content: content, current: 0, target: 0 }];
  document.querySelectorAll('main > section:not(.hero):not([hidden]), .site-footer').forEach(function (section) {
    section.classList.add('section-pull');
    items.push({ section: section, content: section, current: 0, target: 0 });
  });
  var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var frame = null;
  var lastTime = null;

  function paint(item) {
    item.content.style.setProperty('--hero-pull-y', (item.current * item.lift).toFixed(2) + 'px');
    item.content.style.setProperty('--hero-pull-scale', (1 - item.current * .065).toFixed(4));
    item.content.style.setProperty('--hero-pull-opacity', (1 - item.current * .3).toFixed(4));
  }
  function animate(time) {
    frame = null;
    var delta = lastTime === null ? 16 : Math.min(time - lastTime, 64);
    lastTime = time;
    items.forEach(function (item) {
      if (item.current === item.target) return;
      item.current += (item.target - item.current) * (1 - Math.exp(-delta / 85));
      if (Math.abs(item.target - item.current) < .0005) item.current = item.target;
      paint(item);
    });
    if (items.some(function (item) { return item.current !== item.target; })) frame = requestAnimationFrame(animate);
    else lastTime = null;
  }
  function update() {
    items.forEach(function (item) {
      item.target = motion.matches ? 0 : Math.max(0, Math.min(1, (window.scrollY - item.top) / item.distance));
    });
    if (motion.matches || document.hidden) {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null; lastTime = null;
      items.forEach(function (item) { item.current = item.target; paint(item); });
      return;
    }
    if (frame === null && items.some(function (item) { return item.current !== item.target; })) frame = requestAnimationFrame(animate);
  }
  function measure() {
    items.forEach(function (item) {
      // Layout offsets do not drift when a section is already transformed.
      item.top = 0;
      for (var node = item.section; node; node = node.offsetParent) item.top += node.offsetTop;
      item.distance = Math.max(1, item.section.offsetHeight * .85);
      item.lift = Math.min(90, item.section.offsetHeight * .1);
    });
    update();
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', measure);
  window.addEventListener('pageshow', measure);
  motion.addEventListener('change', update);
  document.addEventListener('visibilitychange', update);
  if ('ResizeObserver' in window) {
    var observer = new ResizeObserver(measure);
    items.forEach(function (item) { observer.observe(item.section); });
  }
  measure();
})();
