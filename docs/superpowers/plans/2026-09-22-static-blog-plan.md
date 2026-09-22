# 놀러와스키샵 정적 블로그 및 네이버 사이트링크 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 동일 도메인에 크롤링 가능한 블로그 허브와 검색 의도별 글 3개를 추가하고, 홈페이지 메뉴·내부 링크·sitemap을 연결한다.

**Architecture:** GitHub Pages에서 바로 제공되는 정적 HTML 구조를 사용한다. 블로그 공통 스타일은 `blog/blog.css`로 분리하고, 각 문서는 JavaScript 없이 제목·직답·표·내부 링크를 제공한다. CMS·Supabase·댓글·자동 발행은 추가하지 않는다.

**Tech Stack:** HTML5, CSS, JSON-LD, XML sitemap, 기존 GitHub Pages 배포

**Spec:** `docs/superpowers/specs/2026-09-22-static-blog-design.md`

## Global Constraints

- 기존 정적 HTML 구조와 디자인을 우선 보존하고 요청 범위만 수정한다.
- 가격·시즌·운영 조건은 현재 홈페이지에 공개된 사실만 사용한다.
- 각 글은 고유 title, description, canonical, h1을 정확히 1개씩 가진다.
- 첫 답변·핵심 키워드·본문 링크는 raw HTML에 존재해야 한다.
- FAQ가 있을 경우 화면 문장과 FAQ JSON-LD를 동일하게 유지한다.
- `sitemap.xml`의 `<lastmod>`는 실제 파일 변경일인 `2026-09-22`로 설정한다.
- 네이버 사이트링크 노출이나 상위노출을 보장한다고 표현하지 않는다.
- 이용약관 페이지는 이 계획 범위에 포함하지 않는다.

## Review Focus

- 상대경로가 한 단계 깊어진 블로그 문서에서 홈페이지·다른 글·이미지 링크가 깨지지 않는가 — Task 1과 Task 2의 링크 검사로 고정한다.
- 가격·시즌 기준일이 현재 홈페이지 수치와 어긋나지 않는가 — Task 2의 가격 표 검증으로 고정한다.
- JSON-LD가 파싱되지만 화면에 없는 내용을 선언하지 않는가 — Task 1과 Task 2에서 JSON-LD 타입·가시 제목·URL을 대조한다.
- 홈페이지 메뉴가 JavaScript `onclick`만 남고 실제 블로그 `href`를 제공하지 않는가 — Task 3의 raw HTML 링크 검사로 고정한다.
- sitemap에 신규 URL이 빠지거나 canonical과 다른 URL을 가리키지 않는가 — Task 3의 sitemap 집합 비교로 고정한다.

### Task 1: 블로그 공통 스타일·허브·렌탈 글

**Files:**
- Create: `blog/blog.css`
- Create: `blog/index.html`
- Create: `blog/muju-ski-rental.html`

**Interfaces:**
- Consumes: 기존 홈페이지의 `https://www.nolleowaski.com/` 공개 정보와 보라색 브랜드 색상 `#6d5acd`
- Produces: `/blog/index.html` 허브와 `/blog/muju-ski-rental.html` 문서, 두 페이지에서 재사용하는 CSS 선택자

- [ ] **Step 1: Write the failing existence and metadata check**

```powershell
node -e "const fs=require('fs'); for (const f of ['blog/blog.css','blog/index.html','blog/muju-ski-rental.html']) { if (fs.existsSync(f)) throw new Error('unexpected existing file: '+f); } console.log('RED: blog files are not present yet')"
```

Expected: FAIL if any target already exists; otherwise prints the RED baseline and exits 0 after the explicit precondition check.

- [ ] **Step 2: Run the baseline check and record the missing-file result**

Run: the command from Step 1.

Expected: all three target paths are absent before implementation.

- [ ] **Step 3: Create the shared stylesheet and two static documents**

`blog/blog.css` must define a responsive white-card layout, the existing violet accent, readable Korean typography, table styles, breadcrumb styles, article metadata, and navigation links. It must not import a new framework.

`blog/index.html` must contain:

- `lang="ko"`, viewport, unique title/description, canonical `https://www.nolleowaski.com/blog/`
- one `<h1>`: `무주 스키장 정보와 렌탈 가이드`
- a direct introductory paragraph explaining that the page collects rental, lift-ticket, and price information for the 2026/27 season
- three article cards with real `<a href="muju-ski-rental.html">`, `muju-lift-ticket.html`, and `muju-ski-price.html` links; the latter two are created in Task 2
- a link back to `../index.html`

`blog/muju-ski-rental.html` must contain:

