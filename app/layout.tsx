import type { ReactNode } from 'react';
import './globals.css';

export const metadata = {
  title: 'Rayfin × Embr — Notes Board',
  description: 'Next.js BFF on Embr backed by a Fabric-managed Rayfin backend',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
