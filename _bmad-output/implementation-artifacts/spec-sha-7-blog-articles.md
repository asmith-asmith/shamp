---
title: 'SHA-7: Blog listing and article pages'
type: 'feature'
created: '2026-10-22'
status: 'done'
baseline_revision: 'f41e2cf0d281178c69aeb58ac4b9d0abf3a947d2'
review_loop_iteration: 0
followup_review_recommended: false
context: []
warnings: [oversized]
deferred:
  - summary: >-
      The blog loader has no repeatable automated tests for draft exclusion, malformed-frontmatter build failures, newest-first ordering, or UTC date formatting.
    evidence: |-
      The repo has no test runner, no test script, and no CI (AGENTS.md: "There are no tests and no CI"). The spec requires verification fixtures to be deleted, so with content/blog/ empty, `npm run lint` and `npm run build` never execute the draft filter, the validators, the sort, or formatPostDate. A regression such as an inverted draft filter would pass both. All of these were verified manually with temporary fixtures in this run. Adding a test harness, permanent fixtures, and an injectable BLOG_DIR is new project infrastructure, outside this story.
    location: >-
      lib/blog.ts
    severity: medium
---

<intent-contract>

## Intent

**Problem:** Shoppers have no way to read articles about Shamp before buying. The site has no blog, and PRD FR-10 calls for Posts that the owner writes as files in the repo, with a title, date, summary, cover image, body, and a draft flag.

**Approach:** Store Posts as Markdown files with YAML frontmatter in `content/blog/`, using the file name as the slug. Read them at build time with a small server-only loader. Render a `/blog` index and statically generated `/blog/[slug]` pages in the navy, coral, and cream palette. Every article ends with a "Shop Shamp" link. Drafts are excluded everywhere, and unknown slugs return 404.

## Boundaries & Constraints

**Always:**
- Frontmatter fields: `title` (string), `date` (`YYYY-MM-DD`), `summary` (string), `cover` (a site path under `public/` such as `/blog/x.jpg`, or an `https://images.unsplash.com/...` URL, which is the only remote host allowed in `next.config.js`), `draft` (optional boolean, default `false`). Only `draft: true` hides a Post.
- A Post file with a missing or wrongly typed required field, or a `date` that does not parse, fails `npm run build` with an error that names the file.
- Drafts are filtered inside the loader, so the index, `generateStaticParams`, and the article page lookup can never see them.
- List published Posts newest first. Show dates as `Month D, YYYY` formatted in UTC so the date does not shift by a day.
- The "Shop Shamp" link is a `next/link` to `/`, the page the header's "Shop" link opens. Style it as a coral CTA (`bg-coral-500 hover:bg-coral-600 text-white`).
- Use only `navy-*`, `coral-*`, and `cream` tokens plus `font-serif` headings, as in `app/about/page.tsx` and `app/not-found.tsx`. Do not use the undefined `brand-*` classes found in `/products`.
- Render covers with `next/image`.
- Set page metadata the same way `app/products/[slug]/page.tsx` does: title `"{title} | Shamp"` and description from `summary`. Use `"Blog | Shamp"` for the index.
- The loader reads the filesystem only, with no Prisma and no Stripe, so `npm run build` still succeeds without env vars.

**Never:**
- Do not write article content. Posts are owner-authored (PRD §4.3), and shampoo claims are restricted by label rules (PRD §7.1). Ship with no Post files. Verification fixtures are temporary and must be deleted before finishing.
- No CMS, admin UI, or database tables for Posts.
- Do not build FR-11 extras (sitemap, canonical URL, OG image), FR-12 affiliate disclosures, email capture, or the Recommendation List.
- Do not change the header or footer navigation, `app/page.tsx`, `prisma/`, or the checkout code.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Published post | `content/blog/a.md`, no `draft` key | Shown on `/blog`. `/blog/a` returns 200 | None |
| Draft post | `content/blog/d.md` with `draft: true` | Not on `/blog`. `/blog/d` returns 404 | `notFound()` |
| Unknown slug | `/blog/does-not-exist` | 404 rendered by `app/not-found.tsx` | `dynamicParams = false` plus a `notFound()` guard |
| No published posts | Directory empty or missing, or only drafts | `/blog` shows the heading and a "No articles yet" message in palette styling | A missing directory counts as empty and does not throw |
| Malformed frontmatter | `title` missing or `date: banana` | Build fails | Thrown error names the file and the field |

</intent-contract>

## Code Map

