import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/admin-auth';
import { LoginForm } from '@/components/admin/login-form';

export default async function AdminLoginPage() {
  // Redirect if already authenticated
  const authenticated = await isAdminAuthenticated();
  if (authenticated) {
    redirect('/admin/dashboard');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-white to-pink-50/30">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-sm border border-gray-100">
        <div className="text-center">
          <h2 className="text-4xl font-light tracking-wide text-gray-900">DRAPELY.ai</h2>
          <p className="mt-1 text-xs font-medium text-gray-600 uppercase tracking-wider">Admin Panel</p>
          <p className="mt-4 text-gray-600">Sign in to manage your store</p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
