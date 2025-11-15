import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create categories
  const mensCategory = await prisma.category.upsert({
    where: { slug: 'mens-fashion' },
    update: {},
    create: {
      name: "Men's Fashion",
      slug: 'mens-fashion',
      description: 'Stylish clothing and accessories for men',
    },
  });

  const womensCategory = await prisma.category.upsert({
    where: { slug: 'womens-fashion' },
    update: {},
    create: {
      name: "Women's Fashion",
      slug: 'womens-fashion',
      description: 'Elegant clothing and accessories for women',
    },
  });

  const accessoriesCategory = await prisma.category.upsert({
    where: { slug: 'accessories' },
    update: {},
    create: {
      name: 'Accessories',
      slug: 'accessories',
      description: 'Fashion accessories for everyone',
    },
  });

  console.log('Categories created');

  // Create sample products
  const products = [
    {
      title: 'Classic White T-Shirt',
      slug: 'classic-white-tshirt',
      description: 'Premium quality cotton t-shirt. Comfortable and versatile.',
      price: 29.99,
      stock: 100,
      categoryId: mensCategory.id,
      featured: true,
      images: [
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
        'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a',
      ],
    },
    {
      title: 'Slim Fit Jeans',
      slug: 'slim-fit-jeans',
      description: 'Modern slim fit jeans with stretch fabric for ultimate comfort.',
      price: 79.99,
      stock: 50,
      categoryId: mensCategory.id,
      featured: true,
      images: [
        'https://images.unsplash.com/photo-1542272604-787c3835535d',
      ],
    },
    {
      title: 'Leather Jacket',
      slug: 'leather-jacket',
      description: 'Genuine leather jacket with premium stitching and classic design.',
      price: 299.99,
      stock: 20,
      categoryId: mensCategory.id,
      featured: false,
      images: [
        'https://images.unsplash.com/photo-1551028719-00167b16eac5',
      ],
    },
    {
      title: 'Summer Dress',
      slug: 'summer-dress',
      description: 'Flowy summer dress perfect for warm weather. Light and breathable.',
      price: 89.99,
      stock: 40,
      categoryId: womensCategory.id,
      featured: true,
      images: [
        'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1',
      ],
    },
    {
      title: 'Denim Skirt',
      slug: 'denim-skirt',
      description: 'Classic denim skirt with a modern fit. Versatile and stylish.',
      price: 59.99,
      stock: 60,
      categoryId: womensCategory.id,
      featured: false,
      images: [
        'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa',
      ],
    },
    {
      title: 'Silk Blouse',
      slug: 'silk-blouse',
      description: 'Elegant silk blouse for formal and casual occasions.',
      price: 129.99,
      stock: 30,
      categoryId: womensCategory.id,
      featured: true,
      images: [
        'https://images.unsplash.com/photo-1564859228273-274232fdb516',
      ],
    },
    {
      title: 'Leather Handbag',
      slug: 'leather-handbag',
      description: 'Premium leather handbag with multiple compartments.',
      price: 199.99,
      stock: 25,
      categoryId: accessoriesCategory.id,
      featured: true,
      images: [
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa',
      ],
    },
    {
      title: 'Sunglasses',
      slug: 'sunglasses',
      description: 'UV protection sunglasses with polarized lenses.',
      price: 149.99,
      stock: 80,
      categoryId: accessoriesCategory.id,
      featured: false,
      images: [
        'https://images.unsplash.com/photo-1572635196237-14b3f281503f',
      ],
    },
    {
      title: 'Leather Belt',
      slug: 'leather-belt',
      description: 'Classic leather belt with metal buckle. Available in multiple sizes.',
      price: 49.99,
      stock: 70,
      categoryId: accessoriesCategory.id,
      featured: false,
      images: [
        'https://images.unsplash.com/photo-1624222247344-550fb60583c2',
      ],
    },
    {
      title: 'Wool Scarf',
      slug: 'wool-scarf',
      description: 'Warm wool scarf perfect for cold weather. Soft and comfortable.',
      price: 39.99,
      stock: 90,
      categoryId: accessoriesCategory.id,
      featured: false,
      images: [
        'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9',
      ],
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: product,
    });
  }

  console.log('Products created');
  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
