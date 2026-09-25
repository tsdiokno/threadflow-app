'use client';

import React from 'react';
import { CheckCheck, Link2, X } from 'lucide-react';

export type ToastInfo = {
  show: boolean;
  title: string;
  message?: string;
  referencedThreadId?: string | null;
  referencedMsgId?: string | null;
} | null;

interface ToastNotificationProps {
  toastInfo: ToastInfo;
  onClose: () => void;
  onNavigate: (threadId: string | null, messageId: string) => void;
}

export function ToastNotification({
  toastInfo,
  onClose,
  onNavigate,
}: ToastNotificationProps) {
  if (!toastInfo?.show) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white rounded-2xl shadow-xl px-4 py-3 max-w-md border border-slate-800 animate-in slide-in-from-bottom-5 duration-200">
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 rounded-full bg-indigo-500/30 text-indigo-300 flex items-center justify-center shrink-0 mt-0.5">
          <CheckCheck size={16} />
        </div>
        <div className="flex-1 min-w-0 pr-1">
          <div className="font-semibold text-xs text-white">{toastInfo.title}</div>
          {toastInfo.message && (
            <div className="text-[11px] text-slate-300 font-mono truncate mt-0.5">
              {toastInfo.message}
            </div>
          )}
          {toastInfo.referencedMsgId && (
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (toastInfo.referencedMsgId) {
                    onNavigate(
                      toastInfo.referencedThreadId || null,
                      toastInfo.referencedMsgId
                    );
                  }
                }}
                className="text-[10px] font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
              >
                <Link2 size={11} /> Test opening link
              </button>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
