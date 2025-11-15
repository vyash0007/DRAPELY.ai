import { Bell, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function AdminTopbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800">Admin Dashboard</h2>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-900 text-white">
            <User className="h-5 w-5" />
          </div>
          <div className="text-sm">
            <p className="font-medium">Admin</p>
            <p className="text-gray-500">Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
}
