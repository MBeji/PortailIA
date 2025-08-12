import { listKnowledge } from '../../../lib/knowledge';
import Card from '../../../components/ui/Card';
import Link from 'next/link';
import { Badge } from '../../../components/ui/Badge';
import React from 'react';
import AdminEditKnowledgeLink from '../../../components/AdminEditKnowledgeLink';

interface KBSearchParams { q?: string; tag?: string }
export default async function KnowledgeBasePage({ searchParams }: { searchParams?: KBSearchParams }) {
  const q = searchParams?.q || '';
  const items: any[] = await listKnowledge(q);
  const allTags: string[] = Array.from(new Set(items.flatMap((i:any)=> i.tags as string[]))).sort();
  const activeTag: string = searchParams?.tag || '';
  const filtered = activeTag ? items.filter((i:any)=> (i.tags as string[]).includes(activeTag)) : items;
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Base de connaissance</h2>
          <p className="text-xs text-gray-500">Articles internes et bonnes pratiques ({filtered.length} / {items.length})</p>
        </div>
        <form className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
          <input name="q" placeholder="Recherche mots-clés..." defaultValue={q} className="w-full rounded border px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 md:w-64" />
          <select name="tag" defaultValue={activeTag} className="rounded border px-2 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500">
            <option value="">Tous les tags</option>
            {allTags.map((t:string)=> <option key={t} value={t}>{t}</option>)}
          </select>
          <button type="submit" className="rounded bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-primary-700">Filtrer</button>
        </form>
      </div>
      <div className="flex flex-wrap gap-2 text-[11px] text-gray-500">
        {allTags.map((t:string) => {
          const params: Record<string,string> = {};
          if(q) params.q = q;
          if(t !== activeTag) params.tag = t;
          const href = '?' + new URLSearchParams(params).toString();
          return <Link key={t} href={href} className={`rounded border px-2 py-1 ${t===activeTag?'bg-primary-600 text-white border-primary-600':'hover:bg-primary-50 dark:hover:bg-slate-700'}`}>{t}</Link>;
        })}
      </div>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((i: any) => (
          <div key={i.slug} className="group focus:outline-none focus:ring-2 focus:ring-primary-500 rounded relative">
            <Link href={`/knowledge/base/${i.slug}`}>
              <Card className="flex h-full flex-col gap-3 transition group-hover:shadow-md">
                <div>
                  <h3 className="font-semibold text-sm text-gray-800 group-hover:text-primary-700 dark:group-hover:text-primary-300 line-clamp-2">{i.title}</h3>
                  <p className="mt-1 text-[11px] uppercase tracking-wide text-gray-400">{i.tags.slice(0,3).join(' • ')}</p>
                </div>
                <p className="line-clamp-5 text-[13px] leading-snug text-gray-600">{i.content.slice(0,320)}...</p>
                <div className="mt-auto flex flex-wrap gap-1">
                  {i.tags.map((t: string) => <Badge key={t} variant="neutral">{t}</Badge>)}
                </div>
              </Card>
            </Link>
            {/* Admin-only quick edit link */}
            <div className="absolute right-2 top-2">
              <AdminEditKnowledgeLink slug={i.slug} />
            </div>
          </div>
        ))}
        {!filtered.length && <div className="text-sm text-gray-500">Aucun résultat</div>}
      </div>
    </div>
  );
}
