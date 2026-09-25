'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  CornerDownRight,
  X,
  Plus,
  Paperclip,
  BarChart2,
  Send,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Message, User } from '@/types/chat';

interface MessageInputProps {
  inputValue: string;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  replyingToMessage: Message | null;
  onCancelReply: () => void;
  onSubmit: (e?: React.FormEvent) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenCreatePoll: () => void;
  mentionQuery: string | null;
  mentionableUsers: User[];
  selectedMentionIdx: number;
  setSelectedMentionIdx: (idx: number) => void;
  onSelectMention: (name: string) => void;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
}

export function MessageInput({
  inputValue,
  onInputChange,
  onKeyDown,
  replyingToMessage,
  onCancelReply,
  onSubmit,
  onFileUpload,
  onOpenCreatePoll,
  mentionQuery,
  mentionableUsers,
  selectedMentionIdx,
  setSelectedMentionIdx,
  onSelectMention,
  inputRef,
}: MessageInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const actionsMenuRef = useRef<HTMLDivElement>(null);

  // Close actions menu on click outside or escape key
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(e.target as Node)) {
        setIsActionsOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsActionsOpen(false);
      }
    }

    if (isActionsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActionsOpen]);

  return (
    <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0 relative transition-colors">
      <div className="max-w-4xl mx-auto relative">
        {/* User @Mention Autocomplete Dropdown */}
        {mentionQuery !== null && mentionableUsers.length > 0 && (
          <div className="absolute bottom-full left-12 mb-2 w-72 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-30 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-3 py-2 bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-700/60 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Mention People</span>
              <span className="text-slate-400 dark:text-slate-500 font-normal">↑↓ navigate • enter select</span>
            </div>
            <div className="p-1 max-h-56 overflow-y-auto space-y-0.5">
              {mentionableUsers.map((item, idx) => {
                const isBroadcast = ['channel', 'here', 'everyone'].includes(item.name.toLowerCase());
                const token = item.name.toLowerCase().replace(/\s+/g, '_');
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectMention(item.name)}
                    onMouseEnter={() => setSelectedMentionIdx(idx)}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-xs transition-colors cursor-pointer',
                      idx === selectedMentionIdx
                        ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100 font-semibold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/80'
                    )}
                  >
                    <div
                      className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 text-white',
                        isBroadcast ? 'bg-amber-600' : item.avatarBg
                      )}
                    >
                      {isBroadcast ? '@' : item.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">@{token}</span>
                        {!isBroadcast && (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 truncate">({item.name})</span>
                        )}
                      </div>
                      {item.role && (
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{item.role}</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Active Reply Banner */}
        {replyingToMessage && (
          <div className="flex items-center justify-between bg-slate-100/90 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 px-3.5 py-2 rounded-xl mb-2 text-xs">
            <div className="flex items-center gap-2 truncate min-w-0">
              <CornerDownRight size={14} className="text-slate-600 dark:text-slate-300 shrink-0" />
              <span className="text-slate-600 dark:text-slate-300 shrink-0">
                Replying to <strong className="text-slate-800 dark:text-slate-100">{replyingToMessage.senderName}</strong>:
              </span>
              <span className="text-slate-500 dark:text-slate-400 truncate italic">&ldquo;{replyingToMessage.content}&rdquo;</span>
              {replyingToMessage.annotationPoint?.pinNumber && (
                <span className="shrink-0 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-[10px] font-bold px-1.5 py-0.5 rounded">
                  Pin #{replyingToMessage.annotationPoint.pinNumber}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={onCancelReply}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700 rounded-md shrink-0 ml-2 transition-colors cursor-pointer"
              title="Cancel reply"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Progressive Disclosure Action Menu Popover */}
        {isActionsOpen && (
          <div
            ref={actionsMenuRef}
            id="composer-actions-menu"
            className="absolute bottom-full left-2 mb-2 w-56 bg-white dark:bg-slate-850 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-750 p-1.5 z-30 animate-in fade-in slide-in-from-bottom-2 duration-150"
          >
            <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Actions
            </div>
            <button
              type="button"
              id="action-attach-file-btn"
              onClick={() => {
                setIsActionsOpen(false);
                fileInputRef.current?.click();
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-750 rounded-xl transition-colors cursor-pointer"
            >
              <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                <Paperclip size={14} />
              </div>
              <div className="text-left">
                <div>Attach Files or Photos</div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">PDF, images, documents</div>
              </div>
            </button>
            <button
              type="button"
              id="action-create-poll-btn"
              onClick={() => {
                setIsActionsOpen(false);
                onOpenCreatePoll();
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-750 rounded-xl transition-colors cursor-pointer mt-0.5"
            >
              <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                <BarChart2 size={14} />
              </div>
              <div className="text-left">
                <div>Create a Poll</div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">Ask question & gather votes</div>
              </div>
            </button>
          </div>
        )}

        <form onSubmit={onSubmit} className="relative flex items-end">
          <input
            type="file"
            ref={fileInputRef}
            onChange={onFileUpload}
            className="hidden"
            multiple
            accept="image/*,.pdf,.doc,.docx,.txt"
          />

          {/* Progressive Disclosure Icon (Plus Button) */}
          <div className="absolute left-2 bottom-2 z-10">
            <button
              type="button"
              id="composer-disclosure-toggle-btn"
              onClick={() => setIsActionsOpen((prev) => !prev)}
              className={cn(
                'p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-200/70 dark:hover:bg-slate-700 rounded-xl transition-all cursor-pointer flex items-center justify-center',
                isActionsOpen && 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
              )}
              title={isActionsOpen ? 'Close actions' : 'Add attachment or poll'}
              aria-label="Toggle complementary actions"
              aria-expanded={isActionsOpen}
            >
              <Plus
                size={17}
                className={cn('transition-transform duration-150', isActionsOpen && 'rotate-45')}
              />
            </button>
          </div>

          {/* Shortened placeholder to avoid overflowing on smaller displays */}
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={onInputChange}
            onKeyDown={onKeyDown}
            placeholder={
              replyingToMessage
                ? `Reply to ${replyingToMessage.senderName}...`
                : 'Write a message...'
            }
            className="w-full resize-none bg-slate-100 dark:bg-slate-800 border border-transparent dark:border-slate-700/70 focus:bg-white dark:focus:bg-slate-800/90 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 rounded-xl py-3 pl-11 pr-12 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all max-h-32"
            rows={1}
          />

          {/* Send Icon */}
          <button
            type="submit"
            id="composer-send-btn"
            disabled={!inputValue.trim()}
            className="absolute right-2 bottom-2 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-40 disabled:bg-slate-300 dark:disabled:bg-slate-700 dark:disabled:text-slate-500 transition-colors shadow-2xs cursor-pointer flex items-center justify-center"
            title="Send message"
            aria-label="Send message"
          >
            <Send size={15} />
          </button>
        </form>
      </div>
    </div>
  );
}