- `app/products/[slug]/page.tsx` -- pattern for `generateMetadata`, `notFound()`, and a `next/image` `fill` cover inside a relative aspect box.
- `app/not-found.tsx` -- existing 404 page that unknown and draft slugs fall through to. Also the reference for the coral CTA classes.
- `app/about/page.tsx` -- palette reference: a `bg-cream` page, a `bg-navy-900` hero, `font-serif text-navy-900` headings, and `text-navy-600` body text.
- `components/Header.tsx:19-25` -- "Shop" links to `/`, which is why "Shop Shamp" also targets `/`. Read only.
- `next.config.js` -- the only remote image host is `images.unsplash.com`. Read only.
- `tailwind.config.js` -- `content` globs cover `app/**` and `components/**`, so classes in `lib/` are not compiled. Keep all markup in `app/`. The project has no typography plugin.
- `app/globals.css` -- place for scoped article-body styles (`@layer components` `.blog-body h2/p/ul/a/...` using palette tokens via `@apply`).
- `package.json` -- currently has no Markdown or frontmatter parser (`js-yaml` is only a transitive eslint dependency).

## Tasks & Acceptance

**Execution:**
- `package.json` / `package-lock.json` -- `npm install gray-matter marked` -- frontmatter parsing and Markdown-to-HTML for trusted, repo-authored files.
- `lib/blog.ts` -- new server-only loader. Export a `Post` type, `getPublishedPosts()` (validated, drafts removed, sorted newest first), and `getPublishedPost(slug)` (returns `null` for a draft or missing slug, and also returns the rendered body HTML). Validate as described in Boundaries. Treat a missing `content/blog/` directory as empty. -- This is the single place drafts are filtered.
- `content/blog/.gitkeep` -- create the empty Posts directory so the owner has a place for files.
- `app/blog/page.tsx` -- index page. One card per published Post with the cover image, title, formatted date, and summary. Each card links to `/blog/{slug}`. Include the empty state and the `"Blog | Shamp"` metadata.
- `app/blog/[slug]/page.tsx` -- `generateStaticParams` from published Posts, `export const dynamicParams = false`, `generateMetadata`, and `notFound()` when the loader returns `null`. Render the cover, title, date, and body inside `.blog-body`. End with a "Shop Shamp" CTA link to `/` and a back link to `/blog`.
- `app/globals.css` -- add `.blog-body` element styles in palette tokens.

**Acceptance Criteria:**
- Given published Posts `a.md` (date 2026-01-02) and `b.md` (date 2026-03-04) and draft `d.md`, when a shopper opens `/blog`, then exactly two cards appear in the order b, a, and each shows its cover image, title, summary, and a date such as "March 4, 2026".
- Given that listing, when the shopper selects the card for `a`, then the browser navigates to `/blog/a` and the page shows a's title, date, cover, and rendered Markdown body.
- Given draft `d.md`, when a shopper requests `/blog/d`, then the response is HTTP 404 with the site's 404 page, and the text of `d` appears nowhere on `/blog`.
- Given no Post with slug `nope`, when a shopper requests `/blog/nope`, then the response is HTTP 404.
- Given any published article page, when it renders, then it contains a link with the visible text "Shop Shamp" whose `href` is `/`.
- Given `/blog` and `/blog/[slug]`, when they are inspected, then backgrounds, text, and CTA colors use only `cream`, `navy-*`, and `coral-*` classes.

## Design Notes

The Markdown body is rendered with `marked` and inserted with `dangerouslySetInnerHTML`. That is acceptable because only the repo owner writes Posts, and they arrive through commits rather than user input. Using `dynamicParams = false` makes 404 for unknown slugs and drafts a build-time guarantee. The `notFound()` guard stays as a second layer of protection.

## Verification

**Commands:**
- `npm run lint` -- expected: no errors.
- `npm run build` -- expected: success with no env vars set. The `/blog` route and `/blog/[slug]` are listed as static or SSG.
- With temporary fixtures `content/blog/{a,b,d}.md` (unsplash covers, `d` with `draft: true`): `npm run build && npm start`, then `curl -s -o /dev/null -w '%{http_code}' localhost:3000/blog/a` → `200`, `/blog/d` → `404`, `/blog/nope` → `404`. `curl -s localhost:3000/blog` contains b's title before a's title, does not contain d's title, and the a page contains `Shop Shamp` and `href="/"`.
- Delete the fixtures, then run `npm run build` again -- expected: success, and `/blog` shows the empty state.

## Review Triage Log

