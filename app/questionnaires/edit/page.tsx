import React from 'react';
import Link from 'next/link';
import { getAllQuestionnaires } from '../../../lib/questionnaire';

export const dynamic = 'force-dynamic';

export default async function EditQuestionnairesPage() {
  const list = await getAllQuestionnaires();
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Édition des questionnaires</h2>
      <QuestionnaireAdminActions />
      <ul className="list-disc pl-5 text-sm">
        {list.map(q => (
          <li key={q.department}>
            <Link className="text-blue-600 hover:underline" href={`/questionnaires/edit/${q.department}`}>{q.department} ({q.questionCount} questions)</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function QuestionnaireAdminActions() {
  async function createAction(formData: FormData) {
    'use server';
    const dep = formData.get('dep')?.toString().trim();
    if(!dep) return;
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/questionnaires/admin`, { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ action:'create', department: dep }) });
  }
  async function renameAction(formData: FormData) {
    'use server';
    const from = formData.get('from')?.toString().trim();
    const to = formData.get('to')?.toString().trim();
    if(!from || !to) return;
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/questionnaires/admin`, { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ action:'rename', from, to }) });
  }
  async function deleteAction(formData: FormData) {
    'use server';
    const dep = formData.get('depdel')?.toString().trim();
    if(!dep) return;
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/questionnaires/admin`, { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ action:'delete', department: dep }) });
  }
  async function importAction(formData: FormData) {
    'use server';
    const json = formData.get('json')?.toString();
    const override = formData.get('override') === 'on';
    if(!json) return;
    let payload: any = null;
    try { payload = JSON.parse(json); } catch { return; }
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/questionnaires/admin`, { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ action:'import', questionnaire: payload, override }) });
  }
  return (
    <div className="grid gap-4 rounded border bg-white p-4 text-xs md:grid-cols-2">
      <form action={createAction} className="space-y-1">
        <p className="font-semibold">Créer</p>
        <input name="dep" placeholder="department" className="w-full rounded border px-2 py-1" />
        <button className="rounded bg-primary-600 px-3 py-1 text-white">Créer</button>
      </form>
      <form action={renameAction} className="space-y-1">
        <p className="font-semibold">Renommer</p>
        <div className="flex gap-2">
          <input name="from" placeholder="ancien" className="w-1/2 rounded border px-2 py-1" />
          <input name="to" placeholder="nouveau" className="w-1/2 rounded border px-2 py-1" />
        </div>
        <button className="rounded bg-amber-600 px-3 py-1 text-white">Renommer</button>
      </form>
      <form action={deleteAction} className="space-y-1">
        <p className="font-semibold">Supprimer</p>
        <input name="depdel" placeholder="department" className="w-full rounded border px-2 py-1" />
        <button className="rounded bg-red-600 px-3 py-1 text-white">Supprimer</button>
      </form>
      <form action={importAction} className="space-y-1 md:col-span-2">
        <p className="font-semibold">Importer (JSON)</p>
        <textarea name="json" rows={6} placeholder='{"department":"marketing","questions":[...]}' className="w-full rounded border px-2 py-1 font-mono text-[11px]" />
        <label className="flex items-center gap-2"><input type="checkbox" name="override" /> <span>Écraser si existe</span></label>
        <button className="rounded bg-green-700 px-3 py-1 text-white">Importer</button>
        <div className="text-[11px] text-gray-500">Export: GET /api/questionnaires/admin?department=dep</div>
      </form>
    </div>
  );
}
