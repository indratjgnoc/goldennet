import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import Providers from '@/providers/Providers';

import './globals.css';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Golden Net | Internet Cepat & Stabil',
  description:
    'Golden Net - Internet cepat, stabil, dan terpercaya untuk rumah, bisnis, pendidikan, dan kebutuhan profesional.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={inter.variable}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}