'use client';

import React, { useState } from 'react';
import { Search, X, Users, Hash, Pin, BarChart2, FileText as FileIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Message, Thread, User } from '@/types/chat';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  threads: Thread[];
  messages: Message[];
  users: User[];
  onNavigate: (threadId: string | null, messageId: string) => void;
}

export function SearchModal({
  isOpen,
  onClose,
  threads,
  messages,
  users,
  onNavigate,
}: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchScopeRoom, setSearchScopeRoom] = useState('all');
  const [searchScopeUser, setSearchScopeUser] = useState('all');
  const [searchFilterAttribute, setSearchFilterAttribute] = useState<'all' | 'polls' | 'pinned' | 'files'>('all');

  if (!isOpen) return null;

  // Filter messages based on search query, room, user, and attribute
  const filteredResults = messages
    .filter((msg) => {
      // Room filter
      if (searchScopeRoom !== 'all' && msg.threadId !== searchScopeRoom) {
        return false;
      }
      // User filter
      if (searchScopeUser !== 'all' && msg.senderName !== searchScopeUser) {
        return false;
      }
      // Attribute filter
      if (searchFilterAttribute === 'polls' && !msg.poll) return false;
      if (searchFilterAttribute === 'pinned' && !msg.isPinned) return false;
      if (searchFilterAttribute === 'files' && !msg.annotationFileId) return false;

      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesContent = msg.content.toLowerCase().includes(q);
        const matchesSender = msg.senderName.toLowerCase().includes(q);
        const matchesPoll = msg.poll?.question.toLowerCase().includes(q);
        const thread = threads.find((t) => t.id === msg.threadId);
        const matchesTags = thread?.tagDefs.some(
          (t) => msg.tagIds.includes(t.id) && t.name.toLowerCase().includes(q)
        );
        if (!matchesContent && !matchesSender && !matchesPoll && !matchesTags) {
          return false;
        }
      }

      return true;
    })
    .map((msg) => {
      const thread = threads.find((t) => t.id === msg.threadId);
      let score = 100;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (msg.content.toLowerCase().startsWith(q)) score += 50;
        if (msg.isPinned) score += 20;
        if (msg.poll) score += 15;
      }
      return { msg, thread, score };
    })
    .sort((a, b) => b.score - a.score);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh] text-slate-900 dark:text-slate-100">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3 bg-slate-50/50 dark:bg-slate-850">
          <Search size={20} className="text-slate-400 dark:text-slate-500 shrink-0" />
          <input
            autoFocus
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Fuzzy search messages, polls, pins, files... (type to search)"
            className="flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-lg cursor-pointer"
              title="Clear input"
            >
              <X size={15} />
            </button>
          )}
          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 bg-slate-200/70 dark:bg-slate-800 px-1.5 py-0.5 rounded">ESC</span>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scope & Filter Controls */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Room Scope Filter */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Room:</span>
              <select
                value={searchScopeRoom}
                onChange={(e) => setSearchScopeRoom(e.target.value)}
                className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 outline-none text-slate-700 dark:text-slate-200 cursor-pointer shadow-2xs"
              >
                <option value="all">All Rooms ({threads.length})</option>
                {threads.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.type === 'dm' ? '@' : '#'}{t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* User Scope Filter */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">User:</span>
              <select
                value={searchScopeUser}
                onChange={(e) => setSearchScopeUser(e.target.value)}
                className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 outline-none text-slate-700 dark:text-slate-200 cursor-pointer shadow-2xs"
              >
                <option value="all">All People</option>
                {users.map((u) => (
                  <option key={u.id} value={u.name}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Type Category Pills */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-0.5 rounded-lg shadow-2xs">
            {(['all', 'polls', 'pinned', 'files'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setSearchFilterAttribute(filter)}
                className={cn(
                  'px-2 py-0.5 rounded-md text-[11px] font-semibold capitalize transition-colors cursor-pointer',
                  searchFilterAttribute === filter
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredResults.length === 0 ? (
            <div className="text-center py-12 px-4 text-slate-400 dark:text-slate-500 text-xs">
              <Search size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              {searchQuery.trim() ? (
                <div>
                  <p className="font-semibold text-slate-600 dark:text-slate-300 text-sm">No matching messages found</p>
                  <p className="mt-1">Try adjusting your fuzzy search query, room filter, or user scope.</p>
                </div>
              ) : (
                <div>
                  <p className="font-semibold text-slate-600 dark:text-slate-300 text-sm">Fuzzy search all messages</p>
                  <p className="mt-1">Type keywords, user names, or filter by room and type.</p>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 dark:text-slate-500 px-1">
                <span>{filteredResults.length} {filteredResults.length === 1 ? 'match' : 'matches'} found</span>
                <span>Ranked by fuzzy relevance score</span>
              </div>

              {filteredResults.map((result) => {
                const msg = result.msg;
                const thread = result.thread;

                return (
                  <div
                    key={msg.id}
                    onClick={() => {
                      onClose();
                      onNavigate(thread?.id || null, msg.id);
                    }}
                    className="p-3 bg-white dark:bg-slate-800/80 hover:bg-indigo-50/40 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-500 rounded-xl transition-all cursor-pointer group shadow-2xs"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-semibold text-xs text-slate-800 dark:text-slate-100 truncate">
                          {msg.senderName}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">
                          {msg.timestamp}
                        </span>
                        <span className="text-[10px] font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.2 rounded shrink-0 flex items-center gap-1">
                          {thread?.type === 'dm' ? <Users size={10} /> : <Hash size={10} />}
                          <span>{thread?.name || 'Channel'}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {msg.isPinned && (
                          <span className="text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                            <Pin size={9} className="fill-amber-600 text-amber-600" /> Pinned
                          </span>
                        )}
                        {msg.poll && (
                          <span className="text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                            <BarChart2 size={9} /> Poll
                          </span>
                        )}
                        {msg.annotationFileId && (
                          <span className="text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                            <FileIcon size={9} /> File Pin
                          </span>
                        )}
                        <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          score {result.score}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {msg.content}
                    </p>

                    {msg.poll && (
                      <div className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
                        <BarChart2 size={11} className="text-indigo-600 dark:text-indigo-400" />
                        <span>Poll: &ldquo;{msg.poll.question}&rdquo;</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-850 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="text-[11px]">Tip: Press <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-mono shadow-2xs">Cmd+K</kbd> anywhere to search</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
