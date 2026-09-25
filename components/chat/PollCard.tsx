'use client';

import React from 'react';
import { BarChart2, ArrowUpRight } from 'lucide-react';
import { Message } from '@/types/chat';
import { cn } from '@/lib/utils';

interface PollCardProps {
  message: Message;
  currentUserId: string;
  onClick: () => void;
  className?: string;
}

export function PollCard({
  message,
  currentUserId,
  onClick,
  className,
}: PollCardProps) {
  const poll = message.poll;
  if (!poll) return null;

  const totalVotes = poll.options.reduce(
    (acc, o) => acc + o.voterIds.length,
    0
  );
  const hasVoted = poll.options.some((o) => o.voterIds.includes(currentUserId));

  return (
    <button
      type="button"
      id={`poll-card-${message.id}`}
      onClick={onClick}
      className={cn(
        'w-full text-left border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 hover:bg-slate-50/80 dark:hover:bg-slate-800 hover:border-indigo-300 dark:hover:border-indigo-600 rounded-xl p-3 shadow-2xs transition-all cursor-pointer group flex flex-col gap-2.5',
        className
      )}
      title="Jump and highlight poll in chat"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/60 transition-colors">
            <BarChart2 size={14} />
          </div>
          <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
            {poll.question}
          </h4>
        </div>
        <ArrowUpRight
          size={14}
          className="text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 shrink-0 transition-colors mt-0.5"
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-700/60">
        <div className="flex items-center gap-1.5 truncate">
          <span>By {poll.createdBy}</span>
          <span>•</span>
          <span>{poll.options.length} options</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {hasVoted && (
            <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.2 rounded">
              Voted
            </span>
          )}
          <span className="font-semibold text-slate-600 dark:text-slate-300">
            {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
          </span>
        </div>
      </div>
    </button>
  );
}
