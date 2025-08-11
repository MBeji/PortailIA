import React from 'react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function KnowledgeAdminPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Administration - Base de connaissance</h1>
        <Link href="/knowledge/base" className="text-sm underline">← Retour base</Link>
      </div>
      <KnowledgeCreator />
      <p className="text-xs text-gray-500">Les fichiers markdown existants dans data/knowledge/base restent prioritaires si même slug.</p>
    </div>
  );
}

function KnowledgeCreator() {
  async function action(formData: FormData) {
    'use server';
    const title = formData.get('title')?.toString().trim();
    const slug = formData.get('slug')?.toString().trim();
    const tags = formData.get('tags')?.toString().trim();
    const content = formData.get('content')?.toString();
    if (!title || !slug || !content) { return; }
    await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/knowledge`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, slug, content, tags }) });
  }
  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="block text-xs font-medium mb-1">Titre</label>
        <input name="title" required className="w-full rounded border px-3 py-2 text-sm" placeholder="Titre de l'article" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-xs font-medium mb-1">Slug</label>
          <input name="slug" required className="w-full rounded border px-3 py-2 text-sm" placeholder="ex: guide-data-gov" />
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Tags (séparés par des virgules)</label>
            <input name="tags" className="w-full rounded border px-3 py-2 text-sm" placeholder="stratégie, gouvernance" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium mb-1">Contenu (Markdown)</label>
        <textarea name="content" required rows={14} className="w-full rounded border px-3 py-2 font-mono text-xs" placeholder="# Titre\n\nVotre contenu..."></textarea>
      </div>
      <button type="submit" className="rounded bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">Créer</button>
    </form>
  );
}
