import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { formatPostDate, getPublishedPost, getPublishedPosts } from '@/lib/blog'

export const dynamicParams = false

interface BlogPostPageProps {
  params: { slug: string }
}

export function generateStaticParams() {
  return getPublishedPosts().map((post) => ({ slug: post.slug }))
}

export function generateMetadata({ params }: BlogPostPageProps): Metadata {
  const post = getPublishedPost(params.slug)

  if (!post) {
    return { title: 'Article Not Found' }
  }

  return {
    title: `${post.title} | Shamp`,
    description: post.summary,
  }
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = getPublishedPost(params.slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="bg-cream min-h-screen">
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href="/blog" className="text-navy-600 hover:text-navy-900 transition-colors">
          &larr; Back to blog
        </Link>

        <header className="mt-6 mb-8">
          <h1 className="text-4xl md:text-5xl font-serif text-navy-900">{post.title}</h1>
          <time dateTime={post.date} className="block mt-3 text-navy-500">
            {formatPostDate(post.date)}
          </time>
        </header>

        <div className="relative aspect-[16/9] rounded-lg overflow-hidden mb-10">
          <Image
            src={post.cover}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
            priority
          />
        </div>

        {/* Body is trusted, repo-authored Markdown rendered at build time. */}
        <div className="blog-body" dangerouslySetInnerHTML={{ __html: post.html }} />

        <div className="mt-12 pt-8 border-t border-navy-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/blog" className="text-navy-600 hover:text-navy-900 transition-colors">
            &larr; Back to blog
          </Link>
          <Link
            href="/"
            className="inline-block bg-coral-500 hover:bg-coral-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Shop Shamp
          </Link>
        </div>
      </article>
    </div>
  )
}
