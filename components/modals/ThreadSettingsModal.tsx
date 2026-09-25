/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState } from 'react';
import {
  X,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Plus,
  Check,
  Sliders,
  Tag as TagIcon,
  BarChart2,
  Trash2,
  Pencil,
  Info,
  Layers,
  Sparkles,
  Users,
  Camera,
  ImagePlus,
  Search,
  UserPlus,
  UserMinus,
  Crown,
  KeyRound,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Message, TagCategory, TagDef, Thread, ThreadTagPermission, User } from '@/types/chat';
import { canUserManageThreadTags, getThreadTagColor, isUserAdminOrLead } from '@/lib/chat-utils';
import { PRESET_COLORS } from '@/lib/mock-data';
import { CoverPickerModal } from '@/components/chat/CoverPickerModal';
import { PollCard } from '@/components/chat/PollCard';
import { UserAvatar } from '@/components/chat/UserAvatar';

export type ThreadSettingsTab = 'general' | 'members' | 'thread-tags' | 'message-tags' | 'polls';

interface ThreadSettingsModalProps {
  threadId: string | null;
  threads: Thread[];
  currentUserId: string;
  currentUser: User;
  users: User[];
  allMessages?: Message[];
  initialTab?: ThreadSettingsTab;
  onClose: () => void;
  onSaveThreadTitle?: (newTitle: string) => void;
  onSaveThreadDesc?: (newDesc: string) => void;
  onUpdateThreadCover?: (threadId: string, coverUrl: string | null) => void;
  onAddThreadTag?: (threadId: string, tagName: string) => void;
  onRemoveThreadTag?: (threadId: string, tagName: string) => void;
  onUpdatePermission?: (
    threadId: string,
    permission: ThreadTagPermission,
    allowedTaggerIds?: string[]
  ) => void;
  onAddMember?: (threadId: string, userId: string) => void;
  onRemoveMember?: (threadId: string, userId: string) => void;
  onSwitchUser?: (userId: string) => void;
  onCreateMessageTag?: (newTag: {
    name: string;
    description: string;
    color: string;
    isUnique: boolean;
    category?: TagCategory;
    icon?: string;
  }) => void;
  onSaveTagEdit?: (
    tagId: string,
    name: string,
    desc: string,
    color: string,
    isUnique: boolean,
    category?: TagCategory,
    icon?: string
  ) => void;
  onDeleteTag?: (tagId: string) => void;
  onToggleTagUnique?: (tagId: string) => void;
  onOpenCreatePoll?: () => void;
  onScrollToMessage?: (msgId: string) => void;
  onNavigateToMessage?: (threadId: string, msgId: string) => void;
}

export function ThreadSettingsModal({
  threadId,
  threads,
  currentUserId,
  currentUser,
  users,
  allMessages = [],
  initialTab = 'general',
  onClose,
  onSaveThreadTitle,
  onSaveThreadDesc,
  onUpdateThreadCover,
  onAddThreadTag,
  onRemoveThreadTag,
  onUpdatePermission,
  onAddMember,
  onRemoveMember,
  onSwitchUser,
  onCreateMessageTag,
  onSaveTagEdit,
  onDeleteTag,
  onToggleTagUnique,
  onOpenCreatePoll,
  onScrollToMessage,
  onNavigateToMessage,
}: ThreadSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<ThreadSettingsTab>(initialTab);

  if (!threadId) return null;
  const modalThread = threads.find((t) => t.id === threadId);
  if (!modalThread) return null;

  return (
    <ThreadSettingsModalContent
      modalThread={modalThread}
      threads={threads}
      currentUserId={currentUserId}
      currentUser={currentUser}
      users={users}
      allMessages={allMessages}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onClose={onClose}
      onSaveThreadTitle={onSaveThreadTitle}
      onSaveThreadDesc={onSaveThreadDesc}
      onUpdateThreadCover={onUpdateThreadCover}
      onAddThreadTag={onAddThreadTag}
      onRemoveThreadTag={onRemoveThreadTag}
      onUpdatePermission={onUpdatePermission}
      onAddMember={onAddMember}
      onRemoveMember={onRemoveMember}
      onSwitchUser={onSwitchUser}
      onCreateMessageTag={onCreateMessageTag}
      onSaveTagEdit={onSaveTagEdit}
      onDeleteTag={onDeleteTag}
      onToggleTagUnique={onToggleTagUnique}
      onOpenCreatePoll={onOpenCreatePoll}
      onScrollToMessage={onScrollToMessage}
      onNavigateToMessage={onNavigateToMessage}
    />
  );
}

