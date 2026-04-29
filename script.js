// ---------- Loader ----------
(function () {
  var loader = document.getElementById('loader');
  var hide = function () {
    if (loader) loader.classList.add('is-hidden');
    document.body.classList.add('is-loaded');
  };
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

// ---------- Scroll-triggered fades ----------
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('[data-fade]').forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('[data-fade]').forEach(function (el) { observer.observe(el); });
})();

// ---------- Parallax for full-bleed image sections ----------
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
      strength: 0.22
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

// ---------- Multi-image case carousel: vertical scroll → horizontal track translation ----------
// For each .case-multi, the section is tall (--slides * 70vh). The .case-multi__pin
// is sticky 100vh inside it. As the user scrolls vertically through the section,
// we translate the .case-multi__track horizontally so each slide flows past.
// Disabled on mobile (CSS stacks slides vertically instead) and reduced-motion.
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  function isMobile() { return window.matchMedia('(max-width: 768px)').matches; }
  var carousels = [];
  document.querySelectorAll('.case-multi').forEach(function (section) {
    var track = section.querySelector('.case-multi__track');
    if (!track) return;
    carousels.push({ section: section, track: track });
  });
  if (!carousels.length) return;
  var vh = window.innerHeight;
  var vw = window.innerWidth;
  window.addEventListener('resize', function () {
    vh = window.innerHeight;
    vw = window.innerWidth;
  }, { passive: true });

  function tick() {
    if (isMobile()) {
      // Mobile: clear any inline transform, CSS handles vertical stack
      carousels.forEach(function (c) { c.track.style.transform = ''; });
      requestAnimationFrame(tick);
      return;
    }
    carousels.forEach(function (c) {
      var rect = c.section.getBoundingClientRect();
      // Skip when section is far above or below viewport
      if (rect.bottom < -200 || rect.top > vh + 200) return;
      // Section's full scrollable distance = section height - viewport height
      var scrollableDistance = c.section.offsetHeight - vh;
      if (scrollableDistance <= 0) return;
      // How far we've scrolled INTO the section (clamped 0..1)
      var scrolled = -rect.top;
      var progress = Math.max(0, Math.min(1, scrolled / scrollableDistance));
      // Track is wider than viewport — translate by (track_width - vw) * progress
      var maxTranslate = c.track.scrollWidth - vw;
      if (maxTranslate <= 0) return;
      var translate = progress * maxTranslate;
      c.track.style.transform = 'translate3d(' + (-translate).toFixed(2) + 'px,0,0)';
    });
    requestAnimationFrame(tick);
  }
  tick();
})();

// ---------- Custom cursor (desktop only) ----------
(function () {
  if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var dot = document.getElementById('cursorDot');
  var ring = document.getElementById('cursorRing');
  var label = document.getElementById('cursorLabel');
  if (!dot || !ring) return;
  var x = window.innerWidth / 2, y = window.innerHeight / 2;
  var rx = x, ry = y;
  document.addEventListener('mousemove', function (e) {
    x = e.clientX; y = e.clientY;
    dot.style.transform = 'translate(' + x + 'px,' + y + 'px) translate(-50%,-50%)';
  });
  function tick() {
    rx += (x - rx) * 0.18;
    ry += (y - ry) * 0.18;
    ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
    requestAnimationFrame(tick);
  }
  tick();
  document.querySelectorAll('[data-cursor]').forEach(function (el) {
    el.addEventListener('mouseenter', function () {
      document.body.classList.add('is-hovering');
      var l = el.getAttribute('data-cursor-label') || 'View';
      label.textContent = l;
    });
    el.addEventListener('mouseleave', function () {
      document.body.classList.remove('is-hovering');
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
