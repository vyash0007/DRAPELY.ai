import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixKidsDescription() {
  try {
    console.log('Updating Kids category description...');

    const updated = await prisma.category.update({
      where: { slug: 'kids' },
      data: {
        description: 'Stylish and comfortable fashion for kids',
      },
    });

    console.log('Updated Kids category:', updated);

  } catch (error) {
    console.error('Error updating category:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixKidsDescription();
