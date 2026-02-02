import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-navy-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h3 className="text-2xl font-serif font-bold mb-4">Shamp</h3>
            <p className="text-navy-200 max-w-md">
              Clinical-strength dandruff treatment that actually works.
              Say goodbye to flakes and hello to healthier, fuller hair.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Shop</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-navy-200 hover:text-white transition-colors">
                  Anti-Dandruff Shampoo
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-navy-200 hover:text-white transition-colors">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-navy-200 hover:text-white transition-colors">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-navy-200">
              <li>hello@shamp.com</li>
              <li>1-800-SHAMP</li>
              <li className="pt-2">
                <p className="text-sm">Free shipping on subscriptions</p>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-navy-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-navy-300 text-sm">
          <p>&copy; {new Date().getFullYear()} Shamp. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
