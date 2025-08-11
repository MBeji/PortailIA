"use client";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import Card from './ui/Card';
import { Badge } from './ui/Badge';
import Button from './ui/Button';
import Skeleton from './ui/Skeleton';
import { useToast } from './Providers';

async function fetchMissions() {
  const res = await fetch('/api/missions');
  return res.json();
}

async function fetchMissionScore(id: string) {
  const res = await fetch(`/api/missions/${id}/scores`);
  if(!res.ok) return null;
  return res.json();
}

export default function MissionsPanel() {
  const { data, isLoading, error } = useQuery({ queryKey: ['missions'], queryFn: fetchMissions });
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ company: '', title: '' });
  const pushToast = useToast();

  const handleCreate = async () => {
    if(!form.company || !form.title) return;
    setCreating(true);
    try {
      // Re-use submit endpoint to auto-create mission without answers
      const res = await fetch('/api/submit', { method: 'POST', body: JSON.stringify({ company: form.company, title: form.title, department: 'operations', answers: [] }) });
      const js = await res.json();
      if(js?.missionId) {
        await qc.invalidateQueries({ queryKey: ['missions'] });
        setForm({ company: '', title: '' });
        pushToast('Mission créée','success');
      } else {
        pushToast('Création échouée','error');
      }
    } catch {
      pushToast('Erreur réseau','error');
    } finally { setCreating(false); }
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Missions récentes</h2>
          <p className="text-xs text-gray-500">Dernières 50 missions</p>
        </div>
        <div className="flex flex-wrap items-end gap-2 rounded border bg-white p-3 shadow-sm">
          <div className="flex flex-col">
            <label className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Entreprise</label>
            <input value={form.company} onChange={e=>setForm(f=>({...f, company: e.target.value}))} className="rounded border px-2 py-1 text-xs" placeholder="Nom" />
          </div>
          <div className="flex flex-col">
            <label className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Titre mission</label>
            <input value={form.title} onChange={e=>setForm(f=>({...f, title: e.target.value}))} className="rounded border px-2 py-1 text-xs" placeholder="Titre" />
          </div>
          <Button size="sm" onClick={handleCreate} disabled={creating || !form.company || !form.title} loading={creating}>Créer</Button>
        </div>
      </div>
      {isLoading && (
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({length:3}).map((_,i)=>(<Card key={i} className="p-4"><Skeleton className="mb-2 h-4 w-1/2" /><Skeleton className="mb-1 h-3 w-1/3" /><Skeleton className="h-3 w-2/3" /></Card>))}
        </div>
      )}
      {error && <p className="text-sm text-red-600">Erreur de chargement</p>}
      <div className="grid gap-4 md:grid-cols-3">
        {data?.map((m: any) => <MissionCard key={m.id} mission={m} />)}
        {!isLoading && data?.length === 0 && <p className="text-sm text-gray-500">Aucune mission.</p>}
      </div>
    </section>
  );
}

function MissionCard({ mission }: { mission: any }) {
  const { data } = useQuery({ queryKey: ['mission-score', mission.id], queryFn: () => fetchMissionScore(mission.id), staleTime: 10000 });
  return (
    <Card className="flex flex-col gap-1">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium line-clamp-1 text-sm">{mission.title}</h3>
        <Badge variant="neutral">{mission.status}</Badge>
      </div>
      <p className="text-[11px] text-gray-500">Entreprise <span className="font-mono">{mission.companyId.slice(0,6)}…</span></p>
      {data && (
        <div className="mt-1">
          <div className="h-2 w-full overflow-hidden rounded bg-gray-100">
            <div className="h-full bg-primary-600" style={{ width: `${data.globalPercent.toFixed(1)}%` }} />
          </div>
          <p className="mt-1 text-[11px] font-medium text-primary-700">Global {data.globalPercent.toFixed(1)}%</p>
        </div>
      )}
      <div className="mt-2 flex gap-2">
        <a className="text-[11px] text-blue-600 hover:underline" href={`/api/missions/${mission.id}/export`}>Export</a>
        <a className="text-[11px] text-blue-600 hover:underline" href={`/plan/action`}>Plan</a>
      </div>
    </Card>
  );
}
