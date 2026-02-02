import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const products = [
  {
    id: 'shamp-ketoconazole',
    name: 'Shamp Anti-Dandruff Shampoo',
    slug: 'anti-dandruff-shampoo',
    description: 'Our clinically-proven ketoconazole shampoo eliminates dandruff at the source while supporting healthy hair growth. Formulated with 1% ketoconazole, biotin, and saw palmetto to fight flakes and strengthen hair follicles.',
    price: 3900,
    image: 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=800',
    category: 'Anti-Dandruff',
    size: '8 oz',
    featured: true,
  },
]

async function main() {
  console.log('Seeding database...')

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        image: product.image,
        category: product.category,
        size: product.size,
        featured: product.featured,
      },
      create: product,
    })
  }

  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
