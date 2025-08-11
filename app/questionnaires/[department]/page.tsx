import { notFound } from 'next/navigation';
import { getQuestionnaire } from '../../../lib/questionnaire';
import QuestionnaireForm from '../../../components/QuestionnaireForm';
import QuestionnaireNav from '../../../components/QuestionnaireNav';

interface Props { params: { department: string } }

export default async function DepartmentQuestionnairePage({ params }: Props) {
  const q = await getQuestionnaire(params.department);
  if(!q) return notFound();
  return (
    <div className="grid gap-6 md:grid-cols-[220px_1fr]">
      <div><QuestionnaireNav /></div>
      <div className="space-y-4">
        <h2 className="text-lg font-semibold capitalize">Questionnaire {params.department.replace('_',' ')}</h2>
        <QuestionnaireForm questionnaire={q} />
      </div>
    </div>
  );
}