### 2026-10-22 — Review pass
- verdicts: 40 findings — high 0, medium 7, low 29, false 4, maybe-false 0
- findings:
  - `low` `reject` (blind) marked@18 needs Node >= 20 and package.json declares no `engines` — Node 18 has been EOL since April 2025 and the local and runner Node is v25. Adding an engines policy is a project-wide decision, not a direct correction.
  - `low` `patch` (blind) Local cover paths are not checked against files in public/ — the loader now fails the build, naming the file and `cover`, when `public/<cover>` does not exist.
  - `low` `reject` (blind) Filename slugs are not validated (spaces, unicode, empty) — the owner controls the filenames. The fix adds a new validation rule and branch.
  - `low` `reject` (blind) Non-`.md` extensions are skipped silently — the spec defines Posts as `.md` files. The fix adds a branch for an unlikely case.
  - `low` `reject` (blind) Every lookup re-reads all Posts (quadratic build cost) — negligible for a handful of owner-authored Posts. Memoizing adds complexity.
  - `low` `reject` (blind) No `import 'server-only'` guard — only server components import the loader. The fix adds a dependency.
  - `low` `patch` (blind) Cover alt text duplicates the adjacent heading — both cover images now use `alt=""`.
  - `medium` `patch` (blind) Unquoted YAML timestamps are looser than YYYY-MM-DD and get truncated or shifted — grouped with the edge-case date findings below. parseDate now validates the raw `date:` text.
  - `low` `reject` (blind) Required strings are not trimmed — YAML already strips unquoted values, so only padded quoted strings are affected. That is rare.
  - `low` `patch` (blind) `.blog-body` has no h1 or table styles — added a `.blog-body h1` rule and table/th/td rules in navy tokens.
  - `low` `reject` (blind) The spec's Auto Run Result is stale — the fix edits this build's spec, and Finalize rewrites that section anyway.
  - `low` `reject` (blind) Unrelated lockfile churn (`peer`/`dev` flags) — this is the local npm's serialization and has no functional effect. Regenerating with another npm version is not a direct fix.
  - `low` `reject` (blind) Nothing links to /blog — the intent forbids changing header and footer navigation.
  - `medium` `patch` (edge) An unquoted `date: 2026-02-30` rolls over to 2026-03-02 with no error — js-yaml returns a normalized Date (reproduced). parseDate now validates the raw frontmatter text, and the build fails naming `date`.
  - `medium` `patch` (edge) An unquoted timestamp with an offset shifts to the next UTC day — reproduced (2026-01-02T23:00:00-05:00 became 2026-01-03). The same raw-text check now rejects it.
  - `low` `reject` (edge) Filename slug validation — same as the blind finding: owner-controlled, and the fix adds a rule.
  - `low` `reject` (edge) A directory named `*.md` causes a raw EISDIR — unlikely, and the build still fails loudly.
  - `low` `reject` (edge) Uppercase or alternative extensions are skipped — same as the blind finding.
  - `low` `patch` (edge) A site-path cover pointing to a missing file gives a broken image — fixed by the public/ existence check.
  - `low` `patch` (edge) A `/\host` cover could be read as protocol-relative — the public/ existence check now rejects it, because no such file exists.
  - `low` `reject` (edge) Untrimmed title or summary — same as the blind finding.
  - `low` `patch` (edge) A body h1 or table renders unstyled — fixed with the `.blog-body` h1 and table rules.
  - `low` `reject` (edge) marked requires Node 20 — same as the blind finding.
  - `low` `patch` (edge) The index card's `bg-white` breaks the palette-only AC — replaced with `bg-navy-50`. `text-white` stays because the spec mandates it for the CTA and it matches the about page hero.
  - `medium` `defer` (verification-gap) Draft exclusion has no repeatable check — the repo has no test harness, so this is pre-existing. Verified manually: /blog/d returned 404 and the draft's text was absent from /blog. Deferred.
  - `medium` `defer` (verification-gap) The malformed-frontmatter build failure has no repeatable check — same root cause. Verified manually for banana, missing title, 2026-02-30, an offset timestamp, and a missing cover. Deferred.
  - `medium` `defer` (verification-gap) Newest-first order and UTC date formatting are unpinned — same root cause. Verified manually: b came before a, and "March 4, 2026" rendered. Deferred.
  - `false` `reject` (intent) A non-boolean `draft` fails the build — the spec types `draft` as an optional boolean and requires wrongly typed fields to fail.
  - `false` `reject` (intent) A malformed draft fails the build — the spec says any Post file with bad frontmatter fails the build, and drafts are Post files.
  - `medium` `patch` (intent) YAML timestamps are accepted and truncated — same group as the date findings. Fixed by raw-text validation.
  - `low` `patch` (intent) The cover is not checked to exist under public/ — fixed by the existence check.
  - `false` `reject` (intent) A YAML parse error names the file but not the field — a YAML syntax error has no field to name, and the error names the file.
  - `low` `reject` (intent) `.markdown`/`.mdx` files are ignored — same as the blind finding.
  - `low` `reject` (intent) Body HTML is passed through raw and body images skip next/image — the Design Notes accept trusted raw HTML, and next/image is required only for covers.
  - `low` `patch` (intent) `bg-white` goes beyond the palette list — fixed with `bg-navy-50`.
  - `low` `patch` (intent) The index meta description invents site copy — removed. The index now sets only `title: 'Blog | Shamp'`.
  - `low` `reject` (intent) "Server-only" is a convention only — same as the blind finding.
  - `low` `reject` (intent) Lockfile churn and no engines field — same as the blind findings.
  - `low` `reject` (intent) /blog has no inbound link — the intent forbids navigation changes.
  - `false` `reject` (intent) Nothing shows the verification ran — it ran in this run (see Auto Run Result). The fixtures were deleted as the spec requires.
