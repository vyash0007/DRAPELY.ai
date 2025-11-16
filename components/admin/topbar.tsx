import { Bell, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#f5d7d7] to-[#f5a5a5] text-gray-900 shadow-sm">
            <UserCircle className="h-6 w-6" />
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
