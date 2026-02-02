'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCart } from './CartProvider'

interface ProductCardProps {
  id: string
  name: string
  slug: string
  price: number
  image: string
  category: string
}

export default function ProductCard({
  id,
  name,
  slug,
  price,
  image,
  category,
}: ProductCardProps) {
  const { addItem } = useCart()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    addItem({ id, name, slug, price, image })
  }

  return (
    <Link href={`/products/${slug}`} className="group">
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
        <div className="relative aspect-square">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute top-2 left-2">
            <span className="bg-brand-600 text-white text-xs px-2 py-1 rounded">
              {category}
            </span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
            {name}
          </h3>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-lg font-bold text-brand-600">
              ${(price / 100).toFixed(2)}
            </span>
            <button
              onClick={handleAddToCart}
              className="bg-brand-600 text-white px-3 py-1 rounded text-sm hover:bg-brand-700 transition-colors"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}
