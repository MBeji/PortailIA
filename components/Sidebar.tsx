"use client";
import React from 'react';
import clsx from 'clsx';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
const GlobalSearch = dynamic(()=>import('./GlobalSearch'), { ssr:false });

function NavItem({ href, children }: { href: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <a href={href} className={clsx('block rounded px-3 py-2 font-medium text-sm transition-colors hover:bg-primary-50 hover:text-primary-700 dark:hover:bg-slate-700/60', active && 'bg-primary-100 text-primary-700 dark:bg-slate-700/80 dark:text-primary-200')}>{children}</a>
  );
}

function ThemeToggle() {
  React.useEffect(() => {
    const stored = localStorage.getItem('theme');
    if(stored === 'dark') document.documentElement.classList.add('dark');
  }, []);
  const toggle = () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  };
  return (
    <button onClick={toggle} aria-label="Basculer thème" className="rounded border px-2 py-1 text-[11px] font-medium hover:bg-gray-50 dark:border-slate-600 dark:hover:bg-slate-700">🌗</button>
  );
}

export default function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-60 flex-col border-r bg-white/80 backdrop-blur dark:bg-slate-800/80 lg:flex">
      <SidebarContent />
    </aside>
  );
}

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <div className="flex items-center justify-between px-4 py-4">
        <h1 className="text-sm font-semibold tracking-wide text-primary-700 dark:text-primary-400">Portail IA</h1>
        <ThemeToggle />
      </div>
  <div className="px-2 mb-2"><GlobalSearch /></div>
  <nav className="flex-1 space-y-1 px-2" onClick={onNavigate}>
        <NavItem href="/">Dashboard</NavItem>
        <NavItem href="/questionnaires">Questionnaires</NavItem>
        <NavItem href="/plan/action">Plan d'action</NavItem>
  <NavItem href="/plan/resume">Résumé exécutif</NavItem>
        <NavItem href="/knowledge/base">Base de connaissance</NavItem>
      </nav>
      <div className="border-t px-4 py-3 text-[10px] text-gray-500 dark:text-gray-400">© {new Date().getFullYear()} Portail IA</div>
    </>
  );
}
