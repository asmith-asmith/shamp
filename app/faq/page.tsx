'use client'

import { useState } from 'react'

const faqs = [
  {
    question: 'What makes Shamp different from other dandruff shampoos?',
    answer: 'Shamp combines clinical-strength ketoconazole with hair-supporting ingredients like biotin and saw palmetto. Most dandruff shampoos only treat the symptoms — we treat the root cause while also supporting healthier, stronger hair growth.',
  },
  {
    question: 'How often should I use Shamp?',
    answer: 'For best results, use Shamp 2-3 times per week during the initial treatment phase (usually 2-4 weeks). Once your dandruff is under control, you can reduce to once weekly for maintenance. The shampoo is gentle enough for daily use if needed.',
  },
  {
    question: 'Is Shamp safe for color-treated hair?',
    answer: 'Yes! Our formula is specifically designed to be gentle on color-treated hair while remaining effective against dandruff. We recommend waiting 48 hours after coloring before using Shamp.',
  },
  {
    question: 'How long until I see results?',
    answer: 'Most customers notice a significant reduction in flakes within 1-2 weeks. For full results and long-term dandruff control, we recommend using Shamp consistently for at least 4 weeks.',
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer: 'Absolutely. There are no commitments or cancellation fees. You can skip, pause, or cancel your subscription at any time from your account dashboard or by contacting our support team.',
  },
  {
    question: 'What is ketoconazole?',
    answer: 'Ketoconazole is the #1 dermatologist-recommended antifungal ingredient for treating dandruff. It works by eliminating the fungus (Malassezia) that causes dandruff, seborrheic dermatitis, and scalp irritation. Our shampoo contains 1% ketoconazole, which has been clinically proven to be effective.',
  },
  {
    question: 'Is Shamp suitable for sensitive scalps?',
    answer: 'Yes. While ketoconazole is powerful against dandruff-causing fungus, our formula includes soothing ingredients like tea tree oil and aloe vera to calm irritation. Many customers with sensitive scalps have found relief with Shamp.',
  },
  {
    question: 'Do you offer a money-back guarantee?',
    answer: 'Yes! We offer a 60-day money-back guarantee. If you\'re not satisfied with your results, contact us for a full refund. We believe in our product and want you to feel confident trying it.',
  },
]

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="bg-cream min-h-screen">
      {/* Hero */}
      <section className="bg-navy-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-serif mb-4">FAQs</h1>
          <p className="text-xl text-navy-200">
            Everything you need to know about Shamp
          </p>
        </div>
      </section>

      {/* FAQ List */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg shadow-sm overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-navy-900">{faq.question}</span>
                <svg
                  className={`w-5 h-5 text-navy-600 transition-transform ${
                    openIndex === idx ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {openIndex === idx && (
                <div className="px-6 pb-4">
                  <p className="text-navy-700">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="mt-12 text-center">
          <p className="text-navy-700 mb-4">
            Still have questions? We are here to help.
          </p>
          <a
            href="mailto:hello@shamp.com"
            className="inline-block bg-navy-900 hover:bg-navy-800 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Contact Us
          </a>
        </div>
      </section>
    </div>
  )
}
