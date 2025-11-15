'use server';

import { redirect } from 'next/navigation';
import {
  verifyAdminCredentials,
  createAdminSession,
  destroyAdminSession,
} from '@/lib/admin-auth';

export interface LoginResult {
  success: boolean;
  error?: string;
}

/**
 * Admin login action
 */
export async function loginAdmin(
  email: string,
  password: string
): Promise<LoginResult> {
  try {
    // Verify credentials
    const isValid = verifyAdminCredentials(email, password);

    if (!isValid) {
      return {
        success: false,
        error: 'Invalid email or password',
      };
    }

    // Create session
    await createAdminSession();

    return { success: true };
  } catch (error) {
    console.error('Admin login error:', error);
    return {
      success: false,
      error: 'Login failed. Please try again.',
    };
  }
}

/**
 * Admin logout action
 */
export async function logoutAdmin() {
  await destroyAdminSession();
  redirect('/admin/login');
}
