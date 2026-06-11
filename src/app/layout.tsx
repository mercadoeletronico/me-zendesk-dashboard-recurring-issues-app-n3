import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ZenDesk Analytics — Mercado Eletronico',
  description: 'Dashboard de tickets recorrentes do ZenDesk',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="bg-gray-50 antialiased">{children}</body>
    </html>
  );
}
