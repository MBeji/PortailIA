import { NextResponse } from 'next/server';
import { getMission, listRecommendations } from '../../../../../lib/repository';

interface Params { params: { id: string } }

export async function GET(_: Request, { params }: Params) {
  const mission = await getMission(params.id);
  if(!mission) return NextResponse.json({ error: 'Mission inconnue' }, { status: 404 });
  const recs = await listRecommendations(params.id);
  // Basic enrichment: derive phase from priority
  const enriched = recs.map(r => ({
    ...r,
    phase: r.priority > 15 ? 'Court terme' : r.priority > 8 ? 'Moyen terme' : 'Long terme'
  }));
  return NextResponse.json({ missionId: params.id, items: enriched });
}
