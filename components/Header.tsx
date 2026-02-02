'use client'

import Link from 'next/link'
import { useCart } from './CartProvider'

export default function Header() {
  const { totalItems } = useCart()

  return (
    <>
      {/* Announcement Banner */}
      <div className="bg-navy-900 text-white text-center py-2 px-4">
        <p className="text-sm font-medium tracking-wide">
          END DANDRUFF IN 2026: GET 20% OFF + FREE SHIPPING
        </p>
      </div>

      {/* Main Header */}
      <header className="bg-cream border-b border-gray-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left Nav */}
            <div className="flex items-center space-x-8">
              <Link
                href="/"
                className="text-navy-900 hover:text-navy-600 transition-colors font-medium"
              >
                Shop
              </Link>
              <Link
                href="/about"
                className="text-navy-900 hover:text-navy-600 transition-colors font-medium"
              >
                About
              </Link>
              <Link
                href="/faq"
                className="text-navy-900 hover:text-navy-600 transition-colors font-medium"
              >
                FAQs
              </Link>
            </div>

            {/* Center Logo */}
            <div className="absolute left-1/2 transform -translate-x-1/2">
              <Link href="/" className="text-3xl font-serif font-bold text-navy-900 tracking-tight">
                Shamp
              </Link>
            </div>

            {/* Right Nav */}
            <div className="flex items-center space-x-6">
              <Link
                href="/cart"
                className="flex items-center space-x-2 text-navy-900 hover:text-navy-600 transition-colors"
              >
                <span className="font-medium">Cart</span>
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-navy-900 text-white text-sm font-medium">
                  {totalItems}
                </span>
              </Link>
            </div>
          </div>
        </nav>
      </header>
    </>
  )
}
