(function () {
  'use strict';

  /* ---- Scroll reveal (Intersection Observer) ---- */
  var revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px',
    },
  );

  function initScrollReveal() {
    var targets = document.querySelectorAll('.fade-in-up:not(.visible)');
    targets.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  window.refreshScrollReveal = initScrollReveal;

  /* ---- Navbar scroll state ---- */
  function initNavbarScroll() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    let ticking = false;

    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          if (window.scrollY > 60) {
            navbar.classList.add('scrolled');
          } else {
            navbar.classList.remove('scrolled');
          }
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  /* ---- Active nav link highlight ---- */
  function initActiveNavLink() {
    const sections = document.querySelectorAll('section[id], footer[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    if (!sections.length || !navLinks.length) return;

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach(function (link) {
              link.classList.toggle('active', link.getAttribute('href') === '#' + id);
            });
          }
        });
      },
      {
        threshold: 0.3,
        rootMargin: '-80px 0px -40% 0px',
      },
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  /* ---- Smooth scroll for anchor links ---- */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault();
        const navHeight = document.getElementById('navbar')?.offsetHeight || 72;
        const top = target.getBoundingClientRect().top + window.scrollY - navHeight;

        window.scrollTo({ top: top, behavior: 'smooth' });
      });
    });
  }

  /* ---- Hide scroll indicator on scroll ---- */
  function initScrollIndicatorHide() {
    const indicator = document.getElementById('scroll-indicator');
    if (!indicator) return;

    let hidden = false;
    window.addEventListener('scroll', function () {
      if (!hidden && window.scrollY > 100) {
        indicator.style.opacity = '0';
        indicator.style.transition = 'opacity 0.5s ease';
        hidden = true;
      }
    });
  }

  /* ---- Init all ---- */
  document.addEventListener('DOMContentLoaded', function () {
    initScrollReveal();
    initNavbarScroll();
    initActiveNavLink();
    initSmoothScroll();
    initScrollIndicatorHide();
  });
})();
