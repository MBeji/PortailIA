"use client";
import React, { useEffect, useState } from 'react';

interface SummaryRec { id: string; title: string; department: string; priority: number; phase?: string; status: string; effort?: number }

export default function ExecutiveSummaryPage() {
  const [missionId, setMissionId] = useState('');
  const [items, setItems] = useState<SummaryRec[]>([]);
  useEffect(()=>{ (async()=>{ const res = await fetch('/api/missions'); const data = await res.json(); if(data?.length){ setMissionId(data[0].id);} })(); },[]);
  useEffect(()=>{ if(!missionId) return; (async()=>{ const res = await fetch(`/api/missions/${missionId}/plan`); const data = await res.json(); setItems(data.items||[]); })(); },[missionId]);
  const phasesOrder = ['Court terme','Moyen terme','Long terme'];
  const grouped = phasesOrder.map(ph => ({ phase: ph, items: items.filter(i=>i.phase===ph).sort((a,b)=>b.priority-a.priority).slice(0,5) })).filter(g=>g.items.length);
  return (
    <div className="mx-auto max-w-5xl space-y-6 print:space-y-4">
      <div className="flex items-center justify-between print:hidden">
        <h2 className="text-lg font-semibold">Résumé exécutif</h2>
        <button onClick={()=>window.print()} className="rounded border px-3 py-1 text-sm hover:bg-gray-50 dark:border-slate-600 dark:hover:bg-slate-700">Imprimer</button>
      </div>
      <div className="text-xs text-gray-500 print:text-[11px]">Mission: <span className="font-mono">{missionId||'—'}</span></div>
      {grouped.map(g => (
        <section key={g.phase} className="break-inside-avoid rounded border bg-white p-4 shadow-sm dark:border-slate-600 dark:bg-slate-800 print:shadow-none">
          <h3 className="mb-2 text-sm font-bold tracking-wide">{g.phase}</h3>
          <ol className="space-y-2 text-[12px]">
            {g.items.map(r => (
              <li key={r.id} className="flex gap-3">
                <span className="inline-flex w-6 shrink-0 justify-center rounded bg-primary-600 text-[10px] font-bold text-white">{r.priority.toFixed(0)}</span>
                <div className="flex-1">
                  <p className="font-medium leading-snug">{r.title}</p>
                  <p className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400">{r.department} · {r.status} {r.effort ? `· Effort ${r.effort}`:''}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      ))}
      {!grouped.length && <div className="text-sm text-gray-500">Aucune donnée.</div>}
    </div>
  );
}
