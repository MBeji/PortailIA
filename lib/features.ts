// Feature flags / configuration centrale
// Auth différée : accès ouvert. Activer plus tard pour limiter la persistance.

export const features = {
  auth: {
    enabled: false,          // mettre true quand NextAuth sera intégré
    requireAuthToSave: false // passera à true si on limite la création / édition
  }
} as const;

export function canPersist(): boolean {
  if(!features.auth.enabled) return true;
  return !features.auth.requireAuthToSave; // placeholder futur: vérifier session
}
