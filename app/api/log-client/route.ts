import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // eslint-disable-next-line no-console
    console.error('[client-error]', JSON.stringify(body));
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: 'log failed', detail: e?.message }, { status: 400 });
  }
}
