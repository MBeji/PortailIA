import { NextResponse } from 'next/server';
import { getAllQuestionnaires } from '../../../lib/questionnaire';

export async function GET() {
  const list = await getAllQuestionnaires();
  return NextResponse.json(list);
}
