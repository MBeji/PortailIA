import React from 'react';
import clsx from 'clsx';

export function Skeleton({ className }: { className?: string }) {
  return <div className={clsx('animate-pulse rounded bg-gray-200 dark:bg-slate-700', className)} />;
}

export default Skeleton;
