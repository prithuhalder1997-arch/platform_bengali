/**
 * ka-rotation.js
 * 3D extruded Bengali letter ক — clean sculptural style
 *
 * CANVAS RESIZE STRATEGY:
 * The .ka-canvas-wrap container is sized by CSS (% of the
 * aspect-ratio wrapper). A ResizeObserver watches the container
 * and resizes the canvas buffer to match. All rendering uses
 * a fixed 520×520 design space; ctx.scale() maps it to the
 * actual buffer. Result: crisp rendering at any size, no distortion.
 */
(function () {
  'use strict';

  var canvas = document.getElementById('kaCanvas');
  if (!canvas) return;

  var wrap = canvas.parentElement;
  var ctx = canvas.getContext('2d');
  var dpr = Math.min(window.devicePixelRatio || 1, 2);

  // Fixed design coordinate space — all rendering math uses this
  var SIZE = 520;
  var DEPTH = 30;
  var HALF = DEPTH / 2;
  var FONT = '900 360px "Noto Sans Bengali"';
  var CX = SIZE / 2;
  var CY = SIZE / 2 + 8;
  var SLANT = -0.1;
  var angle = 0;
  var SPEED = (2 * Math.PI) / (16 * 60);
  var SLICES = window.innerWidth < 900 ? 120 : 280;

  var isVisible = true;
  var rafId = null;
  var started = false;

  // Current container dimensions
  var bufW = 0, bufH = 0;

  /**
   * Sync canvas buffer to container's CSS pixel size.
   * ctx.scale maps 520×520 design coords → actual buffer.
   */
  function syncSize() {
    var rect = wrap.getBoundingClientRect();
    var w = Math.round(rect.width);
    var h = Math.round(rect.height);
    if (w === bufW && h === bufH) return;
    if (w < 1 || h < 1) return;

    bufW = w;
    bufH = h;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
  }

  syncSize();

  // ResizeObserver — fires when CSS % sizing changes the container
  if (window.ResizeObserver) {
    new ResizeObserver(function () {
      syncSize();
      if (started && isVisible) render();
    }).observe(wrap);
  }
  window.addEventListener('resize', syncSize, { passive: true });

  // Pause when off-screen
  var vObs = new IntersectionObserver(function (e) {
    isVisible = e[0].isIntersecting;
    if (isVisible && started && !rafId) tick();
    if (!isVisible && rafId) { cancelAnimationFrame(rafId); rafId = null; }
  }, { threshold: 0.05 });
  vObs.observe(canvas);

  // Pause on tab switch
  document.addEventListener('visibilitychange', function () {
    if (document.hidden && rafId) { cancelAnimationFrame(rafId); rafId = null; }
    else if (!document.hidden && isVisible && started) tick();
  });

  function render() {
    // Reset transform and clear, then apply design→buffer mapping
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale((bufW * dpr) / SIZE, (bufH * dpr) / SIZE);

    var cosA = Math.cos(angle), sinA = Math.sin(angle);
    var cs = Math.max(Math.abs(cosA), 0.008);
    var slices = [];

    for (var i = 0; i < SLICES; i++) {
      var t = i / (SLICES - 1), z = -HALF + t * DEPTH;
      var b = (0.15 + 0.85 * t) * (0.4 + 0.6 * Math.abs(sinA));
      slices.push({ sx: sinA * z, sz: cosA * z,
        r: 12 + b * 38 | 0, g: 11 + b * 36 | 0, b: 10 + b * 33 | 0 });
    }

    var fb = 0.6 + 0.4 * Math.max(cosA, 0);
    slices.push({ sx: sinA * HALF, sz: cosA * HALF,
      r: 30 + fb * 30 | 0, g: 28 + fb * 28 | 0, b: 26 + fb * 26 | 0 });
    var bb = 0.3 + 0.3 * Math.max(-cosA, 0);
    slices.push({ sx: sinA * -HALF, sz: cosA * -HALF,
      r: 10 + bb * 18 | 0, g: 9 + bb * 16 | 0, b: 8 + bb * 14 | 0 });

    slices.sort(function (a, b) { return a.sz - b.sz; });

    ctx.font = FONT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.miterLimit = 1;

    for (var j = 0; j < slices.length; j++) {
      var s = slices[j];
      ctx.save();
      ctx.translate(CX + s.sx, CY);
      ctx.transform(cs, 0, SLANT * cs, 1, 0, 0);
      var c = 'rgb(' + s.r + ',' + s.g + ',' + s.b + ')';
      ctx.lineWidth = Math.min(1.5 / cs, 3);
      ctx.strokeStyle = c;
      ctx.strokeText('\u0995', 0, 0);
      ctx.fillStyle = c;
      ctx.fillText('\u0995', 0, 0);
      ctx.restore();
    }

    // Shadow
    var sw = 100 + Math.abs(sinA) * 40;
    var gr = ctx.createRadialGradient(CX, CY + 150, 0, CX, CY + 150, sw);
    gr.addColorStop(0, 'rgba(0,0,0,0.06)');
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gr;
    ctx.fillRect(CX - sw, CY + 130, sw * 2, 50);

    angle += SPEED;
  }

  function tick() {
    if (!isVisible || document.hidden) { rafId = null; return; }
    render();
    rafId = requestAnimationFrame(tick);
  }

  document.fonts.ready.then(function () {
    started = true;
    syncSize();
    render();
    tick();
    window.dispatchEvent(new CustomEvent('ka-ready'));
  });
})();
