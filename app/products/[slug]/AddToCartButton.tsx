'use client'

import { useState } from 'react'
import { useCart } from '@/components/CartProvider'

interface AddToCartButtonProps {
  product: {
    id: string
    name: string
    slug: string
    price: number
    image: string
  }
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addItem } = useCart()
  const [added, setAdded] = useState(false)

  const handleClick = () => {
    addItem(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <button
      onClick={handleClick}
      className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
        added
          ? 'bg-green-600 text-white'
          : 'bg-brand-600 text-white hover:bg-brand-700'
      }`}
    >
      {added ? 'Added to Cart!' : 'Add to Cart'}
    </button>
  )
}
