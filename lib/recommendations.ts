interface Gap { questionId: string; level: number; weight: number }

const RULES: Record<string, { title: string; description: string; impact: number; feasibility: number; roi: number }> = {
  'rh.training': { title: 'Programme de formation IA', description: 'Mettre en place un curriculum IA structuré.', impact: 5, feasibility: 3, roi: 4 },
  'finance.forecasting': { title: 'Amélioration prévisions', description: 'Introduire modèles ML pour forecast mensuel.', impact: 4, feasibility: 3, roi: 4 },
};

export function generateRecommendations(department: string, gaps: Gap[]) {
  // MVP: map questionId prefix to rule
  return gaps.map(g => {
    const rule = RULES[g.questionId] || { title: `Amélioration ${g.questionId}`, description: 'Action correctrice à détailler.', impact: 3, feasibility: 3, roi: 3 };
    const priority = (rule.impact * 0.5 + rule.roi * 0.3 + rule.feasibility * 0.2) * (g.weight);
    return {
      department,
      questionId: g.questionId,
      title: rule.title,
      description: rule.description,
      impact: rule.impact,
      feasibility: rule.feasibility,
      roi: rule.roi,
      priority
    };
  }).sort((a,b) => b.priority - a.priority);
}
