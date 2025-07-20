import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { getUser } from '@/lib/db/queries';
import { SWRConfig } from 'swr';
import Navigation from '@/components/layout/Navigation';
import ClientNavigation from '@/components/layout/ClientNavigation';

export const metadata: Metadata = {
  title: 'AI Review Hub - Discover the Best AI Tools',
  description: 'Find, review, and share your experience with the latest AI products. Help the community make informed decisions about AI tools.'
};

export const viewport: Viewport = {
  maximumScale: 1
};

const manrope = Manrope({ subsets: ['latin'] });

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`bg-white dark:bg-gray-950 text-black dark:text-white ${manrope.className}`}
    >
      <body className="min-h-[100dvh] bg-gray-50">
        <SWRConfig
          value={{
            fallback: {
              // We do NOT await here
              // Only components that read this data will suspend
              '/api/user': getUser()
            }
          }}
        >
          <ClientNavigation />
          {children}
        </SWRConfig>
      </body>
    </html>
  );
}
