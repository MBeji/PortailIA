import { NextRequest, NextResponse } from 'next/server';
import { listKnowledge } from '../../../../lib/knowledge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  const items = await listKnowledge(q);
  return NextResponse.json(items);
}
