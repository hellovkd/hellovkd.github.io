# hellovkd.github.io

Jekyll과 Minima를 기반으로 만든 개발·보안 학습 블로그입니다.

| 카테고리 | 글에 지정할 값 |
| --- | --- |
| 개발 | `development` |
| CTF/Wargame | `ctf-wargame` |
| Bug Bounty | `bug-bounty` |
| 블로그/기술문서 | `blog-docs` |
| 논문/컨퍼런스 | `papers-conferences` |
| 공모전/자격증 | `contests-certifications` |

`_posts/YYYY-MM-DD-title.markdown` 파일을 만들고 다음과 같이 작성합니다.

```yaml
---
layout: post
title: "글 제목"
date: 2026-10-27 12:00:00 +0900
categories: [development]
---
```

카테고리 이름과 소개는 `_data/categories.yml`, 디자인은 `assets/study.css`에서 수정할 수 있습니다. 글을 추가하면 홈과 카테고리 페이지의 목록 및 글 수가 자동으로 갱신됩니다. 글 제목 검색은 `assets/study.js`에서 동작하며, JavaScript를 사용할 수 없어도 전체 글과 카테고리를 볼 수 있습니다.

로컬 실행: `bundle exec jekyll serve`

빌드 확인: `bundle exec jekyll build`
