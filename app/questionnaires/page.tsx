import Link from 'next/link';
import { DEPARTMENTS } from '../../lib/departments';
import MissionPicker from '../../components/MissionPicker';

export default function QuestionnairesIndex() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Questionnaires par département</h2>
        <MissionPicker />
      </div>
      <ul className="grid gap-3 md:grid-cols-3">
        {DEPARTMENTS.map(d => (
          <li key={d.id} className="rounded border bg-white p-4 text-sm capitalize shadow-sm dark:bg-slate-800">
            <Link href={`/questionnaires/${d.id}`}>{d.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
