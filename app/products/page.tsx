import { prisma } from '@/lib/db'
import ProductCard from '@/components/ProductCard'

export const dynamic = 'force-dynamic'

interface ProductsPageProps {
  searchParams: Promise<{ category?: string }>
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams
  const category = params.category

  const products = await prisma.product.findMany({
    where: category ? { category, inStock: true } : { inStock: true },
    orderBy: { name: 'asc' },
  })

  const categories = await prisma.product.findMany({
    select: { category: true },
    distinct: ['category'],
    orderBy: { category: 'asc' },
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Our Products</h1>

      {/* Category Filter */}
      <div className="mb-8 flex flex-wrap gap-2">
        <a
          href="/products"
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            !category
              ? 'bg-brand-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          All
        </a>
        {categories.map((cat) => (
          <a
            key={cat.category}
            href={`/products?category=${encodeURIComponent(cat.category)}`}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              category === cat.category
                ? 'bg-brand-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {cat.category}
          </a>
        ))}
      </div>

      {/* Product Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              slug={product.slug}
              price={product.price}
              image={product.image}
              category={product.category}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600">No products found in this category.</p>
        </div>
      )}
    </div>
  )
}
