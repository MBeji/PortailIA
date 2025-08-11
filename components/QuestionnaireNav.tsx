"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DEPARTMENTS } from '../lib/departments';
import { MissionContext } from './Providers';

interface ProgressInfo { answered: number; total: number; percent: number }
interface ProgressMap { [dept: string]: ProgressInfo }

export default function QuestionnaireNav() {
  const pathname = usePathname();
  const missionCtx = React.useContext(MissionContext);
  const missionId = missionCtx?.missionId;
  const [progress, setProgress] = useState<ProgressMap>({});
  const [globalPercent, setGlobalPercent] = useState<number>(0);

  const active = pathname?.split('/').pop();

  useEffect(() => {
    const fetchProgress = async () => {
      if(!missionId) return;
      const res = await fetch(`/api/missions/${missionId}/progress`);
      if(res.ok) {
        const data = await res.json();
        const map: ProgressMap = {};
  data.departments.forEach((d: any) => { map[d.department] = { answered: d.answered, total: d.total, percent: d.percent }; });
        setProgress(map);
  setGlobalPercent(data.global?.percent || 0);
      }
    };
    fetchProgress();
  }, [missionId, missionCtx?.progressVersion]);

  return (
    <nav className="sticky top-4 space-y-2 text-xs">
      <div>
        <h4 className="mb-2 font-semibold tracking-wide text-gray-600 dark:text-gray-300">Progression</h4>
        {missionId ? (
          <div className="flex flex-col gap-1">
            <div className="h-2 w-full overflow-hidden rounded bg-gray-200 dark:bg-slate-700">
              <div className="h-full bg-primary-600 transition-all" style={{ width: `${globalPercent.toFixed(1)}%` }} />
            </div>
            <span className="text-[10px] text-gray-500 dark:text-gray-400">Global {globalPercent.toFixed(1)}%</span>
          </div>
        ) : <span className="text-[10px] text-gray-500">Commencez un thème pour créer la mission</span>}
      </div>
      <h4 className="font-semibold tracking-wide text-gray-600 dark:text-gray-300">Thèmes</h4>
      <ul className="space-y-1">
        {DEPARTMENTS.map(d => {
          const isActive = d.id === active;
          return (
            <li key={d.id}>
              <Link href={`/questionnaires/${d.id}`} className={`flex items-center justify-between gap-2 rounded px-2 py-1 transition hover:bg-primary-50 dark:hover:bg-slate-700 ${isActive? 'bg-primary-100 font-medium dark:bg-slate-600': 'bg-white dark:bg-slate-800'}`}>
                <span className="truncate" title={d.label}>{d.label}</span>
                {progress[d.id] && (
                  <span className="rounded bg-gray-200 px-1 text-[10px] font-medium dark:bg-slate-600" title={`${progress[d.id].answered}/${progress[d.id].total}`}>
                    {Math.round(progress[d.id].percent)}%
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