function ThreadSettingsModalContent({
  modalThread,
  threads,
  currentUserId,
  currentUser,
  users,
  allMessages,
  activeTab,
  setActiveTab,
  onClose,
  onSaveThreadTitle,
  onSaveThreadDesc,
  onUpdateThreadCover,
  onAddThreadTag,
  onRemoveThreadTag,
  onUpdatePermission,
  onAddMember,
  onRemoveMember,
  onSwitchUser,
  onCreateMessageTag,
  onSaveTagEdit,
  onDeleteTag,
  onToggleTagUnique,
  onOpenCreatePoll,
  onScrollToMessage,
  onNavigateToMessage,
}: {
  modalThread: Thread;
  threads: Thread[];
  currentUserId: string;
  currentUser: User;
  users: User[];
  allMessages: Message[];
  activeTab: ThreadSettingsTab;
  setActiveTab: (tab: ThreadSettingsTab) => void;
  onClose: () => void;
  onSaveThreadTitle?: (newTitle: string) => void;
  onSaveThreadDesc?: (newDesc: string) => void;
  onUpdateThreadCover?: (threadId: string, coverUrl: string | null) => void;
  onAddThreadTag?: (threadId: string, tagName: string) => void;
  onRemoveThreadTag?: (threadId: string, tagName: string) => void;
  onUpdatePermission?: (
    threadId: string,
    permission: ThreadTagPermission,
    allowedTaggerIds?: string[]
  ) => void;
  onAddMember?: (threadId: string, userId: string) => void;
  onRemoveMember?: (threadId: string, userId: string) => void;
  onSwitchUser?: (userId: string) => void;
  onCreateMessageTag?: (newTag: {
    name: string;
    description: string;
    color: string;
    isUnique: boolean;
    category?: TagCategory;
    icon?: string;
  }) => void;
  onSaveTagEdit?: (
    tagId: string,
    name: string,
    desc: string,
    color: string,
    isUnique: boolean,
    category?: TagCategory,
    icon?: string
  ) => void;
  onDeleteTag?: (tagId: string) => void;
  onToggleTagUnique?: (tagId: string) => void;
  onOpenCreatePoll?: () => void;
  onScrollToMessage?: (msgId: string) => void;
  onNavigateToMessage?: (threadId: string, msgId: string) => void;
}) {
  // General Tab State
  const [titleValue, setTitleValue] = useState(modalThread.name);
  const [descValue, setDescValue] = useState(modalThread.description || '');
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);
  const [isCoverPickerOpen, setIsCoverPickerOpen] = useState(false);

  // Members Tab State
  const [memberSearchQuery, setMemberSearchQuery] = useState('');

  // Thread Tags Tab State
  const [newThreadTagInput, setNewThreadTagInput] = useState('');

  // Message Tags Tab State
  const [isCreatingMsgTag, setIsCreatingMsgTag] = useState(false);
  const [newMsgTagName, setNewMsgTagName] = useState('');
  const [newMsgTagDesc, setNewMsgTagDesc] = useState('');
  const [newMsgTagColor, setNewMsgTagColor] = useState(PRESET_COLORS[0]);
  const [newMsgTagUnique, setNewMsgTagUnique] = useState(false);
  const [newMsgTagCategory, setNewMsgTagCategory] = useState<TagCategory>('general');
  const [newMsgTagIcon, setNewMsgTagIcon] = useState('🏷️');

  // Editing existing message tag
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editTagName, setEditTagName] = useState('');
  const [editTagDesc, setEditTagDesc] = useState('');
  const [editTagColor, setEditTagColor] = useState('');
  const [editTagUnique, setEditTagUnique] = useState(false);
  const [editTagCategory, setEditTagCategory] = useState<TagCategory>('general');
  const [editTagIcon, setEditTagIcon] = useState('🏷️');

  const canManage = canUserManageThreadTags(modalThread, currentUserId, users);
  const isCreatorOrAdmin =
    (modalThread.creatorId || modalThread.memberIds[0]) === currentUserId ||
    isUserAdminOrLead(currentUserId, users);
  const creatorUser = users.find(
    (u) => u.id === (modalThread.creatorId || modalThread.memberIds[0])
  );
  const currentPermission = modalThread.tagPermission || 'all';

  const quickPresetTags = [
    'urgent',
    'to-review',
    'roadmap',
    'decision-needed',
    'blocked',
    'qa-ready',
    'customer-escalation',
    'confidential',
  ];

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    if (titleValue.trim() && onSaveThreadTitle) {
      onSaveThreadTitle(titleValue.trim());
    }
    if (onSaveThreadDesc) {
      onSaveThreadDesc(descValue.trim());
    }
    setSavedSuccessMsg('Thread details saved');
    setTimeout(() => setSavedSuccessMsg(null), 2500);
  };

  const handleAddThreadTagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThreadTagInput.trim() || !onAddThreadTag) return;
    onAddThreadTag(modalThread.id, newThreadTagInput.trim());
    setNewThreadTagInput('');
  };

  const handleCreateMsgTagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsgTagName.trim() || !onCreateMessageTag) return;
    onCreateMessageTag({
      name: newMsgTagName.trim(),
      description: newMsgTagDesc.trim(),
      color: newMsgTagColor,
      isUnique: newMsgTagUnique,
      category: newMsgTagCategory,
      icon: newMsgTagIcon,
    });
    setNewMsgTagName('');
    setNewMsgTagDesc('');
    setNewMsgTagColor(PRESET_COLORS[0]);
    setNewMsgTagUnique(false);
    setNewMsgTagCategory('general');
    setNewMsgTagIcon('🏷️');
    setIsCreatingMsgTag(false);
  };

  const startEditMsgTag = (tag: TagDef) => {
    setEditingTagId(tag.id);
    setEditTagName(tag.name);
    setEditTagDesc(tag.description || '');
    setEditTagColor(tag.color);
    setEditTagUnique(tag.isUnique);
    setEditTagCategory(tag.category || 'general');
    setEditTagIcon(tag.icon || '🏷️');
  };

  const handleSaveEditMsgTag = (tagId: string) => {
    if (!editTagName.trim() || !onSaveTagEdit) {
      setEditingTagId(null);
      return;
    }
    onSaveTagEdit(
      tagId,
      editTagName.trim(),
      editTagDesc.trim(),
      editTagColor,
      editTagUnique,
      editTagCategory,
      editTagIcon
    );
    setEditingTagId(null);
  };

  const threadPolls = allMessages.filter((m) => m.threadId === modalThread.id && Boolean(m.poll));

  // Filter members for Members Tab
  const memberUsers = users.filter((u) => modalThread.memberIds.includes(u.id));
  const nonMemberUsers = users.filter((u) => !modalThread.memberIds.includes(u.id));

  const filteredMembers = memberUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(memberSearchQuery.toLowerCase())
  );

  return (
    <div
      id="thread-settings-modal"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0">
              <Sliders size={16} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {modalThread.name}
                </h3>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                  {modalThread.type === 'dm' ? 'Direct Message' : 'Channel'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                Created by {creatorUser?.name || 'Creator'} ({creatorUser?.role || 'Member'})
              </p>
            </div>
          </div>
          <button
            type="button"
            id="close-thread-settings-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 dark:border-slate-800 px-4 bg-white dark:bg-slate-900 shrink-0 gap-1 overflow-x-auto">
          <button
            type="button"
            id="thread-tab-general-btn"
            onClick={() => setActiveTab('general')}
            className={cn(
              'px-3 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0',
              activeTab === 'general'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            )}
          >
            <Info size={14} />
            <span>General</span>
          </button>

          <button
            type="button"
            id="thread-tab-members-btn"
            onClick={() => setActiveTab('members')}
            className={cn(
              'px-3 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0',
              activeTab === 'members'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            )}
          >
            <Users size={14} />
            <span>Members</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {modalThread.memberIds.length}
            </span>
          </button>

          <button
            type="button"
            id="thread-tab-thread-tags-btn"
            onClick={() => setActiveTab('thread-tags')}
            className={cn(
              'px-3 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0',
              activeTab === 'thread-tags'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            )}
          >
            <TagIcon size={14} />
            <span>Thread Tags</span>
          </button>

          <button
            type="button"
            id="thread-tab-message-tags-btn"
            onClick={() => setActiveTab('message-tags')}
            className={cn(
              'px-3 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0',
              activeTab === 'message-tags'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            )}
          >
            <Layers size={14} />
            <span>Message Tags</span>
          </button>

          <button
            type="button"
            id="thread-tab-polls-btn"
            onClick={() => setActiveTab('polls')}
            className={cn(
              'px-3 py-2.5 text-xs font-medium border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0',
              activeTab === 'polls'
                ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            )}
          >
            <BarChart2 size={14} />
            <span>Polls</span>
            {threadPolls.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {threadPolls.length}
              </span>
            )}
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-700 dark:text-slate-300 flex-1">
          {/* TAB 1: GENERAL */}
          {activeTab === 'general' && (
            <form onSubmit={handleSaveGeneral} className="space-y-4">
              {/* Cover Photo */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Cover Photo
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCoverPickerOpen(true)}
                    className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Camera size={12} />
                    <span>{modalThread.coverImage ? 'Change Cover' : 'Add Cover'}</span>
                  </button>
                </div>
                {modalThread.coverImage ? (
                  <div className="relative w-full h-24 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-2xs group">
                    {modalThread.coverImage.startsWith('linear-gradient') ? (
                      <div className="w-full h-full" style={{ background: modalThread.coverImage }} />
                    ) : (
                      <img
                        src={modalThread.coverImage}
                        alt="Cover"
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsCoverPickerOpen(true)}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white text-slate-900 hover:bg-slate-100 shadow-xs cursor-pointer"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateThreadCover?.(modalThread.id, null)}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-600 text-white hover:bg-rose-700 shadow-xs cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsCoverPickerOpen(true)}
                    className="w-full h-16 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-indigo-50/30 flex items-center justify-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all cursor-pointer"
                  >
                    <ImagePlus size={15} />
                    <span>Choose an optional cover photo or gradient</span>
                  </button>
                )}
              </div>

              {/* Thread Title */}
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Thread Title
                </label>
                <input
                  type="text"
                  value={titleValue}
                  onChange={(e) => setTitleValue(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:bg-white dark:focus:bg-slate-850 focus:border-indigo-500 text-slate-800 dark:text-slate-100 transition-colors"
                  placeholder="Thread Title"
                  required
                />
              </div>

              {/* Thread Description */}
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Description
                </label>
                <textarea
                  value={descValue}
                  onChange={(e) => setDescValue(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:bg-white dark:focus:bg-slate-850 focus:border-indigo-500 text-slate-800 dark:text-slate-100 transition-colors resize-none"
                  placeholder="Context, focus, and objectives of this thread..."
                />
              </div>

              {savedSuccessMsg && (
                <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center gap-1.5">
                  <Check size={14} className="text-emerald-600 dark:text-emerald-400" />
                  <span>{savedSuccessMsg}</span>
                </div>
              )}

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: MEMBERS & PERMISSIONS */}
          {activeTab === 'members' && (
            <div className="space-y-4">
              {/* Search & Overview */}
              <div className="flex items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={memberSearchQuery}
                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                    placeholder="Search thread members..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:bg-white dark:focus:bg-slate-850 focus:border-indigo-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-medium shrink-0">
                  {modalThread.memberIds.length} {modalThread.memberIds.length === 1 ? 'member' : 'members'}
                </div>
              </div>

              {/* Members List */}
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-850">
                {filteredMembers.map((member) => {
                  const isCreator =
                    member.id === (modalThread.creatorId || modalThread.memberIds[0]);
                  const isAdminLead = isUserAdminOrLead(member.id, users);
                  const isCustomAllowed = (modalThread.allowedTaggerIds || []).includes(member.id);

                  // Compute thread permission for this user
                  let permissionSummary: {
                    label: string;
                    canTag: boolean;
                    roleBadge: string;
                  };

                  if (isCreator) {
                    permissionSummary = {
                      label: 'Thread Owner (Full Access)',
                      canTag: true,
                      roleBadge: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/80',
                    };
                  } else if (modalThread.tagPermission === 'all') {
                    permissionSummary = {
                      label: 'Can edit tags & post',
                      canTag: true,
                      roleBadge: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
                    };
                  } else if (modalThread.tagPermission === 'admins') {
                    permissionSummary = {
                      label: isAdminLead ? 'Admin tag manager' : 'Read-only tags',
                      canTag: isAdminLead,
                      roleBadge: isAdminLead
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/80'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700',
                    };
                  } else if (modalThread.tagPermission === 'custom') {
                    permissionSummary = {
                      label: isCustomAllowed ? 'Designated tagger' : 'Read-only tags',
                      canTag: isCustomAllowed,
                      roleBadge: isCustomAllowed
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700',
                    };
                  } else {
                    // creator only
                    permissionSummary = {
                      label: 'Read-only tags',
                      canTag: false,
                      roleBadge: 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700',
                    };
                  }

                  const isCurrentUser = member.id === currentUserId;

                  return (
                    <div
                      key={member.id}
                      className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <UserAvatar user={member} size="sm" showStatus={true} />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-slate-900 dark:text-slate-100 text-xs truncate">
                              {member.name}
                            </span>
                            {isCurrentUser && (
                              <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                                (You)
                              </span>
                            )}
                            {isCreator && (
                              <span
                                className="inline-flex items-center text-amber-500"
                                title="Thread Creator"
                              >
                                <Crown size={12} />
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {member.role}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Thread Permission Badge */}
                        <div
                          className={cn(
                            'text-[10px] font-medium px-2 py-0.5 rounded-md border flex items-center gap-1',
                            permissionSummary.roleBadge
                          )}
                          title={permissionSummary.label}
                        >
                          {permissionSummary.canTag ? (
                            <ShieldCheck size={11} className="text-emerald-500 shrink-0" />
                          ) : (
                            <ShieldAlert size={11} className="text-slate-400 shrink-0" />
                          )}
                          <span className="truncate max-w-[120px] sm:max-w-none">
                            {permissionSummary.label}
                          </span>
                        </div>

                        {/* Remove Member action (only channels with >1 member and authorized) */}
                        {modalThread.type !== 'dm' &&
                          modalThread.memberIds.length > 1 &&
                          !isCreator &&
                          isCreatorOrAdmin &&
                          onRemoveMember && (
                            <button
                              type="button"
                              onClick={() => onRemoveMember(modalThread.id, member.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors cursor-pointer"
                              title={`Remove ${member.name} from thread`}
                            >
                              <UserMinus size={13} />
                            </button>
                          )}
                      </div>
                    </div>
                  );
                })}

                {filteredMembers.length === 0 && (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No members match &quot;{memberSearchQuery}&quot;
                  </div>
                )}
              </div>

              {/* Add Member Section (for channels) */}
              {modalThread.type !== 'dm' && nonMemberUsers.length > 0 && isCreatorOrAdmin && (
                <div className="pt-2">
                  <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                    <UserPlus size={13} className="text-indigo-600 dark:text-indigo-400" />
                    <span>Add Workspace Member to Thread</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {nonMemberUsers.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => onAddMember?.(modalThread.id, user.id)}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <UserAvatar user={user} size="xs" />
                        <span>{user.name}</span>
                        <Plus size={12} className="text-indigo-600 dark:text-indigo-400 ml-0.5" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: THREAD TAGS & PERMISSIONS */}
          {activeTab === 'thread-tags' && (
            <div className="space-y-4">
              {/* Assigned Thread Tags */}
              <div>
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block mb-2">
                  Assigned Thread Tags
                </label>

                {modalThread.threadTags && modalThread.threadTags.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                    {modalThread.threadTags.map((tag) => (
                      <span
                        key={tag}
                        className={cn(
                          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border shadow-2xs transition-all',
                          getThreadTagColor(tag)
                        )}
                      >
                        <span>{tag}</span>
                        {canManage && onRemoveThreadTag && (
                          <button
                            type="button"
                            onClick={() => onRemoveThreadTag(modalThread.id, tag)}
                            className="hover:opacity-75 hover:bg-black/10 dark:hover:bg-white/10 rounded p-0.5 cursor-pointer transition-colors"
                            title={`Remove tag ${tag}`}
                          >
                            <X size={12} />
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-center text-slate-400 text-xs">
                    No thread tags assigned yet.
                  </div>
                )}
              </div>

              {/* Add Custom Tag Form */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                  Add Thread Tag
                </label>
                <form onSubmit={handleAddThreadTagSubmit} className="flex items-center gap-2">
                  <input
                    type="text"
                    disabled={!canManage}
                    value={newThreadTagInput}
                    onChange={(e) => setNewThreadTagInput(e.target.value)}
                    placeholder={
                      canManage
                        ? 'e.g. urgent, to-review, roadmap'
                        : 'Tag modification restricted for your role'
                    }
                    className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:bg-white dark:focus:bg-slate-850 focus:border-indigo-500 disabled:opacity-60 text-slate-800 dark:text-slate-100 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!canManage || !newThreadTagInput.trim()}
                    className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 rounded-xl transition-colors shadow-xs cursor-pointer shrink-0 flex items-center gap-1"
                  >
                    <Plus size={14} /> Add
                  </button>
                </form>

                {/* Quick Presets */}
                {canManage && (
                  <div className="pt-1">
                    <div className="text-[11px] text-slate-400 dark:text-slate-500 mb-1.5">
                      Suggested tags:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {quickPresetTags
                        .filter((pt) => !modalThread.threadTags?.includes(pt))
                        .map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => onAddThreadTag && onAddThreadTag(modalThread.id, preset)}
                            className="text-xs px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 transition-colors cursor-pointer font-medium flex items-center gap-1"
                          >
                            <Plus size={10} />
                            <span>{preset}</span>
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Tag Policy Configuration */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-medium text-slate-700 dark:text-slate-300 block">
                      Tagging Permissions Policy
                    </label>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Who is authorized to attach or remove tags on this thread.
                    </p>
                  </div>
                  {!isCreatorOrAdmin && (
                    <span className="text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded">
                      Admin / Creator Only
                    </span>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-2">
                  {[
                    {
                      key: 'all' as ThreadTagPermission,
                      title: 'All Members',
                      desc: 'Any participant can manage tags',
                    },
                    {
                      key: 'creator' as ThreadTagPermission,
                      title: 'Creator Only',
                      desc: `Solely ${creatorUser?.name || 'the creator'}`,
                    },
                    {
                      key: 'admins' as ThreadTagPermission,
                      title: 'Admins & Leads',
                      desc: 'Team leads and admins only',
                    },
                    {
                      key: 'custom' as ThreadTagPermission,
                      title: 'Designated Members',
                      desc: 'Explicit whitelist of taggers',
                    },
                  ].map((opt) => {
                    const isSelected = currentPermission === opt.key;
                    return (
                      <div
                        key={opt.key}
                        onClick={() => {
                          if (isCreatorOrAdmin && onUpdatePermission) {
                            onUpdatePermission(modalThread.id, opt.key);
                          }
                        }}
                        className={cn(
                          'p-3 rounded-xl border transition-all text-left',
                          isCreatorOrAdmin ? 'cursor-pointer' : 'opacity-70 cursor-not-allowed',
                          isSelected
                            ? 'bg-indigo-50/70 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-700 ring-1 ring-indigo-500/20'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                        )}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                            {opt.title}
                          </span>
                          <div
                            className={cn(
                              'w-4 h-4 rounded-full border flex items-center justify-center',
                              isSelected
                                ? 'border-indigo-600 bg-indigo-600 text-white'
                                : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700'
                            )}
                          >
                            {isSelected && <Check size={10} />}
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {opt.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Designated Members Picker when policy is custom */}
                {currentPermission === 'custom' && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs font-medium text-slate-700 dark:text-slate-300">
                      <span>Select Authorized Members:</span>
                      <span className="text-[11px] text-slate-400">
                        {(modalThread.allowedTaggerIds || []).length} of{' '}
                        {modalThread.memberIds.length} members
                      </span>
                    </div>
                    <div className="space-y-1 max-h-36 overflow-y-auto">
                      {modalThread.memberIds.map((mId) => {
                        const member = users.find((u) => u.id === mId);
                        if (!member) return null;
                        const isAllowed = (modalThread.allowedTaggerIds || []).includes(mId);
                        return (
                          <label
                            key={mId}
                            className={cn(
                              'flex items-center justify-between p-2 rounded-lg border text-xs transition-colors',
                              isAllowed
                                ? 'bg-white dark:bg-slate-800 border-indigo-200 dark:border-indigo-700 font-medium'
                                : 'bg-transparent border-transparent text-slate-600 dark:text-slate-400',
                              isCreatorOrAdmin ? 'cursor-pointer hover:bg-white dark:hover:bg-slate-800' : 'cursor-not-allowed opacity-75'
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                disabled={!isCreatorOrAdmin}
                                checked={isAllowed}
                                onChange={() => {
                                  if (!isCreatorOrAdmin || !onUpdatePermission) return;
                                  const currentAllowed = modalThread.allowedTaggerIds || [];
                                  const nextAllowed = isAllowed
                                    ? currentAllowed.filter((id) => id !== mId)
                                    : [...currentAllowed, mId];
                                  onUpdatePermission(modalThread.id, 'custom', nextAllowed);
                                }}
                                className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                              />
                              <span>{member.name}</span>
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {member.role}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: MESSAGE TAGS */}
          {activeTab === 'message-tags' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Message Tag Definitions
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Define tags, colors, and unique constraints for messages in this thread.
                  </p>
                </div>
                {!isCreatingMsgTag && (
                  <button
                    type="button"
                    onClick={() => setIsCreatingMsgTag(true)}
                    className="px-2.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                  >
                    <Plus size={13} />
                    <span>New Tag</span>
                  </button>
                )}
              </div>

              {/* Create Message Tag Form */}
              {isCreatingMsgTag && (
                <form
                  onSubmit={handleCreateMsgTagSubmit}
                  className="p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-indigo-200 dark:border-indigo-700 rounded-xl space-y-3"
                >
                  <div className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                    <Sparkles size={13} />
                    <span>Create Message Tag</span>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-600 dark:text-slate-300 block mb-1">
                      Tag Name
                    </label>
                    <input
                      type="text"
                      autoFocus
                      value={newMsgTagName}
                      onChange={(e) => setNewMsgTagName(e.target.value)}
                      placeholder="e.g. decision, action-item, spec"
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-600 dark:text-slate-300 block mb-1">
                      Category
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { id: 'inspiration' as TagCategory, label: 'Inspiration', icon: '💡' },
                        { id: 'resource' as TagCategory, label: 'Links & Specs', icon: '🔗' },
                        { id: 'decision' as TagCategory, label: 'Decision', icon: '🎯' },
                        { id: 'action' as TagCategory, label: 'Action Item', icon: '⚡' },
                        { id: 'general' as TagCategory, label: 'General', icon: '🏷️' },
                      ].map((arch) => (
                        <button
                          key={arch.id}
                          type="button"
                          onClick={() => {
                            setNewMsgTagCategory(arch.id);
                            setNewMsgTagIcon(arch.icon);
                          }}
                          className={cn(
                            'px-2 py-1 text-xs rounded-lg border flex items-center gap-1 transition-all cursor-pointer font-medium',
                            newMsgTagCategory === arch.id
                              ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-semibold'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                          )}
                        >
                          <span>{arch.icon}</span>
                          <span>{arch.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-600 dark:text-slate-300 block mb-1">
                      Description (Optional)
                    </label>
                    <input
                      type="text"
                      value={newMsgTagDesc}
                      onChange={(e) => setNewMsgTagDesc(e.target.value)}
                      placeholder="When to apply this tag"
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-600 dark:text-slate-300 block mb-1">
                      Color Theme
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_COLORS.map((col, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setNewMsgTagColor(col)}
                          className={cn(
                            'h-6 px-2 text-[10px] font-medium rounded-md border flex items-center gap-1 transition-transform cursor-pointer',
                            col,
                            newMsgTagColor === col
                              ? 'ring-2 ring-indigo-500 scale-105'
                              : 'opacity-70 hover:opacity-100'
                          )}
                        >
                          {newMsgTagColor === col && <Check size={10} />}
                          Color {idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-1">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div>
                        <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
                          Unique Constraint
                        </span>
                        <p className="text-[11px] text-slate-400">
                          Limit to at most 1 message in this thread
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={newMsgTagUnique}
                        onChange={(e) => setNewMsgTagUnique(e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer h-4 w-4"
                      />
                    </label>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setIsCreatingMsgTag(false)}
                      className="px-3 py-1 text-xs text-slate-500 hover:bg-slate-200/60 dark:hover:bg-slate-700 rounded-lg cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newMsgTagName.trim()}
                      className="px-3.5 py-1 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer shadow-2xs"
                    >
                      Create Tag
                    </button>
                  </div>
                </form>
              )}

              {/* Message Tags List */}
              <div className="space-y-2">
                {modalThread.tagDefs.map((tag) => {
                  const tagCount = allMessages.filter(
                    (m) => m.threadId === modalThread.id && m.tagIds.includes(tag.id)
                  ).length;

                  if (editingTagId === tag.id) {
                    return (
                      <div
                        key={tag.id}
                        className="border-2 border-indigo-300 dark:border-indigo-600 rounded-xl p-3 bg-white dark:bg-slate-800 shadow-sm space-y-2.5"
                      >
                        <div className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                          Edit Message Tag
                        </div>

                        <div>
                          <label className="text-[11px] font-medium text-slate-600 dark:text-slate-300 block mb-1">
                            Name
                          </label>
                          <input
                            autoFocus
                            value={editTagName}
                            onChange={(e) => setEditTagName(e.target.value)}
                            className="w-full text-xs font-medium bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-medium text-slate-600 dark:text-slate-300 block mb-1">
                            Category
                          </label>
                          <div className="flex flex-wrap gap-1.5">
                            {[
                              { id: 'inspiration' as TagCategory, label: 'Inspiration', icon: '💡' },
                              { id: 'resource' as TagCategory, label: 'Links & Specs', icon: '🔗' },
                              { id: 'decision' as TagCategory, label: 'Decision', icon: '🎯' },
                              { id: 'action' as TagCategory, label: 'Action Item', icon: '⚡' },
                              { id: 'general' as TagCategory, label: 'General', icon: '🏷️' },
                            ].map((arch) => (
                              <button
                                key={arch.id}
                                type="button"
                                onClick={() => {
                                  setEditTagCategory(arch.id);
                                  setEditTagIcon(arch.icon);
                                }}
                                className={cn(
                                  'px-2 py-0.5 text-xs rounded-lg border flex items-center gap-1 transition-all cursor-pointer font-medium',
                                  editTagCategory === arch.id
                                    ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-semibold'
                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                                )}
                              >
                                <span>{arch.icon}</span>
                                <span>{arch.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] font-medium text-slate-600 dark:text-slate-300 block mb-1">
                            Description
                          </label>
                          <input
                            value={editTagDesc}
                            onChange={(e) => setEditTagDesc(e.target.value)}
                            className="w-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 outline-none focus:border-indigo-500 text-slate-800 dark:text-slate-100"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-medium text-slate-600 dark:text-slate-300 block mb-1">
                            Color Theme
                          </label>
                          <div className="flex flex-wrap gap-1.5">
                            {PRESET_COLORS.map((col, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setEditTagColor(col)}
                                className={cn(
                                  'h-6 px-2 text-[10px] font-medium rounded-md border flex items-center gap-1 transition-transform cursor-pointer',
                                  col,
                                  editTagColor === col
                                    ? 'ring-2 ring-indigo-500 scale-105'
                                    : 'opacity-70 hover:opacity-100'
                                )}
                              >
                                {editTagColor === col && <Check size={10} />}
                                Color {idx + 1}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="pt-1">
                          <label className="flex items-center justify-between cursor-pointer">
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                              Unique Constraint (1 message max)
                            </span>
                            <input
                              type="checkbox"
                              checked={editTagUnique}
                              onChange={(e) => setEditTagUnique(e.target.checked)}
                              className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer h-4 w-4"
                            />
                          </label>
                        </div>

                        <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-700">
                          <button
                            type="button"
                            onClick={() => setEditingTagId(null)}
                            className="px-2.5 py-1 text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEditMsgTag(tag.id)}
                            className="px-3 py-1 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg cursor-pointer shadow-2xs"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={tag.id}
                      className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl p-3 shadow-2xs space-y-2 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={cn(
                              'px-2.5 py-0.5 rounded-md text-xs font-medium border truncate',
                              tag.color
                            )}
                          >
                            {tag.name}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {tagCount} {tagCount === 1 ? 'message' : 'messages'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => startEditMsgTag(tag)}
                            className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Pencil size={12} />
                          </button>
                          {onDeleteTag && (
                            <button
                              type="button"
                              onClick={() => onDeleteTag(tag.id)}
                              className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </div>

                      {tag.description && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {tag.description}
                        </p>
                      )}

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                        <span
                          className={cn(
                            'text-[10px] font-medium',
                            tag.isUnique
                              ? 'text-indigo-600 dark:text-indigo-400'
                              : 'text-slate-400'
                          )}
                        >
                          {tag.isUnique ? 'Unique (1 msg max)' : 'Multi-message'}
                        </span>
                        {onToggleTagUnique && (
                          <button
                            type="button"
                            onClick={() => onToggleTagUnique(tag.id)}
                            className={cn(
                              'relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full transition-colors focus:outline-none',
                              tag.isUnique
                                ? 'bg-indigo-600 dark:bg-indigo-500'
                                : 'bg-slate-200 dark:bg-slate-700'
                            )}
                            title="Toggle uniqueness"
                          >
                            <span
                              className={cn(
                                'inline-block h-3 w-3 transform rounded-full bg-white transition-transform mt-0.5 ml-0.5 shadow-xs',
                                tag.isUnique ? 'translate-x-3' : 'translate-x-0'
                              )}
                            />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {modalThread.tagDefs.length === 0 && (
                  <div className="text-center py-6 px-4 bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 text-xs">
                    No message tags configured yet.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: POLLS */}
          {activeTab === 'polls' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    Thread Polls
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Decision polls and team sentiment checks created in this thread.
                  </p>
                </div>
                {onOpenCreatePoll && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenCreatePoll();
                    }}
                    className="px-2.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                  >
                    <Plus size={13} />
                    <span>Create Poll</span>
                  </button>
                )}
              </div>

              <div className="space-y-2.5">
                {threadPolls.length === 0 ? (
                  <div className="text-center py-8 px-4 bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-400 text-xs">
                    <BarChart2 size={24} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    No polls active in this thread yet.
                  </div>
                ) : (
                  threadPolls.map((pollMsg) => (
                    <PollCard
                      key={pollMsg.id}
                      message={pollMsg}
                      currentUserId={currentUserId}
                      onClick={() => {
                        onClose();
                        if (onNavigateToMessage) {
                          onNavigateToMessage(modalThread.id, pollMsg.id);
                        } else if (onScrollToMessage) {
                          onScrollToMessage(pollMsg.id);
                        }
                      }}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-50/60 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            {onSwitchUser && (
              <div className="flex items-center gap-1.5">
                <KeyRound size={12} className="text-slate-400" />
                <span className="text-[11px] text-slate-500">Test as:</span>
                <select
                  value={currentUserId}
                  onChange={(e) => onSwitchUser(e.target.value)}
                  className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-0.5 text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-white bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>

      {/* Cover Picker Modal inside Thread Settings */}
      <CoverPickerModal
        isOpen={isCoverPickerOpen}
        onClose={() => setIsCoverPickerOpen(false)}
        currentCover={modalThread.coverImage}
        onSelectCover={(newCover) => {
          if (onUpdateThreadCover) {
            onUpdateThreadCover(modalThread.id, newCover);
          }
        }}
      />
    </div>
  );
}
