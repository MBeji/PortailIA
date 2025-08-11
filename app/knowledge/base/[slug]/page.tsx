import { notFound } from 'next/navigation';
import { getKnowledge } from '../../../../lib/knowledge';
import Link from 'next/link';
import { Badge } from '../../../../components/ui/Badge';

interface Props { params: { slug: string } }

export default async function KnowledgeItemPage({ params }: Props) {
  const item = await getKnowledge(params.slug);
  if(!item) return notFound();
  const paragraphs = item.content.split(/\n{2,}/).map(p=>p.trim()).filter(Boolean);
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <Link href="/knowledge/base" className="underline">Retour</Link>
        </div>
        <h1 className="text-xl font-semibold">{item.title}</h1>
        <div className="flex flex-wrap gap-1">{item.tags.map(t => <Badge key={t} variant="neutral">{t}</Badge>)}</div>
      </div>
      <div className="prose prose-sm max-w-none dark:prose-invert">
        {paragraphs.map((p,i)=>(<p key={i}>{p}</p>))}
      </div>
    </div>
  );
}