- Verification note: while re-verifying the patches, the raw-text date check rejected valid unquoted dates during `next build`. On a cache hit, gray-matter returns an `Object.assign` copy, which drops the non-enumerable `matter` property. Fixed by calling `matter(raw, {})` to bypass the cache, then re-verified.

## Auto Run Result

Status: done
Blocking condition: none.

**Summary.** Implemented the `/blog` index and statically generated `/blog/[slug]` article pages. They are backed by a filesystem-only Markdown loader for `content/blog/*.md`. Drafts are filtered in the loader, unknown slugs and drafts return 404 (`dynamicParams = false` plus `notFound()`), every article ends with a coral "Shop Shamp" link to `/`, and the pages use the navy, coral, and cream palette. No Post files ship.

**Files changed**
- `package.json` / `package-lock.json`: added `gray-matter` and `marked`.
- `lib/blog.ts`: new server-side loader. It validates frontmatter (errors name the file and field), checks dates from the raw text, checks that local covers exist under `public/`, filters drafts, sorts newest first, and has a UTC `formatPostDate`.
- `content/blog/.gitkeep`: empty Posts directory.
- `app/blog/page.tsx`: index cards (cover, title, date, summary), an empty state, and the `Blog | Shamp` title.
- `app/blog/[slug]/page.tsx`: article page with static params, metadata, a 404 guard, the Markdown body, back links, and the Shop Shamp CTA.
- `app/globals.css`: `.blog-body` article styles using palette tokens only.

**Review findings breakdown.** Of 40 findings, 6 patch entries were applied: raw-text date validation (medium), the public/ cover existence check (low), `alt=""` on covers (low), h1 and table body styles (low), `bg-white` replaced with `bg-navy-50` (low), and removal of the invented index description (low). One group was deferred: there are no repeatable automated tests (medium, 3 findings). The remaining 19 low findings and 4 false findings were rejected; the Review Triage Log above records each reason.

**Follow-up review recommendation:** `false`. Patched entries by verdict: high 0, medium 1, low 5. One medium patched entry is below the threshold.

**Verification performed**
- `npm run lint`: no errors.
- `npm run build` with no env files present: success. `/blog` is static (○) and `/blog/[slug]` is SSG (●).
- Fixtures a (unquoted 2026-01-02), b (quoted 2026-03-04), and draft d, with `next start` on port 3917:
  - `/blog/a` and `/blog/b` returned 200. `/blog/d` and `/blog/nope` returned 404.
  - `/blog` listed b before a with "March 4, 2026" and "January 2, 2026", contained no draft text, and contained no `bg-white`.
  - The a page had `<title>Alpha Title Zq | Shamp</title>`, rendered `<h1>`/`<h2>`, and a Shop Shamp link with `href="/"`.
- These malformed inputs each failed the build (exit 1) with an error naming `content/blog/bad.md` and the field: `date: banana`, missing `title`, `date: 2026-02-30`, `date: 2026-01-02T23:00:00-05:00`, and `cover: /blog/missing.jpg`.
- Drafts only, a missing `content/blog/`, and an empty directory each built successfully and showed "No articles yet".
- All fixtures were deleted. `content/blog/` contains only `.gitkeep`.

**Residual risks**
- No automated regression tests (deferred).
- An unquoted date followed by an inline YAML comment (`date: 2026-01-02 # note`) is now rejected. Quoting the date avoids this.
- Body HTML from Markdown is trusted, which is acceptable only while Posts come from repo commits.
- `marked@18` requires Node 20 or newer.
- `/blog` has no navigation link, by design.
