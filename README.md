# 게시글 작성

`_posts/YYYY-MM-DD-title.md`의 front matter에 최초 게시 날짜와 시간을 한국 시간으로 기록합니다.

```yaml
layout: post
title: "게시글 제목"
date: 2026-11-07 11:39:25 +0900
categories: [blog-docs]
```

글 목록과 게시글 상단에 `게시 2026.11.07 11:39 (KST)` 형식으로 표시됩니다.
글을 수정할 때도 `date`는 최초 게시 시각으로 유지합니다. 새 글을 올릴 때는 실제 게시 시각을 넣습니다.
