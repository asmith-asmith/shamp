'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useCart } from '@/components/CartProvider'

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const { clearCart } = useCart()

  useEffect(() => {
    clearCart()
  }, [clearCart])

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-serif text-navy-900 mb-4">
            Thank You for Your Order!
          </h1>
          <p className="text-navy-600 mb-2">
            Your payment was successful and your order is being processed.
          </p>
          {sessionId && (
            <p className="text-sm text-navy-400">
              Order reference: {sessionId.slice(0, 20)}...
            </p>
          )}
        </div>

        <div className="bg-white rounded-lg p-6 mb-8 text-left">
          <h2 className="font-semibold text-navy-900 mb-4">What happens next?</h2>
          <ul className="text-navy-600 space-y-3">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-navy-100 rounded-full flex items-center justify-center text-sm font-medium text-navy-600">1</span>
              <span>You will receive a confirmation email shortly</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-navy-100 rounded-full flex items-center justify-center text-sm font-medium text-navy-600">2</span>
              <span>We will prepare your order for shipment</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-navy-100 rounded-full flex items-center justify-center text-sm font-medium text-navy-600">3</span>
              <span>You will receive tracking info once it ships</span>
            </li>
          </ul>
        </div>

        <Link
          href="/"
          className="inline-block bg-coral-500 hover:bg-coral-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}
