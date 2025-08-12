import { prisma } from './prisma';
import { qualitativeLevel, computeDepartmentScore } from './scoring';
import { generateRecommendations } from './recommendations';

export async function ensureCompany(name: string) {
  const existing = await prisma.company.findFirst({ where: { name } });
  if (existing) return existing;
  return prisma.company.create({ data: { name } });
}

export async function createMissionWithCompany(companyName: string, title: string) {
  const company = await ensureCompany(companyName);
  return prisma.mission.create({ data: { companyId: company.id, title } });
}

export async function createMission(companyId: string, title: string) {
  return prisma.mission.create({ data: { companyId, title } });
}

export async function upsertAnswer(missionId: string, department: string, answer: { questionId: string; value: string; weight: number; level: number }) {
  const existing = await prisma.answer.findFirst({ where: { missionId, questionId: answer.questionId } });
  if (existing) {
    return prisma.answer.update({ where: { id: existing.id }, data: { value: answer.value, weight: answer.weight, level: answer.level, department } });
  }
  return prisma.answer.create({ data: { missionId, department, questionId: answer.questionId, value: answer.value, weight: answer.weight, level: answer.level } });
}

export async function saveDepartmentScores(missionId: string, department: string) {
  const answers = await prisma.answer.findMany({ where: { missionId, department } });
  const score = computeDepartmentScore(answers.map(a => ({ weight: a.weight, level: a.level ?? -1, maxLevel: 5 })));
  const level = qualitativeLevel(score.scorePercent);
  const existing = await prisma.departmentScore.findFirst({ where: { missionId, department } });
  const data = { score: score.score, maxScore: answers.filter(a=> (a.level ?? -1) >= 0).reduce((acc,a)=>acc + a.weight * 5,0), level };
  if (existing) return prisma.departmentScore.update({ where: { id: existing.id }, data });
  return prisma.departmentScore.create({ data: { missionId, department, ...data } });
}

export async function listMissionScores(missionId: string) {
  return prisma.departmentScore.findMany({ where: { missionId } });
}

export async function getMission(id: string) {
  return prisma.mission.findUnique({ where: { id } });
}

export async function listMissions() {
  return prisma.mission.findMany({ orderBy: { createdAt: 'desc' }, take: 50 });
}

export async function getMissionDepartmentScores(missionId: string) {
  const scores = await prisma.departmentScore.findMany({ where: { missionId } });
  return scores.map(s => ({
    department: s.department,
    score: s.score,
    maxScore: s.maxScore,
    percent: s.maxScore ? (s.score / s.maxScore) * 100 : 0,
    level: s.level
  }));
}

export async function computeGlobalMissionScore(missionId: string) {
  const scores = await getMissionDepartmentScores(missionId);
  if(!scores.length) return { globalPercent: 0, departments: [] as typeof scores };
  const globalPercent = scores.reduce((acc,s)=>acc + s.percent,0) / scores.length;
  return { globalPercent, departments: scores };
}

export async function getMissionWithAnswers(missionId: string) {
  return prisma.mission.findUnique({ where: { id: missionId }, include: { answers: true, departmentScores: true, company: true } });
}

export async function listAnswers(missionId: string, department?: string) {
  return prisma.answer.findMany({ where: { missionId, ...(department ? { department } : {}) } });
}

// --- Recommendations persistence ---
export async function generateAndPersistRecommendations(missionId: string, department?: string) {
  // Load answers (optionally filter department)
  const answers = await prisma.answer.findMany({ where: { missionId, ...(department ? { department } : {}) } });
  if(!answers.length) return [];
  // Simple gap heuristic: level <=2 considered gap
  const grouped: Record<string, { questionId: string; level: number; weight: number; department: string }[]> = {};
  answers.forEach(a => { (grouped[a.department] ||= []).push({ questionId: a.questionId, level: a.level, weight: a.weight, department: a.department }); });
  const persisted: any[] = [];
  for(const dept of Object.keys(grouped)) {
    if(department && dept !== department) continue;
    const gaps = grouped[dept].filter(g => g.level <= 2).map(g => ({ questionId: g.questionId, level: g.level, weight: g.weight }));
    if(!gaps.length) continue;
    const recs = generateRecommendations(dept, gaps);
    for(const r of recs) {
      // Upsert by missionId+questionId unique
  const existing = await prisma.recommendation.findFirst({ where: { missionId, /* @ts-ignore */ questionId: r.questionId } as any });
      if(existing) {
        const updated = await prisma.recommendation.update({ where: { id: existing.id }, data: { title: r.title, description: r.description, impact: r.impact, feasibility: r.feasibility, roiScore: r.roi, priority: r.priority, department: dept } });
        persisted.push(updated);
      } else {
  const created = await prisma.recommendation.create({ data: { missionId, department: dept, /* @ts-ignore */ questionId: r.questionId, title: r.title, description: r.description, impact: r.impact, feasibility: r.feasibility, roiScore: r.roi, priority: r.priority } as any });
        persisted.push(created);
      }
    }
  }
  return persisted;
}

export async function listRecommendations(missionId: string) {
  return prisma.recommendation.findMany({ where: { missionId }, orderBy: { priority: 'desc' } });
}
