import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { listKnowledge } from '../../../lib/knowledge';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();
  if(!q) return NextResponse.json({ missions: [], recommendations: [], knowledge: [] });
  const missions = await prisma.mission.findMany({
    where: { OR: [ { title: { contains: q } }, { company: { name: { contains: q } } } ] },
    include: { company: true },
    take: 10
  });
  const recommendations = await prisma.recommendation.findMany({
    where: { OR: [ { title: { contains: q } }, { description: { contains: q } } ] },
    take: 15,
    orderBy: { priority: 'desc' }
  });
  const knowledge = await listKnowledge(q);
  return NextResponse.json({
    missions: missions.map(m => ({ id: m.id, title: m.title, company: m.company?.name })),
    recommendations: recommendations.map(r => ({ id: r.id, title: r.title, department: r.department, priority: r.priority })),
    knowledge: knowledge.slice(0,15).map(k => ({ slug: k.slug, title: k.title, tags: k.tags }))
  });
}
