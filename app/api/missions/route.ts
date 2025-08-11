import { NextResponse } from 'next/server';
import { listMissions } from '../../../lib/repository';

export async function GET() {
  const missions = await listMissions();
  return NextResponse.json(missions);
}
