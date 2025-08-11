import { NextResponse } from 'next/server';
import { listAnswers } from '../../../../../lib/repository';

interface Params { params: { id: string }; searchParams?: { department?: string } }

export async function GET(req: Request, { params }: Params) {
  const { searchParams } = new URL(req.url);
  const department = searchParams.get('department') || undefined;
  const answers = await listAnswers(params.id, department);
  return NextResponse.json(answers.map(a => ({ questionId: a.questionId, value: a.value, level: a.level, weight: a.weight, department: a.department })));
}
