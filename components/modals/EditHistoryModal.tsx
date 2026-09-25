'use client';

import React, { useMemo, useState } from 'react';
import { History, X, Clock, Check, ArrowRight, GitCommit } from 'lucide-react';
import { Message, MessageEditRecord } from '@/types/chat';

interface EditHistoryModalProps {
  isOpen: boolean;
  message: Message | null;
  onClose: () => void;
}

type DiffToken = {
  type: 'unchanged' | 'removed' | 'added';
  text: string;
};

// Compute a word-level diff between previous and next text
function computeWordDiff(oldStr: string, newStr: string): DiffToken[] {
  const oldWords = oldStr.split(/(\s+)/);
  const newWords = newStr.split(/(\s+)/);

  const m = oldWords.length;
  const n = newWords.length;

  // Standard LCS dynamic programming table
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (oldWords[i] === newWords[j]) {
        dp[i + 1][j + 1] = dp[i][j] + 1;
      } else {
        dp[i + 1][j + 1] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  // Backtrack to assemble diff tokens
  let i = m;
  let j = n;
  const tokens: DiffToken[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && oldWords[i - 1] === newWords[j - 1]) {
      tokens.unshift({ type: 'unchanged', text: oldWords[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      tokens.unshift({ type: 'added', text: newWords[j - 1] });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      tokens.unshift({ type: 'removed', text: oldWords[i - 1] });
      i--;
    }
  }

  return tokens;
}

export function EditHistoryModal({ isOpen, message, onClose }: EditHistoryModalProps) {
  const [activeTab, setActiveTab] = useState<'timeline' | 'diff'>('timeline');

  // Construct full chronological version list:
  // v1 (original snapshot) -> v2..vn (intermediate snapshots) -> Current version
  const versions = useMemo(() => {
    if (!message) return [];

    const history: MessageEditRecord[] = message.editHistory || [];
    const list: {
      versionNumber: number;
      label: string;
      content: string;
      timestamp: string;
      isCurrent: boolean;
    }[] = [];

    // The historical snapshots represent past versions
    history.forEach((record, idx) => {
      list.push({
        versionNumber: idx + 1,
        label: idx === 0 ? 'Original message' : `Edit #${idx}`,
        content: record.content,
        timestamp: record.editedAt,
        isCurrent: false,
      });
    });

    // The current message is the latest active version
    list.push({
      versionNumber: list.length + 1,
      label: 'Current version',
      content: message.content,
      timestamp: message.editedAt || message.timestamp,
      isCurrent: true,
    });

    return list;
  }, [message]);

  // Visual diff comparing initial/previous version to current version
  const diffTokens = useMemo(() => {
    if (!message || versions.length < 2) return [];
    const firstVersion = versions[0].content;
    const currentVersion = message.content;
    return computeWordDiff(firstVersion, currentVersion);
  }, [message, versions]);

  if (!isOpen || !message) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-history-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <History size={18} />
            </div>
            <div>
              <h3 id="edit-history-title" className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Message Edit History
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sent by {message.senderName} • {versions.length - 1} {versions.length - 1 === 1 ? 'edit' : 'edits'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* View Switcher Tabs */}
        <div className="px-5 pt-3 pb-2 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('timeline')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'timeline'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Snapshot Timeline ({versions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('diff')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'diff'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Visual Diff (Original vs Current)
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-4">
          {activeTab === 'timeline' ? (
            <div className="space-y-4">
              {versions.map((ver, idx) => (
                <div
                  key={ver.versionNumber}
                  className={`rounded-xl border p-3.5 space-y-2 transition-colors ${
                    ver.isCurrent
                      ? 'border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/40 dark:bg-indigo-950/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850/40'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {ver.label}
                      </span>
                      {ver.isCurrent && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white flex items-center gap-1">
                          <Check size={10} /> Current
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 text-[11px]">
                      <Clock size={12} />
                      <span>{ver.timestamp}</span>
                    </div>
                  </div>

                  <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {ver.content}
                  </p>

                  {idx < versions.length - 1 && (
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                      <ArrowRight size={11} className="text-slate-400" />
                      <span>Replaced by version {idx + 2}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 p-4">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2 pb-2 border-b border-slate-200 dark:border-slate-700">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <GitCommit size={14} className="text-indigo-600 dark:text-indigo-400" /> Changes Diff
                  </span>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
                      <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> Removed
                    </span>
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Added
                    </span>
                  </div>
                </div>

                <div className="text-sm leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                  {diffTokens.map((token, index) => {
                    if (token.type === 'removed') {
                      return (
                        <span
                          key={index}
                          className="line-through bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 px-1 py-0.5 rounded mr-0.5 select-none"
                        >
                          {token.text}
                        </span>
                      );
                    }
                    if (token.type === 'added') {
                      return (
                        <span
                          key={index}
                          className="bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-medium px-1 py-0.5 rounded mr-0.5"
                        >
                          {token.text}
                        </span>
                      );
                    }
                    return <span key={index}>{token.text}</span>;
                  })}
                </div>
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 px-1">
                Comparing original version ({versions[0]?.timestamp}) to current version ({message.editedAt || message.timestamp}).
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