- title: `무주 스키장 렌탈샵 이용 방법 | 놀러와스키샵`
- description mentioning 무주렌탈샵, equipment/clothing rental, reservation, and the resort-front location without keyword stuffing
- canonical `https://www.nolleowaski.com/blog/muju-ski-rental.html`
- one `<h1>`: `무주 스키장 렌탈샵 이용 방법`
- first paragraph answering what can be rented and how to reserve
- visible sections for rental items, reservation steps, visit preparation, delivery/pickup information, and related posts
- Article JSON-LD and BreadcrumbList JSON-LD whose headline, URL, and breadcrumb labels match visible HTML
- no claims about reviews, opening hours, or services not present in the existing site

- [ ] **Step 4: Run the Task 1 static checks**

Run:

```powershell
node -e "const fs=require('fs'); const files=['blog/index.html','blog/muju-ski-rental.html']; for (const f of files) { const s=fs.readFileSync(f,'utf8'); for (const token of ['<title>','name=\"description\"','rel=\"canonical\"','<h1','application/ld+json']) if(!s.includes(token)) throw new Error(f+' missing '+token); if((s.match(/<h1\b/g)||[]).length!==1) throw new Error(f+' must have exactly one h1'); } console.log('Task 1 static checks PASS')"
```

Expected: `Task 1 static checks PASS`.

- [ ] **Step 5: Commit Task 1**

```powershell
git add blog/blog.css blog/index.html blog/muju-ski-rental.html
git commit -m "feat: add static blog hub and rental guide"
```

### Task 2: 리프트권·가격 글과 구조화 데이터 검증

**Files:**
- Create: `blog/muju-lift-ticket.html`
- Create: `blog/muju-ski-price.html`

**Interfaces:**
- Consumes: Task 1의 `blog/blog.css`, 허브 링크 규약, 현재 홈페이지에 표시된 26/27 시즌 가격표
- Produces: 두 개의 독립 색인 문서와 허브로 돌아가는 관련 글 링크

- [ ] **Step 1: Write the failing article and price assertions**

```powershell
node -e "const fs=require('fs'); for (const f of ['blog/muju-lift-ticket.html','blog/muju-ski-price.html']) { if(fs.existsSync(f)) throw new Error('unexpected existing file: '+f); } console.log('RED: article files are not present yet')"
```

Expected: both target files are absent before implementation.

- [ ] **Step 2: Create the lift-ticket article**

`blog/muju-lift-ticket.html` must use the canonical URL `https://www.nolleowaski.com/blog/muju-lift-ticket.html`, one h1 `무주리조트 리프트권 할인·시간권 안내`, and a visible table containing the existing 3·4·6 hour weekday/weekend adult/child values. It must state that the table is for the `2026/27 시즌 기준` and distinguish confirmed values from any future resort schedule notice. It must link to the price article, rental article, blog hub, and home.

- [ ] **Step 3: Create the price article**

`blog/muju-ski-price.html` must use the canonical URL `https://www.nolleowaski.com/blog/muju-ski-price.html`, one h1 `무주 스키장 가격: 장비·의류·보호장비`, and a visible table containing the current itemized values for equipment, clothing, helmet, goggles, and helmet+goggle. It must link to the lift-ticket article for lift prices instead of duplicating an unverified promotion. It must state the data 기준일 and link to the reservation entry point.

- [ ] **Step 4: Add and validate Article/BreadcrumbList JSON-LD**

Each article must contain valid JSON-LD with:

```json
{
  "@type": "Article",
  "headline": "visible h1 topic",
  "mainEntityOfPage": "the page canonical URL",
  "datePublished": "2026-09-22",
  "dateModified": "2026-09-22",
  "author": { "@type": "Organization", "name": "놀러와스키샵" },
  "publisher": { "@type": "Organization", "name": "놀러와스키샵" }
}
```

The BreadcrumbList must contain visible `홈`, `블로그`, and the article title in the same order. Do not add FAQ JSON-LD unless the same questions and answers are visibly rendered.

- [ ] **Step 5: Run Task 2 checks**

Run:

```powershell
node -e "const fs=require('fs'); const files=['blog/muju-lift-ticket.html','blog/muju-ski-price.html']; for(const f of files){const s=fs.readFileSync(f,'utf8'); if((s.match(/<h1\b/g)||[]).length!==1) throw new Error(f+' h1 count'); if(!s.includes('2026/27 시즌 기준')) throw new Error(f+' missing data basis'); const blocks=[...s.matchAll(/<script[^>]*type=\"application\/ld\+json\"[^>]*>([\s\S]*?)<\/script>/g)]; if(blocks.length<2) throw new Error(f+' missing JSON-LD blocks'); for(const b of blocks) JSON.parse(b[1]); } console.log('Task 2 JSON-LD and price checks PASS')"
```

Expected: `Task 2 JSON-LD and price checks PASS`.

- [ ] **Step 6: Commit Task 2**

```powershell
git add blog/muju-lift-ticket.html blog/muju-ski-price.html
git commit -m "feat: add lift ticket and rental price guides"
```

### Task 3: 홈페이지 메뉴·sitemap·배포 전 통합 검증

