'use client';
import React, { useEffect, useState } from 'react';
import Button from './ui/Button';
import { Badge } from './ui/Badge';
import Card from './ui/Card';
import Skeleton from './ui/Skeleton';
import { useToast, MissionContext } from './Providers';
import { DEPARTMENTS } from '../lib/departments';

interface Question {
  id: string;
  text: string;
  weight: number;
  category?: string;
  options: { value: string; label: string; level: number }[];
}
interface Questionnaire { department: string; questions: Question[] }

export default function QuestionnaireForm({ questionnaire }: { questionnaire: Questionnaire }) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [scoreDept, setScoreDept] = useState<any>(null);
  const [globalScore, setGlobalScore] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const pushToast = useToast();
  const { department, questions } = questionnaire;
  const missionCtx = React.useContext(MissionContext);
  const missionId = missionCtx?.missionId || null;

  // Prefill existing answers when mission changes
  useEffect(() => {
    if(!missionId) return;
    (async()=>{
      try {
        const res = await fetch(`/api/missions/${missionId}/answers?department=${department}`);
        if(!res.ok) return;
        const data = await res.json();
        const map: Record<string,string> = {};
        data.forEach((a: any) => { map[a.questionId] = a.value; });
        setAnswers(map);
      } catch {/* ignore */}
    })();
  }, [missionId, department]);

  const onChange = (qid: string, value: string) => {
    setAnswers(prev => ({ ...prev, [qid]: value }));
  };

  // Auto submit per department when all answered or on each answer (incremental)
  const recomputeScores = async (partial?: boolean) => {
    const payload = {
      missionId: missionId || undefined,
      department,
      answers: questions.filter(q => answers[q.id]).map(q => ({
        questionId: q.id,
        value: answers[q.id],
        weight: q.weight,
        level: q.options.find(o => o.value === answers[q.id])?.level || 0
      }))
    };
    setSubmitting(true);
    try {
      const res = await fetch('/api/submit', { method: 'POST', body: JSON.stringify(payload) });
      const data = await res.json();
      if(res.ok) {
        setScoreDept(data);
  if(!missionCtx?.missionId && data.missionId) missionCtx?.setMissionId(data.missionId);
  missionCtx?.bumpProgress();
        pushToast(partial ? 'Mise à jour' : 'Score recalculé','info');
        // Fetch global score if mission exists
        const mid = missionCtx?.missionId || data.missionId;
        if(mid) {
          const g = await fetch(`/api/missions/${mid}/scores`);
          if(g.ok) {
            const gs = await g.json();
            setGlobalScore(gs);
          }
        }
      } else {
        pushToast('Erreur validation','error');
      }
    } catch {
      pushToast('Erreur réseau','error');
    } finally { setSubmitting(false); }
  };

  // Recompute automatically when answers change (debounced)
  useEffect(() => {
    if(!Object.keys(answers).length) return;
    const t = setTimeout(() => recomputeScores(true), 500);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers]);

  const answeredCount = questions.filter(q => answers[q.id]).length;
  const completion = Math.round((answeredCount / questions.length) * 100);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-xs">
          <div className="h-2 w-40 overflow-hidden rounded bg-gray-200">
            <div className="h-full bg-primary-600 transition-all" style={{ width: `${completion}%` }} />
          </div>
          <span className="font-medium text-gray-600">{answeredCount}/{questions.length} ({completion}%)</span>
        </div>
  <div className="flex items-center gap-2 text-xs">
    {missionId && globalScore && (
      <span className="rounded bg-gray-100 px-2 py-1 dark:bg-slate-700">Global: {globalScore.globalPercent?.toFixed(1)}%</span>
    )}
    {scoreDept && (
      <span className="rounded bg-primary-600/10 px-2 py-1 text-primary-700 dark:text-primary-300">{department}: {scoreDept.score.scorePercent?.toFixed(1) || scoreDept.score?.scorePercent?.toFixed(1) || scoreDept.score?.toFixed?.(1)}%</span>
    )}
    <Button onClick={()=>recomputeScores(false)} size="sm" disabled={submitting || !questions.every(q => answers[q.id])} loading={submitting}>Forcer recalcul</Button>
  </div>
      </div>
      <div className="space-y-4">
        {questions.map(q => (
          <Card key={q.id} className="p-0">
            <div className="border-b px-4 py-2">
              <p className="text-sm font-medium text-gray-800">{q.text}</p>
              {q.category && <div className="mt-1"><Badge variant="neutral">{q.category}</Badge></div>}
            </div>
            <div className="flex flex-wrap gap-2 p-3">
              {q.options.map(opt => {
                const active = answers[q.id] === opt.value;
                return (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => onChange(q.id, opt.value)}
                    className={`rounded border px-2 py-1 text-[11px] ${active ? 'bg-primary-600 text-white border-primary-600' : 'hover:bg-gray-50'}`}
                  >{opt.label}</button>
                );
              })}
            </div>
          </Card>
        ))}
      </div>
      {submitting && <Skeleton className="h-6 w-40" />}
      {globalScore && !submitting && (
        <Card className="text-xs flex flex-wrap gap-2">{globalScore.departments?.map((d:any)=>(<span key={d.department} className="rounded bg-gray-100 px-2 py-1 dark:bg-slate-700">{d.department}: {d.percent.toFixed(0)}%</span>))}</Card>
      )}
    </div>
  );
}
