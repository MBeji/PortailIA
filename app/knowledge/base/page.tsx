import { listKnowledge } from '../../../lib/knowledge';
import Card from '../../../components/ui/Card';
import Link from 'next/link';
import { Badge } from '../../../components/ui/Badge';

export default async function KnowledgeBasePage({ searchParams }: { searchParams?: { q?: string }}) {
  const items = await listKnowledge(searchParams?.q || '');
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Base de connaissance</h2>
          <p className="text-xs text-gray-500">Articles internes et bonnes pratiques</p>
        </div>
        <form className="w-full md:w-72">
          <input name="q" placeholder="Recherche..." defaultValue={searchParams?.q} className="w-full rounded border px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500" />
        </form>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((i: any) => (
          <Link key={i.slug} href={`/knowledge/base/${i.slug}`} className="group">
            <Card className="flex h-full flex-col gap-2 transition group-hover:shadow-md">
              <h3 className="font-medium text-sm text-gray-800 group-hover:text-primary-700 dark:group-hover:text-primary-300">{i.title}</h3>
              <div className="flex flex-wrap gap-1">
                {i.tags.map((t: string) => <Badge key={t} variant="neutral">{t}</Badge>)}
              </div>
              <p className="line-clamp-4 text-[13px] leading-snug text-gray-600">{i.content.slice(0,240)}...</p>
            </Card>
          </Link>
        ))}
        {!items.length && <div className="text-sm text-gray-500">Aucun résultat</div>}
      </div>
    </div>
  );
}
