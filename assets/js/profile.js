/* ────────────────────────────────────────────────────────────────
 *  프로필 페이지 인터랙션
 *   1) 스크롤 등장 (IntersectionObserver)
 *   2) 스탯 카운트업
 *   3) 섹션 바 도킹 · 진행률 · 현재 섹션 표시
 *   4) 히어로 : 직함 타이핑 + 인스펙터 카드 틸트
 *   5) 타임라인 : 경력/학력 탭 + 스크롤에 따라 차오르는 레일
 *   6) 기술 스택 : 캔버스 레이더 차트 + 카드 연동
 *   7) 최근 프로젝트 : 탭 / 스와이프 + 영상 백그라운드 순차 로딩
 *   8) 주요 작업 : 키워드 필터 + 담당 업무 펼치기
 *   9) 아카이브 아코디언 · 논문 필터 · 연락처 복사
 * ──────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var doc = document;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function clamp(v, min, max) {
    return v < min ? min : v > max ? max : v;
  }

  function $(sel, root) { return (root || doc).querySelector(sel); }
  function $$(sel, root) {
    return Array.prototype.slice.call((root || doc).querySelectorAll(sel));
  }

  // ── 1. 스크롤 등장 ────────────────────────────────────────────
  function initReveal() {
    var items = $$('[data-reveal]');
    if (!items.length) return;

    if (!('IntersectionObserver' in window) || reduceMotion.matches) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });

    items.forEach(function (el) { io.observe(el); });
  }

  // ── 2. 스탯 카운트업 ──────────────────────────────────────────
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
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) window.requestAnimationFrame(step);
    }

    el.textContent = '0';
    window.requestAnimationFrame(step);
  }

  function initCounters() {
    var nums = $$('[data-count]');
    if (!nums.length) return;

    if (!('IntersectionObserver' in window)) {
      nums.forEach(function (el) { el.textContent = el.getAttribute('data-count'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        countUp(e.target);
        io.unobserve(e.target);
      });
    }, { threshold: 0.6 });

    nums.forEach(function (el) { io.observe(el); });
  }

  // ── 3. 섹션 바 ────────────────────────────────────────────────
  function initSectionBar() {
    var bar = $('[data-hx]');
    if (!bar) return;

    var hero = $('[data-pf-hero]');
    var progress = $('[data-hx-progress]', bar);
    var pct = $('[data-hx-pct]', bar);

    var sections = $$('[data-hx-link]', bar).map(function (link) {
      return { link: link, el: doc.getElementById(link.getAttribute('href').slice(1)) };
    }).filter(function (s) { return !!s.el; });

    var pending = false;

    function topOf(el) {
      return el.getBoundingClientRect().top + window.pageYOffset;
    }

    function update() {
      var y = window.pageYOffset || doc.documentElement.scrollTop;
      var heroBottom = hero ? topOf(hero) + hero.offsetHeight - 140 : 240;

      var docked = y > heroBottom;

      bar.classList.toggle('is-docked', docked);
      // 좌우 고정 사이드바도 같은 시점에 등장한다 (_profile.scss)
      doc.body.classList.toggle('is-docked', docked);
      doc.body.classList.toggle('is-scrolled', y > 12);

      var docH = doc.documentElement.scrollHeight - window.innerHeight;
      var span = Math.max(docH - heroBottom, 1);
      var p = clamp((y - heroBottom) / span, 0, 1);

      if (progress) progress.style.width = (p * 100).toFixed(1) + '%';
      if (pct) pct.textContent = Math.round(p * 100) + '%';

      var anchor = y + Math.min(window.innerHeight * 0.4, 400);
      var active = -1;
      sections.forEach(function (s, i) {
        if (topOf(s.el) <= anchor) active = i;
      });
      sections.forEach(function (s, i) {
        s.link.classList.toggle('is-active', i === active);
      });
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

  // ── 부드러운 앵커 이동 ────────────────────────────────────────
  function initAnchors() {
    $$('.hx__links a').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var id = this.getAttribute('href');
        if (!id || id.charAt(0) !== '#') return;
        var target = doc.getElementById(id.slice(1));
        if (!target) return;
        e.preventDefault();
        window.scrollTo({
          top: target.getBoundingClientRect().top + window.pageYOffset - 138,
          behavior: reduceMotion.matches ? 'auto' : 'smooth'
        });
      });
    });
  }

  // ── 4-1. 직함 타이핑 ──────────────────────────────────────────
  function initTyper() {
    var el = $('[data-pf-type]');
    if (!el) return;

    var words = (el.getAttribute('data-words') || '').split('|').filter(Boolean);
    if (words.length < 2 || reduceMotion.matches) return;

    var wordIndex = 0;
    var charIndex = words[0].length;
    var deleting = false;
    var paused = false;

    // 화면 밖이면 타이핑을 쉰다
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        paused = !entries[0].isIntersecting;
      }, { threshold: 0 }).observe(el);
    }

    function tick() {
      if (paused) {
        window.setTimeout(tick, 600);
        return;
      }

      var word = words[wordIndex];
      var delay;

      if (deleting) {
        charIndex -= 1;
        delay = 34;
        if (charIndex <= 0) {
          deleting = false;
          wordIndex = (wordIndex + 1) % words.length;
          delay = 220;
        }
      } else {
        charIndex += 1;
        delay = 68;
        if (charIndex >= word.length) {
          charIndex = word.length;
          deleting = true;
          delay = 2100;
        }
      }

      el.textContent = word.slice(0, charIndex);
      window.setTimeout(tick, delay);
    }

    window.setTimeout(tick, 2100);
  }

  // ── 4-2. 인스펙터 카드 틸트 ───────────────────────────────────
  function initTilt() {
    var card = $('[data-pf-tilt]');
    if (!card || reduceMotion.matches) return;
    // 포인터가 없는(터치) 환경에서는 틸트를 걸지 않는다
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    function move(e) {
      var r = card.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      card.classList.add('is-tilting');
      card.style.transform =
        'perspective(760px) rotateY(' + (x * 11).toFixed(2) + 'deg) rotateX(' +
        (-y * 11).toFixed(2) + 'deg) translateZ(6px)';
    }

    function leave() {
      card.classList.remove('is-tilting');
      card.style.transform = '';
    }

    card.addEventListener('pointermove', move);
    card.addEventListener('pointerleave', leave);
    card.addEventListener('pointercancel', leave);
  }

  // ── 5. 타임라인 ───────────────────────────────────────────────
  function initTimeline() {
    var root = $('[data-pf-timeline]');
    if (!root) return;

    var tabs = $$('[data-tl-tab]', root);
    var items = $$('.tl__item', root);
    var list = $('[data-tl-list]', root);
    var rail = $('[data-tl-rail]', root);

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var kind = tab.getAttribute('data-tl-tab');

        tabs.forEach(function (t) {
          var on = t === tab;
          t.classList.toggle('is-on', on);
          t.setAttribute('aria-selected', on ? 'true' : 'false');
        });

        items.forEach(function (item) {
          item.classList.toggle(
            'is-hide',
            kind !== 'all' && item.getAttribute('data-tl-kind') !== kind
          );
        });

        updateRail();
      });
    });

    var pending = false;

    function updateRail() {
      if (!rail || !list) return;
      var r = list.getBoundingClientRect();
      var mid = window.innerHeight * 0.55;
      var p = clamp((mid - r.top) / Math.max(r.height, 1), 0, 1);
      rail.style.height = (p * 100).toFixed(1) + '%';
    }

    function onScroll() {
      if (pending) return;
      pending = true;
      window.requestAnimationFrame(function () {
        pending = false;
        updateRail();
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    updateRail();
  }

  // ── 6. 기술 스택 레이더 ───────────────────────────────────────
  function initStack() {
    var root = $('[data-pf-stack]');
    if (!root) return;

    var canvas = $('[data-st-canvas]', root);
    var cards = $$('[data-st-card]', root);
    var details = $$('[data-st-detail]', root);
    if (!canvas || !canvas.getContext || !cards.length) return;

    var ctx = canvas.getContext('2d');

    // 카드에서 축 정보를 읽어 온다 (데이터 원본은 _data/stack.yml)
    var axes = cards.map(function (card) {
      var detail = $('[data-st-detail="' + card.getAttribute('data-st-card') + '"]', root);
      var titleEl = detail ? $('.st__detail-title', detail) : null;
      var label = titleEl ? titleEl.textContent.replace(/\s*\d+\s*\/\s*100\s*$/, '').trim() : '';
      return {
        label: label || $('.st__card-name', card).textContent.trim(),
        value: parseInt($('.st__card-lv', card).textContent, 10) || 0
      };
    });

    var LABEL_FONT = '600 11.5px "Noto Sans KR", sans-serif';
    var LABEL_GAP = 13;    // 폴리곤 바깥쪽 라벨까지의 여백

    var active = 0;
    var grow = 0;          // 0 → 1 진입 애니메이션
    var hover = -1;
    var w = 0, h = 0, cx = 0, cy = 0, radius = 0;
    var pts = [];          // 축 라벨 히트 테스트용

    function resize() {
      var rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = w / 2;
      cy = h / 2 + 2;

      // 축 라벨이 캔버스 밖으로 잘리지 않도록 가장 긴 라벨 폭을 재어 반지름을 정한다
      ctx.font = LABEL_FONT;
      var maxLabel = 0;
      var maxCos = 0;
      axes.forEach(function (ax, i) {
        maxLabel = Math.max(maxLabel, ctx.measureText(ax.label).width);
        maxCos = Math.max(maxCos, Math.abs(Math.cos((Math.PI * 2 * i) / axes.length - Math.PI / 2)));
      });
      if (maxCos < 0.1) maxCos = 0.1;

      var byWidth = (w / 2 - 6 - maxLabel) / maxCos - LABEL_GAP;
      var byHeight = h / 2 - LABEL_GAP - 24;   // 아래쪽 라벨 밑의 수치까지 감안
      radius = Math.max(46, Math.min(byWidth, byHeight, Math.min(w, h) * 0.37));

      draw();
    }

    function pointAt(i, ratio) {
      var a = (Math.PI * 2 * i) / axes.length - Math.PI / 2;
      return { x: cx + Math.cos(a) * radius * ratio, y: cy + Math.sin(a) * radius * ratio, a: a };
    }

    // 라벨은 비율이 아니라 폴리곤 바깥쪽 고정 여백에 놓는다
    function labelAt(i) {
      var a = (Math.PI * 2 * i) / axes.length - Math.PI / 2;
      var r = radius + LABEL_GAP;
      return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, a: a };
    }

    function draw() {
      if (!w || !h) return;
      ctx.clearRect(0, 0, w, h);

      // 배경 그물
      for (var ring = 1; ring <= 4; ring++) {
        var rr = ring / 4;
        ctx.beginPath();
        for (var i = 0; i <= axes.length; i++) {
          var p = pointAt(i % axes.length, rr);
          i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
        }
        ctx.closePath();
        ctx.strokeStyle = 'rgba(173, 167, 255, ' + (ring === 4 ? 0.3 : 0.13) + ')';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // 축선
      pts = [];
      for (var k = 0; k < axes.length; k++) {
        var edge = pointAt(k, 1);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(edge.x, edge.y);
        ctx.strokeStyle = k === active ? 'rgba(173, 167, 255, .55)' : 'rgba(173, 167, 255, .16)';
        ctx.lineWidth = 1;
        ctx.stroke();
        pts.push(labelAt(k));
      }

      // 데이터 폴리곤
      ctx.beginPath();
      for (var v = 0; v <= axes.length; v++) {
        var idx = v % axes.length;
        var p2 = pointAt(idx, (axes[idx].value / 100) * grow);
        v === 0 ? ctx.moveTo(p2.x, p2.y) : ctx.lineTo(p2.x, p2.y);
      }
      ctx.closePath();

      var g = ctx.createLinearGradient(cx - radius, cy - radius, cx + radius, cy + radius);
      g.addColorStop(0, 'rgba(145, 102, 252, .42)');
      g.addColorStop(1, 'rgba(173, 167, 255, .3)');
      ctx.fillStyle = g;
      ctx.fill();
      ctx.strokeStyle = 'rgba(178, 148, 255, .95)';
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // 꼭짓점
      for (var n = 0; n < axes.length; n++) {
        var vp = pointAt(n, (axes[n].value / 100) * grow);
        var on = n === active || n === hover;
        ctx.beginPath();
        ctx.arc(vp.x, vp.y, on ? 5.2 : 3.2, 0, Math.PI * 2);
        ctx.fillStyle = on ? '#ffffff' : 'rgba(226, 214, 255, .9)';
        ctx.shadowColor = 'rgba(145, 102, 252, .95)';
        ctx.shadowBlur = on ? 14 : 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // 축 라벨
      ctx.font = LABEL_FONT;
      ctx.textBaseline = 'middle';
      for (var m = 0; m < axes.length; m++) {
        var lp = labelAt(m);
        var cos = Math.cos(lp.a);
        ctx.textAlign = Math.abs(cos) < 0.25 ? 'center' : (cos > 0 ? 'left' : 'right');
        var isOn = m === active || m === hover;
        ctx.fillStyle = isOn ? '#ffffff' : 'rgba(255, 255, 255, .5)';
        ctx.fillText(axes[m].label, lp.x, lp.y);

        // 활성 축에만 수치를 붙인다
        if (isOn) {
          ctx.font = '700 10px D2Coding, monospace';
          ctx.fillStyle = 'rgba(173, 167, 255, .95)';
          ctx.fillText(axes[m].value + '', lp.x, lp.y + 13);
          ctx.font = LABEL_FONT;
        }
      }
    }

    function animateIn() {
      if (reduceMotion.matches) {
        grow = 1;
        draw();
        return;
      }
      var start = null;
      function step(now) {
        if (start === null) start = now;
        var p = clamp((now - start) / 900, 0, 1);
        grow = 1 - Math.pow(1 - p, 3);
        draw();
        if (p < 1) window.requestAnimationFrame(step);
      }
      window.requestAnimationFrame(step);
    }

    function select(i) {
      active = i;
      cards.forEach(function (c, ci) { c.classList.toggle('is-on', ci === i); });
      details.forEach(function (d, di) { d.classList.toggle('is-on', di === i); });
      draw();
    }

    cards.forEach(function (card, i) {
      card.addEventListener('click', function () { select(i); });
      card.addEventListener('mouseenter', function () { hover = i; draw(); });
      card.addEventListener('mouseleave', function () { hover = -1; draw(); });
    });

    // 캔버스 위에서 가장 가까운 축을 집어낸다
    function pick(e) {
      var r = canvas.getBoundingClientRect();
      var x = e.clientX - r.left;
      var y = e.clientY - r.top;
      var best = -1;
      var bestD = 34;
      pts.forEach(function (p, i) {
        var d = Math.sqrt((p.x - x) * (p.x - x) + (p.y - y) * (p.y - y));
        if (d < bestD) { bestD = d; best = i; }
      });
      return best;
    }

    canvas.addEventListener('mousemove', function (e) {
      var i = pick(e);
      if (i === hover) return;
      hover = i;
      canvas.style.cursor = i >= 0 ? 'pointer' : 'default';
      draw();
    });

    canvas.addEventListener('mouseleave', function () { hover = -1; draw(); });

    canvas.addEventListener('click', function (e) {
      var i = pick(e);
      if (i >= 0) select(i);
    });

    if ('ResizeObserver' in window) {
      new ResizeObserver(resize).observe(canvas);
    } else {
      window.addEventListener('resize', resize);
    }

    resize();

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        root.classList.add('is-in');
        animateIn();
        io.disconnect();
      }, { threshold: 0.2 });
      io.observe(root);
    } else {
      root.classList.add('is-in');
      grow = 1;
      draw();
    }
  }

  // ── 7. 최근 프로젝트 : 탭 + 영상 백그라운드 로딩 ──────────────
  function initWorks() {
    var root = $('[data-pf-works]');
    if (!root) return;

    var tabs = $$('[data-wk-tab]', root);
    var panels = $$('[data-wk-panel]', root);
    if (!panels.length) return;

    var current = 0;

    // 영상별 로딩 상태
    var slots = panels.map(function (panel, i) {
      return {
        index: i,
        panel: panel,
        media: $('[data-wk-media]', panel),
        video: $('[data-wk-video]', panel),
        load: $('[data-wk-load]', panel),
        pct: $('[data-wk-pct]', panel),
        dot: tabs[i] ? $('[data-wk-tab-dot]', tabs[i]) : null,
        state: 'idle'   // idle → loading → ready / failed
      };
    });

    function setPct(slot, ratio) {
      if (slot.pct) slot.pct.textContent = Math.round(clamp(ratio, 0, 1) * 100) + '%';
    }

    function markReady(slot) {
      if (slot.state === 'ready') return;
      slot.state = 'ready';
      setPct(slot, 1);
      if (slot.load) slot.load.classList.add('is-done');
      if (slot.video) slot.video.classList.add('is-ready');
      if (slot.dot) {
        slot.dot.classList.remove('is-loading');
        slot.dot.classList.add('is-ready');
      }
      if (slot.index === current) play(slot);
    }

    function markFailed(slot) {
      slot.state = 'failed';
      if (slot.dot) slot.dot.classList.remove('is-loading');
      if (slot.load) {
        var text = $('.wk__load-text', slot.load);
        var ring = $('.wk__load-ring', slot.load);
        if (ring) ring.style.display = 'none';
        if (text) text.textContent = '영상을 불러오지 못했습니다';
      }
    }

    function play(slot) {
      if (!slot.video || slot.state !== 'ready') return;
      var p = slot.video.play();
      if (p && p.catch) p.catch(function () { /* 자동재생 차단은 무시 */ });
    }

    // ── 영상 패닝 ──────────────────────────────────────────────
    //  object-fit: cover 로 잘려 나간 영역을 마우스로 끌어서 볼 수 있게 한다.
    //  터치에서는 좌우 스와이프(프로젝트 전환)와 충돌하므로 마우스에서만 동작한다.
    var canPan = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    function initPan(slot) {
      var media = slot.media;
      var video = slot.video;
      if (!canPan || !media || !video) return;

      var pos = { x: 50, y: 50 };
      var over = { x: 0, y: 0 };
      var dragging = false;
      var lastX = 0, lastY = 0;

      // cover 로 확대된 영상이 컨테이너 밖으로 얼마나 넘치는지 계산한다
      function measure() {
        var vw = video.videoWidth;
        var vh = video.videoHeight;
        var r = media.getBoundingClientRect();
        if (!vw || !vh || !r.width || !r.height) return;

        var scale = Math.max(r.width / vw, r.height / vh);
        over.x = Math.max(0, vw * scale - r.width);
        over.y = Math.max(0, vh * scale - r.height);
        media.classList.toggle('is-pannable', over.x > 2 || over.y > 2);
      }

      video.addEventListener('loadedmetadata', measure);
      video.addEventListener('canplay', measure);
      window.addEventListener('resize', measure);

      media.addEventListener('pointerdown', function (e) {
        if (e.pointerType && e.pointerType !== 'mouse') return;
        if (e.target.closest && e.target.closest('.wk__nav')) return;
        measure();
        if (over.x <= 2 && over.y <= 2) return;

        dragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
        media.classList.add('is-panning');
        if (media.setPointerCapture && e.pointerId !== undefined) {
          media.setPointerCapture(e.pointerId);
        }
        e.preventDefault();
      });

      media.addEventListener('pointermove', function (e) {
        if (!dragging) return;
        var dx = e.clientX - lastX;
        var dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;

        // 끄는 방향으로 영상이 따라오도록 object-position 을 반대로 움직인다
        if (over.x > 2) pos.x = clamp(pos.x - (dx / over.x) * 100, 0, 100);
        if (over.y > 2) pos.y = clamp(pos.y - (dy / over.y) * 100, 0, 100);
        video.style.objectPosition = pos.x.toFixed(2) + '% ' + pos.y.toFixed(2) + '%';
      });

      function endPan(e) {
        if (!dragging) return;
        dragging = false;
        media.classList.remove('is-panning');
        if (media.releasePointerCapture && e.pointerId !== undefined) {
          try { media.releasePointerCapture(e.pointerId); } catch (err) { /* noop */ }
        }
      }

      media.addEventListener('pointerup', endPan);
      media.addEventListener('pointercancel', endPan);

      // 더블클릭하면 가운데로 되돌린다
      media.addEventListener('dblclick', function () {
        pos.x = 50;
        pos.y = 50;
        video.style.objectPosition = '';
      });
    }

    // ── 한 개의 영상 로딩 (페이지 렌더링과 무관하게 백그라운드로) ──
    function load(slot) {
      return new Promise(function (resolve) {
        var video = slot.video;
        if (!video || slot.state !== 'idle') { resolve(); return; }

        var src = video.getAttribute('data-src');
        if (!src) { resolve(); return; }

        slot.state = 'loading';
        if (slot.dot) slot.dot.classList.add('is-loading');

        var settled = false;
        function done(ok) {
          if (settled) return;
          settled = true;
          ok ? markReady(slot) : markFailed(slot);
          resolve();
        }

        // buffered 를 읽어 진행률을 그려 준다
        video.addEventListener('progress', function () {
          if (!video.duration || !video.buffered.length) return;
          setPct(slot, video.buffered.end(video.buffered.length - 1) / video.duration);
        });

        video.addEventListener('loadedmetadata', function () {
          // 메타데이터만 와도 첫 프레임을 띄울 준비가 된다
          setPct(slot, 0.05);
        });

        // canplaythrough 를 기다리면 40MB 짜리는 너무 오래 걸리므로
        // 재생 가능해지는 순간 바로 노출한다 (나머지는 스트리밍으로 채워진다)
        video.addEventListener('canplay', function () { done(true); });
        video.addEventListener('error', function () { done(false); });

        // 혹시 이벤트가 오지 않는 브라우저를 위한 안전장치
        window.setTimeout(function () {
          if (!settled && video.readyState >= 2) done(true);
        }, 20000);

        video.preload = 'auto';
        video.src = src;
        video.load();
      });
    }

    // ── 로딩 큐 : 보이는 것부터 하나씩 (동시에 받으면 서로 느려진다) ──
    var queue = [];
    var pumping = false;

    function pump() {
      if (pumping) return;
      pumping = true;

      (function next() {
        var slot = queue.shift();
        if (!slot) { pumping = false; return; }
        if (slot.state !== 'idle') { next(); return; }
        load(slot).then(next);
      })();
    }

    function enqueue(slot, front) {
      if (!slot || slot.state !== 'idle' || queue.indexOf(slot) >= 0) return;
      front ? queue.unshift(slot) : queue.push(slot);
      pump();
    }

    // 데이터 절약 모드 / 느린 회선에서는 보이는 것만 받는다
    function prefetchAllowed() {
      var c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (!c) return true;
      if (c.saveData) return false;
      return !/(^|-)(2g|slow-2g)$/.test(c.effectiveType || '');
    }

    // ── 탭 전환 (패널이 겹쳐 있어 그대로 크로스페이드된다) ──────
    function show(i) {
      i = (i + panels.length) % panels.length;
      if (i === current) return;

      var prev = slots[current];
      // 나가는 영상은 페이드아웃이 끝난 뒤에 멈춘다
      if (prev.video) {
        var fading = prev.video;
        window.setTimeout(function () {
          if (slots[current].video !== fading) fading.pause();
        }, 400);
      }

      current = i;

      panels.forEach(function (p, pi) {
        var on = pi === i;
        p.classList.toggle('is-on', on);
        p.setAttribute('aria-hidden', on ? 'false' : 'true');
      });

      tabs.forEach(function (t, ti) {
        var on = ti === i;
        t.classList.toggle('is-on', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
      });

      var slot = slots[i];
      if (slot.state === 'ready') play(slot);
      else enqueue(slot, true);   // 보고 있는 영상을 큐 맨 앞으로
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { show(i); });
    });

    $$('[data-wk-prev]', root).forEach(function (btn) {
      btn.addEventListener('click', function () { show(current - 1); });
    });
    $$('[data-wk-next]', root).forEach(function (btn) {
      btn.addEventListener('click', function () { show(current + 1); });
    });

    // 키보드 좌우
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { show(current - 1); }
      else if (e.key === 'ArrowRight') { show(current + 1); }
    });

    // 모바일 스와이프
    $$('[data-wk-media]', root).forEach(function (media) {
      var sx = 0, sy = 0, tracking = false;

      media.addEventListener('touchstart', function (e) {
        if (e.touches.length !== 1) return;
        sx = e.touches[0].clientX;
        sy = e.touches[0].clientY;
        tracking = true;
      }, { passive: true });

      media.addEventListener('touchend', function (e) {
        if (!tracking) return;
        tracking = false;
        var t = e.changedTouches[0];
        var dx = t.clientX - sx;
        var dy = t.clientY - sy;
        if (Math.abs(dx) < 44 || Math.abs(dx) < Math.abs(dy) * 1.4) return;
        show(current + (dx < 0 ? 1 : -1));
      }, { passive: true });
    });

    // 화면 밖 / 탭 비활성일 때는 재생을 멈춰 배터리를 아낀다
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) play(slots[current]);
          else slots.forEach(function (s) { if (s.video) s.video.pause(); });
        });
      }, { threshold: 0.15 }).observe(root);
    }

    doc.addEventListener('visibilitychange', function () {
      if (doc.hidden) slots.forEach(function (s) { if (s.video) s.video.pause(); });
      else play(slots[current]);
    });

    slots.forEach(initPan);

    // ── 페이지 시작 직후 백그라운드 로딩 시작 ────────────────────
    //  load 를 기다리지 않고 첫 페인트 직후(유휴 시점)에 착수해서,
    //  본문을 읽는 동안 영상이 알아서 채워지도록 한다.
    startSoon(function () {
      enqueue(slots[current], true);
      if (prefetchAllowed()) {
        slots.forEach(function (s) { if (s.index !== current) enqueue(s); });
      }
    });
  }

  function startSoon(fn) {
    if ('requestIdleCallback' in window) window.requestIdleCallback(fn, { timeout: 800 });
    else window.setTimeout(fn, 200);
  }

  // ── 8. 주요 작업 : 담당 업무 펼치기 ───────────────────────────
  function initMainProjects() {
    var root = $('[data-pf-main]');
    if (!root) return;

    $$('[data-mp-toggle]', root).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var card = btn.closest('[data-mp-card]');
        if (!card) return;
        var open = card.classList.toggle('is-open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });
  }

  // ── 9-1. 아카이브 아코디언 ────────────────────────────────────
  function initAccordion() {
    var root = $('[data-pf-acc]');
    if (!root) return;

    $$('[data-op-head]', root).forEach(function (head) {
      head.addEventListener('click', function () {
        var item = head.closest('[data-op-item]');
        if (!item) return;
        var open = !item.classList.contains('is-open');

        // 한 번에 하나만 열어 둔다
        $$('[data-op-item]', root).forEach(function (other) {
          other.classList.remove('is-open');
          var h = $('[data-op-head]', other);
          if (h) h.setAttribute('aria-expanded', 'false');
        });

        if (open) {
          item.classList.add('is-open');
          head.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  // ── 9-2. 연락처 복사 ──────────────────────────────────────────
  function initCopy() {
    var toast = $('[data-pf-toast]');
    var timer = null;

    function flash(btn) {
      btn.classList.add('is-done');
      var icon = btn.querySelector('i');
      if (icon) icon.className = 'fa-solid fa-check';

      if (toast) toast.classList.add('is-on');
      window.clearTimeout(timer);
      timer = window.setTimeout(function () {
        btn.classList.remove('is-done');
        if (icon) icon.className = 'fa-regular fa-copy';
        if (toast) toast.classList.remove('is-on');
      }, 1500);
    }

    $$('[data-pf-copy]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var text = btn.getAttribute('data-pf-copy');

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(function () { flash(btn); });
          return;
        }

        // 구형 브라우저 대비
        var ta = doc.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        doc.body.appendChild(ta);
        ta.select();
        try { doc.execCommand('copy'); flash(btn); } catch (err) { /* noop */ }
        doc.body.removeChild(ta);
      });
    });
  }

  function init() {
    initReveal();
    initCounters();
    initSectionBar();
    initAnchors();
    initTyper();
    initTilt();
    initTimeline();
    initStack();
    initWorks();
    initMainProjects();
    initAccordion();
    initCopy();
  }

  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init);
  else init();
})();