**Files:**
- Modify: `index.html:746-772` and footer navigation area
- Modify: `sitemap.xml`
- Modify: `index.html` organization JSON-LD only if the shared publisher `@id` is added consistently
- Modify: `프로젝트_현황.md` to record the deployed blog URLs after verification

**Interfaces:**
- Consumes: Task 1 and Task 2 blog URLs
- Produces: actual `href` entry points from mobile menu, desktop nav, footer, and sitemap

- [ ] **Step 1: Write the failing integration assertions**

```powershell
node -e "const fs=require('fs'); const h=fs.readFileSync('index.html','utf8'); const sm=fs.readFileSync('sitemap.xml','utf8'); if(h.includes('blog/index.html')) throw new Error('blog link already exists'); if(sm.includes('/blog/')) throw new Error('blog sitemap entries already exist'); console.log('RED: integration links are not wired yet')"
```

Expected: the current checkout has no real homepage-to-blog link and no blog sitemap entries.

- [ ] **Step 2: Add real homepage links**

Add a `블로그`/`무주블로그` link with `href="blog/index.html"` to the mobile menu, desktop navigation, and footer. Keep existing panel-opening buttons unchanged. Do not replace the existing reservation CTA.

- [ ] **Step 3: Update the sitemap**

Add these four URLs with `lastmod` `2026-09-22` and retain the existing home and privacy URLs:

```xml
<loc>https://www.nolleowaski.com/blog/</loc>
<loc>https://www.nolleowaski.com/blog/muju-ski-rental.html</loc>
<loc>https://www.nolleowaski.com/blog/muju-lift-ticket.html</loc>
<loc>https://www.nolleowaski.com/blog/muju-ski-price.html</loc>
```

- [ ] **Step 4: Run the full local integration check**

Run:

```powershell
node -e "const fs=require('fs'); const h=fs.readFileSync('index.html','utf8'); const sm=fs.readFileSync('sitemap.xml','utf8'); const urls=['blog/index.html','blog/muju-ski-rental.html','blog/muju-lift-ticket.html','blog/muju-ski-price.html']; if((h.match(/href=\"blog\/index\.html\"/g)||[]).length<3) throw new Error('blog href must exist in mobile, desktop, and footer'); for(const u of urls){if(!fs.existsSync(u)) throw new Error('missing file '+u); const s=fs.readFileSync(u,'utf8'); if(!s.includes('rel=\"canonical\"') || (s.match(/<h1\b/g)||[]).length!==1) throw new Error('metadata failure '+u); } for(const u of ['https://www.nolleowaski.com/blog/','https://www.nolleowaski.com/blog/muju-ski-rental.html','https://www.nolleowaski.com/blog/muju-lift-ticket.html','https://www.nolleowaski.com/blog/muju-ski-price.html']) if(!sm.includes('<loc>'+u+'</loc>')) throw new Error('missing sitemap URL '+u); console.log('Local integration checks PASS')"
```

Extract the existing inline script and run syntax checking with this exact command:

```powershell
$html=Get-Content -Raw 'index.html'; $blocks=[regex]::Matches($html,'(?is)<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>'); $main=$blocks | Where-Object { $_.Groups[1].Value -match 'function|window\.' } | Select-Object -Last 1; [IO.File]::WriteAllText('.artifact-work\index-inline-check.js',$main.Groups[1].Value); node --check '.artifact-work\index-inline-check.js'; if($LASTEXITCODE -ne 0){exit $LASTEXITCODE}
```

The HTML-only navigation edit must not introduce a script syntax change.

- [ ] **Step 5: Verify changed-file scope and update project snapshot**

Run `git diff --check` and `git status --short`. Update `프로젝트_현황.md` only after the local checks pass, adding the four blog URLs under completed SEO/content work and setting the next action to deployment verification and 14-day measurement.

- [ ] **Step 6: Commit and push the verified implementation**

```powershell
git add index.html sitemap.xml blog docs/superpowers/specs/2026-09-22-static-blog-design.md docs/superpowers/plans/2026-09-22-static-blog-plan.md 프로젝트_현황.md
git commit -m "feat: add crawlable blog structure for SEO"
git push origin main
```

After GitHub Pages propagation, request these URLs and require HTTP 200: `/`, `/blog/`, all three article URLs, `/robots.txt`, and `/sitemap.xml`.

## Final Review Checklist

- Homepage has actual blog `<a href>` links in desktop, mobile, and footer locations.
- Blog hub and three articles are indexable static HTML, not JavaScript-only panels.
- Each article has one h1, unique metadata, canonical, visible first answer, and valid JSON-LD.
- Prices are consistent with the current site and carry a 2026/27 basis date.
- Sitemap contains six total public URLs after preserving home and privacy entries.
- No Supabase schema, secrets, admin credentials, or external CMS was introduced.
- Deployment HTTP checks pass before any completion claim.
