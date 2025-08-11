import { NextResponse } from 'next/server';
import { prisma } from '../../../../../../lib/prisma';
import { getMission } from '../../../../../../lib/repository';
import { ALLOWED_STATUSES } from '../../../../../../lib/plan';

interface Params { params: { id: string; recId: string } }

export async function PATCH(req: Request, { params }: Params) {
  const mission = await getMission(params.id);
  if(!mission) return NextResponse.json({ error: 'Mission inconnue' }, { status: 404 });
  const body = await req.json().catch(()=>({}));
  const { status, effort } = body || {};
  const updateData: any = {};
  if(status) {
    if(!ALLOWED_STATUSES.includes(status)) return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
    updateData.status = status;
  }
  if(typeof effort === 'number') {
    updateData.effort = Math.min(5, Math.max(1, effort));
  }
  if(!Object.keys(updateData).length) return NextResponse.json({ error: 'Aucune mise à jour' }, { status: 400 });
  const rec = await prisma.recommendation.update({ where: { id: params.recId }, data: updateData });
  return NextResponse.json(rec);
}
