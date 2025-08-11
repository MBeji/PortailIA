"use client";
import React from 'react';
import clsx from 'clsx';

interface Result { type: 'mission' | 'recommendation' | 'knowledge'; id?: string; slug?: string; title: string; meta?: string }

export default function GlobalSearch() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState<Result[]>([]);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setOpen(o=>!o); }
      else if (e.key === 'Escape') setOpen(false);
    }; window.addEventListener('keydown', handler); return () => window.removeEventListener('keydown', handler);
  }, []);

  React.useEffect(() => {
    if(!open) return; const fn = (e: MouseEvent) => { if(containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false); }; document.addEventListener('mousedown', fn); return () => document.removeEventListener('mousedown', fn);
  }, [open]);

  React.useEffect(() => {
    if(!open) return; if(!query) { setResults([]); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        const r: Result[] = [];
        data.missions?.forEach((m: any) => r.push({ type:'mission', id:m.id, title:m.title, meta:m.company }));
        data.recommendations?.forEach((rec: any) => r.push({ type:'recommendation', id:rec.id, title:rec.title, meta:`${rec.department} · ${rec.priority.toFixed(1)}` }));
        data.knowledge?.forEach((k: any) => r.push({ type:'knowledge', slug:k.slug, title:k.title, meta:k.tags.join(', ') }));
        setResults(r);
      } finally { setLoading(false); }
    }, 300); return () => clearTimeout(t);
  }, [query, open]);

  const go = (res: Result) => {
    setOpen(false);
    if(res.type === 'knowledge' && res.slug) window.location.href = `/knowledge/base/${res.slug}`;
    if(res.type === 'mission' && res.id) window.location.href = `/`;
    if(res.type === 'recommendation') window.location.href = `/plan/action`;
  };

  return (
    <>
      <button onClick={()=>setOpen(true)} className="group flex w-full items-center gap-2 rounded border px-2 py-1 text-[11px] text-gray-500 hover:border-primary-400 hover:text-primary-600 dark:border-slate-600 dark:text-slate-400 dark:hover:border-slate-500" aria-label="Recherche globale (Ctrl+K)">
        <span className="flex-1 truncate text-left">Rechercher…</span>
        <span className="rounded bg-gray-100 px-1 text-[9px] font-medium text-gray-500 dark:bg-slate-700 dark:text-gray-300">Ctrl+K</span>
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div ref={containerRef} className="w-full max-w-xl overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl dark:border-slate-600 dark:bg-slate-800">
            <div className="flex items-center gap-2 border-b bg-gray-50 px-3 py-2 dark:border-slate-600 dark:bg-slate-700/40">
              <input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="Rechercher missions, recommandations, articles..." className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400 dark:placeholder:text-slate-400" />
              {query && <button onClick={()=>setQuery('')} aria-label="Effacer" className="text-xs text-gray-500 hover:text-gray-800 dark:text-slate-400 dark:hover:text-slate-200">✕</button>}
            </div>
            <div className="max-h-96 overflow-y-auto text-xs">
              {!query && <div className="p-4 text-gray-500">Tape une requête…</div>}
              {query && loading && <div className="p-4 text-gray-500">Recherche…</div>}
              {query && !loading && !results.length && <div className="p-4 text-gray-500">Aucun résultat.</div>}
              {results.map((r,i) => (
                <button key={i} onClick={()=>go(r)} className={clsx('flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-primary-50 focus:bg-primary-100 focus:outline-none dark:hover:bg-slate-700/60 dark:focus:bg-slate-700', r.type === 'knowledge' && 'italic')} aria-label={`Ouvrir ${r.title}`}>
                  <span className="inline-flex w-20 shrink-0 justify-center rounded border px-1 text-[10px] font-medium text-gray-500 dark:border-slate-600 dark:text-slate-300">{r.type}</span>
                  <span className="flex-1 truncate">{r.title}</span>
                  {r.meta && <span className="truncate text-[10px] text-gray-400 dark:text-slate-400">{r.meta}</span>}
                </button>
              ))}
            </div>
            <div className="border-t px-3 py-1 text-[10px] text-gray-400 dark:border-slate-600 dark:text-slate-500">Entrée pour ouvrir · Échap pour fermer</div>
          </div>
        </div>
      )}
    </>
  );
}
