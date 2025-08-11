import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { getQuestionnaire } from '../../../../../lib/questionnaire';

export const dynamic = 'force-dynamic';

// GET /api/missions/:id/analytics
// Returns per-department percent scores + per-category weighted averages (0-100)
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const missionId = params.id;
  const answers = await prisma.answer.findMany({ where: { missionId } });
  if(!answers.length) return NextResponse.json({ missionId, departments: [], categories: [] });
  const deptGroups: Record<string, typeof answers> = {};
  answers.forEach(a => { (deptGroups[a.department] ||= []).push(a); });

  const departmentScores = Object.entries(deptGroups).map(([dept, list]) => {
    const max = list.reduce((acc,a)=> acc + a.weight * 5, 0);
    const score = list.reduce((acc,a)=> acc + a.weight * a.level, 0);
    return { department: dept, percent: max ? (score / max) * 100 : 0 };
  }).sort((a,b)=> b.percent - a.percent);

  const categoryAggregate: Record<string, { totalWeighted: number; totalMax: number }> = {};
  for(const dept of Object.keys(deptGroups)) {
    const q = await getQuestionnaire(dept);
    if(!q) continue;
    const questionMeta: Record<string, { category?: string; weight: number }> = {};
    q.questions.forEach((qq: any) => { questionMeta[qq.id] = { category: qq.category, weight: qq.weight }; });
    for(const a of deptGroups[dept]) {
      const meta = questionMeta[a.questionId];
      if(!meta) continue;
      const cat = meta.category || 'Autres';
      (categoryAggregate[cat] ||= { totalWeighted: 0, totalMax: 0 });
      categoryAggregate[cat].totalWeighted += meta.weight * a.level;
      categoryAggregate[cat].totalMax += meta.weight * 5;
    }
  }
  const categories = Object.entries(categoryAggregate).map(([category, v]) => ({ category, percent: v.totalMax ? (v.totalWeighted / v.totalMax) * 100 : 0 }))
    .sort((a,b)=> a.category.localeCompare(b.category));

  return NextResponse.json({ missionId, departments: departmentScores, categories });
}
