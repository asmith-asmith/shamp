import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { marked } from 'marked'

// Server-only loader for owner-authored Posts in content/blog/*.md.
// Reads the filesystem only (no Prisma, no Stripe) so builds work without env vars.
// This is the single place drafts are filtered out.

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog')

export type Post = {
  slug: string
  title: string
  /** ISO date string `YYYY-MM-DD` (UTC). */
  date: string
  summary: string
  cover: string
}

export type PostWithBody = Post & { html: string }

type ParsedPost = Post & { draft: boolean; body: string }

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/

function fail(file: string, message: string): never {
  throw new Error(`Invalid blog post content/blog/${file}: ${message}`)
}

function requireString(file: string, data: Record<string, unknown>, field: string): string {
  const value = data[field]
  if (typeof value !== 'string' || value.trim() === '') {
    fail(file, `field "${field}" is required and must be a non-empty string`)
  }
  return value
}

function parseDate(file: string, value: unknown, frontmatter: string): string {
  // YAML turns an unquoted date into a Date that silently rolls over invalid days
  // and shifts timezones, so validate the raw `date:` text instead.
  if (value instanceof Date) {
    value = /^date:\s*(.*?)\s*$/m.exec(frontmatter)?.[1]
  }
  if (typeof value === 'string') {
    const m = DATE_RE.exec(value.trim())
    if (m) {
      const [, y, mo, d] = m
      const parsed = new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d)))
      if (
        parsed.getUTCFullYear() === Number(y) &&
        parsed.getUTCMonth() === Number(mo) - 1 &&
        parsed.getUTCDate() === Number(d)
      ) {
        return value.trim()
      }
    }
  }
  fail(file, 'field "date" is required and must be a valid YYYY-MM-DD date')
}

function parseCover(file: string, data: Record<string, unknown>): string {
  const cover = requireString(file, data, 'cover')
  if (cover.startsWith('/') && !cover.startsWith('//')) {
    if (!fs.existsSync(path.join(process.cwd(), 'public', cover))) {
      fail(file, `field "cover" points to public${cover}, which does not exist`)
    }
    return cover
  }
  if (cover.startsWith('https://images.unsplash.com/')) return cover
  fail(
    file,
    'field "cover" must be a site path under public/ (e.g. /blog/x.jpg) or an https://images.unsplash.com/ URL',
  )
}

function parseDraft(file: string, value: unknown): boolean {
  if (value === undefined || value === null) return false
  if (typeof value !== 'boolean') fail(file, 'field "draft" must be a boolean if present')
  return value
}

function readPostFiles(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return []
  return fs
    .readdirSync(BLOG_DIR)
    .filter((name) => name.endsWith('.md'))
}

function parsePostFile(file: string): ParsedPost {
  const raw = fs.readFileSync(path.join(BLOG_DIR, file), 'utf8')
  let parsed: matter.GrayMatterFile<string>
  try {
    // Passing options bypasses gray-matter's cache, whose hits drop the raw `matter` text.
    parsed = matter(raw, {})
  } catch (err) {
    fail(file, `frontmatter could not be parsed (${(err as Error).message})`)
  }
  const data = parsed.data as Record<string, unknown>

  return {
    slug: file.replace(/\.md$/, ''),
    title: requireString(file, data, 'title'),
    date: parseDate(file, data.date, parsed.matter),
    summary: requireString(file, data, 'summary'),
    cover: parseCover(file, data),
    draft: parseDraft(file, data.draft),
    body: parsed.content,
  }
}

function loadPublished(): ParsedPost[] {
  return readPostFiles()
    .map(parsePostFile)
    .filter((post) => !post.draft)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug.localeCompare(b.slug)))
}

/** Published Posts (drafts removed), validated, newest first. */
export function getPublishedPosts(): Post[] {
  return loadPublished().map(({ slug, title, date, summary, cover }) => ({
    slug,
    title,
    date,
    summary,
    cover,
  }))
}

/** A published Post with rendered body HTML, or null for a draft or unknown slug. */
export function getPublishedPost(slug: string): PostWithBody | null {
  const post = loadPublished().find((p) => p.slug === slug)
  if (!post) return null
  const { slug: s, title, date, summary, cover, body } = post
  return { slug: s, title, date, summary, cover, html: marked.parse(body, { async: false }) }
}

/** Formats a `YYYY-MM-DD` date as `Month D, YYYY` in UTC. */
export function formatPostDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
