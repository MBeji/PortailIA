"use client";
import React from 'react';
import ClientErrorCatcher from './ClientErrorCatcher';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Simple toast context
interface Toast { id: number; message: string; type?: 'success' | 'error' | 'info'; }
interface ToastContextType { push: (msg: string, type?: Toast['type']) => void; }
export const ToastContext = React.createContext<ToastContextType | null>(null);

// Mission context (global active mission for questionnaire workflow)
interface MissionContextType { missionId: string | null; setMissionId: (id: string)=>void; progressVersion: number; bumpProgress: ()=>void }
export const MissionContext = React.createContext<MissionContextType | null>(null);

function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const push = (message: string, type: Toast['type']='info') => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(()=> setToasts(t => t.filter(x => x.id !== id)), 4000);
  };
  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-2 z-50 flex flex-col items-center gap-2">
        {toasts.map(t => (
          <div key={t.id} className={`pointer-events-auto flex max-w-sm items-center gap-2 rounded border px-3 py-2 text-xs shadow backdrop-blur transition ${t.type==='success'?'border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200':t.type==='error'?'border-red-300 bg-red-50 text-red-700 dark:bg-red-900/40 dark:text-red-200':'border-sky-300 bg-sky-50 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200'}`}>{t.message}</div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if(!ctx) throw new Error('useToast must be used within Providers');
  return ctx.push;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(() => new QueryClient());
  const [missionId, setMissionId] = React.useState<string | null>(null);
  const [progressVersion, setProgressVersion] = React.useState(0);
  const bumpProgress = () => setProgressVersion(v=>v+1);
  // Global loading indicator
  const [loadCount, setLoadCount] = React.useState(0);
  const pushLoad = React.useCallback(()=> setLoadCount(c=>c+1),[]);
  const popLoad = React.useCallback(()=> setLoadCount(c=> Math.max(0,c-1)),[]);
  // Hydrate mission from localStorage if present
  React.useEffect(()=>{
    try { const stored = localStorage.getItem('activeMissionId'); if(stored) setMissionId(stored); } catch {}
  },[]);
  React.useEffect(()=>{
    if(missionId) { try { localStorage.setItem('activeMissionId', missionId); } catch {} }
  },[missionId]);
  return (
    <QueryClientProvider client={queryClient}>
      <MissionContext.Provider value={{ missionId, setMissionId, progressVersion, bumpProgress }}>
  <GlobalLoadingContext.Provider value={{ push: pushLoad, pop: popLoad, active: loadCount }}>
          <ToastProvider>
            {/* Top progress bar */}
            {loadCount > 0 && (
              <div className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-1 overflow-hidden bg-primary-100 dark:bg-slate-700">
                <div className="h-full w-1/3 animate-[loading_1.2s_ease_infinite] bg-primary-600" />
                <style>{`@keyframes loading {0%{transform:translateX(-100%)}50%{transform:translateX(150%)}100%{transform:translateX(150%)}}`}</style>
              </div>
            )}
            <ClientErrorCatcher />
            {children}
            {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
          </ToastProvider>
        </GlobalLoadingContext.Provider>
      </MissionContext.Provider>
    </QueryClientProvider>
  );
}
export const GlobalLoadingContext = React.createContext<{ push: ()=>void; pop: ()=>void; active: number } | null>(null);
export function useGlobalLoading() {
  const ctx = React.useContext(GlobalLoadingContext);
  if(!ctx) return { start: ()=>{}, stop: ()=>{} };
  return { start: ctx.push, stop: ctx.pop };
}
