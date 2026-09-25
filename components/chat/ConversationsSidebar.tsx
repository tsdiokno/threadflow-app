'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Hash,
  Users,
  Lock,
  Pin,
  Tag as TagIcon,
  BookOpen,
  Info,
  Settings,
  ChevronDown,
  Check,
  X,
  Filter,
  PanelLeftClose,
  Puzzle,
  LayoutDashboard,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getThreadTagColor } from '@/lib/chat-utils';
import { Thread, User } from '@/types/chat';
import { WorkspaceViewMode } from '@/types/plugins';
import { ThreadTagBadge } from '@/components/chat/ThreadTagBadge';
import { UserAvatar } from '@/components/chat/UserAvatar';
import { SettingsTabType } from '@/components/modals/SettingsModal';

interface ConversationsSidebarProps {
  threads: Thread[];
  activeThreadId: string;
  currentUserId: string;
  currentUser: User;
  allUsers: User[];
  selectedThreadTagFilter: string | null;
  allThreadTags: string[];
  onSelectThread: (threadId: string) => void;
  onAccessDenied: (thread: Thread) => void;
  onTogglePinThread: (threadId: string) => void;
  onOpenThreadTagModal: (threadId: string) => void;
  onSetThreadTagFilter: (tag: string | null) => void;
  onSwitchUser: (userId: string) => void;
  onOpenSettings: (tab: SettingsTabType) => void;
  onCollapse?: () => void;
  workspaceViewMode?: WorkspaceViewMode;
  onChangeWorkspaceViewMode?: (mode: WorkspaceViewMode) => void;
  isProjectViewsEnabled?: boolean;
  isCustomSkinsEnabled?: boolean;
}

