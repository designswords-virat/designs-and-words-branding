// ---------- Loader ----------
(function () {
  var loader = document.getElementById('loader');
  var hide = function () { if (loader) loader.classList.add('is-hidden'); };
  var minDuration = 1400;
  var maxDuration = 2200;
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
    duration: 1.4,
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
      lenis.scrollTo(target, { offset: -10, duration: 1.6 });
    });
  });
})();

// ---------- Nav scroll state ----------
(function () {
  var nav = document.getElementById('nav');
  if (!nav) return;
  function onScroll() { nav.classList.toggle('scrolled', window.scrollY > 60); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
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
    cx += (tx - cx) * 0.18;
    cy += (ty - cy) * 0.18;
    cur.style.transform = 'translate(' + cx + 'px,' + cy + 'px) translate(-50%, -50%)';
    requestAnimationFrame(loop);
  })();
  document.querySelectorAll('a, [data-tile], .cap, button, [data-cursor]').forEach(function (el) {
    el.addEventListener('mouseenter', function () { cur.classList.add('lg'); });
    el.addEventListener('mouseleave', function () { cur.classList.remove('lg'); });
  });
})();

// ---------- Reveal on scroll ----------
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.reveal, .section-head, .tile, .cap, .step, .feat-grid').forEach(function (el) { el.classList.add('in'); });
    return;
  }
  if (!('IntersectionObserver' in window)) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal, .section-head, .tile, .cap, .step, .feat-grid').forEach(function (el) {
    el.classList.add('reveal');
    io.observe(el);
  });
})();

// ---------- Subtle parallax on tile mouseover ----------
(function () {
  if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('.tile').forEach(function (tile) {
    tile.addEventListener('mousemove', function (e) {
      var r = tile.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      var canvas = tile.querySelector('.canvas');
      if (canvas) canvas.style.transform = 'translate(' + (x * -12) + 'px,' + (y * -12) + 'px) scale(1.06)';
    });
    tile.addEventListener('mouseleave', function () {
      var canvas = tile.querySelector('.canvas');
      if (canvas) canvas.style.transform = '';
    });
  });
})();

// ---------- Mobile hamburger menu ----------
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
