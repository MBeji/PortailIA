import { NextResponse } from 'next/server';
import { listMissions } from '../../../lib/repository';

// Prevent Next.js from attempting to prerender this API route at build time (SQLite not available then)
export const dynamic = 'force-dynamic';

export async function GET() {
  const missions = await listMissions();
  return NextResponse.json(missions);
}
