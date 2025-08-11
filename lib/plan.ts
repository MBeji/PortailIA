// Simple phase derivation based on priority score
export function phaseFromPriority(priority: number) {
  if(priority > 15) return 'Court terme';
  if(priority > 8) return 'Moyen terme';
  return 'Long terme';
}

export const ALLOWED_STATUSES = ['TODO','IN_PROGRESS','DONE'] as const;
export type RecommendationStatus = typeof ALLOWED_STATUSES[number];
