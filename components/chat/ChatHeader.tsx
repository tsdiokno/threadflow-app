'use client';

import React from 'react';
import {
  Search,
  Hash,
  Users,
  Lock,
  Pin,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Palette,
  Webhook,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Thread, User } from '@/types/chat';
import { WorkspaceViewMode } from '@/types/plugins';
import { UserAvatar } from '@/components/chat/UserAvatar';

interface ChatHeaderProps {
  activeThread: Thread | null;
  onOpenSearch: () => void;
  users?: User[];
  currentUserId?: string;
  isLeftSidebarOpen?: boolean;
  onToggleLeftSidebar?: () => void;
  isRightSidebarOpen?: boolean;
  onToggleRightSidebar?: () => void;
  workspaceViewMode?: WorkspaceViewMode;
  onChangeWorkspaceViewMode?: (mode: WorkspaceViewMode) => void;
  isProjectViewsEnabled?: boolean;
  onOpenThreadSkins?: () => void;
  isCustomSkinsEnabled?: boolean;
  onOpenWebhookModal?: () => void;
  isWebhookEnabled?: boolean;
  // Optional legacy props kept for backward-compatibility
  activeThreadFilesCount?: number;
  activeMessagesWithPollsCount?: number;
  rightSidebarTab?: 'tags' | 'polls' | 'files';
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
  onTogglePinThread?: (threadId: string) => void;
  onSelectRightSidebarTab?: (tab: 'tags' | 'polls' | 'files') => void;
}

export function ChatHeader({
  activeThread,
  onOpenSearch,
  users,
  currentUserId,
  isLeftSidebarOpen = true,
  onToggleLeftSidebar,
  isRightSidebarOpen = true,
  onToggleRightSidebar,
  workspaceViewMode = 'chat',
  onChangeWorkspaceViewMode,
  isProjectViewsEnabled = false,
  onOpenThreadSkins,
  isCustomSkinsEnabled = false,
  onOpenWebhookModal,
  isWebhookEnabled = false,
}: ChatHeaderProps) {
  if (!activeThread) {
    return (
      <header className="h-16 px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0" />
    );
  }

  const otherUser =
    activeThread.type === 'dm'
      ? users?.find(
          (u) => activeThread.memberIds.includes(u.id) && u.id !== currentUserId
        ) || users?.find((u) => u.name.toLowerCase() === activeThread.name.toLowerCase())
      : null;

  return (
    <header className="h-16 px-4 sm:px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 gap-3 transition-colors">
      {/* 1. Left Sidebar Toggle & Chat Prefix Icon/Avatar + Chat Title */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {onToggleLeftSidebar && (
          <button
            type="button"
            id="toggle-left-sidebar-btn"
            onClick={onToggleLeftSidebar}
            className={cn(
              'p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0',
              !isLeftSidebarOpen && 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-200 dark:border-indigo-800'
            )}
            title={isLeftSidebarOpen ? 'Collapse conversations panel' : 'Expand conversations panel'}
            aria-label="Toggle conversations panel"
          >
            {isLeftSidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
          </button>
        )}

        {activeThread.type === 'dm' ? (
          otherUser ? (
            <UserAvatar user={otherUser} size="md" showStatus={true} status="online" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 shadow-2xs">
              <Users size={16} />
            </div>
          )
        ) : (
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
            {activeThread.isPrivate ? (
              <Lock size={15} className="text-slate-500 dark:text-slate-400" />
            ) : (
              <Hash size={16} className="text-slate-500 dark:text-slate-400" />
            )}
          </div>
        )}

        <div className="flex items-center gap-2 min-w-0 truncate">
          <h2 className="font-semibold text-base text-slate-800 dark:text-slate-100 truncate">
            {activeThread.name}
          </h2>
          {activeThread.isPinned && (
            <span
              className="p-0.5 text-slate-400 dark:text-slate-500 shrink-0"
              title="Pinned conversation"
            >
              <Pin size={13} className="text-slate-400 dark:text-slate-500" />
            </span>
          )}
        </div>
      </div>

      {/* 2. Plugin Quick Actions + Search Bar + Right Sidebar Toggle */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Custom Skins Plugin Trigger */}
        {isCustomSkinsEnabled && onOpenThreadSkins && (
          <button
            type="button"
            onClick={onOpenThreadSkins}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors cursor-pointer shrink-0 hidden sm:flex items-center justify-center shadow-2xs"
            title="Revamp: Customize thread cosmetic skin and badges"
          >
            <Palette size={16} />
          </button>
        )}

        {/* Webhook Plugin Trigger */}
        {isWebhookEnabled && onOpenWebhookModal && (
          <button
            type="button"
            onClick={onOpenWebhookModal}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-transparent hover:border-purple-200 dark:hover:border-purple-800 transition-colors cursor-pointer shrink-0 hidden sm:flex items-center justify-center shadow-2xs"
            title="DevOps Webhook Dispatcher: Simulate inbound CI/CD notifications"
          >
            <Webhook size={16} />
          </button>
        )}
        <button
          type="button"
          id="thread-search-bar-btn"
          onClick={onOpenSearch}
          className="flex items-center gap-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/70 dark:hover:bg-slate-750 hover:border-indigo-300 dark:hover:border-indigo-600 border border-slate-200 dark:border-slate-700 px-3.5 py-1.5 rounded-xl text-xs transition-colors w-36 sm:w-52 md:w-64 cursor-pointer shadow-2xs group"
          title="Search messages, polls, pins, and files (⌘K)"
        >
          <Search
            size={14}
            className="text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 shrink-0 transition-colors"
          />
          <span className="flex-1 text-left truncate text-slate-500 dark:text-slate-400">
            Search messages...
          </span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-400 dark:text-slate-500 shrink-0">
            ⌘K
          </kbd>
        </button>

        {onToggleRightSidebar && (
          <button
            type="button"
            id="toggle-right-sidebar-btn"
            onClick={onToggleRightSidebar}
            className={cn(
              'p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0',
              !isRightSidebarOpen && 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-200 dark:border-indigo-800'
            )}
            title={isRightSidebarOpen ? 'Collapse metadata panel' : 'Expand metadata panel'}
            aria-label="Toggle metadata panel"
          >
            {isRightSidebarOpen ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
          </button>
        )}
      </div>
    </header>
  );
}
