import { NextResponse } from 'next/server';
import { getMission } from '../../../../../../lib/repository';
import { generateAndPersistRecommendations, listRecommendations } from '../../../../../../lib/repository';

interface Params { params: { id: string } }

export async function POST(_: Request, { params }: Params) {
  const mission = await getMission(params.id);
  if(!mission) return NextResponse.json({ error: 'Mission inconnue' }, { status: 404 });
  await generateAndPersistRecommendations(params.id);
  const recs = await listRecommendations(params.id);
  return NextResponse.json({ missionId: params.id, count: recs.length, recommendations: recs });
}
