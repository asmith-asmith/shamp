'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/components/CartProvider'
import {
  getFreeShippingMessage,
  getFreeShippingProgress,
  getShippingCost,
} from '@/lib/shipping'

export default function CartPage() {
  const { items, totalPrice, updateQuantity, removeItem } = useCart()

  if (items.length === 0) {
    return (
      <div className="bg-cream min-h-screen">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="text-3xl font-serif text-navy-900 mb-4">Your Cart is Empty</h1>
          <p className="text-navy-600 mb-8">
            Looks like you have not added anything yet.
          </p>
          <Link
            href="/"
            className="inline-block bg-coral-500 hover:bg-coral-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Shop Now
          </Link>
        </div>
      </div>
    )
  }

  const shippingCost = getShippingCost(totalPrice)
  const total = totalPrice + shippingCost
  const progressPct = Math.floor(getFreeShippingProgress(totalPrice) * 100)

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-serif text-navy-900 mb-8">Your Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg p-4 flex gap-4"
              >
                <div className="relative w-24 h-24 rounded overflow-hidden flex-shrink-0">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-navy-900">{item.name}</h3>
                  <p className="text-coral-500 font-medium">
                    ${(item.price / 100).toFixed(2)}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                    >
                      -
                    </button>
                    <span className="text-navy-900 font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="ml-auto text-sm text-red-600 hover:text-red-800 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 sticky top-4">
              <h2 className="text-xl font-semibold text-navy-900 mb-4">Order Summary</h2>
              <div className="mb-4 space-y-2">
                <p className="text-sm text-navy-700" aria-live="polite">{getFreeShippingMessage(totalPrice)}</p>
                <div
                  role="progressbar"
                  aria-label="Progress toward free shipping"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progressPct}
                  aria-valuetext={getFreeShippingMessage(totalPrice)}
                  className="h-2 bg-navy-100 rounded-full overflow-hidden"
                >
                  <div
                    className="h-full bg-coral-500 transition-all motion-reduce:transition-none"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
              <div className="space-y-3 text-navy-700">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${(totalPrice / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>{shippingCost === 0 ? 'Free' : `$${(shippingCost / 100).toFixed(2)}`}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between font-semibold text-navy-900">
                  <span>Total</span>
                  <span>${(total / 100).toFixed(2)}</span>
                </div>
              </div>
              <Link
                href="/checkout"
                className="block w-full bg-coral-500 hover:bg-coral-600 text-white text-center py-3 rounded-lg font-semibold mt-6 transition-colors"
              >
                Checkout
              </Link>
              <Link
                href="/"
                className="block w-full text-center text-navy-600 hover:text-navy-800 mt-4 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
