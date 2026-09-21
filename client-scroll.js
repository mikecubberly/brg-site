(function () {
  'use strict';
  var viewport = document.querySelector('.client-window');
  if (!viewport) return;
  var track = viewport.querySelector('.client-track');
  var group = track.querySelector('.client-group');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var release;
  // Scrub the same seamless animation, so manual movement never resets the strip.
  viewport.addEventListener('wheel', function (event) {
    if (event.ctrlKey || reduced.matches) return;
    var delta = event.deltaX;
    if (!delta && event.shiftKey) delta = event.deltaY;
    if (!delta || (!event.shiftKey && Math.abs(event.deltaY) > Math.abs(delta))) return;
    var animation = track.getAnimations()[0];
    var width = group.getBoundingClientRect().width;
    if (!animation || !width) return;
    var duration = Number(animation.effect.getTiming().duration);
    if (!Number.isFinite(duration) || duration <= 0) return;
    event.preventDefault();
    if (event.deltaMode === 1) delta *= 16;
    if (event.deltaMode === 2) delta *= viewport.clientWidth;
    track.dataset.manualScroll = 'true';
    var next = (Number(animation.currentTime) || 0) + delta / width * duration;
    animation.currentTime = ((next % duration) + duration) % duration;
    clearTimeout(release);
    release = setTimeout(function () { delete track.dataset.manualScroll; }, 1600);
  }, { passive: false });
})();
