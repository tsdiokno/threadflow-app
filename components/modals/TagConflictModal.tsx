'use client';

import React from 'react';
import { AlertTriangle, ArrowRight, Tag as TagIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Message, TagDefinition } from '@/types/chat';

export type UniqueConflictPrompt = {
  tag: TagDefinition;
  currentMessage: Message;
  targetMessage: Message;
} | null;

interface TagConflictModalProps {
  uniqueConflictPrompt: UniqueConflictPrompt;
  onClose: () => void;
  onConfirm: () => void;
}

export function TagConflictModal({
  uniqueConflictPrompt,
  onClose,
  onConfirm,
}: TagConflictModalProps) {
  if (!uniqueConflictPrompt) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-100 flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-slate-900">
              Move Unique Tag?
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              This tag has a single-message constraint enabled.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-3.5 text-xs text-slate-600">
          <p>
            The tag <span className={cn('inline-flex items-center font-semibold px-2 py-0.5 rounded-md border text-xs', uniqueConflictPrompt.tag.color)}>
              {uniqueConflictPrompt.tag.name}
            </span> is marked with a <strong>unique constraint</strong> and can only be assigned to one message at a time.
          </p>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <span>Currently assigned to:</span>
            </div>
            <div className="text-slate-700 font-medium truncate">
              {uniqueConflictPrompt.currentMessage.senderName}: &ldquo;{uniqueConflictPrompt.currentMessage.content}&rdquo;
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              {uniqueConflictPrompt.currentMessage.timestamp}
            </div>
          </div>

          <div className="flex items-center justify-center text-slate-400">
            <ArrowRight size={16} className="rotate-90 sm:rotate-0" />
          </div>

          <div className="bg-indigo-50/70 rounded-xl p-3 border border-indigo-200/80">
            <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-1 flex items-center gap-1">
              <span>Move tag to new message:</span>
            </div>
            <div className="text-slate-800 font-medium truncate">
              {uniqueConflictPrompt.targetMessage.senderName}: &ldquo;{uniqueConflictPrompt.targetMessage.content}&rdquo;
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              {uniqueConflictPrompt.targetMessage.timestamp}
            </div>
          </div>

          <p className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200 leading-normal">
            Applying this tag will remove it from the previously tagged message. Do you want to proceed?
          </p>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/70 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            Move Tag
          </button>
        </div>
      </div>
    </div>
  );
}
