"use client";
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface Option { value: string; label: string; level: number }
interface Question { id: string; text: string; weight: number; category?: string; options: Option[] }
interface Questionnaire { department: string; questions: Question[] }

export default function QuestionnaireEditor({ questionnaire }: { questionnaire: Questionnaire }) {
  const qc = useQueryClient();
  const [q, setQ] = useState<Questionnaire>(questionnaire);
  const [editing, setEditing] = useState<Question | null>(null);
  const [newId, setNewId] = useState('');
  const defaultScaleOptions: Option[] = [
    { value: '0', label: '0 - Inexistant', level: 0 },
    { value: '1', label: '1 - Initial', level: 1 },
    { value: '2', label: '2 - Basique', level: 2 },
    { value: '3', label: '3 - Intermédiaire', level: 3 },
    { value: '4', label: '4 - Avancé', level: 4 },
    { value: '5', label: '5 - Excellence', level: 5 }
  ];

  const saveQuestion = useMutation({
    mutationFn: async (question: Question) => {
      const res = await fetch(`/api/questionnaires/${q.department}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(question) });
      if(!res.ok) throw new Error('save failed');
      return res.json();
    },
    onSuccess: (saved: Question) => {
      setQ(cur => ({ ...cur, questions: cur.questions.some(x=>x.id===saved.id) ? cur.questions.map(x=>x.id===saved.id?saved:x) : [...cur.questions, saved] }));
      setEditing(null);
      qc.invalidateQueries();
    }
  });

  const deleteQuestion = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/questionnaires/${q.department}?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      if(!res.ok) throw new Error('delete failed');
      return res.json();
    },
    onSuccess: (_: any, id: string) => {
      setQ(cur => ({ ...cur, questions: cur.questions.filter(x=>x.id!==id) }));
    }
  });

  const startEdit = (question?: Question) => {
    if (question) {
      // If question has no options, seed default scale
      setEditing({ ...question, options: (question.options && question.options.length ? question.options : defaultScaleOptions) });
    } else {
      setEditing({ id: newId || 'new.question', text: '', weight: 1, category: '', options: defaultScaleOptions });
    }
  };

  const updateEditing = (patch: Partial<Question>) => {
    if(!editing) return; setEditing({ ...editing, ...patch });
  };

  const addOption = () => { if(editing) updateEditing({ options: [...editing.options, { value: 'value', label: 'Label', level: 0 }] }); };
  const updateOption = (idx: number, patch: Partial<Option>) => { if(editing) { const next = editing.options.slice(); next[idx] = { ...next[idx], ...patch }; updateEditing({ options: next }); } };
  const removeOption = (idx: number) => { if(editing){ const next = editing.options.filter((_,i)=>i!==idx); updateEditing({ options: next }); } };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold capitalize">Éditer: {q.department}</h2>
        <input className="border px-2 py-1 text-xs" placeholder="nouvel id" value={newId} onChange={e=>setNewId(e.target.value)} />
        <button disabled={!newId} onClick={()=>{ startEdit({ id: newId, text: '', weight: 1, options: [] }); setNewId(''); }} className="text-xs rounded bg-blue-600 px-2 py-1 text-white disabled:opacity-40">Nouvelle question</button>
      </div>
      <ul className="divide-y rounded border bg-white">
        {q.questions.map(qu => (
          <li key={qu.id} className="p-3 flex flex-col gap-1">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{qu.id}</p>
                <p className="text-[10px] uppercase tracking-wide text-gray-500">{qu.category || '—'}</p>
                <p className="text-xs text-gray-600 line-clamp-2">{qu.text}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>startEdit(qu)} className="text-xs text-blue-600 hover:underline">Modifier</button>
                <button onClick={()=>deleteQuestion.mutate(qu.id)} className="text-xs text-red-600 hover:underline">Suppr</button>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 text-[10px] text-gray-500">
              {qu.options.map(o => <span key={o.value} className="rounded bg-gray-100 px-1 py-0.5">{o.label}:{o.level}</span>)}
            </div>
          </li>
        ))}
        {q.questions.length === 0 && <li className="p-4 text-center text-xs text-gray-500">Aucune question</li>}
      </ul>
      {editing && (
        <div className="rounded border bg-white p-4 space-y-3">
          <h3 className="text-sm font-semibold">{editing.id}</h3>
          <label className="block text-xs font-medium">Intitulé
            <textarea value={editing.text} onChange={e=>updateEditing({ text: e.target.value })} className="mt-1 w-full rounded border px-2 py-1 text-xs" rows={3} />
          </label>
          <label className="block text-xs font-medium">Catégorie
            <input value={editing.category||''} onChange={e=>updateEditing({ category: e.target.value })} className="mt-1 w-full rounded border px-2 py-1 text-xs" placeholder="ex: Forecasting / Personnalisation" />
          </label>
          <label className="block text-xs font-medium">Poids
            <input type="number" value={editing.weight} onChange={e=>updateEditing({ weight: parseFloat(e.target.value) })} className="mt-1 w-20 rounded border px-2 py-1 text-xs" />
          </label>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">Options</span>
              <button onClick={addOption} className="text-xs text-blue-600">+ Option</button>
            </div>
            <div className="space-y-2">
              {editing.options.map((o,idx)=>(
                <div key={idx} className="flex items-center gap-2">
                  <input value={o.value} onChange={e=>updateOption(idx,{ value: e.target.value })} className="w-24 rounded border px-1 py-0.5 text-[10px]" />
                  <input value={o.label} onChange={e=>updateOption(idx,{ label: e.target.value })} className="flex-1 rounded border px-1 py-0.5 text-[10px]" />
                  <input type="number" value={o.level} onChange={e=>updateOption(idx,{ level: parseInt(e.target.value,10) })} className="w-16 rounded border px-1 py-0.5 text-[10px]" />
                  <button onClick={()=>removeOption(idx)} className="text-[10px] text-red-600">x</button>
                </div>
              ))}
              {editing.options.length === 0 && <p className="text-[10px] text-gray-500">Aucune option</p>}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={()=> editing && saveQuestion.mutate(editing)} className="rounded bg-green-600 px-3 py-1 text-xs text-white disabled:opacity-50" disabled={saveQuestion.isPending}>Enregistrer</button>
            <button onClick={()=>setEditing(null)} className="rounded border px-3 py-1 text-xs">Annuler</button>
          </div>
        </div>
      )}
    </div>
  );
}
