"use client";
import React, { useEffect, useState } from 'react';
import { MissionContext } from './Providers';

interface Mission { id: string; title: string; createdAt: string }

export default function MissionPicker() {
  const ctx = React.useContext(MissionContext);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState('');

  const load = async() => {
    setLoading(true);
    try { const res = await fetch('/api/missions'); const data = await res.json(); setMissions(data); } finally { setLoading(false); }
  };
  useEffect(()=>{ load(); },[]);

  const create = async () => {
    if(!title.trim()) return;
    setCreating(true);
    try {
      const res = await fetch('/api/submit', { method: 'POST', body: JSON.stringify({ title: title.trim(), department: 'init', answers: [] }) });
      const data = await res.json();
      if(data.missionId) { ctx?.setMissionId(data.missionId); setTitle(''); load(); }
    } finally { setCreating(false); }
  };

  return (
    <div className="flex items-center gap-2">
  <select className="rounded border px-2 py-1 text-xs" value={ctx?.missionId || ''} onChange={e=>ctx?.setMissionId(e.target.value === '' ? '' : e.target.value)}>
        <option value="">Nouvelle mission...</option>
        {missions.map(m => <option key={m.id} value={m.id}>{m.title || m.id.slice(0,8)}</option>)}
      </select>
      {!ctx?.missionId && (
        <div className="flex items-center gap-1">
          <input placeholder="Titre" className="w-40 rounded border px-2 py-1 text-xs" value={title} onChange={e=>setTitle(e.target.value)} />
          <button onClick={create} disabled={creating} className="rounded bg-primary-600 px-2 py-1 text-[11px] text-white disabled:opacity-50">Créer</button>
        </div>
      )}
    </div>
  );
}
