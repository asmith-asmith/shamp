---
title: 'SHA-7: Blog listing and article pages'
type: 'feature'
created: '2026-10-22'
status: 'ready-for-dev'
review_loop_iteration: 0
followup_review_recommended: false
context: []
warnings: [oversized]
deferred: []
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

## Auto Run Result

Status: ready-for-dev
Blocking condition: none. Halted after planning as the invocation directed.
