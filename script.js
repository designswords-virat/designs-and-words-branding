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
    var elapsed = performance.now() - start;
    setTimeout(hide, Math.max(0, minDuration - elapsed));
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
// Inner div translates inversely to scroll position so the bg appears to lag.
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
