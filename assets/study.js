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

    // Jekyll이 만든 각주 링크를 보강하고, 미지원 브라우저에서는 원래 하단 이동을 유지합니다.
    if (prose && typeof HTMLElement.prototype.showPopover === 'function') {
      const footnotes = [...prose.querySelectorAll('a.footnote')].flatMap(link => {
        const href = link.getAttribute('href');
        if (!href?.startsWith('#')) return [];
        let note;
        try { note = document.getElementById(decodeURIComponent(href.slice(1))); } catch (_) { return []; }
        return note && prose.contains(note) && note.closest('.footnotes') ? [{ link, note }] : [];
      });

      if (footnotes.length > 0) {
        const popover = document.createElement('div');
        popover.id = 'post-footnote-popover';
        popover.className = 'footnote-popover';
        popover.setAttribute('popover', 'auto');
        popover.setAttribute('role', 'dialog');
        popover.setAttribute('aria-labelledby', 'post-footnote-title');
        popover.setAttribute('aria-describedby', 'post-footnote-body');
        popover.tabIndex = -1;

        const header = document.createElement('div');
        header.className = 'footnote-popover-header';
        const title = document.createElement('span');
        title.id = 'post-footnote-title';
        const closeButton = document.createElement('button');
        closeButton.type = 'button';
        closeButton.className = 'footnote-popover-close';
        closeButton.textContent = '닫기';
        closeButton.setAttribute('aria-label', '각주 닫기');
        header.append(title, closeButton);

        const body = document.createElement('div');
        body.id = 'post-footnote-body';
        body.className = 'footnote-popover-body';
        popover.append(header, body);
        document.body.appendChild(popover);
        let activeLink = null;
        let pressedOpenLink = null;
        let positionFrame = 0;
        let hideTimer;
        let restoringFocus = false;

        // 번호 아래에 배치하되, 화면 아래쪽에서는 위로 열고 모바일 화면 안으로 위치를 보정합니다.
        const positionPopover = () => {
          positionFrame = 0;
          if (!activeLink || !popover.matches(':popover-open')) return;
          const viewport = window.visualViewport;
          const viewportLeft = viewport?.offsetLeft || 0;
          const viewportTop = viewport?.offsetTop || 0;
          const viewportWidth = viewport?.width || window.innerWidth;
          const viewportHeight = viewport?.height || window.innerHeight;
          const margin = 12;
          const gap = 10;
          const anchor = activeLink.getBoundingClientRect();
          if (anchor.bottom < viewportTop || anchor.top > viewportTop + viewportHeight) {
            popover.hidePopover();
            return;
          }
          popover.style.width = `${Math.min(360, viewportWidth - margin * 2)}px`;
          popover.style.maxHeight = `${viewportHeight - margin * 2}px`;
          const box = popover.getBoundingClientRect();
          const below = anchor.bottom + gap;
          const top = below + box.height <= viewportTop + viewportHeight - margin
            ? below : anchor.top - box.height - gap;
          popover.style.left = `${Math.max(viewportLeft + margin, Math.min(anchor.left - 16, viewportLeft + viewportWidth - box.width - margin))}px`;
          popover.style.top = `${Math.max(viewportTop + margin, Math.min(top, viewportTop + viewportHeight - box.height - margin))}px`;
        };
        const schedulePosition = () => {
          if (activeLink && !positionFrame) positionFrame = requestAnimationFrame(positionPopover);
        };

        // 번호와 설명 사이의 짧은 간격을 건널 시간을 주고, 두 영역 모두 벗어났을 때 닫습니다.
        const cancelHide = () => clearTimeout(hideTimer);
        const scheduleHide = () => {
          cancelHide();
          hideTimer = setTimeout(() => {
            if (!activeLink || !popover.matches(':popover-open')) return;
            const hovering = activeLink.matches(':hover') || popover.matches(':hover');
            const keyboardFocus = activeLink.matches(':focus-visible')
              || popover.matches(':focus-visible') || popover.querySelector(':focus-visible');
            if (!hovering && !keyboardFocus) popover.hidePopover();
          }, 140);
        };

        // Esc와 창 밖 클릭은 브라우저가 처리하고, 닫힌 뒤 접근성 상태와 키보드 초점을 복구합니다.
        popover.addEventListener('beforetoggle', event => {
          if (event.newState !== 'closed' || !activeLink) return;
          cancelHide();
          const previousLink = activeLink;
          activeLink = null;
          previousLink.setAttribute('aria-expanded', 'false');
          if (popover.contains(document.activeElement)) {
            restoringFocus = true;
            previousLink.focus({ preventScroll: true });
            restoringFocus = false;
          }
        });
        closeButton.addEventListener('click', () => popover.hidePopover());
        popover.addEventListener('pointerenter', cancelHide);
        popover.addEventListener('pointerleave', event => {
          if (event.pointerType !== 'touch') scheduleHide();
        });
        popover.addEventListener('focusin', cancelHide);
        popover.addEventListener('focusout', scheduleHide);

        // 마우스를 올릴 때는 초점을 빼앗지 않고, 키보드·터치로 열 때만 설명에 초점을 줍니다.
        const showFootnote = (link, note, focus = false) => {
          cancelHide();
          if (activeLink !== link || !popover.matches(':popover-open')) {
            if (popover.matches(':popover-open')) popover.hidePopover();
            // 원본 각주는 그대로 두고, 복사본의 중복 ID와 본문 복귀 링크만 제거합니다.
            const content = note.cloneNode(true);
            content.querySelectorAll('.reversefootnote, [role="doc-backlink"]').forEach(node => node.remove());
            content.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
            body.replaceChildren(...content.childNodes);
            title.textContent = `각주 ${link.textContent.trim()}`;
            activeLink = link;
            link.setAttribute('aria-expanded', 'true');
            popover.showPopover({ source: link });
            popover.scrollTop = 0;
            positionPopover();
          }
          if (focus) popover.focus({ preventScroll: true });
        };

        footnotes.forEach(({ link, note }) => {
          link.setAttribute('aria-haspopup', 'dialog');
          link.setAttribute('aria-controls', popover.id);
          link.setAttribute('aria-expanded', 'false');
          link.setAttribute('aria-label', `각주 ${link.textContent.trim()} 보기`);
          link.addEventListener('pointerenter', event => {
            if (event.pointerType !== 'touch') showFootnote(link, note);
          });
          link.addEventListener('pointerleave', event => {
            if (event.pointerType !== 'touch') scheduleHide();
          });
          link.addEventListener('focusin', () => {
            if (!restoringFocus && link.matches(':focus-visible')) showFootnote(link, note);
          });
          link.addEventListener('focusout', scheduleHide);
          // 터치 기기에서는 기존처럼 같은 번호를 다시 누르면 닫을 수 있습니다.
          link.addEventListener('pointerdown', () => {
            pressedOpenLink = activeLink === link ? link : null;
          });
          link.addEventListener('click', event => {
            if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            const sameLink = activeLink === link || (event.detail > 0 && pressedOpenLink === link);
            pressedOpenLink = null;
            const touch = event.pointerType === 'touch';
            if (touch && sameLink) {
              if (popover.matches(':popover-open')) popover.hidePopover();
              return;
            }
            showFootnote(link, note, touch || event.detail === 0);
          });
        });
        window.addEventListener('scroll', schedulePosition, { passive: true });
        window.addEventListener('resize', schedulePosition, { passive: true });
        window.visualViewport?.addEventListener('resize', schedulePosition, { passive: true });
        window.visualViewport?.addEventListener('scroll', schedulePosition, { passive: true });
        popover.addEventListener('load', schedulePosition, true);

        // 팝업 연결이 끝난 경우에만 하단 목록을 숨겨, 스크립트 미지원 시에는 원래 각주를 읽게 합니다.
        const noteSections = new Set(footnotes.map(({ note }) => note.closest('.footnotes')));
        noteSections.forEach(section => { section.hidden = true; });

        // 각주 주소로 직접 접속하거나 새 탭에서 연 경우에도 해당 번호의 팝업을 표시합니다.
        const openHashFootnote = () => {
          let id;
          try { id = decodeURIComponent(window.location.hash.slice(1)); } catch (_) { return; }
          const footnote = footnotes.find(({ note }) => note.id === id);
          if (!footnote) return;
          footnote.link.scrollIntoView({ block: 'center', behavior: 'instant' });
          footnote.link.click();
        };
        window.addEventListener('hashchange', openHashFootnote);
        openHashFootnote();
      }
    }

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
  const excludedFromAll = document.querySelector('[data-archive-filters]')?.dataset.excludeFromAll;
  let selectedCategory = '';
  let selectedName = '';
  const normalize = value => value.normalize('NFKC').toLocaleLowerCase('ko').trim();
  const filter = () => {
    const query = normalize(input.value);
    let matches = 0;
    for (const row of rows) {
      const categories = row.dataset.postCategories.split(' ');
      const inCategory = selectedCategory
        ? categories.includes(selectedCategory)
        : !excludedFromAll || !categories.includes(excludedFromAll);
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
  filter();
})();
