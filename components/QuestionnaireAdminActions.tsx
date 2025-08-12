"use client";
import React from 'react';
import { useToast } from './Providers';
import { useRouter } from 'next/navigation';

export default function QuestionnaireAdminActionsClient() {
  const toast = useToast();
  const router = useRouter();
  const [loading, setLoading] = React.useState<string | null>(null);

  async function post(body: any) {
    setLoading(body.action);
    try {
      const res = await fetch('/api/questionnaires/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.detail || j?.error || 'Erreur');
      }
      toast('Opération réussie', 'success');
      router.refresh();
    } catch (e: any) {
      toast(e.message || 'Échec', 'error');
    } finally {
      setLoading(null);
    }
  }

  const [dep, setDep] = React.useState('');
  const [from, setFrom] = React.useState('');
  const [to, setTo] = React.useState('');
  const [depDel, setDepDel] = React.useState('');
  const [jsonText, setJsonText] = React.useState('');
  const [override, setOverride] = React.useState(false);
  const onFile = async (file?: File | null) => {
    if (!file) return;
    const text = await file.text().catch(() => '');
    if (text) setJsonText(text);
  };
  const doImport = async () => {
    let payload: any = null;
    try { payload = JSON.parse(jsonText); } catch { toast('JSON invalide', 'error'); return; }
    await post({ action: 'import', questionnaire: payload, override });
  };

  const [depExport, setDepExport] = React.useState('');
  const exportUrl = depExport ? `/api/questionnaires/admin?department=${encodeURIComponent(depExport)}` : '#';

  return (
    <div className="grid gap-4 rounded border bg-white p-4 text-xs md:grid-cols-2">
      <div className="space-y-1">
        <p className="font-semibold">Créer</p>
        <div className="flex gap-2">
          <input value={dep} onChange={e=>setDep(e.target.value)} placeholder="department" className="w-full rounded border px-2 py-1" />
          <button onClick={()=> post({ action:'create', department: dep })} disabled={!dep || loading==='create'} className="rounded bg-primary-600 px-3 py-1 text-white disabled:opacity-50">{loading==='create'?'…':'Créer'}</button>
        </div>
      </div>
      <div className="space-y-1">
        <p className="font-semibold">Renommer</p>
        <div className="flex gap-2">
          <input value={from} onChange={e=>setFrom(e.target.value)} placeholder="ancien" className="w-1/2 rounded border px-2 py-1" />
          <input value={to} onChange={e=>setTo(e.target.value)} placeholder="nouveau" className="w-1/2 rounded border px-2 py-1" />
          <button onClick={()=> post({ action:'rename', from, to })} disabled={!from||!to||loading==='rename'} className="rounded bg-amber-600 px-3 py-1 text-white disabled:opacity-50">{loading==='rename'?'…':'Renommer'}</button>
        </div>
      </div>
      <div className="space-y-1">
        <p className="font-semibold">Supprimer</p>
        <div className="flex gap-2">
          <input value={depDel} onChange={e=>setDepDel(e.target.value)} placeholder="department" className="w-full rounded border px-2 py-1" />
          <button onClick={()=> { if(confirm('Supprimer définitivement ?')) post({ action:'delete', department: depDel }); }} disabled={!depDel||loading==='delete'} className="rounded bg-red-600 px-3 py-1 text-white disabled:opacity-50">{loading==='delete'?'…':'Supprimer'}</button>
        </div>
      </div>
      <div className="space-y-1">
        <p className="font-semibold">Exporter</p>
        <div className="flex items-center gap-2">
          <input value={depExport} onChange={e=>setDepExport(e.target.value)} placeholder="department" className="w-full rounded border px-2 py-1" />
          <a href={exportUrl} target="_blank" rel="noreferrer" className="rounded bg-slate-700 px-3 py-1 text-white opacity-90 hover:opacity-100">Télécharger</a>
        </div>
        <div className="text-[11px] text-gray-500">GET {exportUrl==='#'? '/api/questionnaires/admin?department=dep' : exportUrl}</div>
      </div>
      <div className="space-y-2 md:col-span-2">
        <p className="font-semibold">Importer (JSON)</p>
        <div className="flex items-center gap-2">
          <input type="file" accept="application/json,.json" onChange={e=> onFile(e.target.files?.[0] || null)} className="text-[11px]" />
          <label className="flex items-center gap-2"><input type="checkbox" checked={override} onChange={e=>setOverride(e.target.checked)} /> <span>Écraser si existe</span></label>
        </div>
        <textarea value={jsonText} onChange={e=>setJsonText(e.target.value)} rows={8} placeholder='{"department":"marketing","questions":[...]}' className="w-full rounded border px-2 py-1 font-mono text-[11px]" />
        <button onClick={doImport} disabled={!jsonText || loading==='import'} className="rounded bg-green-700 px-3 py-1 text-white disabled:opacity-50">{loading==='import'?'…':'Importer'}</button>
      </div>
    </div>
  );
}
