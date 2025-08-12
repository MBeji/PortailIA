import { NextRequest, NextResponse } from 'next/server';
import { createQuestionnaire, deleteQuestionnaire, renameQuestionnaire, importQuestionnaire, getQuestionnaire } from '../../../../lib/questionnaire';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body || {};
    if (action === 'create') {
      const { department } = body;
      if(!department) return NextResponse.json({ error: 'department required' }, { status: 400 });
      const q = await createQuestionnaire(department);
      return NextResponse.json(q, { status: 201 });
    }
    if (action === 'delete') {
      const { department } = body;
      if(!department) return NextResponse.json({ error: 'department required' }, { status: 400 });
      await deleteQuestionnaire(department);
      return NextResponse.json({ ok: true });
    }
    if (action === 'rename') {
      const { from, to } = body;
      if(!from || !to) return NextResponse.json({ error: 'from/to required' }, { status: 400 });
      const q = await renameQuestionnaire(from, to);
      return NextResponse.json(q);
    }
    if (action === 'import') {
      const { questionnaire, override } = body;
      const res = await importQuestionnaire(questionnaire, { override: !!override });
      return NextResponse.json(res);
    }
    return NextResponse.json({ error: 'unknown action' }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: 'admin-failed', detail: e?.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dep = searchParams.get('department');
  if(!dep) return NextResponse.json({ error: 'department required' }, { status: 400 });
  const q = await getQuestionnaire(dep);
  if(!q) return NextResponse.json({ error: 'not found' }, { status: 404 });
  return NextResponse.json(q);
}
