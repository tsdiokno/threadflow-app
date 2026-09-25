'use client';

import React from 'react';
import { Pin, ArrowRight, X } from 'lucide-react';
import { Message } from '@/types/chat';

export type ReplacePinPrompt = {
  currentPinnedMsg: Message;
  newMsgToPin: Message;
} | null;

interface ReplacePinModalProps {
  replacePinPrompt: ReplacePinPrompt;
  activeThreadName?: string;
  onClose: () => void;
  onConfirm: (messageId: string) => void;
}

export function ReplacePinModal({
  replacePinPrompt,
  activeThreadName,
  onClose,
  onConfirm,
}: ReplacePinModalProps) {
  if (!replacePinPrompt) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-start gap-3 bg-amber-50/70 dark:bg-amber-950/40">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
            <Pin size={22} className="fill-amber-600 dark:fill-amber-400 text-amber-700 dark:text-amber-300" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Replace Pinned Message?</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Threads can only have one pinned message at a time.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 p-1 rounded-lg hover:bg-white/80 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-3.5">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Pinning this message will replace the message currently pinned in{' '}
            <strong className="text-slate-800 dark:text-slate-100">{activeThreadName || 'this conversation'}</strong>.
          </p>

          <div className="space-y-2">
            <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1 flex items-center gap-1">
                <span>Currently Pinned</span>
              </div>
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-0.5">
                {replacePinPrompt.currentPinnedMsg.senderName} •{' '}
                <span className="font-normal text-slate-400 dark:text-slate-500">
                  {replacePinPrompt.currentPinnedMsg.timestamp}
                </span>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 italic line-clamp-2">
                &ldquo;{replacePinPrompt.currentPinnedMsg.content}&rdquo;
              </div>
            </div>

            <div className="flex justify-center text-slate-400 dark:text-slate-500">
              <ArrowRight size={16} className="rotate-90" />
            </div>

            <div className="bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/70 rounded-xl p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-1 flex items-center gap-1">
                <span>New Message to Pin</span>
              </div>
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-200 mb-0.5">
                {replacePinPrompt.newMsgToPin.senderName} •{' '}
                <span className="font-normal text-slate-400 dark:text-slate-500">
                  {replacePinPrompt.newMsgToPin.timestamp}
                </span>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 italic line-clamp-2">
                &ldquo;{replacePinPrompt.newMsgToPin.content}&rdquo;
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-850 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            Keep Current
          </button>
          <button
            type="button"
            onClick={() => onConfirm(replacePinPrompt.newMsgToPin.id)}
            className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            Replace & Pin
          </button>
        </div>
      </div>
    </div>
  );
}
