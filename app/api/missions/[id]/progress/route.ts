import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { DEPARTMENTS } from '../../../../../lib/departments';
import { getQuestionnaire } from '../../../../../lib/questionnaire';

interface Params { params: { id: string } }

export async function GET(_req: Request, { params }: Params) {
  const missionId = params.id;
  const answers = await prisma.answer.findMany({ where: { missionId } });
  const byDept: Record<string, number> = {};
  answers.forEach(a => { byDept[a.department] = (byDept[a.department]||0)+1; });
  const result = await Promise.all(DEPARTMENTS.map(async d => {
    const q = await getQuestionnaire(d.id);
    const total = q?.questions?.length || 0;
    const answered = byDept[d.id] || 0;
    const percent = total ? (answered / total) * 100 : 0;
    return { department: d.id, answered, total, percent };
  }));
  const globalAnswered = result.reduce((a,r)=>a + r.answered,0);
  const globalTotal = result.reduce((a,r)=>a + r.total,0);
  const globalPercent = globalTotal ? (globalAnswered / globalTotal) * 100 : 0;
  return NextResponse.json({ missionId, global: { answered: globalAnswered, total: globalTotal, percent: globalPercent }, departments: result });
}
