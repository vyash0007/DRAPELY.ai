import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const ADMIN_SESSION_COOKIE = 'admin-session';

/**
 * Check if admin credentials are valid
 */
export function verifyAdminCredentials(email: string, password: string): boolean {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error('Admin credentials not configured in environment variables');
  }

  return email === adminEmail && password === adminPassword;
}

/**
 * Create admin session
 */
export async function createAdminSession() {
  const cookieStore = await cookies();

  // Set httpOnly cookie for security
  cookieStore.set(ADMIN_SESSION_COOKIE, 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/admin',
  });
}

/**
 * Check if admin is authenticated
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_SESSION_COOKIE);
  return session?.value === 'authenticated';
}

/**
 * Get admin session or redirect to login
 */
export async function requireAdminAuth() {
  const isAuthenticated = await isAdminAuthenticated();

  if (!isAuthenticated) {
    redirect('/admin/login');
  }
}

/**
 * Destroy admin session
 */
export async function destroyAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
}
