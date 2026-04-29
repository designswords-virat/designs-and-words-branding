// ---------- Loader ----------
(function () {
  var loader = document.getElementById('loader');
  var hide = function () {
    if (loader) loader.classList.add('is-hidden');
    document.body.classList.add('is-loaded');
  };
  var minDuration = 1100;
  var maxDuration = 2000;
  var start = performance.now();
  var fired = false;
  var fire = function () {
    if (fired) return;
    fired = true;
    setTimeout(hide, Math.max(0, minDuration - (performance.now() - start)));
  };
  window.addEventListener('load', fire);
  setTimeout(fire, maxDuration);
})();

// ---------- Smooth scroll (Lenis) ----------
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (typeof Lenis === 'undefined') return;
  var lenis = new Lenis({
    duration: 1.2,
    easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
    smoothWheel: true,
    smoothTouch: false
  });
  function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
  requestAnimationFrame(raf);
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -64, duration: 1.4 });
    });
  });
})();

// ---------- Reveal on scroll ----------
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('[data-fade], .tile').forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('[data-fade], .tile').forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -5% 0px' });
  document.querySelectorAll('[data-fade], .tile').forEach(function (el) { observer.observe(el); });
})();

// ---------- Custom cursor ----------
(function () {
  if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var cur = document.getElementById('cursor');
  if (!cur) return;
  var cx = window.innerWidth / 2, cy = window.innerHeight / 2;
  var tx = cx, ty = cy;
  window.addEventListener('mousemove', function (e) { tx = e.clientX; ty = e.clientY; });
  (function loop() {
    cx += (tx - cx) * 0.2;
    cy += (ty - cy) * 0.2;
    cur.style.transform = 'translate(' + cx + 'px,' + cy + 'px) translate(-50%,-50%)';
    requestAnimationFrame(loop);
  })();
  document.querySelectorAll('a, button, [data-cursor], .tile').forEach(function (el) {
    el.addEventListener('mouseenter', function () { cur.classList.add('lg'); });
    el.addEventListener('mouseleave', function () { cur.classList.remove('lg'); });
  });
})();

// ---------- Mobile hamburger ----------
(function () {
  var btn = document.getElementById('navHamburger');
  var menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;
  function open() {
    btn.classList.add('is-open');
    menu.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false');
    document.body.classList.add('menu-open');
  }
  function close() {
    btn.classList.remove('is-open');
    menu.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('menu-open');
  }
  btn.addEventListener('click', function () {
    if (menu.classList.contains('is-open')) close(); else open();
  });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', close); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) close();
  });
})();

// ---------- Sector filter ----------
(function () {
  var pills = document.querySelectorAll('#sectorFilters .filter-pill');
  var tiles = document.querySelectorAll('.tile[data-sector]');
  if (!pills.length || !tiles.length) return;
  pills.forEach(function (pill) {
    pill.addEventListener('click', function () {
      var sector = pill.getAttribute('data-sector');
      pills.forEach(function (p) { p.classList.toggle('is-active', p === pill); });
      tiles.forEach(function (tile) {
        var match = sector === 'all' || tile.getAttribute('data-sector') === sector;
        tile.classList.toggle('is-hidden', !match);
      });
    });
  });
})();

// ---------- Parallax for detail-page image sections ----------
// Each [data-parallax] section has a .showcase__inner that translates Y based
// on scroll position relative to viewport center. Uses the codified pattern
// from brain/dw-build/README.md.
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var entries = [];
  document.querySelectorAll('[data-parallax]').forEach(function (section) {
    var inner = section.querySelector('.showcase__inner');
    if (!inner) return;
    entries.push({
      section: section,
      inner: inner,
      direction: section.hasAttribute('data-parallax-invert') ? -1 : 1,
      strength: parseFloat(section.getAttribute('data-parallax-strength')) || 0.18
    });
  });
  if (!entries.length) return;
  var vh = window.innerHeight;
  window.addEventListener('resize', function () { vh = window.innerHeight; }, { passive: true });
  function tick() {
    entries.forEach(function (p) {
      var rect = p.section.getBoundingClientRect();
      if (rect.bottom < -200 || rect.top > vh + 200) return;
      var diff = (rect.top + rect.height / 2) - vh / 2;
      var translate = -diff * p.strength * p.direction;
      p.inner.style.transform = 'translate3d(0,' + translate.toFixed(2) + 'px,0)';
    });
    requestAnimationFrame(tick);
  }
  tick();
})();

// ---------- Hero word rotator ----------
(function () {
  var el = document.querySelector('[data-rotator]');
  if (!el) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var words = ['brand', 'identity', 'voice', 'story', 'system'];
  var i = 0;
  setInterval(function () {
    el.style.opacity = '0';
    setTimeout(function () {
      i = (i + 1) % words.length;
      el.textContent = words[i];
      el.style.opacity = '1';
    }, 320);
  }, 2400);
  el.style.transition = 'opacity 320ms ease';
})();
