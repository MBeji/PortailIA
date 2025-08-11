interface AnswerScore { weight: number; level: number; maxLevel: number }

export function computeDepartmentScore(answers: AnswerScore[]) {
  if(!answers.length) return { score: 0, scorePercent: 0 };
  const totalWeighted = answers.reduce((acc,a) => acc + a.weight * a.level, 0);
  const totalPossible = answers.reduce((acc,a) => acc + a.weight * a.maxLevel, 0);
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
