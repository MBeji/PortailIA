"use client";
import React from 'react';
import Link from 'next/link';
import { useAdmin } from './Providers';

export default function AdminQuickLinks() {
  const { admin } = useAdmin();
  if (!admin) return null;
  return (
    <div className="flex items-center justify-end gap-2">
      <Link href="/knowledge/admin" className="rounded bg-amber-600 px-3 py-1 text-xs text-white">Admin Base de connaissance</Link>
      <Link href="/questionnaires/edit" className="rounded bg-blue-700 px-3 py-1 text-xs text-white">Admin Questionnaires</Link>
    </div>
  );
}
