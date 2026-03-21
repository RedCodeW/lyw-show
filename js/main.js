(function () {
  'use strict';

  var allTypes = [];
  /** @type {'all'|string} 全部 或 某一类型（单选） */
  var filterMode = 'all';

  function getUniqueTypes(projects) {
    var set = new Set();
    projects.forEach(function (p) {
      var t = p.type || '其他';
      set.add(t);
    });
    return Array.from(set).sort(function (a, b) {
      return a.localeCompare(b, 'zh-CN');
    });
  }

  function renderFilterBar() {
    var container = document.getElementById('projects-filter');
    if (!container) return;
    container.innerHTML = '';

    if (!allTypes.length) return;

    var label = document.createElement('span');
    label.className = 'projects-filter-label';
    label.textContent = '类型';
    container.appendChild(label);

    var allBtn = document.createElement('button');
    allBtn.type = 'button';
    allBtn.className = 'filter-chip filter-chip--all is-active';
    allBtn.setAttribute('data-action', 'all');
    allBtn.textContent = '全部';
    container.appendChild(allBtn);

    allTypes.forEach(function (t) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'filter-chip';
      btn.setAttribute('data-type', t);
      btn.textContent = t;
      container.appendChild(btn);
    });

    container.addEventListener('click', onFilterClick);
  }

  function updateFilterChipsUI() {
    var container = document.getElementById('projects-filter');
    if (!container) return;

    var allBtn = container.querySelector('[data-action="all"]');
    if (allBtn) {
      allBtn.classList.toggle('is-active', filterMode === 'all');
    }

    container.querySelectorAll('[data-type]').forEach(function (btn) {
      var t = btn.getAttribute('data-type');
      btn.classList.toggle('is-active', filterMode !== 'all' && filterMode === t);
    });
  }

  function onFilterClick(e) {
    var target = e.target.closest('button.filter-chip');
    if (!target || !target.closest('#projects-filter')) return;

    var action = target.getAttribute('data-action');
    if (action === 'all') {
      filterMode = 'all';
    } else {
      var t = target.getAttribute('data-type');
      if (!t) return;
      filterMode = t;
    }

    updateFilterChipsUI();
    applyProjectFilter();
  }

  function applyProjectFilter() {
    var cards = document.querySelectorAll('#projects-grid .project-card');
    var visible = 0;

    cards.forEach(function (card) {
      var t = card.dataset.type || '其他';
      var show = filterMode === 'all' || filterMode === t;
      card.classList.toggle('is-filtered-out', !show);
      if (show) visible++;
    });

    var emptyEl = document.getElementById('projects-empty');
    if (emptyEl) {
      emptyEl.hidden = visible > 0;
    }
  }

  function createProjectCard(project, index) {
    var card = document.createElement('div');
    card.className = 'project-card fade-in-up';
    card.style.transitionDelay = index * 0.12 + 's';
    card.dataset.type = project.type || '其他';

    var mediaHTML;
    if (project.bilibili) {
      mediaHTML =
        '<div class="card-media card-media--bilibili">' +
        '<iframe src="https://player.bilibili.com/player.html?bvid=' +
        project.bilibili +
        '&page=1&high_quality=1&danmaku=0&autoplay=0"' +
        ' scrolling="no" frameborder="0" allowfullscreen="true"' +
        ' sandbox="allow-top-navigation allow-same-origin allow-forms allow-scripts">' +
        '</iframe>' +
        '</div>';
    } else if (project.video) {
      mediaHTML =
        '<div class="card-media">' +
        '<video src="' +
        project.video +
        '" muted loop playsinline preload="metadata"></video>' +
        '</div>';
    } else {
      mediaHTML =
        '<div class="card-media">' +
        '<div class="card-placeholder">' +
        '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">' +
        '<rect x="2" y="3" width="20" height="14" rx="2"/>' +
        '<path d="M8 21h8M12 17v4"/>' +
        '</svg>' +
        '<span>暂无预览</span>' +
        '</div>' +
        '</div>';
    }

    var tagsHTML = project.technology
      .map(function (t) {
        return '<span class="tag">' + escapeHTML(t) + '</span>';
      })
      .join('');

    var resultHTML = '';
    if (project.result) {
      resultHTML =
        '<div class="card-result">' +
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
        '<path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z"/>' +
        '</svg>' +
        '<span>' +
        escapeHTML(project.result) +
        '</span>' +
        '</div>';
    }

    var typeLabel = escapeHTML(project.type || '其他');

    card.innerHTML =
      mediaHTML +
      '<div class="card-body">' +
      '<span class="card-type">' +
      typeLabel +
      '</span>' +
      '<h3 class="card-title">' +
      escapeHTML(project.name) +
      '</h3>' +
      '<p class="card-desc">' +
      escapeHTML(project.description) +
      '</p>' +
      resultHTML +
      '<div class="card-tags">' +
      tagsHTML +
      '</div>' +
      '</div>';

    return card;
  }

  /* ---- Render project cards from PROJECT_DATA ---- */
  function renderProjects() {
    var grid = document.getElementById('projects-grid');
    if (!grid || typeof PROJECT_DATA === 'undefined' || !PROJECT_DATA.length) return;

    allTypes = getUniqueTypes(PROJECT_DATA);
    filterMode = 'all';

    grid.innerHTML = '';
    var fragment = document.createDocumentFragment();

    PROJECT_DATA.forEach(function (project, index) {
      fragment.appendChild(createProjectCard(project, index));
    });

    grid.appendChild(fragment);

    renderFilterBar();
    updateFilterChipsUI();
    applyProjectFilter();

    if (typeof window.refreshScrollReveal === 'function') {
      window.refreshScrollReveal();
    }
  }

  function escapeHTML(str) {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  /* ---- Video autoplay on hover ---- */
  function initVideoHover() {
    var cards = document.querySelectorAll('.project-card');
    cards.forEach(function (card) {
      var video = card.querySelector('video');
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

  /* ---- Typing cursor on hero subtitle ---- */
  function initCursorBlink() {
    var subtitle = document.querySelector('.hero-subtitle');
    if (!subtitle) return;

    var cursor = document.createElement('span');
    cursor.className = 'typing-cursor';
    cursor.textContent = '|';
    cursor.style.cssText =
      'animation: blink 1s step-end infinite; margin-left: 2px; color: var(--accent-blue); font-weight: 300;';
    subtitle.appendChild(cursor);

    var style = document.createElement('style');
    style.textContent = '@keyframes blink { 0%,100% { opacity:1 } 50% { opacity:0 } }';
    document.head.appendChild(style);

    setTimeout(function () {
      cursor.style.transition = 'opacity 1s ease';
      cursor.style.opacity = '0';
    }, 4000);
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderProjects();
    initVideoHover();
    initCursorBlink();
  });
})();
