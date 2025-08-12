interface AnswerScore { weight: number; level: number; maxLevel: number }

export function computeDepartmentScore(answers: AnswerScore[]) {
  if(!answers.length) return { score: 0, scorePercent: 0 };
  // Ignore N/A answers: convention level < 0 OR maxLevel <= 0
  const effective = answers.filter(a => a.level >= 0 && a.maxLevel > 0);
  if(!effective.length) return { score: 0, scorePercent: 0 };
  const totalWeighted = effective.reduce((acc,a) => acc + a.weight * a.level, 0);
  const totalPossible = effective.reduce((acc,a) => acc + a.weight * a.maxLevel, 0);
  const ratio = totalPossible === 0 ? 0 : totalWeighted / totalPossible;
  return { score: totalWeighted, scorePercent: ratio * 100 };
}

export function qualitativeLevel(percent: number) {
  if(percent >= 85) return 5;
  if(percent >= 70) return 4;
  if(percent >= 55) return 3;
  if(percent >= 40) return 2;
  if(percent >= 25) return 1;
  return 0;
}
