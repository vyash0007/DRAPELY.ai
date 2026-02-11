import { requireAdminAuth } from '@/lib/admin-auth';
import { AdminSidebar } from '@/components/admin/sidebar';
import { AdminTopbar } from '@/components/admin/topbar';

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdminAuth();

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-white to-pink-50/30">
      {/* Sidebar - Desktop */}
      <div className="hidden md:flex">
        <AdminSidebar />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden bg-gradient-to-br from-gray-50 via-white to-pink-50/30">
        {/* Topbar */}
        <AdminTopbar />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gradient-to-br from-gray-50 via-white to-pink-50/30">{children}</main>
      </div>
    </div>
  );
}
