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
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Admin Panel</h2>
          <p className="mt-2 text-gray-600">Sign in to manage your store</p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
