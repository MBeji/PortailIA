import Link from 'next/link';
import { DEPARTMENTS } from '../../lib/departments';

export default function QuestionnairesIndex() {
  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Questionnaires par département</h2>
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
