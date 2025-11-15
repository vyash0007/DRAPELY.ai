import { currentUser } from '@clerk/nextjs/server';
import { db } from './db';

/**
 * Get the current authenticated user from Clerk and sync with database
 * Creates user in database if it doesn't exist
 */
export async function getCurrentUser() {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return null;
    }

    // Check if user exists in database
    let user = await db.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    // Create user if doesn't exist
    if (!user) {
      user = await db.user.create({
        data: {
          clerkId: clerkUser.id,
          email: clerkUser.emailAddresses[0]?.emailAddress ?? '',
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          imageUrl: clerkUser.imageUrl,
        },
      });
    }

    return user;
  } catch (error) {
    console.error('Database connection error in getCurrentUser:', error);
    // Return null when database is unreachable instead of crashing
    return null;
  }
}

/**
 * Get current user ID (throws if not authenticated)
 */
export async function requireAuth() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}
