/**
 * matrix.js
 * Dot field behind vertical title — dots morph into 0/1
 * Perf: visibility pause, throttled updates, preloader signal
 * Resize: ResizeObserver on container, no inline style overrides
 */
(function () {
  'use strict';

  var canvas = document.getElementById('matrixCanvas');
  if (!canvas) return;

  var wrap = canvas.parentElement;
  var ctx = canvas.getContext('2d');
  var dpr = Math.min(window.devicePixelRatio || 1, 2);

  var COLS = 28, ROWS = 30;
  var GAP_X = 11, GAP_Y = 11;
  var DOT_RADIUS = 1.3;
  var FONT_SIZE = 8;
  var BASE_OPACITY = 0.15;
  var COLOR = '60,60,60';

  var cells = [];
  for (var i = 0; i < COLS * ROWS; i++) {
    cells.push({
      char: '0', progress: 0, targetProgress: 0,
      timer: Math.random() * 600 | 0
    });
  }

  var isVisible = true;
  var rafId = null;
  var frameCount = 0;
  var lastW = 0, lastH = 0;

  function resize() {
    var rect = wrap.getBoundingClientRect();
    var w = Math.round(rect.width), h = Math.round(rect.height);
    if (w === lastW && h === lastH) return;
    if (w < 1 || h < 1) return;
    lastW = w; lastH = h;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    // Don't set canvas.style.width/height — CSS handles display size
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resize();

  // ResizeObserver — fires when % sizing changes container
  if (window.ResizeObserver) {
    new ResizeObserver(resize).observe(wrap);
  }
  window.addEventListener('resize', resize, { passive: true });

  // Visibility observer
  var vObs = new IntersectionObserver(function (e) {
    isVisible = e[0].isIntersecting;
    if (isVisible && !rafId) loop();
    if (!isVisible && rafId) { cancelAnimationFrame(rafId); rafId = null; }
  }, { threshold: 0.05 });
  vObs.observe(canvas);

  document.addEventListener('visibilitychange', function () {
    if (document.hidden && rafId) { cancelAnimationFrame(rafId); rafId = null; }
    else if (!document.hidden && isVisible) loop();
  });

  function update() {
    for (var i = 0; i < cells.length; i++) {
      var c = cells[i];
      c.timer--;
      if (c.timer <= 0 && Math.random() < 0.02) {
        c.targetProgress = c.targetProgress === 0 ? 1 : 0;
        c.char = Math.random() > 0.5 ? '1' : '0';
        c.timer = 200 + Math.random() * 400 | 0;
      }
      c.progress += (c.targetProgress - c.progress) * 0.04;
    }
  }

  function draw() {
    var w = canvas.width / dpr, h = canvas.height / dpr;
    ctx.clearRect(0, 0, w, h);

    var sx = (w - (COLS - 1) * GAP_X) / 2;
    var sy = (h - (ROWS - 1) * GAP_Y) / 2;

    ctx.font = FONT_SIZE + 'px "DM Sans",monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (var row = 0; row < ROWS; row++) {
      for (var col = 0; col < COLS; col++) {
        var c = cells[row * COLS + col];
        var x = sx + col * GAP_X, y = sy + row * GAP_Y;
        if (c.progress < 0.5) {
          var ds = 1 - c.progress * 2;
          ctx.beginPath();
          ctx.arc(x, y, DOT_RADIUS * ds, 0, 6.2832);
          ctx.fillStyle = 'rgba(' + COLOR + ',' + (BASE_OPACITY * ds) + ')';
          ctx.fill();
        } else {
          var cs = (c.progress - 0.5) * 2;
          ctx.fillStyle = 'rgba(' + COLOR + ',' + (BASE_OPACITY * cs) + ')';
          ctx.fillText(c.char, x, y);
        }
      }
    }
  }

  function loop() {
    if (!isVisible || document.hidden) { rafId = null; return; }
    frameCount++;
    if (window.innerWidth < 900 && frameCount % 2 !== 0) {
      rafId = requestAnimationFrame(loop);
      return;
    }
    update();
    draw();
    rafId = requestAnimationFrame(loop);
  }

  loop();
  window.dispatchEvent(new CustomEvent('matrix-ready'));
})();
