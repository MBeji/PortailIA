import { notFound } from 'next/navigation';
import { getQuestionnaire } from '../../../lib/questionnaire';
import QuestionnaireForm from '../../../components/QuestionnaireForm';
import AdminEditQuestionnaireLink from '../../../components/AdminEditQuestionnaireLink';
import QuestionnaireNav from '../../../components/QuestionnaireNav';

interface Props { params: { department: string } }

export default async function DepartmentQuestionnairePage({ params }: Props) {
  const q = await getQuestionnaire(params.department);
  if(!q) return notFound();
  return (
    <div className="grid gap-6 md:grid-cols-[220px_1fr]">
      <div><QuestionnaireNav /></div>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold capitalize">Questionnaire {params.department.replace('_',' ')}</h2>
          {/* Admin-only inline edit entry */}
          <AdminEditQuestionnaireLink department={params.department} />
        </div>
        <div className="rounded border bg-white p-3 text-xs text-gray-600">
          Échelle de maturité par défaut: 0 (inexistant) à 5 (excellence). Sélectionner N/A pour ignorer une question non applicable. Le score du département est la moyenne pondérée des niveaux sur 5, convertie en pourcentage; le score global est la moyenne des départements.
        </div>
        <QuestionnaireForm questionnaire={q} />
      </div>
    </div>
  );
}
