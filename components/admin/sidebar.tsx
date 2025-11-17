'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Boxes, ShoppingBag, Users, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { logoutAdmin } from '@/actions/admin-auth';

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: BarChart3,
  },
  {
    name: 'Products',
    href: '/admin/products',
    icon: Boxes,
  },
  {
    name: 'Orders',
    href: '/admin/orders',
    icon: ShoppingBag,
  },
  {
    name: 'Customers',
    href: '/admin/customers',
    icon: Users,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    await logoutAdmin();
  };

  return (
    <div className="flex w-64 flex-col bg-gradient-to-b from-[#f5d7d7] via-[#fce8e8] to-[#f5d7d7] shadow-lg">
      {/* Logo */}
      <div className="flex h-20 items-center justify-center border-b border-[#f5a5a5]/30 bg-white/50 backdrop-blur-sm">
        <h1 className="text-2xl font-serif font-light  text-gray-900 tracking-wide">DRAPELY.ai</h1>
        <span className="ml-2 text-sm font-light text-gray-900 uppercase tracking-wider">Admin</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-6">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-200',
                isActive
                  ? 'bg-white text-gray-900 shadow-md shadow-[#f5a5a5]/20'
                  : 'text-gray-700 hover:bg-white/70 hover:text-gray-900 hover:shadow-sm'
              )}
            >
              <Icon className={cn(
                'h-5 w-5 transition-colors',
                isActive ? 'text-gray-900' : 'text-gray-800'
              )} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="border-t border-[#f5a5a5]/30 p-6 bg-white/30 backdrop-blur-sm">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold text-gray-700 transition-all duration-200 hover:bg-white hover:text-gray-900 hover:shadow-sm"
        >
          <LogOut className="h-5 w-5 text-gray-600" />
          Logout
        </button>
      </div>
    </div>
  );
}
