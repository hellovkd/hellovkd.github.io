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
        badge.textContent = '복사 완료';
      } catch (_) {
        badge.textContent = '복사 불가';
      }
      resetTimer = setTimeout(() => { badge.textContent = '복사'; }, 2200);
    });
  }

  for (const preview of document.querySelectorAll('[data-preview-src]')) {
    preview.addEventListener('toggle', () => {
      const iframe = preview.querySelector('iframe');
      if (preview.open && !iframe.hasAttribute('src')) iframe.src = preview.dataset.previewSrc;
    });
  }

  const desk = document.querySelector('[data-project-desk]');
  if (desk) {
    const tablist = desk.querySelector('[role="tablist"]');
    const tabs = [...tablist.querySelectorAll('[role="tab"]')];
    const panels = [...desk.querySelectorAll('[data-folder-panel]')];
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
        const next = { ArrowRight: (index + 1) % tabs.length, ArrowLeft: (index - 1 + tabs.length) % tabs.length, Home: 0, End: tabs.length - 1 }[event.key];
        if (next !== undefined) {
          event.preventDefault();
          select(next, true);
        }
      });
    });
    desk.classList.add('is-enhanced');
    tablist.hidden = false;
    select(0);
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
      const visible = inCategory && normalize(row.dataset.postTitle).includes(query);
      row.hidden = !visible;
      if (visible) matches += 1;
    }
    reset.hidden = !query;
    kbd.hidden = !!query;
    if (empty) empty.hidden = !query || matches > 0 || rows.length === 0;
    if (categoryEmpty) categoryEmpty.hidden = !!query || !selectedCategory || matches > 0;
    status.textContent = query ? `${selectedName ? selectedName + '에서 ' : ''}${matches}개의 글을 찾았습니다.` : selectedCategory ? `${selectedName} · ${matches}개의 글` : '';
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
