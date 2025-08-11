import { NextResponse } from 'next/server';
import { Document, Packer, Paragraph, HeadingLevel, Table, TableRow, TableCell, WidthType } from 'docx';
import { getMissionWithAnswers, computeGlobalMissionScore, listRecommendations } from '../../../../../lib/repository';
import { phaseFromPriority } from '../../../../../lib/plan';

interface Params { params: { id: string } }

export async function GET(_: Request, { params }: Params) {
  const mission = await getMissionWithAnswers(params.id);
  if(!mission) return NextResponse.json({ error: 'Mission inconnue' }, { status: 404 });
  const scoring = await computeGlobalMissionScore(params.id);
  const recommandations = await listRecommendations(params.id) as any[];

  const deptRows = scoring.departments.map((d: any) => new TableRow({ children: [
    new TableCell({ children: [ new Paragraph(d.department) ] }),
    new TableCell({ children: [ new Paragraph(d.percent.toFixed(1) + '%') ] }),
    new TableCell({ children: [ new Paragraph('Niveau ' + d.level) ] })
  ]}));

  const answersByDept: Record<string, number> = {};
  mission.answers.forEach((a: any) => { answersByDept[a.department] = (answersByDept[a.department]||0)+1; });

  const doc = new Document({ sections: [ { children: [
    new Paragraph({ text: 'Rapport de Mission', heading: HeadingLevel.TITLE }),
    new Paragraph({ text: mission.title, heading: HeadingLevel.HEADING_1 }),
    new Paragraph({ text: `Entreprise: ${mission.companyId}` }),
    new Paragraph({ text: `Score global: ${scoring.globalPercent.toFixed(1)}%` }),
    new Paragraph({ text: 'Scores par département', heading: HeadingLevel.HEADING_2 }),
    new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [
      new TableRow({ children: [
        new TableCell({ children: [ new Paragraph('Département') ] }),
        new TableCell({ children: [ new Paragraph('Score %') ] }),
        new TableCell({ children: [ new Paragraph('Niveau') ] })
      ]}),
      ...deptRows
    ]}),
    new Paragraph({ text: 'Synthèse (placeholder)', heading: HeadingLevel.HEADING_2 }),
    new Paragraph({ text: 'Recommandations Priorisées', heading: HeadingLevel.HEADING_2 }),
    ...(recommandations.length ? [ new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [
      new TableRow({ children: [
        new TableCell({ children: [ new Paragraph('Dept') ] }),
        new TableCell({ children: [ new Paragraph('Titre') ] }),
        new TableCell({ children: [ new Paragraph('Priorité') ] }),
        new TableCell({ children: [ new Paragraph('Phase') ] }),
        new TableCell({ children: [ new Paragraph('Statut') ] })
      ]}),
      ...recommandations.map(r => new TableRow({ children: [
        new TableCell({ children: [ new Paragraph(r.department) ] }),
        new TableCell({ children: [ new Paragraph(r.title) ] }),
        new TableCell({ children: [ new Paragraph(r.priority.toFixed(2)) ] }),
        new TableCell({ children: [ new Paragraph(phaseFromPriority(r.priority)) ] }),
        new TableCell({ children: [ new Paragraph(r.status) ] }),
      ]}))
    ]}) ] : [ new Paragraph('Aucune recommandation générée.') ]),
    new Paragraph({ text: 'Statistiques Réponses', heading: HeadingLevel.HEADING_2 }),
    ...Object.entries(answersByDept).map(([dept,count]) => new Paragraph(`${dept}: ${count} réponses`)),
    new Paragraph({ text: 'Fin du rapport', heading: HeadingLevel.HEADING_3 })
  ] } ] });

  const buffer = await Packer.toBuffer(doc);
  const uint8 = new Uint8Array(buffer);
  return new NextResponse(new Blob([uint8]), {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename=mission-${params.id}.docx`
    }
  });
}
