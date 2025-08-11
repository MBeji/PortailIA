"use client";
import React from 'react';

let installed = false;

export default function ClientErrorCatcher() {
  React.useEffect(() => {
    if (installed) return; // singleton
    installed = true;
    function send(type: string, info: any) {
      try {
        fetch('/api/log-client', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, info }) });
      } catch {}
    }
    const onErr = (e: ErrorEvent) => {
      send('error', { message: e.message, stack: e.error?.stack, filename: e.filename, lineno: e.lineno, colno: e.colno });
    };
    const onRej = (e: PromiseRejectionEvent) => {
      send('unhandledrejection', { reason: (e.reason && e.reason.message) || String(e.reason), stack: e.reason?.stack });
    };
    window.addEventListener('error', onErr);
    window.addEventListener('unhandledrejection', onRej);
    return () => {
      window.removeEventListener('error', onErr);
      window.removeEventListener('unhandledrejection', onRej);
    };
  }, []);
  return null;
}
