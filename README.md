# Portail IA - Plateforme d'Audit de Maturité Digitale & IA

Application interne permettant à un cabinet de conseil de réaliser, de bout en bout, un audit de maturité digitale & IA, de générer un plan d'action priorisé et de consulter une base de connaissances structurée.

## Objectifs
- Questionnaires dynamiques par département & secteur
- Calcul de scores de maturité (département & global)
- Recommandations & priorisation (Impact / Faisabilité / ROI)
- Génération d'un plan d'action exportable (PDF / DOCX - stub initial)
- Base de connaissances (recherche full-text simple + stub IA conversationnelle)
- Gestion multi-missions / multi-consultants

## Stack Technique (MVP)
- **Frontend / Backend**: Next.js 14 (App Router, TypeScript)
- **DB**: SQLite (par défaut via Prisma ORM) – option ultérieure PostgreSQL si besoin multi-utilisateurs concurrent
- **Auth**: (Déférée) Aucune authentification requise pour la consultation et l'audit ; sera ajoutée plus tard uniquement pour l'enregistrement / gestion avancée de projets et rôles.
- **UI**: Tailwind CSS, composants utilitaires minimalistes
- **Recherche**: Filtrage + score simple; future extension vers vecteurs / LLM
- **Exports**: docx / pdf (placeholders, branchement futur sur génération côté serveur)

## Démarrage (SQLite par défaut)
1. Copier `.env.example` en `.env.local` (la variable `DATABASE_URL` pointe déjà vers `file:./dev.db`).
2. Installer les dépendances:
  ```bash
  npm install
  ```
3. Générer le client Prisma:
  ```bash
  npx prisma generate
  ```
4. Créer / appliquer le schéma (migration initiale):
  ```bash
  npx prisma migrate dev --name init
  ```
5. Lancer le serveur de dev:
  ```bash
  npm run dev
  ```

### Passer (optionnel) à PostgreSQL ultérieurement
1. Modifier `provider` dans `prisma/schema.prisma` en `postgresql` et ajuster `DATABASE_URL` (ex: `postgresql://user:password@localhost:5432/portail_ia`).
2. Lancer un conteneur Postgres (voir ancien bloc Docker) ou un service managé.
3. `npx prisma migrate dev --name switch-to-postgres`.

> Le fichier `docker-compose.yml` reste présent mais n'est plus nécessaire pour l'usage SQLite local.

## Structure
```
app/
  layout.tsx
  page.tsx (Accueil / Dashboard)
  api/
    questionnaires/route.ts
    submit/route.ts
    recommendations/route.ts
    knowledge/search/route.ts
  (questionnaires)/questionnaires/[department]/page.tsx
  plan/action/page.tsx
  knowledge/base/page.tsx
data/
  questionnaires/*.json
## Questionnaires disponibles (MVP)
- rh
- finance
- operations
- marketing
- ventes
- service_client
- produit_innovation
- rfp

  knowledge/base/*.md
lib/
  scoring.ts
  recommendations.ts
  questionnaire.ts
  knowledge.ts
prisma/schema.prisma
```

## Modèle de Données (extrait)
- Company, Mission, DepartmentScore, Answer, Recommendation, KnowledgeItem

Voir `prisma/schema.prisma` pour le détail.

## Calcul de la Maturité
Chaque question possède:
- weight (importance relative)
- level (0-5) selon la réponse choisie
Score département = somme(weight * level) / somme(weight * maxLevel) normalisée sur 100.
Score global = moyenne pondérée par la taille ou pondération par criticité (extension future).

## Recommandations
Algorithme MVP (heuristique):
1. Identifier les questions < seuil (ex: <40%)
2. Mapper vers actions (dictionnaire règles)
3. Calculer priorité = f(impact, faisabilité, ROI_estimé)
4. Retourner trié desc par priorité.

## Roadmap (Prochaines étapes)
- Agrégation et enrichissement recommandations (stockage + priorisation fine)
- Génération DOCX / PDF enrichie (charte graphique, annexes)
- Interface édition questionnaires (CRUD + versionning)
- IA conversationnelle sur base de connaissances (LLM + embeddings)
- Paramétrage pondérations secteur / taille d'entreprise
- Tableau de bord synthèse multi-missions
- Authentification / SSO (dernière étape seulement si besoin de sécuriser l'enregistrement privé)
- Gestion des rôles (Consultant, Manager, Admin Connaissance) post-auth

## Licence
Interne - Usage restreint (à préciser).

# PortailIA

Plateforme interne d'audit de maturité digitale & usage de l'IA permettant :

- Création de missions et entreprises
- Questionnaire multi-départements (13+ domaines) avec sauvegarde auto & scoring dynamique
- Calcul des scores par département & global + analytics (radar / barres)
- Génération automatique de recommandations priorisées (phase, priorité)
- Plan d'action interactif (édition statut / effort, filtrage, tri) + export DOCX
- Base de connaissance (guides méthodo, interviews, documents requis, prestations sectorielles)

## Stack
- Next.js 14 (App Router) / TypeScript / React Server & Client Components
- Tailwind CSS (dark mode)
- Prisma ORM + SQLite (dev)
- React Query (caching client)
- Chart.js + react-chartjs-2
- docx (export Word)

## Structure principale
```
app/
  api/ ... routes d'API (missions, questionnaires, plan, export, progress)
  knowledge/base/ ... index & détail articles
  questionnaires/ ... navigation & formulaires par département
components/ ... UI réutilisable + navigation + analytics
lib/ ... logique métier (scoring, recommandations, repository, knowledge)
data/questionnaires/ ... questions JSON par département
data/knowledge/base/ ... markdown base de connaissance
prisma/schema.prisma ... modèle de données
```

## Démarrage
1. Installer dépendances : `npm install`
2. Générer client Prisma : `npx prisma generate`
3. Lancer : `npm run dev`
4. Accéder : http://localhost:3000

## Prochaines améliorations
- Rendu markdown enrichi (titres, listes, tableaux) + export PDF
- Filtrage avancé / tags knowledge base
- Authentification & rôles
- Benchmarks cibles & écarts vs objectif
- Optimisations perf (lazy loading charts, code splitting)

## Licence
Usage interne.
