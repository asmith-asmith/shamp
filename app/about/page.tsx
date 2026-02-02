import Image from 'next/image'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About Us | Shamp',
  description: 'Learn about our mission to end dandruff and support healthy hair growth.',
}

export default function AboutPage() {
  const values = [
    {
      title: 'Science-Backed',
      description: 'Every ingredient is chosen based on clinical research and dermatologist recommendations.',
    },
    {
      title: 'No Compromises',
      description: 'We never sacrifice effectiveness for gentleness, or vice versa. You deserve both.',
    },
    {
      title: 'Transparent',
      description: 'We tell you exactly what is in our products and why. No mystery ingredients.',
    },
  ]

  return (
    <div className="bg-cream min-h-screen">
      <section className="bg-navy-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-serif mb-6">Our Mission</h1>
          <p className="text-xl text-navy-200">
            We believe no one should have to deal with the embarrassment and discomfort of dandruff.
            That is why we created Shamp.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-serif text-navy-900 mb-6">The Problem</h2>
            <p className="text-navy-700 mb-4">
              Millions of people struggle with dandruff. It is not just annoying flakes - it is the
              constant worry about wearing dark colors, the itchy scalp during important meetings,
              and the endless cycle of products that do not work.
            </p>
            <p className="text-navy-700">
              Most dandruff shampoos either do not work or are so harsh they damage your hair.
              We knew there had to be a better way.
            </p>
          </div>
          <div className="relative aspect-square rounded-lg overflow-hidden">
            <Image
              src="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800"
              alt="Natural ingredients"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 relative aspect-square rounded-lg overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=800"
                alt="Shamp product"
                fill
                className="object-cover"
              />
            </div>
            <div className="order-1 md:order-2">
              <h2 className="text-3xl font-serif text-navy-900 mb-6">Our Solution</h2>
              <p className="text-navy-700 mb-4">
                We partnered with dermatologists to create a formula that actually works.
                Our shampoo combines ketoconazole - the most effective antifungal ingredient
                for dandruff - with biotin and saw palmetto to support healthy hair growth.
              </p>
              <p className="text-navy-700">
                The result? A shampoo that eliminates dandruff at the source while making
                your hair healthier and stronger. No harsh chemicals. No more compromise.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-serif text-navy-900 text-center mb-12">What We Stand For</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {values.map((value, idx) => (
            <div key={idx} className="text-center">
              <h3 className="text-xl font-semibold text-navy-900 mb-2">{value.title}</h3>
              <p className="text-navy-600">{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-navy-900 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-serif text-white mb-4">Ready to End Dandruff?</h2>
          <p className="text-navy-200 mb-8">
            Join thousands of customers who have finally found a solution that works.
          </p>
          <a
            href="/"
            className="inline-block bg-coral-500 hover:bg-coral-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            Shop Now
          </a>
        </div>
      </section>
    </div>
  )
}
