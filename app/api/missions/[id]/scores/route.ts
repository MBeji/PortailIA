import { NextResponse } from 'next/server';
import { computeGlobalMissionScore, getMission } from '../../../../../lib/repository';

export const dynamic = 'force-dynamic';

interface Params { params: { id: string } }

export async function GET(_: Request, { params }: Params) {
  const mission = await getMission(params.id);
  if(!mission) return NextResponse.json({ error: 'Mission inconnue' }, { status: 404 });
  const data = await computeGlobalMissionScore(params.id);
  return NextResponse.json({ missionId: params.id, ...data });
}
