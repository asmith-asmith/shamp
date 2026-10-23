import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { formatPostDate, getPublishedPosts } from '@/lib/blog'

export const metadata: Metadata = {
  title: 'Blog | Shamp',
}

export default function BlogIndexPage() {
  const posts = getPublishedPosts()

  return (
    <div className="bg-cream min-h-screen">
      <section className="bg-navy-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-serif">Blog</h1>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {posts.length === 0 ? (
          <p className="text-center text-navy-600 text-lg">No articles yet. Check back soon.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group block bg-navy-50 rounded-lg overflow-hidden border border-navy-100 hover:border-navy-300 transition-colors"
              >
                <div className="relative aspect-[16/9]">
                  <Image
                    src={post.cover}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <div className="p-6">
                  <time dateTime={post.date} className="text-sm text-navy-500">
                    {formatPostDate(post.date)}
                  </time>
                  <h2 className="mt-2 text-2xl font-serif text-navy-900 group-hover:text-navy-700">
                    {post.title}
                  </h2>
                  <p className="mt-3 text-navy-600">{post.summary}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
