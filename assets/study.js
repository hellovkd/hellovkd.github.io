(() => {
  const toggle = document.getElementById('theme-toggle');
  if (toggle) {
    const updateLabel = theme => {
      const label = theme === 'dark' ? '라이트모드로 전환' : '다크모드로 전환';
      toggle.setAttribute('aria-label', label);
      toggle.title = label;
    };
    updateLabel(document.documentElement.getAttribute('data-theme'));
    toggle.addEventListener('click', () => {
      const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('study-theme', next); } catch (_) {}
      updateLabel(next);
    });
  }

  const copyBtn = document.querySelector('[data-copy-email]');
  if (copyBtn) {
    const badge = copyBtn.querySelector('.copy-email-badge');
    let resetTimer;
    copyBtn.addEventListener('click', async () => {
      clearTimeout(resetTimer);
      try {
        await navigator.clipboard.writeText(copyBtn.dataset.copyEmail);
        badge.textContent = '복사됨';
      } catch (_) {
        badge.textContent = '복사 불가';
      }
      resetTimer = setTimeout(() => { badge.textContent = '주소 복사'; }, 2200);
    });
  }

  const desk = document.querySelector('[data-project-desk]');
  if (desk) {
    const tablist = desk.querySelector('[role="tablist"]');
    const tabs = [...tablist.querySelectorAll('[role="tab"]')];
    const panels = [...desk.querySelectorAll('[data-folder-panel]')];
    const syncOrientation = () => {
      tablist.setAttribute('aria-orientation', window.innerWidth > 1020 ? 'vertical' : 'horizontal');
    };
    const select = (index, focus = false) => {
      tabs.forEach((tab, i) => {
        const active = i === index;
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
        panels[i].hidden = !active;
        panels[i].classList.remove('is-entering');
      });
      panels[index].classList.add('is-entering');
      if (focus) tabs[index].focus();
    };
    tabs.forEach((tab, index) => {
      panels[index].setAttribute('role', 'tabpanel');
      panels[index].setAttribute('aria-labelledby', tab.id);
      panels[index].tabIndex = 0;
      tab.addEventListener('click', () => select(index));
      tab.addEventListener('keydown', event => {
        const map = {
          ArrowRight: (index + 1) % tabs.length,
          ArrowDown: (index + 1) % tabs.length,
          ArrowLeft: (index - 1 + tabs.length) % tabs.length,
          ArrowUp: (index - 1 + tabs.length) % tabs.length,
          Home: 0,
          End: tabs.length - 1
        };
        const next = map[event.key];
        if (next !== undefined) {
          event.preventDefault();
          select(next, true);
        }
      });
    });
    syncOrientation();
    window.addEventListener('resize', syncOrientation, { passive: true });
    desk.classList.add('is-enhanced');
    tablist.hidden = false;
    select(0);
  }

  const runHeadlineTyping = () => {
    const heading = document.getElementById('site-heading');
    if (!heading || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const spans = [...heading.querySelectorAll('span')];
    if (spans.length === 0) return;
    // Lock heading height before clearing text so layout never jumps during typing
    heading.style.minHeight = `${heading.offsetHeight}px`;
    const texts = spans.map(s => s.textContent);
    spans.forEach(s => { s.textContent = '\u00A0'; });
    let spanIdx = 0;
    let charIdx = 0;
    const step = () => {
      if (spanIdx >= spans.length) {
        heading.style.minHeight = '';
        return;
      }
      charIdx += 1;
      spans[spanIdx].textContent = texts[spanIdx].slice(0, charIdx);
      if (charIdx < texts[spanIdx].length) {
        setTimeout(step, 95);
      } else {
        spanIdx += 1;
        charIdx = 0;
        if (spanIdx < spans.length) setTimeout(step, 240);
        else heading.style.minHeight = '';
      }
    };
    setTimeout(step, 120);
  };

  const initRevealAndTyping = () => {
    runHeadlineTyping();
    if (window.IntersectionObserver && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const targets = document.querySelectorAll(
        '.desk-intro, .profile-desk, .project-desk, .desk-archive, .study-post-row, .desk-contact, .project-entry, .post-head, .post-prose, .category-head, .static-head, .about-timeline-card'
      );
      targets.forEach((el, idx) => {
        el.setAttribute('data-reveal', '');
        if (idx < 4) {
          el.style.setProperty('--reveal-delay', `${idx * 120}ms`);
        }
      });
      document.documentElement.classList.add('reveal-ready');
      const io = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        }
      }, { rootMargin: '0px 0px -30px 0px', threshold: 0.04 });
      requestAnimationFrame(() => {
        targets.forEach(el => io.observe(el));
      });
    }
  };

  const bootOverlay = document.getElementById('boot-overlay');
  if (bootOverlay && document.documentElement.classList.contains('is-booting')) {
    const lines = [...bootOverlay.querySelectorAll('.boot-line')];
    const fill = document.getElementById('boot-progress-fill');
    const pct = document.getElementById('boot-progress-pct');
    let finished = false;
    const timers = [];

    const setProgress = value => {
      if (fill) fill.style.transform = `scaleX(${value / 100})`;
      if (pct) pct.textContent = `${value}%`;
    };

    const finishBoot = () => {
      if (finished) return;
      finished = true;
      timers.forEach(clearTimeout);
      setProgress(100);
      lines.forEach(l => l.classList.add('is-shown'));
      bootOverlay.classList.add('is-closing');
      document.documentElement.classList.remove('is-booting');
      initRevealAndTyping();
      setTimeout(() => {
        bootOverlay.classList.remove('is-closing');
        bootOverlay.hidden = true;
      }, 380);
    };

    setProgress(20);
    timers.push(setTimeout(() => {
      if (lines[1]) lines[1].classList.add('is-shown');
      setProgress(60);
    }, 480));
    timers.push(setTimeout(() => {
      if (lines[2]) lines[2].classList.add('is-shown');
      setProgress(100);
    }, 980));
    timers.push(setTimeout(finishBoot, 1500));

    bootOverlay.addEventListener('click', finishBoot, { once: true });
    window.addEventListener('keydown', finishBoot, { once: true });
  } else {
    initRevealAndTyping();
  }

  // Post Reading Progress Bar & Auto Table of Contents (TOC)
  const postArticle = document.querySelector('[data-post-article]');
  if (postArticle) {
    const prose = postArticle.querySelector('[data-post-prose]');
    const tocRail = document.getElementById('post-toc-rail');
    const tocList = document.getElementById('post-toc-list');
    const tocPct = document.getElementById('post-toc-pct');
    const tocTopBtn = document.getElementById('post-toc-top');
    const progressFill = document.getElementById('reading-progress-fill');

    const headings = prose ? [...prose.querySelectorAll('h2, h3')] : [];
    const tocLinks = [];

    if (headings.length >= 2 && tocRail && tocList) {
      headings.forEach((heading, idx) => {
        if (!heading.id) {
          const slug = heading.textContent
            .trim()
            .toLowerCase()
            .replace(/[^\p{L}\p{N}\s-]/gu, '')
            .replace(/\s+/g, '-');
          heading.id = slug ? `section-${slug}-${idx + 1}` : `section-${idx + 1}`;
        }
        const li = document.createElement('li');
        li.className = `post-toc-item${heading.tagName === 'H3' ? ' is-sub' : ''}`;
        const a = document.createElement('a');
        a.className = 'post-toc-link';
        a.href = `#${heading.id}`;
        a.textContent = heading.textContent.trim();
        li.appendChild(a);
        tocList.appendChild(li);
        tocLinks.push({ heading, link: a });
      });
      postArticle.classList.add('has-toc');
      tocRail.hidden = false;
    }

    if (tocTopBtn) {
      tocTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    let ticking = false;
    const updateReadingState = () => {
      ticking = false;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = docHeight > 0 ? Math.min(1, Math.max(0, window.scrollY / docHeight)) : 1;
      if (progressFill) {
        progressFill.style.transform = `scaleX(${ratio})`;
      }
      if (tocPct) {
        tocPct.textContent = `${Math.round(ratio * 100)}%`;
      }
      if (tocLinks.length > 0) {
        let activeIndex = 0;
        const offset = 130;
        for (let i = 0; i < tocLinks.length; i += 1) {
          if (tocLinks[i].heading.getBoundingClientRect().top <= offset) {
            activeIndex = i;
          }
        }
        tocLinks.forEach((item, i) => {
          item.link.classList.toggle('is-active', i === activeIndex);
        });
      }
    };

    window.addEventListener('scroll', () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateReadingState);
      }
    }, { passive: true });
    window.addEventListener('resize', updateReadingState, { passive: true });
    updateReadingState();
  }

  const search = document.querySelector('.post-search');
  if (!search) return;
  const input = search.querySelector('input');
  const reset = search.querySelector('.search-reset');
  const kbd = search.querySelector('.search-kbd');
  const status = search.querySelector('.search-status');
  const rows = [...document.querySelectorAll('[data-post-title]')];
  const empty = document.querySelector('.search-empty');
  const categoryEmpty = document.querySelector('[data-category-empty]');
  const categoryDestination = document.querySelector('[data-category-destination]');
  const categoryLinks = [...document.querySelectorAll('[data-archive-filters] [data-category]')];
  let selectedCategory = '';
  let selectedName = '';
  const normalize = value => value.normalize('NFKC').toLocaleLowerCase('ko').trim();
  const filter = () => {
    const query = normalize(input.value);
    let matches = 0;
    for (const row of rows) {
      const inCategory = !selectedCategory || row.dataset.postCategories.split(' ').includes(selectedCategory);
      const haystack = normalize(row.dataset.postSearch || row.dataset.postTitle);
      const visible = inCategory && haystack.includes(query);
      row.hidden = !visible;
      if (visible) matches += 1;
    }
    reset.hidden = !query;
    kbd.hidden = !!query;
    if (empty) empty.hidden = !query || matches > 0 || rows.length === 0;
    if (categoryEmpty) categoryEmpty.hidden = !!query || !selectedCategory || matches > 0;
    status.textContent = query ? `${selectedName ? selectedName + '에서 ' : ''}${matches}편의 기록을 찾았습니다.` : selectedCategory ? `${selectedName} · ${matches}편의 기록` : '';
  };

  for (const link of categoryLinks) {
    link.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      selectedCategory = link.dataset.category;
      selectedName = selectedCategory ? link.querySelector('span').textContent : '';
      categoryLinks.forEach(item => {
        if (item === link) item.setAttribute('aria-current', 'true');
        else item.removeAttribute('aria-current');
      });
      if (categoryDestination && selectedCategory) categoryDestination.href = link.href;
      filter();
    });
  }

  search.hidden = rows.length === 0;
  input.addEventListener('input', filter);
  input.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !event.isComposing) {
      input.value = '';
      filter();
      input.blur();
    }
  });
  document.addEventListener('keydown', event => {
    const active = document.activeElement;
    const editing = active?.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(active?.tagName);
    if (event.key === '/' && !search.hidden && !editing && !event.ctrlKey && !event.metaKey && !event.altKey && !event.isComposing) {
      event.preventDefault();
      input.focus();
    }
  });
  reset.addEventListener('click', () => {
    input.value = '';
    filter();
    input.focus();
  });
})();
