// These decorations never change the cards' links, labels, or layout.
export function rocketPose(progress) {
  const angle = progress * Math.PI * 2;
  const depth = -Math.sin(angle);
  const x = 17 * Math.cos(angle);
  const y = -8 * Math.sin(angle) - x * .28;
  const scale = .72 + depth * .2;
  // The far side fades out behind the emblem, then reappears at the left.
  const opacity = Math.max(0, Math.min(1, (depth + .68) / .46));
  return { x, y, scale, opacity, front: depth >= 0, rotation: -360 * progress };
}

export function rocketFrames() {
  return Array.from({ length: 97 }, (_, i) => {
    const p = rocketPose(i / 96);
    return {
      offset: i / 96,
      transform: `translate(${p.x.toFixed(3)}px,${p.y.toFixed(3)}px) rotate(${p.rotation.toFixed(3)}deg) scale(${p.scale.toFixed(3)})`,
      opacity: p.opacity,
      zIndex: p.front ? 3 : 1,
    };
  });
}

const lensFrames = [
  { transform: 'translate(0,0)' },
  { transform: 'translate(-2px,-2px)' },
  { transform: 'translate(2px,-1px)' },
  { transform: 'translate(2px,2px)' },
  { transform: 'translate(-1px,2px)' },
  { transform: 'translate(0,0)' },
];
const bubbleFrames = [
  { offset: 0, opacity: 0, transform: 'translateY(7px) scale(.55)' },
  { offset: .12, opacity: .3, transform: 'translateY(0) scale(1)' },
  { offset: .3, opacity: .25, transform: 'translateY(-4px) scale(1)' },
  { offset: .48, opacity: 0, transform: 'translateY(-12px) scale(.9)' },
  { offset: 1, opacity: 0, transform: 'translateY(-12px) scale(.9)' },
];

export function bindEventTeaser(card, motion, doc = document) {
  let hovered = false;
  let focused = false;
  let visible = true;
  let animations = [];
  const kind = card.dataset.eventMotion;
  const flight = card.querySelector('.commander-flight');
  const lens = card.querySelector('.enricher-lens');
  const bubbles = Array.from(card.querySelectorAll('.audience-bubble'));
  const layers = Array.from(card.querySelectorAll('.commander-layer img, img.commander-layer'));
  const layersReady = () => layers.every(img => img.complete && img.naturalWidth > 0);

  function stop() {
    animations.forEach(animation => animation.cancel());
    animations = [];
    card.classList.remove('is-animating');
  }
  function sync() {
    if (!(hovered || focused) || !visible || doc.hidden || motion.matches || !layersReady()) { stop(); return; }
    if (animations.length) return;
    if (kind === 'commanders' && typeof flight?.animate === 'function') {
      animations.push(flight.animate(rocketFrames(), { duration: 5600, iterations: Infinity, easing: 'linear' }));
    } else if (kind === 'enricher' && typeof lens?.animate === 'function') {
      animations.push(lens.animate(lensFrames, { duration: 3800, iterations: Infinity, easing: 'ease-in-out' }));
    } else if (kind === 'audience') {
      bubbles.forEach((bubble, i) => {
        if (typeof bubble.animate === 'function') animations.push(bubble.animate(bubbleFrames, {
          duration: 4800, delay: i * 510, iterations: Infinity, easing: 'ease-in-out', fill: 'both',
        }));
      });
    }
    if (animations.length) card.classList.add('is-animating');
  }
  card.addEventListener('pointerenter', event => { hovered = event.pointerType !== 'touch'; sync(); });
  card.addEventListener('pointerleave', () => { hovered = false; sync(); });
  card.addEventListener('pointercancel', () => { hovered = false; sync(); });
  card.addEventListener('focusin', () => { focused = card.matches(':focus-visible'); sync(); });
  card.addEventListener('focusout', event => { if (!card.contains(event.relatedTarget)) focused = false; sync(); });
  motion.addEventListener('change', sync);
  doc.addEventListener('visibilitychange', sync);
  layers.forEach(img => { img.addEventListener('load', sync); img.addEventListener('error', sync); });
  return { setVisible(value) { visible = value; sync(); }, stop };
}

if (typeof document !== 'undefined') {
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const controllers = new Map();
  document.querySelectorAll('[data-event-motion]').forEach(card => controllers.set(card, bindEventTeaser(card, motion)));
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => controllers.get(entry.target)?.setVisible(entry.isIntersecting));
    }, { threshold: .1 });
    controllers.forEach((_, card) => observer.observe(card));
  }
}
