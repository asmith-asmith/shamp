'use client'

import Image from 'next/image'
import { useCart, CartItem as CartItemType } from './CartProvider'

interface CartItemProps {
  item: CartItemType
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart()

  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-200">
      <div className="relative w-20 h-20 flex-shrink-0">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover rounded"
          sizes="80px"
        />
      </div>

      <div className="flex-grow">
        <h3 className="font-semibold text-gray-900">{item.name}</h3>
        <p className="text-brand-600 font-medium">
          ${(item.price / 100).toFixed(2)}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => updateQuantity(item.id, item.quantity - 1)}
          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100"
        >
          -
        </button>
        <span className="w-8 text-center">{item.quantity}</span>
        <button
          onClick={() => updateQuantity(item.id, item.quantity + 1)}
          className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100"
        >
          +
        </button>
      </div>

      <div className="text-right">
        <p className="font-semibold">
          ${((item.price * item.quantity) / 100).toFixed(2)}
        </p>
        <button
          onClick={() => removeItem(item.id)}
          className="text-sm text-red-600 hover:text-red-800"
        >
          Remove
        </button>
      </div>
    </div>
  )
}
