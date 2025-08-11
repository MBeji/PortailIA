"use client";
import React, { useEffect, useState } from 'react';
import Button from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import Card from '../../../components/ui/Card';
import Skeleton from '../../../components/ui/Skeleton';
import { useToast } from '../../../components/Providers';

interface Recommendation { id: string; department: string; title: string; priority: number; phase?: string; status: string; effort?: number }

export default function PlanActionPage() {
  const [missionId, setMissionId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Recommendation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  // Filters
  const [filterDept, setFilterDept] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterPhase, setFilterPhase] = useState<string>('');
  const departments = Array.from(new Set(items.map(i => i.department))).sort();
  const phases = Array.from(new Set(items.map(i => i.phase).filter(Boolean))) as string[];
  const statuses = ['TODO','IN_PROGRESS','DONE'];
  const [sortDir, setSortDir] = useState<'desc'|'asc'>('desc');
  const [sortSecondary, setSortSecondary] = useState<'effort'|'status'|''>('');
  const pushToast = useToast();

  // MVP: pick the most recent mission automatically
  useEffect(() => {
    const loadMission = async () => {
      const res = await fetch('/api/missions');
      const data = await res.json();
      if(data?.length) {
        setMissionId(data[0].id);
      }
    };
    loadMission();
  }, []);

  const loadPlan = async (mid: string) => {
    if(!mid) return;
    setLoading(true); setError(null);
    try {
      const res = await fetch(`/api/missions/${mid}/plan`);
      const data = await res.json();
      setItems(data.items || []);
    } catch(e:any) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { if(missionId) loadPlan(missionId); }, [missionId]);

  const handleGenerate = async () => {
    if(!missionId) return;
    setLoading(true); setError(null);
    try {
      await fetch(`/api/missions/${missionId}/recommendations/generate`, { method: 'POST' });
      await loadPlan(missionId);
      pushToast('Recommandations générées','success');
    } catch(e:any) { setError(e.message); pushToast('Erreur génération: '+ e.message,'error'); }
    finally { setLoading(false); }
  };

  const handleExport = async () => {
    if(!missionId || exporting) return;
    setExporting(true); setError(null);
    pushToast('Export en cours...','info');
    try {
      const res = await fetch(`/api/missions/${missionId}/export`);
      if(!res.ok) throw new Error('Export impossible');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `mission-${missionId}.docx`;
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
      pushToast('Export DOCX prêt','success');
    } catch(e:any) { setError(e.message); pushToast('Erreur export: '+ e.message,'error'); }
    finally { setExporting(false); }
  };

  // Debounce cache for effort updates
  const effortTimers = React.useRef<Record<string, any>>({});
  const updateEffort = (id: string, val: number) => {
    if(effortTimers.current[id]) clearTimeout(effortTimers.current[id]);
    effortTimers.current[id] = setTimeout(async () => {
      try {
        const res = await fetch(`/api/missions/${missionId}/recommendations/${id}`, { method: 'PATCH', body: JSON.stringify({ effort: val }) });
        if(!res.ok) throw new Error('Maj effort échouée');
        loadPlan(missionId);
        pushToast('Effort mis à jour','info');
      } catch(e:any) {
        pushToast('Erreur effort: '+ e.message,'error');
      }
    }, 500);
  };

  const sortItems = (list: Recommendation[]) => {
    return [...list].sort((a,b) => {
      const pri = sortDir==='desc' ? b.priority - a.priority : a.priority - b.priority;
      if(pri !== 0) return pri;
      if(sortSecondary === 'effort') return (a.effort||0) - (b.effort||0);
      if(sortSecondary === 'status') return a.status.localeCompare(b.status);
      return 0;
    });
  };

  const phasesOrder = ['Court terme','Moyen terme','Long terme'];
  const grouped = phasesOrder.map(ph => ({ phase: ph, items: items.filter(i => i.phase === ph) }))
    .filter(g => g.items.length);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Plan d'action</h2>
          <p className="text-xs text-gray-500">Priorisation des recommandations générées automatiquement</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="font-medium">Mission:</span>
          <span className="font-mono text-[11px]">{missionId || '—'}</span>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleGenerate} disabled={!missionId || loading || exporting} loading={loading}>Générer / Regénérer</Button>
            <Button size="sm" variant="secondary" onClick={handleExport} disabled={!missionId || loading || exporting} loading={exporting}>Exporter DOCX</Button>
          </div>
        </div>
      </div>
      {error && <div className="rounded border border-red-300 bg-red-50 p-2 text-xs text-red-700">{error}</div>}
      <Card className="p-0">
        {loading && <div className="space-y-2 p-4">{Array.from({length:3}).map((_,i)=><Skeleton key={i} className="h-6 w-full" />)}</div>}
        {!loading && !items.length && <div className="p-6 text-center text-sm text-gray-500">Aucune recommandation. Lance la génération.</div>}
        {!!items.length && (
          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-3 border-b bg-gray-50 px-4 py-3 text-[11px] dark:bg-slate-800/60">
              <div className="flex items-center gap-1">
                <span className="text-gray-500">Dept</span>
                <select value={filterDept} onChange={e=>setFilterDept(e.target.value)} className="rounded border bg-white px-1 py-0.5 dark:bg-slate-800">
                  <option value="">Tous</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-500">Statut</span>
                <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} className="rounded border bg-white px-1 py-0.5 dark:bg-slate-800">
                  <option value="">Tous</option>
                  {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-500">Phase</span>
                <select value={filterPhase} onChange={e=>setFilterPhase(e.target.value)} className="rounded border bg-white px-1 py-0.5 dark:bg-slate-800">
                  <option value="">Toutes</option>
                  {phases.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-500">Tri</span>
                <select value={sortDir} onChange={e=>setSortDir(e.target.value as any)} className="rounded border bg-white px-1 py-0.5 dark:bg-slate-800">
                  <option value="desc">Priorité ↓</option>
                  <option value="asc">Priorité ↑</option>
                </select>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-500">Second</span>
                <select value={sortSecondary} onChange={e=>setSortSecondary(e.target.value as any)} className="rounded border bg-white px-1 py-0.5 dark:bg-slate-800">
                  <option value="">(aucun)</option>
                  <option value="effort">Effort</option>
                  <option value="status">Statut</option>
                </select>
              </div>
              {(filterDept||filterStatus||filterPhase||sortDir!=='desc'||sortSecondary) && (
                <button onClick={()=>{setFilterDept('');setFilterStatus('');setFilterPhase('');setSortDir('desc');setSortSecondary('');}} className="text-blue-600 underline-offset-2 hover:underline">Reset</button>
              )}
            </div>
            <div className="divide-y">
              {grouped.map(group => {
                const filtered = sortItems(group.items.filter(item => (
                  (!filterDept || item.department === filterDept) &&
                  (!filterStatus || item.status === filterStatus) &&
                  (!filterPhase || item.phase === filterPhase)
                )));
                if(!filtered.length) return null;
                return (
                  <details key={group.phase} open className="group/phase">
                    <summary className="flex cursor-pointer items-center justify-between gap-4 bg-gray-100 px-4 py-2 text-xs font-semibold tracking-wide text-gray-700 dark:bg-slate-800 dark:text-gray-300">
                      <span>{group.phase} ({filtered.length})</span>
                      <span className="transition group-open/phase:rotate-180">▾</span>
                    </summary>
                    <div className="overflow-x-auto">
                      <table className="w-full text-[11px]">
                        <thead>
                          <tr className="text-left">
                            <th className="p-2 font-semibold">Dept</th>
                            <th className="p-2 font-semibold">Titre</th>
                            <th className="p-2 font-semibold">Priorité</th>
                            <th className="p-2 font-semibold">Statut</th>
                            <th className="p-2 font-semibold">Effort</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.map(item => (
                            <tr key={item.id} className="border-t">
                              <td className="p-2 align-top"><Badge variant="neutral">{item.department}</Badge></td>
                              <td className="p-2 align-top max-w-md"><p className="font-medium text-gray-800 dark:text-gray-100">{item.title}</p></td>
                              <td className="p-2 align-top font-mono text-[10px]">{item.priority.toFixed(2)}</td>
                              <td className="p-2 align-top">
                                <select
                                  className="rounded border bg-white px-1 py-0.5 dark:bg-slate-800"
                                  value={item.status}
                                  onChange={async e => {
                                    try {
                                      const res = await fetch(`/api/missions/${missionId}/recommendations/${item.id}`, { method: 'PATCH', body: JSON.stringify({ status: e.target.value }) });
                                      if(!res.ok) throw new Error('Maj statut échouée');
                                      loadPlan(missionId);
                                      pushToast('Statut mis à jour','success');
                                    } catch(err:any) {
                                      pushToast('Erreur statut: ' + err.message,'error');
                                    }
                                  }}
                                >
                                  {['TODO','IN_PROGRESS','DONE'].map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                              </td>
                              <td className="p-2 align-top">
                                <input
                                  type="number"
                                  min={1}
                                  max={5}
                                  defaultValue={item.effort || ''}
                                  className="w-16 rounded border px-1 py-0.5 dark:bg-slate-800"
                                  onChange={e => {
                                    const val = parseInt(e.target.value,10);
                                    if(!val) return; updateEffort(item.id, val);
                                  }}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </details>
                );
              })}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
