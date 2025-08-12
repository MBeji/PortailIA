"use client";
import React from 'react';
import Link from 'next/link';
import { useAdmin } from './Providers';

export default function AdminEditKnowledgeLink({ slug }: { slug: string }) {
  const { admin } = useAdmin();
  if(!admin) return null;
  return (
    <Link href={`/knowledge/admin?slug=${encodeURIComponent(slug)}`} className="rounded bg-amber-600 px-2 py-1 text-xs text-white">Éditer</Link>
  );
}
