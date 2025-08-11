import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getKnowledge } from '../../../../lib/knowledge';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const item = await getKnowledge(params.slug);
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const body = await req.json();
    const { title, content, tags } = body;
    const existing = await prisma.knowledgeItem.findUnique({ where: { slug: params.slug } });
    if (!existing) return NextResponse.json({ error: 'Not found (DB only, fichiers non modifiables)' }, { status: 404 });
    const updated = await prisma.knowledgeItem.update({ where: { slug: params.slug }, data: { title: title ?? existing.title, content: content ?? existing.content, tags: Array.isArray(tags) ? tags.join(',') : (tags ?? existing.tags) } });
    return NextResponse.json(updated);
  } catch (e: any) {
    return NextResponse.json({ error: 'Erreur mise à jour', detail: e?.message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    await prisma.knowledgeItem.delete({ where: { slug: params.slug } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: 'Erreur suppression', detail: e?.message }, { status: 500 });
  }
}
