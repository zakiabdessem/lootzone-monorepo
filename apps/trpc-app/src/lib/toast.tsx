'use client';

import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type ToastKind = 'success' | 'error' | 'info' | 'warning';

type ToastInput = {
  kind: ToastKind;
  message: string;
  title?: string;
  duration?: number; // ms
};

export type ToastPayload = ToastInput & { id: string };

let dispatchFn: ((t: ToastInput) => void) | null = null;

function dispatch(kind: ToastKind, message: string, opts?: { title?: string; duration?: number }) {
  if (!dispatchFn) return;
  dispatchFn({ kind, message, title: opts?.title, duration: opts?.duration ?? 2600 });
}

export const toast = {
  success(message: string, opts?: { title?: string; duration?: number }) {
    dispatch('success', message, opts);
  },
  error(message: string, opts?: { title?: string; duration?: number }) {
    dispatch('error', message, opts);
  },
  info(message: string, opts?: { title?: string; duration?: number }) {
    dispatch('info', message, opts);
  },
  warning(message: string, opts?: { title?: string; duration?: number }) {
    dispatch('warning', message, opts);
  },
};

export function ToastProvider() {
  const [toasts, setToasts] = useState<ToastPayload[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    dispatchFn = (t: ToastInput) => {
      const id =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`;
      setToasts(prev => [...prev, { id, ...t }]);
    };
    return () => {
      dispatchFn = null;
      timersRef.current.forEach(tm => clearTimeout(tm));
      timersRef.current.clear();
    };
  }, []);

  useEffect(() => {
    toasts.forEach(t => {
      if (!timersRef.current.has(t.id)) {
        const tm = setTimeout(() => dismiss(t.id), t.duration ?? 2600);
        timersRef.current.set(t.id, tm);
      }
    });
  }, [toasts]);

  function dismiss(id: string) {
    setToasts(prev => prev.filter(x => x.id !== id));
    const tm = timersRef.current.get(id);
    if (tm) {
      clearTimeout(tm);
      timersRef.current.delete(id);
    }
  }

  return (
    <div className='pointer-events-none fixed bottom-4 right-4 z-[10000] flex flex-col-reverse gap-3'>
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onClose={() => dismiss(t.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: ToastPayload; onClose: () => void }) {
  const palette = {
    success: {
      bg: 'bg-[#23c299]',
      border: 'border-[#63e3c2]',
      text: 'text-white',
      icon: <CheckCircle2 className='w-5 h-5' />,
    },
    error: {
      bg: 'bg-[#e76a8c]',
      border: 'border-[#e76a8c]',
      text: 'text-white',
      icon: <AlertCircle className='w-5 h-5' />,
    },
    info: {
      bg: 'bg-[#4618AC]',
      border: 'border-[#63e3c2]',
      text: 'text-white',
      icon: <Info className='w-5 h-5' />,
    },
    warning: {
      bg: 'bg-[#fad318]',
      border: 'border-[#fad318]',
      text: 'text-[#212121]',
      icon: <TriangleAlert className='w-5 h-5' />,
    },
  }[toast.kind];

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 rounded-sm border ${palette.border} ${palette.bg} ${palette.text} shadow-lg min-w-[260px] max-w-[360px] p-3 transition-all`}
      role='status'
      aria-live='polite'
    >
      <div className='mt-0.5'>{palette.icon}</div>
      <div className='flex-1'>
        {toast.title && <div className='font-semibold leading-tight'>{toast.title}</div>}
        <div className='text-sm leading-snug'>{toast.message}</div>
      </div>
      <button
        onClick={onClose}
        className='opacity-80 hover:opacity-100 transition text-current'
        aria-label='Dismiss notification'
      >
        <X className='w-4 h-4' />
      </button>
    </div>
  );
}
