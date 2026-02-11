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
    <ClerkProvider
      appearance={{
        layout: {
          socialButtonsPlacement: "bottom",
          socialButtonsVariant: "blockButton",
          unsafe_disableDevelopmentModeWarnings: true,
        },
        elements: {
          formButtonPrimary:
            "bg-[#87A582] hover:bg-[#7A9475] text-sm normal-case shadow-lg h-12 transition-all duration-300 rounded-xl",
          card: "shadow-2xl bg-white border border-gray-100/50 rounded-3xl",
          headerTitle: "text-3xl font-light text-gray-900 tracking-tight",
          headerSubtitle: "text-gray-500 text-base font-light mt-2",
          socialButtonsBlockButton: "border-gray-100 hover:bg-gray-50 h-12 transition-all duration-300 rounded-xl shadow-sm",
          socialButtonsBlockButtonText: "text-gray-600 font-medium",
          formFieldInput: "h-12 border-gray-100 bg-gray-50/50 focus:bg-white focus:border-[#87A582] transition-all duration-300 rounded-xl px-4",
          formFieldLabel: "text-gray-700 font-medium mb-1.5",
          internal_securedByClerk: "!hidden",
          branding: "!hidden", // Explicit branding target
          userButtonPopoverFooter: "!hidden",
        }
      }}
    >
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
