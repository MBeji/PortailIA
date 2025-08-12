import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { computeDepartmentScore } from '../../../lib/scoring';
import { upsertAnswer, saveDepartmentScores, getMission, createMissionWithCompany } from '../../../lib/repository';

// Ensure this is always dynamic (SQLite not available at build time on Vercel)
export const dynamic = 'force-dynamic';

const payloadSchema = z.object({
  missionId: z.string().optional(),
  company: z.string().optional(),
  title: z.string().optional(),
  department: z.string(),
  answers: z.array(z.object({
    questionId: z.string(),
    value: z.string(),
    weight: z.number(),
    level: z.number().int()
  }))
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = payloadSchema.safeParse(json);
    if(!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    let { missionId } = parsed.data;
    if (!missionId) {
      const companyName = parsed.data.company || 'Entreprise Demo';
      const title = parsed.data.title || `Mission ${new Date().toISOString().slice(0,10)}`;
      const mission = await createMissionWithCompany(companyName, title);
      missionId = mission.id;
    } else {
      const mission = await getMission(missionId);
      if(!mission) return NextResponse.json({ error: 'Mission inconnue' }, { status: 404 });
    }
  const { department, answers } = parsed.data;
    for (const a of answers) {
      await upsertAnswer(missionId, department, a);
    }
    await saveDepartmentScores(missionId, department);
  // Default scale 0..5 with N/A ignored (level < 0)
  const score = computeDepartmentScore(answers.map(a => ({ weight: a.weight, level: a.level ?? -1, maxLevel: 5 })));
    return NextResponse.json({ missionId, department, score });
  } catch (e:any) {
    console.error('Submit API error', e);
    return NextResponse.json({ error: 'Internal error', detail: e?.message }, { status: 500 });
  }
}
