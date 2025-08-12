import { NextResponse } from 'next/server';
import { getQuestionnaire, saveQuestionnaire, upsertQuestion, deleteQuestion } from '../../../../lib/questionnaire';
import { z } from 'zod';

interface Params { params: { department: string } }

const questionnaireSchema = z.object({
  department: z.string(),
  questions: z.array(z.object({
    id: z.string(),
    text: z.string(),
    weight: z.number().min(0),
    category: z.string().optional(),
    options: z.array(z.object({ value: z.string(), label: z.string(), level: z.number().int().min(0).max(5) }))
  }))
});

const questionSchema = z.object({
  id: z.string(),
  text: z.string(),
  weight: z.number().min(0),
  category: z.string().optional(),
  options: z.array(z.object({ value: z.string(), label: z.string(), level: z.number().int().min(0).max(5) }))
});

export async function GET(_: Request, { params }: Params) {
  const q = await getQuestionnaire(params.department);
  if(!q) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(q);
}

export async function PUT(req: Request, { params }: Params) {
  const data = await req.json();
  const parsed = questionnaireSchema.safeParse(data);
  if(!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  if(parsed.data.department !== params.department) return NextResponse.json({ error: 'Department mismatch' }, { status: 400 });
  await saveQuestionnaire(params.department, parsed.data);
  return NextResponse.json(parsed.data);
}

export async function POST(req: Request, { params }: Params) {
  const data = await req.json();
  const parsed = questionSchema.safeParse(data);
  if(!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  const saved = await upsertQuestion(params.department, parsed.data);
  return NextResponse.json(saved);
}

export async function DELETE(req: Request, { params }: Params) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if(!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
  const ok = await deleteQuestion(params.department, id);
  if(!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
