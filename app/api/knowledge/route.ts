import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { listKnowledge } from '../../../lib/knowledge';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  const items = await listKnowledge(q);
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, slug, content, tags } = body;
    if (!title || !slug || !content) return NextResponse.json({ error: 'title, slug, content requis' }, { status: 400 });
    const existing = await prisma.knowledgeItem.findUnique({ where: { slug } });
    if (existing) return NextResponse.json({ error: 'Slug déjà utilisé' }, { status: 409 });
    const item = await prisma.knowledgeItem.create({ data: { title, slug, content, tags: Array.isArray(tags) ? tags.join(',') : (tags || '') } });
    return NextResponse.json(item, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: 'Erreur création', detail: e?.message }, { status: 500 });
  }
}
