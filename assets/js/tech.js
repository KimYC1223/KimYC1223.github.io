/* ────────────────────────────────────────────────────────────────
 *  테크노트 목록 인터랙션
 *   1) 검색 (제목 · 부제목 · 카테고리) + 일치 부분 하이라이트
 *   2) 카테고리 필터 (레일 / URL ?tag= 연동)
 *   3) 스크롤 배치 로딩 + 로딩 인디케이터
 *   4) 툴바 도킹 · 목록 진행률
 *   5) 헤더 스탯 카운트업, '/' 검색 단축키
 * ──────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  var doc = document;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  var root = doc.querySelector('[data-tech]');
  if (!root) return;

  var BATCH = 8;          // 한 번에 불러오는 글 수
  var DELAY = 380;        // 로딩 인디케이터를 보여 주는 시간 (ms)

  var list      = root.querySelector('.plist');
  var rows      = toArray(root.querySelectorAll('[data-row]'));
  var yearHeads = toArray(root.querySelectorAll('[data-year-head]'));
  var pills     = toArray(root.querySelectorAll('[data-pill]'));
  var inputs    = toArray(doc.querySelectorAll('[data-search]'));

  var sentinel  = root.querySelector('[data-sentinel]');
  var loader    = root.querySelector('[data-loader]');
  var loaderNow = root.querySelector('[data-loader-now]');
  var endMark   = root.querySelector('[data-end]');
  var empty     = root.querySelector('[data-empty]');
  var emptyQ    = root.querySelector('[data-empty-q]');
  var rail      = root.querySelector('[data-rail]');

  var counts       = toArray(doc.querySelectorAll('[data-count-now]'));
  var bar          = doc.querySelector('[data-tx]');
  var progress     = bar ? bar.querySelector('[data-tx-progress]') : null;
  var filterBtn    = doc.querySelector('[data-jump-filter]');
  var filterLabel  = doc.querySelector('[data-filter-label]');

  // 원본 텍스트 (하이라이트를 되돌릴 때 쓴다)
  var texts = rows.map(function (row) {
    var t = row.querySelector('[data-title]');
    var s = row.querySelector('[data-sub]');
    return {
      titleEl: t,
      subEl: s,
      title: t ? t.textContent : '',
      sub: s ? s.textContent : '',
      haystack: (row.getAttribute('data-search') || '').toLowerCase(),
      tags: ' ' + (row.getAttribute('data-tags') || '') + ' ',
      year: row.getAttribute('data-year') || ''
    };
  });

  var matched = rows.slice();
  var shown = 0;
  var loading = false;
  var query = '';
  var tag = 'all';
  var searchTimer = null;
  var gen = 0;            // 필터가 바뀌면 진행 중이던 로딩을 버린다

  function toArray(nodes) {
    return Array.prototype.slice.call(nodes);
  }

  function clamp(v, min, max) {
    return v < min ? min : v > max ? max : v;
  }

  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ── 1. 필터링 ─────────────────────────────────────────────────
  function computeMatched() {
    var q = query.toLowerCase();

    matched = rows.filter(function (row, i) {
      var m = texts[i];
      if (tag !== 'all' && m.tags.indexOf(' ' + tag + ' ') === -1) return false;
      if (q && m.haystack.indexOf(q) === -1) return false;
      return true;
    });
  }

  // 검색어와 일치하는 부분을 <mark> 로 감싼다 (텍스트만 다루므로 안전하다)
  function paintHighlight() {
    var q = query.trim();

    for (var i = 0; i < rows.length; i++) {
      var m = texts[i];
      if (!q) {
        if (m.titleEl) m.titleEl.textContent = m.title;
        if (m.subEl) m.subEl.textContent = m.sub;
        continue;
      }
      if (m.titleEl) m.titleEl.innerHTML = mark(m.title, q);
      if (m.subEl) m.subEl.innerHTML = mark(m.sub, q);
    }
  }

  function mark(text, q) {
    var lower = text.toLowerCase();
    var needle = q.toLowerCase();
    var out = '';
    var from = 0;
    var at = lower.indexOf(needle, from);

    while (at !== -1) {
      out += escapeHtml(text.slice(from, at));
      out += '<mark>' + escapeHtml(text.slice(at, at + needle.length)) + '</mark>';
      from = at + needle.length;
      at = lower.indexOf(needle, from);
    }

    return out + escapeHtml(text.slice(from));
  }

  // ── 2. 표시 ───────────────────────────────────────────────────
  function syncYearHeads() {
    var years = {};
    for (var i = 0; i < shown; i++) {
      years[matched[i].getAttribute('data-year')] = true;
    }
    for (var j = 0; j < yearHeads.length; j++) {
      yearHeads[j].classList.toggle('is-shown', !!years[yearHeads[j].getAttribute('data-year-head')]);
    }
  }

  function revealUpTo(next, stagger) {
    for (var i = shown; i < next; i++) {
      matched[i].style.setProperty('--d', stagger ? i - shown : 0);
      matched[i].classList.add('is-shown');
    }
    shown = next;
    syncYearHeads();
    updateFooterState();
  }

  function updateFooterState() {
    var done = shown >= matched.length;

    if (loaderNow) loaderNow.textContent = shown;
    if (endMark) endMark.hidden = !done || matched.length === 0;
    if (sentinel) sentinel.style.display = done ? 'none' : '';
    if (loader && done) loader.hidden = true;
  }

  function applyFilter(resetShown) {
    // 진행 중이던 배치 로딩은 무효로 만든다
    gen++;
    loading = false;
    if (loader) loader.hidden = true;

    // 이전에 보이던 행을 모두 접는다
    for (var i = 0; i < rows.length; i++) rows[i].classList.remove('is-shown');

    computeMatched();
    paintHighlight();

    shown = 0;
    var first = Math.min(BATCH, matched.length);
    revealUpTo(first, true);

    for (var c = 0; c < counts.length; c++) counts[c].textContent = matched.length;

    var none = matched.length === 0;
    if (empty) empty.hidden = !none;
    if (emptyQ) emptyQ.textContent = query.trim() || activeKo();

    if (resetShown) syncUrl();
    updateBar();
  }

  function activeKo() {
    var pill = pills.filter(function (p) { return p.getAttribute('data-pill') === tag; })[0];
    return pill ? (pill.getAttribute('data-pill-ko') || '전체') : '전체';
  }

  // ── 3. 배치 로딩 ──────────────────────────────────────────────
  function loadMore() {
    if (loading || shown >= matched.length) return;
    loading = true;

    if (loader) loader.hidden = false;

    var wait = reduceMotion.matches ? 0 : DELAY;
    var mine = gen;

    window.setTimeout(function () {
      if (mine !== gen) return;           // 그 사이 검색 · 필터가 바뀌었다

      var next = Math.min(shown + BATCH, matched.length);
      revealUpTo(next, true);
      if (loader) loader.hidden = shown >= matched.length;
      loading = false;

      // 화면이 크면 한 번의 로딩으로 센티넬을 벗어나지 못할 수 있다
      if (sentinel && shown < matched.length) {
        var r = sentinel.getBoundingClientRect();
        if (r.top < window.innerHeight) loadMore();
      }
    }, wait);
  }

  function initInfinite() {
    if (!sentinel) return;

    if (!('IntersectionObserver' in window)) {
      revealUpTo(matched.length, false);
      return;
    }

    new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) loadMore();
    }, { rootMargin: '0px 0px 320px 0px' }).observe(sentinel);
  }

  // ── 4. 툴바 도킹 · 진행률 ─────────────────────────────────────
  function updateBar() {
    var y = window.pageYOffset || doc.documentElement.scrollTop;
    var head = root.querySelector('.tn__head');
    var headBottom = head ? head.offsetTop + head.offsetHeight - 110 : 220;
    var docked = y > headBottom;

    if (bar) bar.classList.toggle('is-docked', docked);
    doc.body.classList.toggle('is-docked', docked);
    doc.body.classList.toggle('is-scrolled', y > 12);

    if (!progress || !list) return;

    // 진행률 : 목록의 시작 ~ 끝을 기준으로 한다
    var start = list.offsetTop - 160;
    var end = list.offsetTop + list.offsetHeight - window.innerHeight * 0.7;
    var p = clamp((y - start) / Math.max(end - start, 1), 0, 1);
    progress.style.width = (p * 100).toFixed(1) + '%';
  }

  function initScroll() {
    var pending = false;

    function onScroll() {
      if (pending) return;
      pending = true;
      window.requestAnimationFrame(function () {
        pending = false;
        updateBar();
      });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    updateBar();
  }

  // ── 5. 검색 · 필터 입력 ───────────────────────────────────────
  function setQuery(v, from) {
    query = v;

    for (var i = 0; i < inputs.length; i++) {
      if (inputs[i] !== from) inputs[i].value = v;
      var wrap = inputs[i].closest ? inputs[i].closest('.tsearch') : null;
      if (wrap) wrap.classList.toggle('has-value', v.length > 0);
    }

    applyFilter(true);
  }

  function setTag(next) {
    tag = next;

    for (var i = 0; i < pills.length; i++) {
      pills[i].classList.toggle('is-active', pills[i].getAttribute('data-pill') === tag);
    }

    if (filterLabel) filterLabel.textContent = activeKo();

    if (filterBtn) {
      var on = tag !== 'all';
      filterBtn.classList.toggle('is-on', on);
      var pill = pills.filter(function (p) { return p.getAttribute('data-pill') === tag; })[0];
      var icon = filterBtn.querySelector('i');
      if (icon && pill) {
        icon.className = (pill.getAttribute('data-pill-icon') || 'fa-solid fa-layer-group');
      }
      filterBtn.style.setProperty('--c', pill ? getComputedStyle(pill).getPropertyValue('--c') : '');
    }

    applyFilter(true);
  }

  function syncUrl() {
    if (!window.history || !history.replaceState) return;

    var params = [];
    if (tag !== 'all') params.push('tag=' + encodeURIComponent(tag));
    if (query.trim()) params.push('q=' + encodeURIComponent(query.trim()));

    var url = location.pathname + (params.length ? '?' + params.join('&') : '');
    history.replaceState(null, '', url);
  }

  function readUrl() {
    var params = new URLSearchParams(location.search);
    var t = params.get('tag');
    var q = params.get('q');

    if (t) {
      var known = pills.filter(function (p) { return p.getAttribute('data-pill') === t; })[0];
      if (known) tag = t;
    }
    if (q) query = q;

    for (var i = 0; i < pills.length; i++) {
      pills[i].classList.toggle('is-active', pills[i].getAttribute('data-pill') === tag);
    }
    for (var j = 0; j < inputs.length; j++) {
      inputs[j].value = query;
      var wrap = inputs[j].closest ? inputs[j].closest('.tsearch') : null;
      if (wrap) wrap.classList.toggle('has-value', query.length > 0);
    }
    if (filterLabel) filterLabel.textContent = activeKo();
    if (filterBtn && tag !== 'all') filterBtn.classList.add('is-on');
  }

  function initInputs() {
    for (var i = 0; i < inputs.length; i++) {
      inputs[i].addEventListener('input', function () {
        var self = this;
        window.clearTimeout(searchTimer);
        searchTimer = window.setTimeout(function () {
          setQuery(self.value, self);
        }, 130);
      });

      inputs[i].addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          this.value = '';
          setQuery('', null);
          this.blur();
        }
      });
    }

    for (var p = 0; p < pills.length; p++) {
      pills[p].addEventListener('click', function () {
        var next = this.getAttribute('data-pill');
        // 같은 카테고리를 한 번 더 누르면 해제한다
        setTag(next === tag ? 'all' : next);
      });
    }

    var clears = doc.querySelectorAll('[data-clear]');
    for (var c = 0; c < clears.length; c++) {
      clears[c].addEventListener('click', function () {
        setQuery('', null);
        var input = root.querySelector('.tsearch__input');
        if (input) input.focus();
      });
    }

    var resets = doc.querySelectorAll('[data-reset]');
    for (var r = 0; r < resets.length; r++) {
      resets[r].addEventListener('click', function () {
        query = '';
        for (var k = 0; k < inputs.length; k++) {
          inputs[k].value = '';
          var wrap = inputs[k].closest ? inputs[k].closest('.tsearch') : null;
          if (wrap) wrap.classList.remove('has-value');
        }
        setTag('all');
      });
    }

    var tops = doc.querySelectorAll('[data-top]');
    for (var t = 0; t < tops.length; t++) {
      tops[t].addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      });
    }

    if (filterBtn && rail) {
      filterBtn.addEventListener('click', function () {
        var top = rail.getBoundingClientRect().top + window.pageYOffset - 146;
        window.scrollTo({ top: top, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      });
    }

    var brand = doc.querySelector('.tx__brand');
    if (brand) {
      brand.addEventListener('click', function (e) {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      });
    }

    var jump = root.querySelector('.tn__title a');
    if (jump && list) {
      jump.addEventListener('click', function (e) {
        e.preventDefault();
        var top = list.getBoundingClientRect().top + window.pageYOffset - 150;
        window.scrollTo({ top: top, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      });
    }

    // '/' 로 검색창 포커스
    doc.addEventListener('keydown', function (e) {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      var t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      e.preventDefault();

      var docked = bar && bar.classList.contains('is-docked');
      var input = docked
        ? bar.querySelector('input')
        : root.querySelector('.tsearch__input');
      if (input) input.focus();
    });
  }

  // ── 6. 스탯 카운트업 ──────────────────────────────────────────
  function initCounters() {
    var nums = root.querySelectorAll('[data-count]');
    if (!nums.length) return;

    for (var i = 0; i < nums.length; i++) countUp(nums[i]);
  }

  function countUp(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    if (isNaN(target) || reduceMotion.matches) return;

    var duration = 800;
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

  function init() {
    doc.body.classList.add('is-tech');

    readUrl();
    applyFilter(false);
    initInfinite();
    initScroll();
    initInputs();
    initCounters();
  }

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
