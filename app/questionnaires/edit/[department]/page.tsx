import React from 'react';
import { notFound } from 'next/navigation';
import { getQuestionnaire } from '../../../../lib/questionnaire';
import Editor from '../../../../components/QuestionnaireEditor';

interface Props { params: { department: string } }

export const dynamic = 'force-dynamic';

export default async function EditDepartmentPage({ params }: Props) {
  const q = await getQuestionnaire(params.department);
  if(!q) return notFound();
  return <Editor questionnaire={q} />;
}
