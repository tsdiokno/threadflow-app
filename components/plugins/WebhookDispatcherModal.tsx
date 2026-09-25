// components/plugins/WebhookDispatcherModal.tsx
// Built-in DevOps & Webhook Integration simulator for ThreadFlow

'use client';

import React, { useState } from 'react';
import {
  Webhook,
  Send,
  X,
  GitPullRequest,
  CheckCircle2,
  AlertTriangle,
  Radio,
  ExternalLink,
  ShieldCheck,
  Cpu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Thread } from '@/types/chat';

interface WebhookDispatcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeThread: Thread;
  onDispatchWebhook: (threadId: string, content: string, senderName: string) => void;
}

const TEMPLATES = [
  {
    id: 'github_pr',
    service: 'GitHub',
    title: 'PR #142 Merged: Implement Dynamic User Theming',
    author: 'github-actions[bot]',
    icon: GitPullRequest,
    color: 'text-purple-600 dark:text-purple-400',
    payload: `🚀 **[GitHub] Pull Request #142 Merged**\n• **Title:** Implement dynamic user theming & WCAG color tokens\n• **Branch:** \`feat/user-tint-tokens\` → \`main\`\n• **Author:** @alex-dev\n• **Status:** All 48 tests passed, deployed to preview environment.`,
  },
  {
    id: 'cicd_success',
    service: 'CI/CD Pipeline',
    title: 'Production Build #890 Succeeded',
    author: 'cloud-build[bot]',
    icon: CheckCircle2,
    color: 'text-emerald-600 dark:text-emerald-400',
    payload: `✅ **[CI/CD] Build #890 Completed Successfully**\n• **Target:** Production Asia-Southeast1\n• **Duration:** 1m 42s\n• **Artifacts:** Container image verified & signed. Zero vulnerabilities detected.`,
  },
  {
    id: 'linear_issue',
    service: 'Linear',
    title: 'Issue THREAD-209 Closed: Audio Annotation Sync',
    author: 'linear-sync',
    icon: Radio,
    color: 'text-indigo-600 dark:text-indigo-400',
    payload: `🎯 **[Linear] Issue Marked Done: THREAD-209**\n• **Title:** Fix timeline-based media pin alignment\n• **Assignee:** @sarah-chen\n• **Priority:** Urgent P0 → Resolved`,
  },
  {
    id: 'sentry_alert',
    service: 'Sentry',
    title: 'Error Alert: Network Latency Spike Detected',
    author: 'sentry-bot',
    icon: AlertTriangle,
    color: 'text-rose-600 dark:text-rose-400',
    payload: `⚠️ **[Sentry Alert] Warning: WebSocket ping timeout > 450ms**\n• **Environment:** staging-cluster-04\n• **Impact:** 3 active connections re-negotiated smoothly.`,
  },
];

export function WebhookDispatcherModal({
  isOpen,
  onClose,
  activeThread,
  onDispatchWebhook,
}: WebhookDispatcherModalProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState('github_pr');
  const [customMessage, setCustomMessage] = useState(TEMPLATES[0].payload);
  const [botName, setBotName] = useState(TEMPLATES[0].author);

  if (!isOpen) return null;

  const handleSelectTemplate = (tmpl: typeof TEMPLATES[0]) => {
    setSelectedTemplateId(tmpl.id);
    setCustomMessage(tmpl.payload);
    setBotName(tmpl.author);
  };

  const handleDispatch = () => {
    onDispatchWebhook(activeThread.id, customMessage, botName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3 bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-2xs">
              <Webhook size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  DevOps Webhook Dispatcher
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Integration Plugin
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Dispatch inbound webhook notifications into <strong className="text-slate-700 dark:text-slate-200">#{activeThread.name}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Permission Verification Pill */}
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
            <ShieldCheck size={16} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>
              Permission Verified: This plugin holds <code className="font-mono font-bold">messages:send</code> authorization for this channel.
            </span>
          </div>

          {/* Template Selectors */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
              Select Sample Event
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TEMPLATES.map((t) => {
                const Icon = t.icon;
                const isSelected = selectedTemplateId === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleSelectTemplate(t)}
                    className={cn(
                      'p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 shadow-2xs',
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-850'
                    )}
                  >
                    <Icon size={16} className={t.color} />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {t.service}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{t.author}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bot Name */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
              Sender / Bot Name
            </label>
            <input
              type="text"
              value={botName}
              onChange={(e) => setBotName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          {/* Payload Preview / Edit */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
              Payload Content (Markdown)
            </label>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              rows={5}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500 font-mono leading-relaxed resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDispatch}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
          >
            <Send size={13} />
            <span>Dispatch Webhook</span>
          </button>
        </div>
      </div>
    </div>
  );
}
