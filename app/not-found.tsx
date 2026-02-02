import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h1 className="text-6xl font-serif text-navy-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-navy-700 mb-4">Page Not Found</h2>
        <p className="text-navy-600 mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block bg-coral-500 hover:bg-coral-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}
