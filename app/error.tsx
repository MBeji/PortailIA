"use client";
import React from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html>
      <body className="p-6 text-sm font-sans">
        <div className="mx-auto max-w-lg space-y-4 rounded border border-red-300 bg-red-50 p-6 text-red-700 dark:border-red-700 dark:bg-red-900/30 dark:text-red-200">
          <h1 className="text-lg font-semibold">Une erreur est survenue</h1>
          <p className="whitespace-pre-wrap break-all font-mono text-xs opacity-80">{error.message}</p>
          {error.digest && <p className="text-[10px] opacity-60">Digest: {error.digest}</p>}
          <button onClick={() => reset()} className="rounded bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700">Réessayer</button>
        </div>
      </body>
    </html>
  );
}
