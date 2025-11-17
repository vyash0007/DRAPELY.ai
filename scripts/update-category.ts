import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateCategory() {
  try {
    console.log('Checking current categories...');
    const categories = await prisma.category.findMany();
    console.log('Current categories:', categories);

    // Check if accessories category exists
    const accessoriesCategory = await prisma.category.findUnique({
      where: { slug: 'accessories' }
    });

    if (accessoriesCategory) {
      console.log('\nFound accessories category, updating to kids...');

      // Update the category
      const updated = await prisma.category.update({
        where: { slug: 'accessories' },
        data: {
          name: 'Kids',
          slug: 'kids',
          description: 'Stylish and comfortable fashion for kids',
        },
      });

      console.log('Updated category:', updated);
    } else {
      console.log('\nNo accessories category found. Checking for kids category...');
      const kidsCategory = await prisma.category.findUnique({
        where: { slug: 'kids' }
      });

      if (kidsCategory) {
        console.log('Kids category already exists:', kidsCategory);
      } else {
        console.log('Neither accessories nor kids category found.');
      }
    }

    console.log('\nFinal categories:');
    const finalCategories = await prisma.category.findMany();
    console.log(finalCategories);

  } catch (error) {
    console.error('Error updating category:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateCategory();