export function ConversationsSidebar({
  threads,
  activeThreadId,
  currentUserId,
  currentUser,
  allUsers,
  selectedThreadTagFilter,
  allThreadTags,
  onSelectThread,
  onAccessDenied,
  onTogglePinThread,
  onOpenThreadTagModal,
  onSetThreadTagFilter,
  onSwitchUser,
  onOpenSettings,
  onCollapse,
  workspaceViewMode = 'chat',
  onChangeWorkspaceViewMode,
  isProjectViewsEnabled = true,
  isCustomSkinsEnabled = true,
}: ConversationsSidebarProps) {
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const tagDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tagDropdownRef.current &&
        !tagDropdownRef.current.contains(event.target as Node)
      ) {
        setIsTagDropdownOpen(false);
      }
    };
    if (isTagDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isTagDropdownOpen]);

  const renderThreadItem = (thread: Thread) => {
    const hasAccess = thread.memberIds.includes(currentUserId);
    const isCurrentActive = activeThreadId === thread.id && hasAccess;

    return (
      <div key={thread.id} className="relative group/thread">
        <button
          type="button"
          id={`thread-btn-${thread.id}`}
          onClick={() => {
            if (!hasAccess) {
              onAccessDenied(thread);
              return;
            }
            onSelectThread(thread.id);
          }}
          className={cn(
            'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all cursor-pointer group',
            isCurrentActive
              ? 'bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-100 font-semibold shadow-2xs border-l-2 border-indigo-600 dark:border-indigo-400'
              : hasAccess
              ? 'hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300'
              : 'opacity-70 hover:bg-rose-50/60 dark:hover:bg-rose-950/30 text-slate-500 dark:text-slate-400'
          )}
        >
          <div
            className={cn(
              'shrink-0 flex items-center justify-center w-7 h-7 rounded-lg transition-colors',
              !hasAccess
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                : isCurrentActive
                ? 'bg-indigo-100/90 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
            )}
          >
            {!hasAccess ? (
              <Lock size={13} className="text-slate-400" />
            ) : thread.type === 'dm' ? (
              <Users size={14} />
            ) : (
              <Hash size={14} />
            )}
          </div>
          <div className="truncate text-xs flex-1 min-w-0 pr-14">
            <div className="truncate font-medium flex items-center gap-1">
              <span className="truncate">{thread.name}</span>
              {thread.isPinned && (
                <Pin size={10} className="text-slate-400 dark:text-slate-500 shrink-0" />
              )}
            </div>
            {!hasAccess && (
              <div className="text-[10px] text-rose-500 font-medium">Restricted</div>
            )}
            {/* Thread Custom Tags */}
            {thread.threadTags && thread.threadTags.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap mt-1">
                {thread.threadTags.map((tTag) => (
                  <ThreadTagBadge key={tTag} tagName={tTag} size="xs" />
                ))}
              </div>
            )}
          </div>
        </button>

        {hasAccess && (
          <div className="absolute right-2 top-2 flex items-center gap-0.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenThreadTagModal(thread.id);
              }}
              className={cn(
                'p-1 rounded transition-all cursor-pointer',
                thread.threadTags && thread.threadTags.length > 0
                  ? 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800'
                  : 'text-slate-300 dark:text-slate-600 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 opacity-0 group-hover/thread:opacity-100'
              )}
              title={`Manage tags & permissions for "${thread.name}"`}
            >
              <TagIcon size={12} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onTogglePinThread(thread.id);
              }}
              className={cn(
                'p-1 rounded transition-all cursor-pointer',
                thread.isPinned
                  ? 'text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  : 'text-slate-300 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 opacity-0 group-hover/thread:opacity-100'
              )}
              title={thread.isPinned ? 'Unpin conversation' : 'Pin conversation'}
            >
              <Pin size={12} className={thread.isPinned ? 'fill-current' : ''} />
            </button>
          </div>
        )}
      </div>
    );
  };

  const filteredThreads = threads.filter(
    (t) => !selectedThreadTagFilter || t.threadTags?.includes(selectedThreadTagFilter)
  );
  const pinnedThreads = filteredThreads.filter((t) => t.isPinned);
  const regularThreads = filteredThreads.filter((t) => !t.isPinned);

  return (
    <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 transition-colors">
      {/* Sidebar Header */}
      <div className="h-16 px-4 sm:px-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 font-semibold text-lg text-slate-800 dark:text-slate-100 tracking-tight">
        <span>Conversations</span>
        {onCollapse && (
          <button
            type="button"
            id="collapse-conversations-btn"
            onClick={onCollapse}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Collapse conversations panel"
            aria-label="Collapse conversations panel"
          >
            <PanelLeftClose size={18} />
          </button>
        )}
      </div>

      {/* View Switcher Dropdown (Chat vs Project Views vs Revamp) */}
      {(isProjectViewsEnabled || isCustomSkinsEnabled) && onChangeWorkspaceViewMode && (
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <LayoutDashboard size={11} className="text-slate-400" />
              <span>View Mode</span>
            </span>
          </div>
          <div className="relative">
            <select
              id="workspace-view-mode-select"
              value={workspaceViewMode === 'chat' ? 'chat' : workspaceViewMode === 'revamp' ? 'revamp' : 'project_views'}
              onChange={(e) => {
                const val = e.target.value;
                if (val === 'chat') {
                  onChangeWorkspaceViewMode('chat');
                } else if (val === 'revamp') {
                  onChangeWorkspaceViewMode('revamp');
                } else {
                  onChangeWorkspaceViewMode(workspaceViewMode === 'chat' || workspaceViewMode === 'revamp' ? 'table' : workspaceViewMode);
                }
              }}
              className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 outline-none text-slate-800 dark:text-slate-100 focus:border-indigo-500 dark:focus:border-indigo-400 cursor-pointer shadow-2xs transition-colors"
            >
              <option value="chat">Chat</option>
              {isProjectViewsEnabled && <option value="project_views">Project Views</option>}
              {isCustomSkinsEnabled && <option value="revamp">Revamp</option>}
            </select>
          </div>
        </div>
      )}

      {/* Current Persona Switcher */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Current User</span>
          <span className="text-[10px] text-slate-600 dark:text-slate-300 font-medium">Test Access</span>
        </div>
        <div className="flex items-center gap-2">
          <UserAvatar user={currentUser} size="sm" />
          <div className="flex-1 min-w-0">
            <select
              id="persona-select"
              value={currentUserId}
              onChange={(e) => onSwitchUser(e.target.value)}
              className="w-full text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 outline-none text-slate-800 dark:text-slate-100 focus:border-slate-400 dark:focus:border-slate-500 cursor-pointer shadow-2xs"
            >
              {allUsers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Thread Custom Tag Filters (Dropdown Selection) */}
      <div className="px-3 py-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 relative">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
            <Filter size={10} />
            <span>Filter by Tag</span>
          </span>
          {selectedThreadTagFilter && (
            <button
              type="button"
              onClick={() => onSetThreadTagFilter(null)}
              className="text-[10px] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        <div ref={tagDropdownRef} className="relative">
          <button
            type="button"
            id="thread-tag-filter-dropdown-btn"
            onClick={() => setIsTagDropdownOpen((prev) => !prev)}
            className={cn(
              'w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg border text-xs transition-all cursor-pointer shadow-2xs text-left',
              selectedThreadTagFilter
                ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 font-medium'
                : 'bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            )}
          >
            <div className="flex items-center gap-2 min-w-0 truncate">
              {selectedThreadTagFilter ? (
                <span
                  className={cn(
                    'text-[10px] font-semibold px-2 py-0.5 rounded border truncate shadow-2xs',
                    getThreadTagColor(selectedThreadTagFilter)
                  )}
                >
                  {selectedThreadTagFilter}
                </span>
              ) : (
                <span className="text-xs text-slate-600 dark:text-slate-400 truncate">
                  All Tags ({threads.length} threads)
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0 text-slate-400">
              {selectedThreadTagFilter && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSetThreadTagFilter(null);
                  }}
                  className="p-0.5 hover:text-slate-700 dark:hover:text-slate-200 rounded cursor-pointer"
                  title="Clear tag filter"
                >
                  <X size={12} />
                </span>
              )}
              <ChevronDown
                size={13}
                className={cn('transition-transform duration-150', isTagDropdownOpen && 'rotate-180')}
              />
            </div>
          </button>

          {isTagDropdownOpen && (
            <div className="absolute left-0 right-0 top-full mt-1.5 z-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden py-1 max-h-56 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
              {/* Option: All Tags */}
              <button
                type="button"
                onClick={() => {
                  onSetThreadTagFilter(null);
                  setIsTagDropdownOpen(false);
                }}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-1.5 text-xs text-left transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800',
                  !selectedThreadTagFilter
                    ? 'font-bold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800'
                    : 'text-slate-700 dark:text-slate-300'
                )}
              >
                <div className="flex items-center gap-2">
                  <TagIcon size={12} className="text-slate-400" />
                  <span>All Tags</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span>{threads.length}</span>
                  {!selectedThreadTagFilter && <Check size={13} className="text-slate-900 dark:text-slate-100" />}
                </div>
              </button>

              <div className="my-1 border-b border-slate-100 dark:border-slate-800" />

              {/* Tag options */}
              {allThreadTags.length === 0 ? (
                <div className="px-3 py-2 text-[11px] text-slate-400 text-center">
                  No tags created yet
                </div>
              ) : (
                allThreadTags.map((tTag) => {
                  const count = threads.filter((t) => t.threadTags?.includes(tTag)).length;
                  const isSelected = selectedThreadTagFilter === tTag;
                  return (
                    <button
                      key={tTag}
                      type="button"
                      onClick={() => {
                        onSetThreadTagFilter(tTag);
                        setIsTagDropdownOpen(false);
                      }}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-1.5 text-xs text-left transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800',
                        isSelected
                          ? 'font-bold bg-indigo-50/50 dark:bg-indigo-950/40'
                          : 'text-slate-700 dark:text-slate-300'
                      )}
                    >
                      <span
                        className={cn(
                          'text-[10px] font-semibold px-2 py-0.5 rounded border tracking-tight truncate',
                          getThreadTagColor(tTag)
                        )}
                      >
                        {tTag}
                      </span>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span>{count}</span>
                        {isSelected && <Check size={13} className="text-indigo-600 dark:text-indigo-400" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* Conversations List with Scroll */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* Pinned Threads Section */}
        {pinnedThreads.length > 0 && (
          <div className="space-y-1">
            <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Pin size={11} className="text-slate-400 dark:text-slate-500" />
                <span>Pinned</span>
              </span>
              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold px-1.5 py-0.2 rounded-full">
                {pinnedThreads.length}
              </span>
            </div>
            {pinnedThreads.map(renderThreadItem)}
          </div>
        )}

        {/* Separate Divider between Pinned and Other Conversations */}
        {pinnedThreads.length > 0 && regularThreads.length > 0 && (
          <div className="pt-1 pb-1">
            <div className="border-b border-slate-200 dark:border-slate-800" />
          </div>
        )}

        {/* Regular Conversations List */}
        <div className="space-y-1">
          <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {pinnedThreads.length > 0 ? 'Conversations' : 'All Conversations'}
          </div>
          {regularThreads.map(renderThreadItem)}
          {filteredThreads.length === 0 && selectedThreadTagFilter && (
            <div className="text-center py-6 px-3 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
              <TagIcon size={20} className="mx-auto text-slate-400 mb-1.5" />
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                No matching conversations
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                No threads are tagged with #{selectedThreadTagFilter}
              </div>
              <button
                type="button"
                onClick={() => onSetThreadTagFilter(null)}
                className="mt-2 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-semibold cursor-pointer"
              >
                Reset filter
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Conversations Panel Footer: User Status, Mock Settings & About Link */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 space-y-2">
        {/* Quick About ThreadFlow Link */}
        <button
          type="button"
          onClick={() => onOpenSettings('about')}
          className="w-full flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer group"
          title="ThreadFlow Vision Manifesto & Architecture Specification"
        >
          <span className="flex items-center gap-1.5">
            <BookOpen size={13} className="text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200" />
            <span>Vision Manifesto &amp; PoC Thesis</span>
          </span>
          <span className="text-[10px] text-slate-600 dark:text-slate-300 font-semibold bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
            PoC Spec
          </span>
        </button>

        {/* User Persona & Settings Row */}
        <div className="flex items-center justify-between gap-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800">
          <div
            onClick={() => onOpenSettings('personas')}
            className="flex items-center gap-2 min-w-0 flex-1 cursor-pointer hover:opacity-85 transition-opacity"
            title="Click to switch persona or manage permissions"
          >
            <UserAvatar user={currentUser} size="sm" />
            <div className="min-w-0 truncate">
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate leading-tight">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate leading-tight">
                {currentUser.role}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              id="sidebar-theme-tint-btn"
              onClick={() => onOpenSettings('theme')}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer flex items-center justify-center relative group"
              title="Appearance & Theme Tint"
              aria-label="Appearance & Theme Tint"
            >
              <span
                className="w-3.5 h-3.5 rounded-full border border-white dark:border-slate-800 shadow-2xs group-hover:scale-110 transition-transform"
                style={{ backgroundColor: 'var(--theme-primary-light)' }}
              />
            </button>
            <button
              type="button"
              id="sidebar-plugins-btn"
              onClick={() => onOpenSettings('plugins')}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Extensions & Plugins (Sandbox)"
              aria-label="Extensions & Plugins"
            >
              <Puzzle size={15} />
            </button>
            <button
              type="button"
              onClick={() => onOpenSettings('about')}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="About ThreadFlow"
            >
              <Info size={15} />
            </button>
            <button
              type="button"
              onClick={() => onOpenSettings('general')}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Settings"
            >
              <Settings size={15} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
