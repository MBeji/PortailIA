import React from 'react';
import MissionsPanel from '../components/MissionsPanel';
import dynamic from 'next/dynamic';

const AnalyticsCharts = dynamic(() => import('../components/AnalyticsCharts'), { ssr: false });

export default function DashboardPage() {
  return (
    <main className="space-y-6">
  <MissionsPanel />
  <AnalyticsCharts />
      <section>
        <h2 className="text-lg font-semibold">Actions en attente</h2>
        <ul className="list-disc pl-6 text-sm text-gray-600">
          <li>Compléter les questionnaires</li>
          <li>Générer recommandations</li>
          <li>Exporter plan d'action</li>
        </ul>
      </section>
    </main>
  );
}
