;(function () {
  'use strict';

  console.log('项目已启动');

  var app = document.getElementById('app');

  // ---------- 全局状态 ----------
  var allNovels = [];
  var currentGenre = null;
  var currentLang = 'zh';
  var favorites = [];

  // 从 localStorage 读取收藏
  function loadFavorites() {
    try {
      var stored = localStorage.getItem('novelFavorites');
      favorites = stored ? JSON.parse(stored) : [];
    } catch (e) {
      favorites = [];
    }
  }

  function saveFavorites() {
    localStorage.setItem('novelFavorites', JSON.stringify(favorites));
  }

  function toggleFavorite(id) {
    var idx = favorites.indexOf(id);
    if (idx === -1) {
      favorites.push(id);
    } else {
      favorites.splice(idx, 1);
    }
    saveFavorites();
    // 更新所有卡片上的心形图标
    updateAllHeartIcons();
    // 更新收藏栏
    renderFavoritesSection();
  }

  function isFavorited(id) {
    return favorites.indexOf(id) !== -1;
  }

  var GENRES = ['玄幻', '仙侠', '都市', '科幻', '言情', '悬疑'];
  var searchKeyword = '';

  // ---------- 静态文案 i18n ----------
  var STATIC_I18N = {
    zh: {
      'page-title': '网络小说出海推荐网页',
      'lang-zh': '🇨🇳 中文',
      'lang-en': '🇬🇧 English',
      'rankings-title': '🏆 热门 Top 5',
      'filter-all': '全部',
      'empty': '暂无该题材小说',
      'readers': '阅读量',
      'chapters': '章节数',
      'status': '状态',
      'genre-rank': '排行榜',
      'favorites-title': '❤️ 我的收藏',
      'favorites-empty': '暂无收藏',
      'favorites-count': '部收藏',
      'search-placeholder': '搜索书名或作者...',
      'search-no-result': '未找到相关小说'
    },
    en: {
      'page-title': 'Web Novel Discovery',
      'lang-zh': '🇨🇳 中文',
      'lang-en': '🇬🇧 English',
      'rankings-title': '🏆 Top 5',
      'filter-all': 'All',
      'empty': 'No novels found',
      'readers': 'Readers',
      'chapters': 'Chapters',
      'status': 'Status',
      'genre-rank': 'Rankings',
      'favorites-title': '❤️ My Favorites',
      'favorites-empty': 'No favorites yet',
      'favorites-count': 'saved',
      'search-placeholder': 'Search by title or author...',
      'search-no-result': 'No novels found'
    }
  };

  function t(key) {
    return (STATIC_I18N[currentLang] && STATIC_I18N[currentLang][key]) || (STATIC_I18N['zh'][key]) || key;
  }

  // ---------- 更新静态文案 ----------
  function updateStaticText() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.title = t('page-title');
    var btns = document.querySelectorAll('.lang-btn');
    btns.forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.lang === currentLang);
    });
    // 搜索框 placeholder
    var searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.placeholder = t('search-placeholder');
    // 清空按钮文字
    document.querySelectorAll('.search-clear').forEach(function (btn) {
      btn.textContent = currentLang === 'zh' ? '清空' : 'Clear';
    });
  }

  // ---------- 语言切换 ----------
  function switchLang(lang) {
    if (lang === currentLang) return;
    currentLang = lang;
    updateStaticText();
    // 排行榜和卡片全部重新渲染
    refreshAll();
  }

  // ---------- 工具函数 ----------
  function calcHotScore(novel) {
    return novel.rating * (novel.readers / 10000);
  }

  function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  // ---------- 获取 Top 5（按题材过滤） ----------
  function getTopNovels(genreFilter) {
    var pool = genreFilter
      ? allNovels.filter(function (n) { return n.genres.indexOf(genreFilter) !== -1; })
      : allNovels;
    var sorted = pool.slice().sort(function (a, b) {
      var diff = calcHotScore(b) - calcHotScore(a);
      return diff !== 0 ? diff : b.readers - a.readers;
    });
    return sorted.slice(0, 5);
  }

  // ---------- 创建卡片 ----------
  function createCard(novel, lang) {
    var card = document.createElement('div');
    card.className = 'novel-card';
    card.dataset.id = novel.id;

    var imgW = document.createElement('div');
    imgW.className = 'card-cover';
    var img = document.createElement('img');
    // 优先加载源站封面，失败则回退本地 SVG，再失败回退首字符
    img.src = novel.coverUrl || novel.cover;
    img.alt = novel.title[lang] || novel.title.zh;
    img.onerror = function () {
      if (img.src !== novel.cover && novel.cover) {
        // coverUrl 加载失败 → 尝试本地 SVG
        img.src = novel.cover;
        return;
      }
      img.style.display = 'none';
      var fb = document.createElement('span');
      fb.className = 'cover-fallback';
      fb.textContent = (novel.title[lang] || novel.title.zh).charAt(0);
      imgW.appendChild(fb);
    };
    imgW.appendChild(img);

    var body = document.createElement('div');
    body.className = 'card-body';

    var title = document.createElement('h3');
    title.className = 'card-title';
    title.textContent = novel.title[lang] || novel.title.zh;

    var author = document.createElement('p');
    author.className = 'card-author';
    author.textContent = novel.author[lang] || novel.author.zh;

    var rating = document.createElement('div');
    rating.className = 'card-rating';
    var sc = Math.round(novel.rating);
    var stars = '';
    for (var i = 0; i < 5; i++) stars += i < sc ? '★' : '☆';
    rating.textContent = stars + ' ' + novel.rating.toFixed(1);

    var summary = document.createElement('p');
    summary.className = 'card-summary';
    var txt = novel.summary[lang] || novel.summary.zh || '';
    summary.textContent = txt.length > 80 ? txt.slice(0, 80) + '…' : txt;

    var tags = document.createElement('div');
    tags.className = 'card-tags';
    novel.genres.forEach(function (g) {
      var tag = document.createElement('span');
      tag.className = 'tag';
      tag.textContent = g;
      tags.appendChild(tag);
    });

    // ---------- 收藏心形图标 ----------
    var favBtn = document.createElement('span');
    favBtn.className = 'fav-btn';
    favBtn.dataset.id = novel.id;
    favBtn.textContent = isFavorited(novel.id) ? '♥' : '♡';
    favBtn.addEventListener('click', function (e) {
      e.stopPropagation(); // 阻止触发卡片详情
      toggleFavorite(parseInt(this.dataset.id));
    });

    // 卡片底部的容器，用于放置标签和心形
    var footer = document.createElement('div');
    footer.className = 'card-footer';
    footer.appendChild(tags);
    footer.appendChild(favBtn);

    body.appendChild(title);
    body.appendChild(author);
    body.appendChild(rating);
    body.appendChild(summary);
    body.appendChild(footer);
    card.appendChild(imgW);
    card.appendChild(body);
    return card;
  }

  // ---------- 绑定卡片点击 ----------
  function bindCardClicks() {
    document.querySelectorAll('.novel-card').forEach(function (card) {
      card.addEventListener('click', function () { openModal(parseInt(this.dataset.id)); });
    });
  }

  // ---------- 渲染网格 ----------
  function renderGrid(data, emptyMsg) {
    // 清除所有残留的空状态，避免重复
    document.querySelectorAll('.empty-state').forEach(function (el) { el.remove(); });
    document.querySelector('.novel-grid') && document.querySelector('.novel-grid').remove();

    var area = document.querySelector('.content-area');
    if (!area) return;

    if (data.length === 0) {
      var em = document.createElement('p');
      em.className = 'empty-state';
      em.textContent = emptyMsg || t('empty');
      area.appendChild(em);
      return;
    }

    var grid = document.createElement('div');
    grid.className = 'novel-grid';
    data.forEach(function (n) { grid.appendChild(createCard(n, currentLang)); });
    area.appendChild(grid);
    bindCardClicks();
  }

  // ---------- 更新所有心形图标 ----------
  function updateAllHeartIcons() {
    document.querySelectorAll('.fav-btn').forEach(function (btn) {
      var id = parseInt(btn.dataset.id);
      btn.textContent = isFavorited(id) ? '♥' : '♡';
    });
  }

  // ---------- 渲染收藏栏 ----------
  function renderFavoritesSection() {
    var oldSection = document.querySelector('.favorites-section');
    if (oldSection) oldSection.remove();

    var rankings = document.querySelector('.rankings');
    if (!rankings) return;

    var section = document.createElement('div');
    section.className = 'favorites-section';

    var header = document.createElement('div');
    header.className = 'rankings-header';
    header.innerHTML = '<span class="rankings-label">' + t('favorites-title') + '</span>' +
      (favorites.length > 0 ? '<span class="favorites-count">' + favorites.length + ' ' + t('favorites-count') + '</span>' : '');
    section.appendChild(header);

    if (favorites.length === 0) {
      var empty = document.createElement('div');
      empty.className = 'favorites-empty';
      empty.textContent = t('favorites-empty');
      section.appendChild(empty);
    } else {
      var list = document.createElement('div');
      list.className = 'favorites-list';

      favorites.forEach(function (id) {
        // 从 allNovels 中找到对应小说
        var novel = null;
        for (var i = 0; i < allNovels.length; i++) {
          if (allNovels[i].id === id) { novel = allNovels[i]; break; }
        }
        if (!novel) return;

        var item = document.createElement('div');
        item.className = 'favorites-item';
        item.dataset.id = id;

        var heart = document.createElement('span');
        heart.className = 'fav-icon';
        heart.textContent = '♥';
        heart.addEventListener('click', function (e) {
          e.stopPropagation();
          toggleFavorite(parseInt(this.parentNode.dataset.id));
        });

        var name = document.createElement('span');
        name.className = 'fav-name';
        name.textContent = novel.title[currentLang] || novel.title.zh;

        var rmBtn = document.createElement('span');
        rmBtn.className = 'fav-remove';
        rmBtn.innerHTML = '&times;';
        rmBtn.title = currentLang === 'zh' ? '移除收藏' : 'Remove';
        rmBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          toggleFavorite(parseInt(this.parentNode.dataset.id));
        });

        item.appendChild(heart);
        item.appendChild(name);
        item.appendChild(rmBtn);

        // 点击收藏项 → 滚动到卡片
        item.addEventListener('click', function () {
          var targetId = parseInt(this.dataset.id);
          // 如果当前筛选隐藏了目标，重置筛选
          if (currentGenre !== null) {
            var inFiltered = allNovels.filter(function (n) { return n.genres.indexOf(currentGenre) !== -1; });
            var found = inFiltered.some(function (n) { return n.id === targetId; });
            if (!found) {
              currentGenre = null;
              highlightActive();
              refreshAll();
            }
            updateRankingHighlight(targetId);
          }
          scrollToCard(targetId);
        });

        list.appendChild(item);
      });

      section.appendChild(list);
    }

    rankings.parentNode.insertBefore(section, rankings.nextSibling);
  }

  // ---------- 渲染排行榜 ----------
  function renderRankings() {
    document.querySelector('.rankings') && document.querySelector('.rankings').remove();

    var top5 = getTopNovels(currentGenre);

    var aside = document.createElement('aside');
    aside.className = 'rankings';

    // 标题栏
    var header = document.createElement('div');
    header.className = 'rankings-header';
    header.innerHTML =
      '<span class="rankings-label">' +
        (currentLang === 'zh'
          ? (currentGenre ? '「' + currentGenre + '」' : '') + '🏆 热门 Top 5'
          : '🏆 ' + (currentGenre ? currentGenre + ' ' : '') + 'Top 5') +
      '</span>';

    // 副标题：综合热度排序
    var sub = document.createElement('div');
    sub.className = 'rankings-sub';
    sub.textContent = currentLang === 'zh' ? '综合热度排序' : 'by popularity';
    header.appendChild(sub);

    aside.appendChild(header);

    var list = document.createElement('ol');
    list.className = 'rankings-list';

    top5.forEach(function (novel, idx) {
      var item = document.createElement('li');
      item.className = 'rankings-item';
      item.dataset.id = novel.id;

      var rankEl = document.createElement('span');
      rankEl.className = 'rank-num';
      rankEl.textContent = idx < 3 ? ['🥇','🥈','🥉'][idx] : '#' + (idx + 1);

      var info = document.createElement('div');
      info.className = 'rank-info';

      var nameSpan = document.createElement('span');
      nameSpan.className = 'rank-name';
      nameSpan.textContent = novel.title[currentLang] || novel.title.zh;

      var metaSpan = document.createElement('span');
      metaSpan.className = 'rank-meta';
      metaSpan.textContent = '⭐ ' + novel.rating.toFixed(1) + '  ·  ' + formatNumber(novel.readers) + ' readers';

      info.appendChild(nameSpan);
      info.appendChild(metaSpan);

      item.appendChild(rankEl);
      item.appendChild(info);

      item.addEventListener('click', function () {
        var targetId = novel.id;
        // 如果已筛选且目标不在筛选中，重置
        if (currentGenre !== null) {
          var inFiltered = allNovels.filter(function (n) { return n.genres.indexOf(currentGenre) !== -1; });
          var found = inFiltered.some(function (n) { return n.id === targetId; });
          if (!found) {
            currentGenre = null;
            highlightActive();
            refreshAll();
            updateRankingHighlight(targetId);
          }
        }
        scrollToCard(targetId);
      });

      list.appendChild(item);
    });

    aside.appendChild(list);
    return aside;
  }

  // ---------- 刷新全部（网格 + 排行榜） ----------
  function refreshAll() {
    applySearchAndRender();

    var oldRank = document.querySelector('.rankings');
    var parent = oldRank ? oldRank.parentNode : document.querySelector('.main-content');
    var newRank = renderRankings();
    if (parent) parent.appendChild(newRank);
    renderFavoritesSection();
  }

  // ---------- 排行榜高亮 ----------
  function updateRankingHighlight(targetId) {
    document.querySelectorAll('.rankings-item').forEach(function (item) {
      item.classList.toggle('active', parseInt(item.dataset.id) === targetId);
    });
  }

  // ---------- 滚动到卡片 ----------
  function scrollToCard(targetId) {
    var card = document.querySelector('.novel-card[data-id="' + targetId + '"]');
    if (!card) return;
    updateRankingHighlight(targetId);
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    card.classList.add('card-highlight');
    setTimeout(function () { card.classList.remove('card-highlight'); }, 2000);
  }

  // ---------- 搜索栏 ----------
  function renderSearchBar() {
    var container = document.createElement('div');
    container.className = 'search-bar';

    var input = document.createElement('input');
    input.type = 'text';
    input.id = 'searchInput';
    input.className = 'search-input';
    input.placeholder = t('search-placeholder');
    input.value = searchKeyword;

    var clearBtn = document.createElement('button');
    clearBtn.className = 'search-clear';
    clearBtn.textContent = currentLang === 'zh' ? '清空' : 'Clear';
    clearBtn.style.display = searchKeyword ? '' : 'none';

    input.addEventListener('input', function () {
      searchKeyword = this.value.trim();
      clearBtn.style.display = searchKeyword ? '' : 'none';
      applySearchAndRender();
    });

    clearBtn.addEventListener('click', function () {
      input.value = '';
      searchKeyword = '';
      clearBtn.style.display = 'none';
      applySearchAndRender();
      input.focus();
    });

    container.appendChild(input);
    container.appendChild(clearBtn);
    return container;
  }

  // 获取当前基础列表（经过题材筛选）
  function getBaseList() {
    return currentGenre
      ? allNovels.filter(function (n) { return n.genres.indexOf(currentGenre) !== -1; })
      : allNovels;
  }

  // 搜索过滤 + 渲染
  function applySearchAndRender() {
    var base = getBaseList();
    var result = base;

    if (searchKeyword) {
      var kw = searchKeyword.toLowerCase();
      result = base.filter(function (n) {
        return (n.title.zh && n.title.zh.toLowerCase().indexOf(kw) !== -1) ||
               (n.title.en && n.title.en.toLowerCase().indexOf(kw) !== -1) ||
               (n.author.zh && n.author.zh.toLowerCase().indexOf(kw) !== -1) ||
               (n.author.en && n.author.en.toLowerCase().indexOf(kw) !== -1);
      });
    }

    renderGrid(result, searchKeyword ? t('search-no-result') : t('empty'));
  }

  // ---------- 筛选栏 ----------
  function renderFilterBar() {
    var bar = document.createElement('div');
    bar.className = 'filter-bar';

    var allBtn = document.createElement('button');
    allBtn.className = 'filter-btn' + (currentGenre === null ? ' active' : '');
    allBtn.textContent = t('filter-all');
    allBtn.dataset.genre = '';
    allBtn.addEventListener('click', function () {
      if (currentGenre !== null) { currentGenre = null; highlightActive(); refreshAll(); }
    });
    bar.appendChild(allBtn);

    GENRES.forEach(function (genre) {
      var btn = document.createElement('button');
      btn.className = 'filter-btn' + (currentGenre === genre ? ' active' : '');
      btn.textContent = genre;
      btn.dataset.genre = genre;
      btn.addEventListener('click', function () {
        if (currentGenre !== genre) { currentGenre = genre; highlightActive(); refreshAll(); }
      });
      bar.appendChild(btn);
    });

    return bar;
  }

  // ---------- 高亮激活按钮 ----------
  function highlightActive() {
    document.querySelectorAll('.filter-btn').forEach(function (btn) {
      var g = btn.dataset.genre;
      btn.classList.toggle('active', (g === '' && currentGenre === null) || g === currentGenre);
    });
  }

  // ==================== 模态框 ====================
  var modal = document.getElementById('modal');
  var modalBody = document.getElementById('modalBody');
  var modalClose = document.getElementById('modalClose');

  function openModal(novelId) {
    var novel = null;
    for (var i = 0; i < allNovels.length; i++) {
      if (allNovels[i].id === novelId) { novel = allNovels[i]; break; }
    }
    if (!novel) return;

    document.body.classList.add('modal-open');

    var starStr = '';
    for (var si = 0; si < 5; si++) starStr += si < Math.round(novel.rating) ? '★' : '☆';

    var tagsHtml = '';
    for (var ti = 0; ti < novel.tags.length; ti++) {
      tagsHtml += '<span class="tag">' + novel.tags[ti] + '</span>';
    }

    var titleTxt = novel.title[currentLang] || novel.title.zh;
    var authorTxt = novel.author[currentLang] || novel.author.zh;
    var summaryTxt = novel.summary[currentLang] || novel.summary.zh;
    var statusTxt = novel.status[currentLang] || novel.status.zh;

    modalBody.innerHTML =
      '<div class="modal-cover"><img src="' + (novel.coverUrl || novel.cover) + '" alt="' + titleTxt + '" id="modalCoverImg"></div>' +
      '<div class="modal-inner">' +
        '<h2 class="modal-title">' + titleTxt + '</h2>' +
        '<p class="modal-author">' + authorTxt + '</p>' +
        '<div class="modal-rating"><span class="modal-stars">' + starStr + '</span> <span>' + novel.rating.toFixed(1) + '</span></div>' +
        '<div class="modal-summary">' + summaryTxt + '</div>' +
        '<div class="modal-meta">' +
          '<div class="meta-item"><span class="meta-label">' + t('chapters') + '</span><span class="meta-value">' + novel.chapters + '</span></div>' +
          '<div class="meta-item"><span class="meta-label">' + t('status') + '</span><span class="meta-value">' + statusTxt + '</span></div>' +
          '<div class="meta-item"><span class="meta-label">' + t('readers') + '</span><span class="meta-value">' + formatNumber(novel.readers) + '</span></div>' +
        '</div>' +
        '<div class="modal-tags">' + tagsHtml + '</div>' +
      '</div>';

    // 模态框封面回退：coverUrl 失败 → 尝试本地 SVG
    var modalImg = document.getElementById('modalCoverImg');
    if (modalImg) {
      modalImg.onerror = function () {
        if (this.src !== novel.cover && novel.cover) {
          this.src = novel.cover;
          this.onerror = null;
        }
      };
    }

    modal.classList.add('open');
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.classList.remove('modal-open');
  }

  modalClose.addEventListener('click', closeModal);
  modal.querySelector('.modal-backdrop').addEventListener('click', closeModal);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });

  // ==================== 构建布局 ====================
  function buildLayout() {
    app.innerHTML = '';
    app.appendChild(renderFilterBar());
    app.appendChild(renderSearchBar());

    var main = document.createElement('div');
    main.className = 'main-content';
    main.innerHTML = '<div class="content-area"></div>';
    app.appendChild(main);

    // 默认加载排行榜
    var rankings = renderRankings();
    main.appendChild(rankings);
    renderFavoritesSection();
  }

  // ==================== 初始化 ====================
  if (window.location.protocol === 'file:') {
    app.innerHTML = '<p class="error-msg">⚠️ 浏览器禁止在 <code>file://</code> 协议下加载本地文件。<br>请使用本地 HTTP 服务器打开此页面。</p>';
  }

  fetch('novels.json')
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function (data) {
      console.log('数据加载成功');
      console.log('共获取 ' + data.length + ' 部小说');
      allNovels = data;
      loadFavorites();

      initLangSwitcher();
      updateStaticText();
      buildLayout();
      refreshAll();
    })
    .catch(function (err) {
      console.error('数据加载失败:', err.message);
      if (window.location.protocol !== 'file:') app.innerHTML = '<p class="error-msg">数据加载失败，请稍后重试。</p>';
    });

  function initLangSwitcher() {
    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.addEventListener('click', function () { switchLang(btn.dataset.lang); });
    });
  }
})();
