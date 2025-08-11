import './globals.css';
import React from 'react';
import Providers from '../components/Providers';
import Sidebar from '../components/Sidebar';
import dynamic from 'next/dynamic';
const MobileShell = dynamic(()=>import('../components/mobile/MobileShell'), { ssr:false });

export const metadata = {
  title: 'Portail IA',
  description: 'Audit de maturité digitale & IA',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50 transition-colors dark:bg-slate-900">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <MobileShell>
      <Sidebar />
      <main className="flex-1 overflow-x-hidden px-4 py-6 lg:px-8">{children}</main>
    </MobileShell>
  );
}
