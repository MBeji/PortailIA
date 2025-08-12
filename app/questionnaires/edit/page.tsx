import React from 'react';
import Link from 'next/link';
import { getAllQuestionnaires } from '../../../lib/questionnaire';
import QuestionnaireAdminActionsClient from '../../../components/QuestionnaireAdminActions';

export const dynamic = 'force-dynamic';

export default async function EditQuestionnairesPage() {
  const list = await getAllQuestionnaires();
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Édition des questionnaires</h2>
  <QuestionnaireAdminActionsClient />
      <ul className="list-disc pl-5 text-sm">
        {list.map(q => (
          <li key={q.department}>
            <Link className="text-blue-600 hover:underline" href={`/questionnaires/edit/${q.department}`}>{q.department} ({q.questionCount} questions)</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
 
