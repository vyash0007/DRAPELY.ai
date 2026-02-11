import { Bell, UserCircle, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { AdminSidebar } from '@/components/admin/sidebar';

export function AdminTopbar() {
  return (
    <header className="flex h-20 items-center justify-between border-b border-gray-200 bg-white/95 backdrop-blur-sm shadow-sm px-4 md:px-8">
      <div className="flex items-center gap-4">
        {/* Mobile Sidebar Trigger */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-gray-100">
                <Menu className="h-6 w-6 text-gray-900" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 border-r-0">
              <SheetTitle className="sr-only">Admin Navigation</SheetTitle>
              <AdminSidebar className="w-full h-full border-r-0 shadow-none" />
            </SheetContent>
          </Sheet>
        </div>

        <div>
          <h2 className="text-2xl md:text-3xl font-light tracking-wide text-gray-900">Dashboard</h2>
          <p className="text-xs md:text-sm text-gray-600 mt-1 hidden sm:block">Manage your store</p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-[#f5d7d7]/50 hover:text-gray-900 transition-colors"
        >
          <Bell className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
          <div className="flex h-10 w-10 md:h-14 md:w-14 items-center justify-center rounded-full border border-gray-200 bg-white mr-2 md:mr-4">
            <Image
              src="/logo2.2k.png"
              alt="Logo"
              width={48}
              height={48}
              className="h-8 w-8 md:h-12 md:w-12 object-contain"
            />
          </div>
          <div className="text-sm hidden sm:block">
            <p className="font-semibold text-gray-900">Administrator</p>
            <p className="text-gray-500 text-xs">Admin Account</p>
          </div>
        </div>
      </div>
    </header>
  );
}
