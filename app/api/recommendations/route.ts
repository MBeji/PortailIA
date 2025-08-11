import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateRecommendations } from '../../../lib/recommendations';

const schema = z.object({
  department: z.string(),
  gaps: z.array(z.object({ questionId: z.string(), level: z.number(), weight: z.number() }))
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if(!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const recs = generateRecommendations(parsed.data.department, parsed.data.gaps);
  return NextResponse.json(recs);
}
