(function () {
  'use strict';

  /* ---- Video autoplay on hover ---- */
  function initVideoHover() {
    const cards = document.querySelectorAll('.project-card');

    cards.forEach(function (card) {
      const video = card.querySelector('video');
      if (!video) return;

      card.addEventListener('mouseenter', function () {
        video.play().catch(function () {});
      });

      card.addEventListener('mouseleave', function () {
        video.pause();
        video.currentTime = 0;
      });
    });
  }

  /* ---- Typing effect for hero subtitle (optional, subtle) ---- */
  function initCursorBlink() {
    const subtitle = document.querySelector('.hero-subtitle');
    if (!subtitle) return;

    const cursor = document.createElement('span');
    cursor.className = 'typing-cursor';
    cursor.textContent = '|';
    cursor.style.cssText =
      'animation: blink 1s step-end infinite; margin-left: 2px; color: var(--accent-blue); font-weight: 300;';
    subtitle.appendChild(cursor);

    const style = document.createElement('style');
    style.textContent = '@keyframes blink { 0%,100% { opacity:1 } 50% { opacity:0 } }';
    document.head.appendChild(style);

    setTimeout(function () {
      cursor.style.transition = 'opacity 1s ease';
      cursor.style.opacity = '0';
    }, 4000);
  }

  document.addEventListener('DOMContentLoaded', function () {
    initVideoHover();
    initCursorBlink();
  });
})();
