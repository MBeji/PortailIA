"use client";
import React, { useEffect, useState } from 'react';
import { Bar, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  RadialLinearScale,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
  Legend
} from 'chart.js';
import Card from './ui/Card';
import Skeleton from './ui/Skeleton';

ChartJS.register(RadialLinearScale, BarElement, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler, Legend);

interface AnalyticsData { missionId: string; departments: { department: string; percent: number }[]; categories: { category: string; percent: number }[] }

export default function AnalyticsCharts() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [missionId, setMissionId] = useState<string>('');
  const [deptFilter, setDeptFilter] = useState<string>('');

  useEffect(() => {
    const loadMission = async () => {
      const res = await fetch('/api/missions');
      const missions = await res.json();
      if(missions?.length) setMissionId(missions[0].id);
    };
    loadMission();
  }, []);

  useEffect(() => {
    if(!missionId) return;
    setLoading(true);
    fetch(`/api/missions/${missionId}/analytics`).then(r=>r.json()).then(j=>{ setData(j); setLoading(false); });
  }, [missionId]);

  if(!missionId) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <h2 className="text-lg font-semibold">Scores</h2>
          <p className="text-xs text-gray-500">Départements & catégories</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <label className="text-gray-500">Département focus</label>
          <select value={deptFilter} onChange={e=>setDeptFilter(e.target.value)} className="rounded border px-2 py-1 text-xs">
            <option value="">(tous)</option>
            {data?.departments.map(d=> <option key={d.department} value={d.department}>{d.department}</option>)}
          </select>
        </div>
      </div>
      {loading && <div className="grid gap-4 lg:grid-cols-2"><Skeleton className="h-72 w-full" /><Skeleton className="h-72 w-full" /></div>}
      {!loading && data && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <h3 className="mb-2 text-sm font-medium">Score par département</h3>
            <Bar height={260} data={{
              labels: data.departments.map(d=>d.department),
              datasets: [{
                label: '%',
                data: data.departments.map(d=> Math.round(d.percent*10)/10),
                backgroundColor: 'rgba(29,111,216,0.5)',
                borderColor: 'rgba(29,111,216,1)',
                borderWidth: 1
              }]
            }} options={{ responsive:true, plugins:{ legend:{ display:false }}, scales:{ y:{ suggestedMin:0, suggestedMax:100, ticks:{ callback:(v)=> v+'' } } } }} />
          </Card>
          <Card>
            <h3 className="mb-2 text-sm font-medium">Catégories (radar)</h3>
            <Radar height={260} data={{
              labels: data.categories.map(c=>c.category),
              datasets: [{
                label: deptFilter || 'Global',
                data: data.categories.map(c=> Math.round(c.percent*10)/10),
                backgroundColor: 'rgba(20,93,184,0.3)',
                borderColor: 'rgba(20,93,184,0.8)',
                pointBackgroundColor: 'rgba(20,93,184,1)'
              }]
            }} options={{ responsive:true, scales:{ r:{ suggestedMin:0, suggestedMax:100, ticks:{ stepSize:20 } } } }} />
          </Card>
        </div>
      )}
    </div>
  );
}
