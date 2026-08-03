(function () {
  'use strict';

  var NS = 'http://www.w3.org/2000/svg';

  var root = document.querySelector('[data-life-graph]');
  if (!root) return;

  var svg = root.querySelector('.life__graph');
  var timeline = root.querySelector('.life__timeline');
  if (!svg || !timeline) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  var rows = [];
  var revealIndex = 0;
  var litIndex = 0;
  var trunk = null;
  var trunkLength = 0;
  var headDot = null;
  var pending = false;
  var measuring = false;

  function make(name, attrs) {
    var node = document.createElementNS(NS, name);
    for (var key in attrs) {
      if (Object.prototype.hasOwnProperty.call(attrs, key)) {
        node.setAttribute(key, attrs[key]);
      }
    }
    return node;
  }

  function clamp(value, min, max) {
    return value < min ? min : value > max ? max : value;
  }

  function round(value) {
    return Math.round(value * 10) / 10;
  }

  function pseudoHash(seed) {
    var hash = 0x811c9dc5;
    for (var i = 0; i < seed.length; i++) {
      hash ^= seed.charCodeAt(i);
      hash = (hash * 0x01000193) >>> 0;
    }
    return ('0000000' + hash.toString(16)).slice(-7);
  }

  function fillHashes() {
    var chips = root.querySelectorAll('.commit__hash[data-hash-seed]');
    for (var i = 0; i < chips.length; i++) {
      chips[i].textContent = pseudoHash(chips[i].getAttribute('data-hash-seed'));
    }
  }

  function offsetWithin(el, ancestor) {
    var x = 0;
    var y = 0;
    while (el && el !== ancestor) {
      x += el.offsetLeft;
      y += el.offsetTop;
      el = el.offsetParent;
    }
    return { x: x, y: y };
  }

  var NODE_INSET = 3;

  function alignNodes(commits) {
    for (var i = 0; i < commits.length; i++) {
      var commit = commits[i];
      var rail = commit.querySelector(':scope > .commit__rail');
      var node = rail && rail.querySelector(':scope > .commit__node');
      var card = commit.querySelector(':scope > .commit__card');
      if (!rail || !node || !card) continue;

      var top = offsetWithin(card, commit).y - offsetWithin(rail, commit).y + NODE_INSET;
      var next = round(top) + 'px';
      if (node.style.top !== next) node.style.top = next;
    }
  }

  function measure(commits) {
    var list = [];

    for (var i = 0; i < commits.length; i++) {
      var commit = commits[i];
      var node = commit.querySelector(':scope > .commit__rail > .commit__node');
      var card = commit.querySelector(':scope > .commit__card');
      if (!node || !card) continue;

      var nodePos = offsetWithin(node, timeline);
      var cardPos = offsetWithin(card, timeline);
      var nodeY = nodePos.y + node.offsetHeight / 2;

      var avatar = commit.querySelector(':scope > .commit__card > .commit__header > .commit__avatar');
      var entryY = avatar
        ? offsetWithin(avatar, timeline).y + avatar.offsetHeight / 2
        : nodeY + 24;

      list.push({
        commit: commit,
        reply: commit.classList.contains('commit--reply'),
        x: nodePos.x + node.offsetWidth / 2,
        y: nodeY,
        entryY: entryY,
        cardX: cardPos.x,
        connector: null
      });
    }

    return list;
  }

  function connectorPath(row) {
    var reach = Math.max(row.cardX - row.x, 8);
    var drop = Math.max(row.entryY - row.y, 10);
    return 'M ' + round(row.x) + ' ' + round(row.y) +
           ' C ' + round(row.x) + ' ' + round(row.y + drop * 0.6) +
           ', ' + round(row.x + reach * 0.45) + ' ' + round(row.entryY) +
           ', ' + round(row.cardX) + ' ' + round(row.entryY);
  }

  function replyLanePath(group) {
    var first = group[0];
    var last = group[group.length - 1];
    var lift = 26;
    var d = 'M ' + round(first.x - lift) + ' ' + round(first.y - lift) +
            ' Q ' + round(first.x) + ' ' + round(first.y - lift) +
            ', ' + round(first.x) + ' ' + round(first.y);
    if (last.y > first.y) d += ' V ' + round(last.y);
    return d;
  }

  function build() {
    var commits = timeline.querySelectorAll('.commit');
    if (!commits.length) return;

    measuring = true;
    alignNodes(commits);
    var all = measure(commits);
    var width = timeline.offsetWidth;
    var height = timeline.offsetHeight;
    measuring = false;

    if (!all.length || !width || !height) return;

    svg.setAttribute('viewBox', '0 0 ' + round(width) + ' ' + round(height));
    svg.setAttribute('width', round(width));
    svg.setAttribute('height', round(height));
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    var main = [];
    for (var i = 0; i < all.length; i++) {
      if (!all[i].reply) main.push(all[i]);
    }
    if (!main.length) return;

    all.sort(function (a, b) { return a.y - b.y; });
    rows = all;
    revealIndex = 0;

    var trunkX = main[0].x;
    var firstY = main[0].y;
    var lastY = main[main.length - 1].y;

    var ticks = [];
    var tags = timeline.querySelectorAll('[data-life-tag] .life__ref');
    for (var t = 0; t < tags.length; t++) {
      var tagPos = offsetWithin(tags[t], timeline);
      ticks.push({
        y: tagPos.y + tags[t].offsetHeight / 2,
        x: tagPos.x - 4
      });
    }

    var topY = firstY - 34;
    if (ticks.length) topY = Math.min(topY, ticks[0].y - 10);

    svg.appendChild(make('path', {
      'class': 'life__trunk-bed',
      d: 'M ' + round(trunkX) + ' ' + round(topY) + ' V ' + round(lastY)
    }));

    svg.appendChild(make('path', {
      'class': 'life__tail',
      d: 'M ' + round(trunkX) + ' ' + round(lastY) + ' V ' + round(height - 6)
    }));

    for (var k = 0; k < ticks.length; k++) {
      svg.appendChild(make('path', {
        'class': 'life__tick',
        d: 'M ' + round(trunkX) + ' ' + round(ticks[k].y) + ' H ' + round(ticks[k].x)
      }));
    }

    var seedY = reduceMotion.matches ? Infinity : headY();
    litIndex = 0;

    for (var c = 0; c < all.length; c++) {
      var row = all[c];
      var live = row.commit.classList.contains('is-live');
      var cls = row.reply ? 'life__connector life__connector--reply' : 'life__connector';
      if (row.y <= seedY) {
        cls += ' is-lit';
        litIndex = c + 1;
      }
      var path = make('path', {
        'class': cls,
        d: connectorPath(row)
      });
      svg.appendChild(path);
      row.connector = path;

      var length = path.getTotalLength();
      row.connectorLength = length;
      if (reduceMotion.matches) {
        path.style.strokeDasharray = 'none';
      } else {
        path.style.strokeDasharray = length;
        path.style.strokeDashoffset = live ? 0 : length;
      }
    }

    var groups = timeline.querySelectorAll('.commit__replies');
    for (var g = 0; g < groups.length; g++) {
      var group = [];
      for (var r = 0; r < all.length; r++) {
        if (groups[g].contains(all[r].commit)) group.push(all[r]);
      }
      if (group.length) {
        svg.appendChild(make('path', {
          'class': 'life__lane',
          d: replyLanePath(group)
        }));
      }
    }

    trunk = make('path', {
      'class': 'life__trunk',
      d: 'M ' + round(trunkX) + ' ' + round(topY) + ' V ' + round(lastY)
    });
    svg.appendChild(trunk);

    headDot = make('circle', { 'class': 'life__head-dot', r: 4, cx: 0, cy: 0 });
    svg.appendChild(headDot);

    trunkLength = trunk.getTotalLength();

    root.classList.add('graph-ready');

    if (reduceMotion.matches) {
      trunk.style.strokeDasharray = 'none';
      headDot.style.display = 'none';
      revealAll();
    } else {
      trunk.style.strokeDasharray = trunkLength;
      trunk.style.strokeDashoffset = trunkLength;
      draw();
    }
  }

  function anchorFrom(box) {
    return window.innerHeight * 0.72 - box.top;
  }

  function atBottom() {
    return window.innerHeight + window.scrollY >=
           document.documentElement.scrollHeight - 4;
  }

  function headY() {
    return atBottom() ? Infinity : anchorFrom(timeline.getBoundingClientRect());
  }

  function draw() {
    if (!trunk || reduceMotion.matches) return;

    var box = timeline.getBoundingClientRect();
    var anchorY = anchorFrom(box);
    var progress = clamp(anchorY / Math.max(box.height, 1), 0, 1);
    var drawn = trunkLength * progress;

    trunk.style.strokeDashoffset = trunkLength - drawn;

    if (headDot) {
      if (progress > 0.001 && progress < 0.999) {
        var point = trunk.getPointAtLength(drawn);
        headDot.setAttribute('cx', round(point.x));
        headDot.setAttribute('cy', round(point.y));
        headDot.style.opacity = '1';
      } else {
        headDot.style.opacity = '0';
      }
    }

    var bottom = atBottom();
    reveal(bottom ? Infinity : anchorY + 40);
    relight(bottom ? Infinity : anchorY);
  }

  function setLit(path, on) {
    if (!path) return;
    var cls = path.getAttribute('class') || '';
    if (on === (cls.indexOf(' is-lit') !== -1)) return;
    path.setAttribute('class', on ? cls + ' is-lit' : cls.replace(' is-lit', ''));
  }

  function reveal(limitY) {
    while (revealIndex < rows.length && rows[revealIndex].y <= limitY) {
      var row = rows[revealIndex];
      row.commit.classList.add('is-live');
      if (row.connector) row.connector.style.strokeDashoffset = '0';
      revealIndex++;
    }
  }

  function relight(headY) {
    while (litIndex < rows.length && rows[litIndex].y <= headY) {
      setLit(rows[litIndex].connector, true);
      litIndex++;
    }
    while (litIndex > 0 && rows[litIndex - 1].y > headY) {
      litIndex--;
      setLit(rows[litIndex].connector, false);
    }
  }

  function revealAll() {
    for (var i = 0; i < rows.length; i++) {
      rows[i].commit.classList.add('is-live');
      if (rows[i].connector) rows[i].connector.style.strokeDashoffset = '0';
      setLit(rows[i].connector, true);
    }
    revealIndex = rows.length;
    litIndex = rows.length;
  }

  function onScroll() {
    if (pending) return;
    pending = true;
    window.requestAnimationFrame(function () {
      pending = false;
      draw();
    });
  }

  var rebuildPending = false;

  function scheduleBuild() {
    if (measuring || rebuildPending) return;
    rebuildPending = true;
    window.requestAnimationFrame(function () {
      rebuildPending = false;
      build();
    });
  }

  function init() {
    fillHashes();
    build();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('orientationchange', scheduleBuild);

    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) onScroll();
    });

    if ('ResizeObserver' in window) {
      new ResizeObserver(scheduleBuild).observe(timeline);
    } else {
      window.addEventListener('resize', scheduleBuild);
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(scheduleBuild);
    }

    if (reduceMotion.addEventListener) {
      reduceMotion.addEventListener('change', build);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
