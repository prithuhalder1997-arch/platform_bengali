/**
 * navigation.js
 * Nav bar, bilingual toggle, scroll reveal, preloader
 * Hero scaling is pure CSS (aspect-ratio + cqi) — no JS needed.
 */
(function () {
  'use strict';

  // ==========================================
  // PRELOADER
  // ==========================================
  var preloader = document.getElementById('preloader');
  var kaReady = false, matrixReady = false;

  function checkReady() {
    if (kaReady && matrixReady && preloader) {
      preloader.classList.add('loaded');
      setTimeout(function () { preloader.style.display = 'none'; }, 600);
    }
  }

  window.addEventListener('ka-ready', function () { kaReady = true; checkReady(); });
  window.addEventListener('matrix-ready', function () { matrixReady = true; checkReady(); });

  setTimeout(function () {
    if (preloader && !preloader.classList.contains('loaded')) {
      kaReady = true; matrixReady = true; checkReady();
    }
  }, 3000);

  // ==========================================
  // VERTICAL BAR NAVIGATOR
  // ==========================================
  var allSections = document.querySelectorAll('section, .section-content');
  var navSegments = document.querySelectorAll('.nav-segment');
  var navFill = document.getElementById('navFill');
  var navCounter = document.getElementById('navCounter');
  var currentSection = 0;
  var totalSections = allSections.length;

  function updateNav(index) {
    if (index === currentSection) return;
    currentSection = index;

    var fillEnd = ((index + 1) / totalSections) * 100;
    if (navFill) {
      navFill.style.top = '0%';
      navFill.style.height = fillEnd + '%';
    }
    if (navCounter) {
      navCounter.textContent = String(index + 1).padStart(2, '0');
    }

    navSegments.forEach(function (seg) {
      seg.classList.toggle('active', parseInt(seg.dataset.section) === index);
    });
  }

  var navObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
        var idx = Array.prototype.indexOf.call(allSections, entry.target);
        if (idx !== -1) updateNav(idx);
      }
    });
  }, {
    threshold: [0.3, 0.6],
    rootMargin: '-10% 0px -10% 0px'
  });

  allSections.forEach(function (section) { navObserver.observe(section); });

  // Click to scroll — temporarily disable snap for smooth programmatic scroll
  navSegments.forEach(function (seg) {
    seg.addEventListener('click', function () {
      var idx = parseInt(seg.dataset.section);
      if (allSections[idx]) {
        document.documentElement.style.scrollSnapType = 'none';
        allSections[idx].scrollIntoView({ behavior: 'smooth' });
        setTimeout(function () {
          document.documentElement.style.scrollSnapType = '';
        }, 800);
      }
    });
  });

  // ==========================================
  // BILINGUAL TOGGLE
  // ==========================================
  var btnEN = document.getElementById('btnEN');
  var btnBN = document.getElementById('btnBN');
  var lang = 'en';

  function switchLang(newLang) {
    if (newLang === lang) return;
    lang = newLang;

    btnEN.classList.toggle('active', lang === 'en');
    btnBN.classList.toggle('active', lang === 'bn');

    document.querySelectorAll('[data-en][data-bn]').forEach(function (el) {
      el.textContent = el.getAttribute('data-' + lang);
      if (lang === 'bn') {
        el.style.fontFamily = "'Nirmala UI','Bangla Sangam MN','Noto Sans Bengali',sans-serif";
        el.style.letterSpacing = '0';
        el.style.textTransform = 'none';
        el.style.fontSize = el.classList.contains('o-label') ? '16px' : '';
      } else {
        el.style.fontFamily = '';
        el.style.letterSpacing = '';
        el.style.textTransform = '';
        el.style.fontSize = '';
      }
    });
  }

  if (btnEN) btnEN.addEventListener('click', function () { switchLang('en'); });
  if (btnBN) btnBN.addEventListener('click', function () { switchLang('bn'); });

  // ==========================================
  // HEADER TOGGLE
  // ==========================================
  var siteHeader = document.getElementById('siteHeader');
  var headerVisible = true;

  if (siteHeader) {
    document.addEventListener('click', function (e) {
      var tag = e.target.tagName.toLowerCase();
      var isInteractive = tag === 'a' || tag === 'button' ||
        e.target.closest('a') || e.target.closest('button') ||
        e.target.closest('.nav-bar') || e.target.closest('.lang-toggle') ||
        e.target.closest('.site-header');
      if (isInteractive) return;
      headerVisible = !headerVisible;
      siteHeader.classList.toggle('hidden', !headerVisible);
    });
  }

  // ==========================================
  // SCROLL REVEAL
  // ==========================================
  var revealEls = document.querySelectorAll('.reveal');

  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  revealEls.forEach(function (el) { revealObserver.observe(el); });

})();
