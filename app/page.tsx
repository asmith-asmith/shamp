'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useCart } from '@/components/CartProvider'

const productImages = [
  'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=800',
  'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800',
  'https://images.unsplash.com/photo-1556227702-d1e4e7b5c232?w=800',
]

const product = {
  id: 'shamp-ketoconazole',
  name: 'Shamp Anti-Dandruff Shampoo',
  slug: 'anti-dandruff-shampoo',
  description: 'Our clinically-proven ketoconazole shampoo eliminates dandruff at the source while supporting healthy hair growth. Formulated with 1% ketoconazole, biotin, and saw palmetto to fight flakes and strengthen hair follicles.',
  price: 3900,
  originalPrice: 4900,
  image: 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=800',
}

const conditioner = {
  id: 'shamp-flower-conditioner',
  name: 'Shamp Flower Conditioner',
  slug: 'flower-conditioner',
  description: 'A lightweight floral conditioner that leaves hair feeling soft, smooth, and easy to comb. Infused with rose and chamomile extracts for a fresh, delicate scent.',
  price: 2500,
  subscriptionPrice: 2000,
  image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=800',
  size: '12 oz',
}

type TabType = 'description' | 'how-to-use' | 'ingredients'

export default function HomePage() {
  const { addItem } = useCart()
  const [selectedImage, setSelectedImage] = useState(0)
  const [purchaseType, setPurchaseType] = useState<'subscribe' | 'onetime'>('subscribe')
  const [activeTab, setActiveTab] = useState<TabType>('description')
  const [added, setAdded] = useState(false)

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: purchaseType === 'subscribe' ? product.price : product.originalPrice,
      image: product.image,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const [conditionerPurchaseType, setConditionerPurchaseType] = useState<'subscribe' | 'onetime'>('subscribe')
  const [conditionerAdded, setConditionerAdded] = useState(false)

  const handleAddConditionerToCart = () => {
    addItem({
      id: conditioner.id,
      name: conditioner.name,
      slug: conditioner.slug,
      price: conditionerPurchaseType === 'subscribe' ? conditioner.subscriptionPrice : conditioner.price,
      image: conditioner.image,
    })
    setConditionerAdded(true)
    setTimeout(() => setConditionerAdded(false), 2000)
  }

  return (
    <div className="bg-cream min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left - Product Images */}
          <div className="flex gap-4">
            {/* Thumbnails */}
            <div className="flex flex-col gap-3">
              {productImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-16 h-16 rounded-full overflow-hidden border-2 transition-all ${
                    selectedImage === idx ? 'border-navy-900' : 'border-transparent'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`Product view ${idx + 1}`}
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                </button>
              ))}
            </div>

            {/* Main Image */}
            <div className="flex-1 relative aspect-square rounded-lg overflow-hidden bg-navy-800">
              <Image
                src={productImages[selectedImage]}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Right - Product Info */}
          <div>
            <h1 className="font-serif text-4xl md:text-5xl text-navy-900 mb-2">
              Anti-Dandruff<br />Shampoo
            </h1>
            <p className="text-navy-600 text-lg mb-3">
              Ketoconazole + Biotin Formula
            </p>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-5 h-5 ${star <= 4 ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-navy-600">(1,247)</span>
            </div>

            {/* Purchase Options */}
            <div className="space-y-3 mb-6">
              {/* Subscribe Option */}
              <label
                className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  purchaseType === 'subscribe'
                    ? 'border-navy-900 bg-navy-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="purchaseType"
                    checked={purchaseType === 'subscribe'}
                    onChange={() => setPurchaseType('subscribe')}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-semibold text-navy-900">Subscribe & Save 20%</span>
                        <span className="ml-2 text-xs bg-coral-500 text-white px-2 py-0.5 rounded">Most Popular</span>
                      </div>
                      <div className="text-right">
                        <span className="line-through text-gray-400 mr-2">${(product.originalPrice / 100).toFixed(0)}</span>
                        <span className="font-bold text-navy-900">${(product.price / 100).toFixed(0)}</span>
                      </div>
                    </div>
                    <ul className="mt-2 text-sm text-navy-600 space-y-1">
                      <li>• Free shipping on every order</li>
                      <li>• Ships every 60 days</li>
                      <li>• Skip, modify, or cancel anytime</li>
                    </ul>
                  </div>
                </div>
              </label>

              {/* One-time Option */}
              <label
                className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  purchaseType === 'onetime'
                    ? 'border-navy-900 bg-navy-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="purchaseType"
                    checked={purchaseType === 'onetime'}
                    onChange={() => setPurchaseType('onetime')}
                  />
                  <div className="flex-1 flex justify-between items-center">
                    <span className="font-semibold text-navy-900">One-time purchase</span>
                    <span className="font-bold text-navy-900">${(product.originalPrice / 100).toFixed(0)}</span>
                  </div>
                </div>
              </label>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className={`w-full py-4 rounded-lg font-semibold text-lg transition-colors ${
                added
                  ? 'bg-green-600 text-white'
                  : 'bg-coral-500 hover:bg-coral-600 text-white'
              }`}
            >
              {added ? 'Added to Cart!' : 'Add to Cart'}
            </button>

            {/* Tabs */}
            <div className="mt-10 border-t border-gray-200 pt-8">
              <div className="flex gap-8 border-b border-gray-200">
                {[
                  { id: 'description' as TabType, label: 'Description' },
                  { id: 'how-to-use' as TabType, label: 'How to Use' },
                  { id: 'ingredients' as TabType, label: 'Key Ingredients' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-3 font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'text-navy-900 border-b-2 border-navy-900'
                        : 'text-gray-500 hover:text-navy-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="py-6 text-navy-700">
                {activeTab === 'description' && (
                  <div className="space-y-4">
                    <p>
                      Say goodbye to embarrassing flakes and hello to healthier, fuller hair. Our
                      dermatologist-recommended formula combines clinical-strength ketoconazole with
                      hair-supporting nutrients for a complete scalp solution.
                    </p>
                    <p>
                      Unlike harsh dandruff shampoos that strip your hair, Shamp is gentle enough for
                      daily use while being tough on the fungus that causes dandruff, seborrheic
                      dermatitis, and scalp irritation.
                    </p>
                  </div>
                )}
                {activeTab === 'how-to-use' && (
                  <div className="space-y-4">
                    <p><strong>For best results:</strong></p>
                    <ol className="list-decimal list-inside space-y-2">
                      <li>Wet hair thoroughly with warm water</li>
                      <li>Apply a generous amount to scalp and hair</li>
                      <li>Massage into scalp for 2-3 minutes</li>
                      <li>Leave on for 3-5 minutes for maximum effectiveness</li>
                      <li>Rinse thoroughly and repeat if needed</li>
                    </ol>
                    <p className="text-sm text-navy-500 mt-4">
                      Use 2-3 times per week for treatment, then once weekly for maintenance.
                    </p>
                  </div>
                )}
                {activeTab === 'ingredients' && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold">Ketoconazole (1%)</h4>
                      <p className="text-sm">Clinically proven antifungal that eliminates the root cause of dandruff</p>
                    </div>
                    <div>
                      <h4 className="font-semibold">Biotin</h4>
                      <p className="text-sm">Strengthens hair follicles and supports healthy hair growth</p>
                    </div>
                    <div>
                      <h4 className="font-semibold">Saw Palmetto Extract</h4>
                      <p className="text-sm">Natural DHT blocker that helps prevent hair thinning</p>
                    </div>
                    <div>
                      <h4 className="font-semibold">Tea Tree Oil</h4>
                      <p className="text-sm">Soothes scalp irritation and provides antimicrobial benefits</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Flower Conditioner Section */}
        <section className="mt-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-square rounded-lg overflow-hidden bg-navy-800">
            <Image
              src={conditioner.image}
              alt={conditioner.name}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>

          <div>
            <h2 className="font-serif text-4xl md:text-5xl text-navy-900 mb-2">
              Flower<br />Conditioner
            </h2>
            <p className="text-navy-600 text-lg mb-4">{conditioner.size}</p>
            <p className="text-navy-700 mb-6">{conditioner.description}</p>

            {/* Purchase Options */}
            <div className="space-y-3 mb-6">
              {/* Subscribe Option */}
              <label
                className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  conditionerPurchaseType === 'subscribe'
                    ? 'border-navy-900 bg-navy-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="conditionerPurchaseType"
                    checked={conditionerPurchaseType === 'subscribe'}
                    onChange={() => setConditionerPurchaseType('subscribe')}
                  />
                  <div className="flex-1 flex justify-between items-center">
                    <span className="font-semibold text-navy-900">Subscribe</span>
                    <div className="text-right">
                      <span className="line-through text-gray-400 mr-2">${(conditioner.price / 100).toFixed(0)}</span>
                      <span className="font-bold text-navy-900">
                        ${(conditioner.subscriptionPrice / 100).toFixed(0)}/month
                      </span>
                    </div>
                  </div>
                </div>
              </label>

              {/* One-time Option */}
              <label
                className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  conditionerPurchaseType === 'onetime'
                    ? 'border-navy-900 bg-navy-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="conditionerPurchaseType"
                    checked={conditionerPurchaseType === 'onetime'}
                    onChange={() => setConditionerPurchaseType('onetime')}
                  />
                  <div className="flex-1 flex justify-between items-center">
                    <span className="font-semibold text-navy-900">One-time purchase</span>
                    <span className="font-bold text-navy-900">${(conditioner.price / 100).toFixed(0)}</span>
                  </div>
                </div>
              </label>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddConditionerToCart}
              className={`w-full py-4 rounded-lg font-semibold text-lg transition-colors ${
                conditionerAdded
                  ? 'bg-green-600 text-white'
                  : 'bg-coral-500 hover:bg-coral-600 text-white'
              }`}
            >
              {conditionerAdded ? 'Added to Cart!' : 'Add to Cart'}
            </button>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="mt-20 py-16 bg-navy-900 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 rounded-lg">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-serif text-white text-center mb-12">
              Why Shamp Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Clinically Proven',
                  description: 'Ketoconazole is the #1 dermatologist-recommended ingredient for treating dandruff',
                },
                {
                  title: 'Supports Hair Growth',
                  description: 'Biotin and saw palmetto nourish follicles and help prevent thinning',
                },
                {
                  title: 'Gentle Formula',
                  description: 'Safe for daily use, color-treated hair, and sensitive scalps',
                },
              ].map((benefit, idx) => (
                <div key={idx} className="text-center">
                  <h3 className="text-xl font-semibold text-white mb-2">{benefit.title}</h3>
                  <p className="text-navy-200">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="mt-20 py-16">
          <h2 className="text-3xl font-serif text-navy-900 text-center mb-12">
            Real Results
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "After years of trying everything, Shamp finally got rid of my dandruff. My scalp feels amazing.",
                author: "Michael R.",
                rating: 5,
              },
              {
                quote: "Not only did it clear my flakes, but my hair actually feels thicker. Highly recommend!",
                author: "Sarah T.",
                rating: 5,
              },
              {
                quote: "The subscription is so convenient. No more running out, and the price is unbeatable.",
                author: "James K.",
                rating: 5,
              },
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className="w-4 h-4 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-navy-700 mb-4">&ldquo;{testimonial.quote}&rdquo;</p>
                <p className="text-sm font-semibold text-navy-900">{testimonial.author}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
