import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

interface Params { params: { id: string } }

export async function PATCH(req: NextRequest, { params }: Params) {
  const json = await req.json().catch(()=>null) || {};
  const data: any = {};
  if(typeof json.title === 'string' && json.title.trim()) data.title = json.title.trim();
  if(typeof json.status === 'string' && json.status.trim()) data.status = json.status.trim();
  if(!Object.keys(data).length) return NextResponse.json({ error: 'Nothing to update'}, { status: 400 });
  try {
    const updated = await prisma.mission.update({ where: { id: params.id }, data });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Mission not found' }, { status: 404 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const id = params.id;
  try {
    // Delete dependent records first
    await prisma.recommendation.deleteMany({ where: { missionId: id } });
    await prisma.answer.deleteMany({ where: { missionId: id } });
    await prisma.departmentScore.deleteMany({ where: { missionId: id } });
    await prisma.mission.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Mission not found' }, { status: 404 });
  }
}
