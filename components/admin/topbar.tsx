import { Bell, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export function AdminTopbar() {
  return (
    <header className="flex h-20 items-center justify-between border-b border-gray-200 bg-white/95 backdrop-blur-sm shadow-sm px-8">
      <div>
        <h2 className="text-3xl font-light tracking-wide text-gray-900">Dashboard</h2>
        <p className="text-sm text-gray-600 mt-1">Manage your store</p>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-[#f5d7d7]/50 hover:text-gray-900 transition-colors"
        >
          <Bell className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-gray-200 bg-white mr-4">
          <Image
            src="/logo2.2k.png"
            alt="Logo"
            width={48}
            height={48}
            className="h-12 w-12 object-contain"
          />
        </div>
          <div className="text-sm">
            <p className="font-semibold text-gray-900">Administrator</p>
            <p className="text-gray-500 text-xs">Admin Account</p>
          </div>
        </div>
      </div>
    </header>
  );
}
