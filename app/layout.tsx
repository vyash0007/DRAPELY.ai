import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { Navbar } from '@/components/navbar';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Fashion Store - Your Style Destination',
  description: 'Shop the latest fashion trends with our curated collection',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <Navbar />
          <main className="min-h-screen bg-gray-50">{children}</main>
          <footer className="border-t bg-white py-8">
            <div className="mx-auto max-w-7xl px-4 text-center text-gray-600 sm:px-6 lg:px-8">
              <p>&copy; 2024 Fashion Store. All rights reserved.</p>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
