import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { headers } from 'next/headers';
import { Toaster } from 'sonner';
import './globals.css';
import { Navbar } from '@/components/navbar';
import FooterWrapper from '@/components/FooterWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DRAPELY.ai',
  description: 'Shop the latest fashion trends with our curated collection',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || headersList.get('referer') || '';
  const isAdminRoute = pathname.includes('/admin');

  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="icon" href="/logo2.2k.png" type="image/png" />
        </head>
        <body className={inter.className}>
          {isAdminRoute ? (
            // Admin routes - no Navbar/Footer, let admin layout handle everything
            children
          ) : (
            // Regular routes - show Navbar and Footer
            <>
              <Navbar />
              <main className="min-h-screen bg-gray-50 pt-16">{children}</main>
              <FooterWrapper />
            </>
          )}
          <Toaster position="top-center" richColors />
        </body>
      </html>
    </ClerkProvider>
  );
}
