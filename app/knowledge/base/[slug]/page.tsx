import { notFound } from 'next/navigation';
import { getKnowledge } from '../../../../lib/knowledge';
import Link from 'next/link';
import { Badge } from '../../../../components/ui/Badge';
import AdminEditKnowledgeLink from '../../../../components/AdminEditKnowledgeLink';

interface Props { params: { slug: string } }

export default async function KnowledgeItemPage({ params }: Props) {
  const item = await getKnowledge(params.slug);
  if(!item) return notFound();
  const paragraphs = item.content.split(/\n{2,}/).map(p=>p.trim()).filter(Boolean);
  const showToc = item.headings && item.headings.length > 2;
  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      <article className="min-w-0 flex-1 space-y-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <Link href="/knowledge/base" className="underline">← Retour</Link>
            <span>Lecture ~ {item.readingMinutes} min • {item.wordCount} mots</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl font-semibold leading-tight tracking-tight">{item.title}</h1>
            <AdminEditKnowledgeLink slug={item.slug} />
          </div>
          <div className="flex flex-wrap gap-1">{item.tags.map(t => <Badge key={t} variant="neutral">{t}</Badge>)}</div>
        </div>
        <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: item.html }} />
      </article>
      {showToc && (
        <aside className="top-24 h-fit w-full max-w-xs shrink-0 rounded border bg-white/60 p-4 text-xs shadow-sm backdrop-blur dark:bg-slate-800/40 lg:sticky lg:block">
          <p className="mb-2 font-semibold text-gray-600 dark:text-gray-300">Sommaire</p>
          <nav className="space-y-1">
            {item.headings.map(h=> (
              <a key={h.id} href={`#${h.id}`} className={`block truncate rounded px-2 py-1 hover:bg-primary-50 dark:hover:bg-slate-700 ${h.depth>2?'pl-4 text-gray-500':'font-medium'}`}>{h.text}</a>
            ))}
          </nav>
        </aside>
      )}
    </div>
  );
}
