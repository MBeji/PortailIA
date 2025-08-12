"use client";
import React from 'react';
import Link from 'next/link';
import { useAdmin } from './Providers';

export default function AdminEditQuestionnaireLink({ department }: { department: string }) {
  const { admin } = useAdmin();
  if(!admin) return null;
  return <Link href={`/questionnaires/edit/${department}`} className="rounded bg-blue-700 px-2 py-1 text-xs text-white">Éditer</Link>;
}
