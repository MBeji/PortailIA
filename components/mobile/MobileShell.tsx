"use client";
import React from 'react';
import { SidebarContent } from '../Sidebar';

export default function MobileShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  React.useEffect(()=>{
    const handler = (e: KeyboardEvent) => { if(e.key==='Escape') setOpen(false); };
    window.addEventListener('keydown', handler);
    return ()=> window.removeEventListener('keydown', handler);
  },[]);
  return (
    <div className="flex min-h-screen w-full">
      {/* Desktop sidebar injected by layout */}
      {children instanceof Array ? children[0] : null}
      <div className="flex flex-1 flex-col">
        <MobileTopBar onMenu={()=>setOpen(true)} />
        <div className="flex-1">{children instanceof Array ? children[1] : children}</div>
      </div>
      {/* Mobile drawer */}
      <div className={`fixed inset-0 z-40 lg:hidden ${open?'':'pointer-events-none'}`}>
        <div className={`absolute inset-0 bg-black/40 transition-opacity ${open?'opacity-100':'opacity-0'}`} onClick={()=>setOpen(false)} />
        <div className={`absolute left-0 top-0 h-full w-64 transform bg-white shadow-xl transition-transform dark:bg-slate-800 ${open?'translate-x-0':'-translate-x-full'}`}>
          <SidebarContent onNavigate={()=>setOpen(false)} />
        </div>
      </div>
    </div>
  );
}

function MobileTopBar({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="flex items-center gap-3 border-b bg-white/70 px-3 py-2 backdrop-blur dark:border-slate-700 dark:bg-slate-800/70 lg:hidden">
      <button onClick={onMenu} aria-label="Menu" className="rounded border px-2 py-1 text-xs font-medium dark:border-slate-600">☰</button>
      <span className="text-sm font-semibold text-primary-700 dark:text-primary-300">Portail IA</span>
    </header>
  );
}
