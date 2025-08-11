import { NextResponse } from 'next/server';
import { listMissions } from '../../../lib/repository';

// Prevent Next.js from attempting to prerender this API route at build time (SQLite not available then)
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const missions = await listMissions();
    return NextResponse.json(missions);
  } catch (e:any) {
    console.error('GET /api/missions error', e);
    return NextResponse.json({ error: 'DB_ERROR', detail: e?.message }, { status: 500 });
  }
}
