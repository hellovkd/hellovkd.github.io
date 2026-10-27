(() => {
  const search = document.querySelector('.post-search');
  if (!search) return;

  const input = search.querySelector('input');
  const reset = search.querySelector('.search-reset');
  const status = search.querySelector('.search-status');
  const rows = [...document.querySelectorAll('[data-post-title]')];
  const empty = document.querySelector('.search-empty');
  const normalize = value => value.normalize('NFKC').toLocaleLowerCase('ko').trim();

  const filter = () => {
    const query = normalize(input.value);
    let matches = 0;

    for (const row of rows) {
      const visible = normalize(row.dataset.postTitle).includes(query);
      row.hidden = !visible;
      if (visible) matches += 1;
    }

    reset.hidden = query.length === 0;
    empty.hidden = matches !== 0;
    status.textContent = query ? `${matches}개의 글을 찾았습니다.` : '';
  };

  search.hidden = false;
  input.addEventListener('input', filter);
  input.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      input.value = '';
      filter();
    }
  });
  reset.addEventListener('click', () => {
    input.value = '';
    filter();
    input.focus();
  });
})();
