(function () {
  'use strict';

  var doc = document;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function clamp(v, min, max) {
    return v < min ? min : v > max ? max : v;
  }

  function initReveal() {
    var items = doc.querySelectorAll('[data-reveal]');
    if (!items.length) return;

    if (!('IntersectionObserver' in window) || reduceMotion.matches) {
      for (var i = 0; i < items.length; i++) items[i].classList.add('is-in');
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (!entries[i].isIntersecting) continue;
        entries[i].target.classList.add('is-in');
        io.unobserve(entries[i].target);
      }
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });

    for (var j = 0; j < items.length; j++) io.observe(items[j]);
  }

  function countUp(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    if (isNaN(target)) return;

    if (reduceMotion.matches) {
      el.textContent = target;
      return;
    }

    var duration = 900;
    var start = null;

    function step(now) {
      if (start === null) start = now;
      var p = clamp((now - start) / duration, 0, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) window.requestAnimationFrame(step);
    }

    el.textContent = '0';
    window.requestAnimationFrame(step);
  }

  function initCounters() {
    var nums = doc.querySelectorAll('[data-count]');
    if (!nums.length) return;

    if (!('IntersectionObserver' in window)) return;

    var io = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (!entries[i].isIntersecting) continue;
        countUp(entries[i].target);
        io.unobserve(entries[i].target);
      }
    }, { threshold: 0.6 });

    for (var j = 0; j < nums.length; j++) io.observe(nums[j]);
  }

  function initSectionBar() {
    var bar = doc.querySelector('[data-hx]');
    var hero = doc.querySelector('[data-hero]');
    if (!bar) return;

    var progress = bar.querySelector('[data-hx-progress]');
    var pct = bar.querySelector('[data-hx-pct]');
    var links = bar.querySelectorAll('[data-hx-link]');

    var sections = [];
    for (var i = 0; i < links.length; i++) {
      var id = links[i].getAttribute('href').slice(1);
      var el = doc.getElementById(id);
      if (el) sections.push({ link: links[i], el: el });
    }

    var asideFrom = doc.getElementById('topics');

    var pending = false;

    function update() {
      var y = window.pageYOffset || doc.documentElement.scrollTop;
      var heroBottom = hero ? hero.offsetTop + hero.offsetHeight - 120 : 240;

      var docked = y > heroBottom;

      bar.classList.toggle('is-docked', docked);
      doc.body.classList.toggle('is-docked', docked);
      doc.body.classList.toggle('is-scrolled', y > 12);

      var docH = doc.documentElement.scrollHeight - window.innerHeight;
      var span = Math.max(docH - heroBottom, 1);
      var p = clamp((y - heroBottom) / span, 0, 1);

      if (progress) progress.style.width = (p * 100).toFixed(1) + '%';
      if (pct) pct.textContent = Math.round(p * 100) + '%';

      var anchor = y + Math.min(window.innerHeight * 0.4, 400);

      doc.body.classList.toggle(
        'is-aside',
        asideFrom ? asideFrom.offsetTop <= anchor : docked
      );

      var active = -1;
      for (var i = 0; i < sections.length; i++) {
        if (sections[i].el.offsetTop <= anchor) active = i;
      }
      for (var j = 0; j < sections.length; j++) {
        sections[j].link.classList.toggle('is-active', j === active);
      }
    }

    function onScroll() {
      if (pending) return;
      pending = true;
      window.requestAnimationFrame(function () {
        pending = false;
        update();
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
  }

  function initGizmo() {
    var canvas = doc.querySelector('[data-gizmo]');
    if (!canvas || !canvas.getContext) return;

    var ctx = canvas.getContext('2d');
    var readout = doc.querySelector('[data-gizmo-rot]');

    var phi = (1 + Math.sqrt(5)) / 2;
    var verts = [];
    var raw = [
      [-1, phi, 0], [1, phi, 0], [-1, -phi, 0], [1, -phi, 0],
      [0, -1, phi], [0, 1, phi], [0, -1, -phi], [0, 1, -phi],
      [phi, 0, -1], [phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1]
    ];
    for (var i = 0; i < raw.length; i++) {
      var len = Math.sqrt(raw[i][0] * raw[i][0] + raw[i][1] * raw[i][1] + raw[i][2] * raw[i][2]);
      verts.push([raw[i][0] / len, raw[i][1] / len, raw[i][2] / len]);
    }

    var minDist = Infinity;
    for (var a = 0; a < verts.length; a++) {
      for (var b = a + 1; b < verts.length; b++) {
        var d = dist(verts[a], verts[b]);
        if (d < minDist) minDist = d;
      }
    }
    var edges = [];
    for (var m = 0; m < verts.length; m++) {
      for (var n = m + 1; n < verts.length; n++) {
        if (Math.abs(dist(verts[m], verts[n]) - minDist) < 0.001) edges.push([m, n]);
      }
    }

    function dist(p, q) {
      var dx = p[0] - q[0], dy = p[1] - q[1], dz = p[2] - q[2];
      return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    var boxS = 0.95;
    var box = [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
      [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
    ].map(function (p) { return [p[0] * boxS, p[1] * boxS, p[2] * boxS]; });
    var boxEdges = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7]
    ];

    var rx = -0.42, ry = 0.6;
    var vx = 0, vy = 0;
    var dragging = false;
    var lastX = 0, lastY = 0;
    var w = 0, h = 0, dpr = 1;
    var visible = true;
    var running = false;

    function rotate(p) {
      var cy = Math.cos(ry), sy = Math.sin(ry);
      var x = p[0] * cy - p[2] * sy;
      var z = p[0] * sy + p[2] * cy;
      var cx = Math.cos(rx), sx = Math.sin(rx);
      var y = p[1] * cx - z * sx;
      z = p[1] * sx + z * cx;
      return [x, y, z];
    }

    function project(p, radius) {
      var r = rotate(p);
      var depth = 4.6;
      var s = depth / (depth - r[2]);
      return {
        x: w / 2 + r[0] * radius * s,
        y: h / 2 + r[1] * radius * s,
        z: r[2]
      };
    }

    function resize() {
      var rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    }

    function drawAxis(radius) {
      var ox = 26, oy = h - 26, len = 17;
      var axes = [
        { v: [1, 0, 0], c: '#ff7a90', n: 'X' },
        { v: [0, -1, 0], c: '#8ee2a0', n: 'Y' },
        { v: [0, 0, 1], c: '#7fb2ff', n: 'Z' }
      ];
      axes.sort(function (p, q) { return rotate(p.v)[2] - rotate(q.v)[2]; });

      for (var i = 0; i < axes.length; i++) {
        var r = rotate(axes[i].v);
        var ex = ox + r[0] * len;
        var ey = oy + r[1] * len;
        var far = r[2] < 0;

        ctx.globalAlpha = far ? 0.35 : 0.95;
        ctx.strokeStyle = axes[i].c;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.lineTo(ex, ey);
        ctx.stroke();

        ctx.fillStyle = axes[i].c;
        ctx.beginPath();
        ctx.arc(ex, ey, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    function draw() {
      if (!w || !h) return;
      ctx.clearRect(0, 0, w, h);

      var radius = Math.min(w, h) * 0.30;

      ctx.strokeStyle = 'rgba(145, 102, 252, 0.14)';
      ctx.lineWidth = 1;
      for (var g = -2; g <= 2; g++) {
        var p1 = project([g / 2.2, 0.98, -1.1], radius);
        var p2 = project([g / 2.2, 0.98, 1.1], radius);
        var p3 = project([-1.1, 0.98, g / 2.2], radius);
        var p4 = project([1.1, 0.98, g / 2.2], radius);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
        ctx.moveTo(p3.x, p3.y); ctx.lineTo(p4.x, p4.y);
        ctx.stroke();
      }

      ctx.strokeStyle = 'rgba(173, 167, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);
      for (var e = 0; e < boxEdges.length; e++) {
        var b1 = project(box[boxEdges[e][0]], radius);
        var b2 = project(box[boxEdges[e][1]], radius);
        ctx.beginPath();
        ctx.moveTo(b1.x, b1.y);
        ctx.lineTo(b2.x, b2.y);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      var lines = [];
      for (var k = 0; k < edges.length; k++) {
        var a = project(verts[edges[k][0]], radius);
        var b = project(verts[edges[k][1]], radius);
        lines.push({ a: a, b: b, z: (a.z + b.z) / 2 });
      }
      lines.sort(function (p, q) { return p.z - q.z; });

      for (var l = 0; l < lines.length; l++) {
        var t = clamp((lines[l].z + 1) / 2, 0, 1);
        ctx.strokeStyle = 'rgba(178, 148, 255, ' + (0.18 + t * 0.72).toFixed(3) + ')';
        ctx.lineWidth = 0.8 + t * 1.3;
        ctx.beginPath();
        ctx.moveTo(lines[l].a.x, lines[l].a.y);
        ctx.lineTo(lines[l].b.x, lines[l].b.y);
        ctx.stroke();
      }

      var pts = [];
      for (var v = 0; v < verts.length; v++) pts.push(project(verts[v], radius));
      pts.sort(function (p, q) { return p.z - q.z; });

      for (var s = 0; s < pts.length; s++) {
        var tt = clamp((pts[s].z + 1) / 2, 0, 1);
        ctx.fillStyle = 'rgba(226, 214, 255, ' + (0.35 + tt * 0.65).toFixed(3) + ')';
        ctx.shadowColor = 'rgba(145, 102, 252, 0.9)';
        ctx.shadowBlur = 4 + tt * 8;
        ctx.beginPath();
        ctx.arc(pts[s].x, pts[s].y, 1.6 + tt * 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      drawAxis(radius);

      if (readout) {
        readout.textContent =
          'x ' + (rx * 57.2958).toFixed(0) + '° · y ' + (((ry * 57.2958) % 360).toFixed(0)) + '°';
      }
    }

    function tick() {
      if (!running) return;

      if (!dragging) {
        ry += vy + 0.0032;
        rx += vx;
        vx *= 0.94;
        vy *= 0.94;
        if (Math.abs(vx) < 0.00005) vx = 0;
        if (Math.abs(vy) < 0.00005) vy = 0;
        rx += (-0.42 - rx) * 0.012;
      }

      rx = clamp(rx, -1.2, 1.2);
      draw();
      window.requestAnimationFrame(tick);
    }

    function start() {
      if (running || reduceMotion.matches) return;
      running = true;
      window.requestAnimationFrame(tick);
    }

    function stop() {
      running = false;
    }

    function onDown(e) {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      vx = vy = 0;
      if (canvas.setPointerCapture && e.pointerId !== undefined) {
        canvas.setPointerCapture(e.pointerId);
      }
    }

    function onMove(e) {
      if (!dragging) return;
      var dx = e.clientX - lastX;
      var dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      ry += dx * 0.009;
      rx = clamp(rx + dy * 0.009, -1.2, 1.2);
      vy = dx * 0.0022;
      vx = dy * 0.0022;
      if (!running) draw();
    }

    function onUp(e) {
      if (!dragging) return;
      dragging = false;
      if (canvas.releasePointerCapture && e.pointerId !== undefined) {
        try { canvas.releasePointerCapture(e.pointerId); } catch (err) {}
      }
    }

    if (window.PointerEvent) {
      canvas.addEventListener('pointerdown', onDown);
      canvas.addEventListener('pointermove', onMove);
      canvas.addEventListener('pointerup', onUp);
      canvas.addEventListener('pointercancel', onUp);
      canvas.addEventListener('pointerleave', onUp);
    }

    if ('ResizeObserver' in window) {
      new ResizeObserver(resize).observe(canvas);
    } else {
      window.addEventListener('resize', resize);
    }

    resize();

    if (reduceMotion.matches) {
      draw();
    } else if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries[0].isIntersecting ? start() : stop();
        visible = entries[0].isIntersecting;
      }, { threshold: 0.05 }).observe(canvas);
    } else {
      start();
    }

    doc.addEventListener('visibilitychange', function () {
      if (doc.hidden) stop();
      else if (visible) start();
    });
  }

  function initHeatmap() {
    var hm = doc.querySelector('[data-hm]');
    if (!hm) return;

    var tip = hm.querySelector('[data-hm-tip]');
    if (!tip) return;

    function show(cell) {
      var text = cell.getAttribute('data-tip');
      if (!text) return;
      tip.textContent = text;
      var cr = cell.getBoundingClientRect();
      var hr = hm.getBoundingClientRect();
      tip.style.left = (cr.left - hr.left + cr.width / 2) + 'px';
      tip.style.top = (cr.top - hr.top - 4) + 'px';
      tip.classList.add('is-on');
    }

    hm.addEventListener('mouseover', function (e) {
      var cell = e.target.closest ? e.target.closest('.hm__cell') : null;
      if (cell) show(cell);
    });

    hm.addEventListener('mouseout', function (e) {
      var cell = e.target.closest ? e.target.closest('.hm__cell') : null;
      if (cell) tip.classList.remove('is-on');
    });

    hm.addEventListener('touchstart', function (e) {
      var cell = e.target.closest ? e.target.closest('.hm__cell') : null;
      if (cell) show(cell);
    }, { passive: true });
  }

  function initAnchors() {
    var links = doc.querySelectorAll('.hx__links a, .hero__cue');

    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener('click', function (e) {
        var id = this.getAttribute('href');
        if (!id || id.charAt(0) !== '#') return;
        var target = doc.getElementById(id.slice(1));
        if (!target) return;
        e.preventDefault();
        var top = target.getBoundingClientRect().top + window.pageYOffset - 138;
        window.scrollTo({
          top: top,
          behavior: reduceMotion.matches ? 'auto' : 'smooth'
        });
      });
    }
  }

  function init() {
    initReveal();
    initCounters();
    initSectionBar();
    initGizmo();
    initHeatmap();
    initAnchors();
  }

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
