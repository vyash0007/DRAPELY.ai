'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface NavbarWrapperProps {
  children: React.ReactNode;
}

export function NavbarWrapper({ children }: NavbarWrapperProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Homepage styling - blend with hero gradient
  if (isHomePage) {
    return (
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-gray-200/50'
            : 'bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100/30'
        }`}
      >
        {children}
      </nav>
    );
  }

  // Other pages - always solid white
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-gray-200">
      {children}
    </nav>
  );
}
