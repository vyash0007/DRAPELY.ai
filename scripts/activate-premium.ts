import { db } from '../lib/db';

/**
 * Script to manually activate premium for a user by email
 * Usage: npx tsx scripts/activate-premium.ts
 */

async function activatePremium() {
  const userEmail = 'vyash5407@gmail.com'; // Change this to your email

  try {
    console.log(`🔍 Looking for user with email: ${userEmail}`);

    const user = await db.user.findUnique({
      where: { email: userEmail },
    });

    if (!user) {
      console.error(`❌ User not found with email: ${userEmail}`);
      process.exit(1);
    }

    console.log(`✅ Found user: ${user.firstName} ${user.lastName} (ID: ${user.id})`);
    console.log(`📊 Current status: hasPremium=${user.hasPremium}, aiEnabled=${user.aiEnabled}`);

    if (user.hasPremium) {
      console.log('ℹ️  User already has premium access');
    } else {
      console.log('🔧 Activating premium...');

      const updatedUser = await db.user.update({
        where: { id: user.id },
        data: {
          hasPremium: true,
          aiEnabled: true,
        },
      });

      console.log(`✅ Premium activated successfully!`);
      console.log(`📊 New status: hasPremium=${updatedUser.hasPremium}, aiEnabled=${updatedUser.aiEnabled}`);
    }

    await db.$disconnect();
  } catch (error) {
    console.error('❌ Error activating premium:', error);
    await db.$disconnect();
    process.exit(1);
  }
}

activatePremium();
