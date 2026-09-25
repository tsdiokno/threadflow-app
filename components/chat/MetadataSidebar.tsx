/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useMemo } from 'react';
import {
  Plus,
  Tag as TagIcon,
  BarChart2,
  FileText as FileIcon,
  Filter,
  Settings,
  Sliders,
  Camera,
  ImagePlus,
  X,
  PanelRightClose,
  Music,
  Video,
} from 'lucide-react';
import { cn, formatTimecode } from '@/lib/utils';
import { getThreadTagColor } from '@/lib/chat-utils';
import { FileAttachment, Message, TagDef, Thread } from '@/types/chat';
import { ThreadSettingsTab } from '@/components/modals/ThreadSettingsModal';
import { CoverPickerModal } from '@/components/chat/CoverPickerModal';
import { PollCard } from '@/components/chat/PollCard';
import { TagBadge } from '@/components/chat/TagBadge';
import { ThreadTagBadge } from '@/components/chat/ThreadTagBadge';

interface MetadataSidebarProps {
  activeThread: Thread | null;
  allMessages: Message[];
  activeMessages: Message[];
  activeThreadFiles: FileAttachment[];
  currentUserId: string;
  rightSidebarTab: 'tags' | 'polls' | 'files';
  setRightSidebarTab: (tab: 'tags' | 'polls' | 'files') => void;
  filterTagId: string | null;
  onTagClick: (tagId: string) => void;
  onCreateTag?: (preset?: Partial<TagDef>) => void;
  onOpenThreadTagModal?: (threadId: string, initialTab?: ThreadSettingsTab) => void;
  onOpenThreadSettings?: (threadId: string, initialTab?: ThreadSettingsTab) => void;
  onUpdateThreadCover?: (threadId: string, coverUrl: string | null) => void;
  onRemoveThreadTag?: (threadId: string, tag: string) => void;
  onSaveThreadTitle?: (newTitle: string) => void;
  onSaveThreadDesc?: (newDesc: string) => void;
  onSaveTagEdit?: (tagId: string, name: string, desc: string, color: string, isUnique: boolean) => void;
  onDeleteTag?: (tagId: string) => void;
  onToggleTagUnique?: (tagId: string) => void;
  onScrollToMessage: (msgId: string) => void;
  onVotePoll: (msgId: string, optionId: string) => void;
  onOpenCreatePoll: () => void;
  onOpenFileAtPin: (fileId: string, pinNumber?: number, timestampSeconds?: number) => void;
  onTriggerFileUpload: () => void;
  onCollapse?: () => void;
}

export function MetadataSidebar({
  activeThread,
  allMessages,
  activeMessages,
  activeThreadFiles,
  currentUserId,
  rightSidebarTab,
  setRightSidebarTab,
  filterTagId,
  onTagClick,
  onCreateTag,
  onOpenThreadTagModal,
  onOpenThreadSettings,
  onUpdateThreadCover,
  onRemoveThreadTag,
  onScrollToMessage,
  onVotePoll,
  onOpenCreatePoll,
  onOpenFileAtPin,
  onTriggerFileUpload,
  onCollapse,
}: MetadataSidebarProps) {
  const [isCoverPickerOpen, setIsCoverPickerOpen] = useState(false);

  const handleOpenSettings = (tab: ThreadSettingsTab = 'general') => {
    if (!activeThread) return;
    if (onOpenThreadSettings) {
      onOpenThreadSettings(activeThread.id, tab);
    } else if (onOpenThreadTagModal) {
      onOpenThreadTagModal(activeThread.id, tab);
    }
  };

  // Map messages by tag ID
  const messagesByTag = useMemo(() => {
    const map = new Map<string, Message[]>();
    if (!activeThread) return map;
    for (const tag of activeThread.tagDefs) {
      const tagged = allMessages.filter(
        (m) => m.threadId === activeThread.id && m.tagIds && m.tagIds.includes(tag.id)
      );
      map.set(tag.id, tagged);
    }
    return map;
  }, [activeThread, allMessages]);

  if (!activeThread) return null;

  return (
    <aside
      id="metadata-sidebar"
      className="w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col shrink-0 overflow-hidden transition-colors"
    >
      {/* 1. Optional Cover Photo on top of Metadata Sidebar */}
      {activeThread.coverImage ? (
        <div className="relative w-full h-28 bg-slate-100 dark:bg-slate-800 overflow-hidden group/cover shrink-0 select-none border-b border-slate-200 dark:border-slate-800">
          {activeThread.coverImage.startsWith('linear-gradient') ? (
            <div className="w-full h-full" style={{ background: activeThread.coverImage }} />
          ) : (
            <img
              src={activeThread.coverImage}
              alt="Thread cover"
              className="w-full h-full object-cover transition-transform duration-300 group-hover/cover:scale-105"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/30" />

          {/* Cover Actions Overlay */}
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
            <button
              type="button"
              id="change-cover-btn"
              onClick={() => setIsCoverPickerOpen(true)}
              className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-black/55 hover:bg-black/75 text-white backdrop-blur-xs border border-white/20 transition-all flex items-center gap-1 shadow-xs cursor-pointer"
              title="Customize cover photo"
            >
              <Camera size={12} />
              <span>Cover</span>
            </button>

            <button
              type="button"
              id="open-thread-settings-btn"
              onClick={() => handleOpenSettings('general')}
              className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-black/55 hover:bg-black/75 text-white backdrop-blur-xs border border-white/20 transition-all flex items-center gap-1 shadow-xs cursor-pointer"
              title="Thread Settings"
            >
              <Settings size={12} />
              <span>Settings</span>
            </button>

            {onCollapse && (
              <button
                type="button"
                id="collapse-metadata-sidebar-btn"
                onClick={onCollapse}
                className="p-1.5 rounded-lg text-white/90 hover:text-white bg-black/55 hover:bg-black/75 backdrop-blur-xs border border-white/20 transition-all flex items-center shadow-xs cursor-pointer"
                title="Collapse metadata panel"
                aria-label="Collapse metadata panel"
              >
                <PanelRightClose size={13} />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="w-full h-16 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-3.5 relative group/cover shrink-0">
          <button
            type="button"
            id="add-cover-btn"
            onClick={() => setIsCoverPickerOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs text-xs font-semibold transition-all cursor-pointer"
            title="Add a custom cover photo to personalize this conversation"
          >
            <ImagePlus size={13} className="text-slate-600 dark:text-slate-300" />
            <span>Add Cover</span>
          </button>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              id="open-thread-settings-btn"
              onClick={() => handleOpenSettings('general')}
              className="px-2 py-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 shadow-2xs"
              title="Thread Settings"
            >
              <Settings size={13} />
              <span>Settings</span>
            </button>
            {onCollapse && (
              <button
                type="button"
                id="collapse-metadata-sidebar-btn"
                onClick={onCollapse}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 shadow-2xs"
                title="Collapse metadata panel"
                aria-label="Collapse metadata panel"
              >
                <PanelRightClose size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Thread Description & Thread Tags */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
        <div>
          {activeThread.description ? (
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {activeThread.description}
            </p>
          ) : (
            <p className="text-xs text-slate-400 dark:text-slate-500 italic">
              No description added
            </p>
          )}
        </div>

        {/* Thread Tags Component */}
        <div className="mt-3.5 pt-3 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Thread Tags
            </span>
          </div>

          {activeThread.threadTags && activeThread.threadTags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 items-center">
              {activeThread.threadTags.map((tag) => (
                <ThreadTagBadge
                  key={tag}
                  tagName={tag}
                  size="xs"
                />
              ))}
            </div>
          ) : (
            <div className="py-1.5 px-2.5 bg-white dark:bg-slate-800/60 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
              <span className="text-[11px] text-slate-400 dark:text-slate-500 italic">
                No thread tags assigned
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Tab Switcher - Headings without count badges */}
      <div className="flex items-center h-12 shrink-0 px-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <button
          type="button"
          id="tab-tags-btn"
          onClick={() => setRightSidebarTab('tags')}
          className={cn(
            'flex-1 h-full font-semibold text-xs border-b-2 transition-colors flex items-center justify-center gap-1.5 cursor-pointer',
            rightSidebarTab === 'tags'
              ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          )}
        >
          <TagIcon size={14} />
          <span>Tags</span>
        </button>
        <button
          type="button"
          id="tab-polls-btn"
          onClick={() => setRightSidebarTab('polls')}
          className={cn(
            'flex-1 h-full font-semibold text-xs border-b-2 transition-colors flex items-center justify-center gap-1.5 cursor-pointer',
            rightSidebarTab === 'polls'
              ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          )}
        >
          <BarChart2 size={14} />
          <span>Polls</span>
        </button>
        <button
          type="button"
          id="tab-files-btn"
          onClick={() => setRightSidebarTab('files')}
          className={cn(
            'flex-1 h-full font-semibold text-xs border-b-2 transition-colors flex items-center justify-center gap-1.5 cursor-pointer',
            rightSidebarTab === 'files'
              ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          )}
        >
          <FileIcon size={14} />
          <span>Files</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5">
        {rightSidebarTab === 'tags' ? (
          <div className="space-y-2">
            {activeThread.tagDefs.length === 0 ? (
              <div className="text-center py-8 px-4 bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 text-xs">
                <TagIcon size={24} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                No message tags created yet.
              </div>
            ) : (
                activeThread.tagDefs.map((tag) => {
                  const taggedMessages = messagesByTag.get(tag.id) || [];
                  const count = taggedMessages.length;
                  const isFiltered = filterTagId === tag.id;

                  return (
                    <div
                      key={tag.id}
                      id={`sidebar-tag-card-${tag.id}`}
                      onClick={() => onTagClick(tag.id)}
                      className={cn(
                        'p-3 rounded-xl border transition-all cursor-pointer select-none text-left shadow-2xs group',
                        isFiltered
                          ? 'bg-indigo-50/90 dark:bg-indigo-950/60 border-indigo-400 dark:border-indigo-600 ring-2 ring-indigo-500/20 text-indigo-950 dark:text-indigo-100'
                          : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-750 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-slate-50/70 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100'
                      )}
                      title={
                        isFiltered
                          ? `Filtering by "${tag.name}". Click to clear filter.`
                          : `Filter messages by "${tag.name}".`
                      }
                    >
                      <div className="flex items-center justify-between gap-2">
                        <TagBadge tag={tag} size="sm" showIcon={true} />

                        <div className="flex items-center gap-1.5 shrink-0">
                          {tag.isUnique && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-750 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              Unique
                            </span>
                          )}
                          <span
                            className={cn(
                              'text-[11px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors',
                              isFiltered
                                ? 'bg-indigo-600 text-white shadow-2xs'
                                : count > 0
                                ? 'bg-slate-100 dark:bg-slate-750 text-slate-700 dark:text-slate-200 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/60 group-hover:text-indigo-700 dark:group-hover:text-indigo-300'
                                : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                            )}
                          >
                            {isFiltered ? (
                              <>
                                <X size={11} />
                                <span>Clear ({count})</span>
                              </>
                            ) : (
                              <span>{count} {count === 1 ? 'msg' : 'msgs'}</span>
                            )}
                          </span>
                        </div>
                      </div>

                      {tag.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                          {tag.description}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
        ) : rightSidebarTab === 'polls' ? (
          <div>
            {/* Heading without count badge */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Thread Polls
              </h3>
              <button
                type="button"
                id="create-poll-btn"
                onClick={onOpenCreatePoll}
                className="px-2 py-1 rounded-lg text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 transition-colors flex items-center gap-1 cursor-pointer"
                title="Create new poll"
              >
                <Plus size={13} />
                <span>New Poll</span>
              </button>
            </div>

            <div className="space-y-3">
              {activeMessages.filter((m) => Boolean(m.poll)).length === 0 ? (
                <div className="text-center py-8 px-4 bg-slate-50 dark:bg-slate-850 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 dark:text-slate-400 text-xs">
                  <BarChart2 size={24} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                  No polls active in this thread yet.
                  <br />
                  <button
                    type="button"
                    onClick={onOpenCreatePoll}
                    className="mt-2 text-indigo-600 dark:text-indigo-400 font-medium hover:underline cursor-pointer"
                  >
                    Create a poll now
                  </button>
                </div>
              ) : (
                activeMessages
                  .filter((m) => Boolean(m.poll))
                  .map((pollMsg) => (
                    <PollCard
                      key={pollMsg.id}
                      message={pollMsg}
                      currentUserId={currentUserId}
                      onClick={() => onScrollToMessage(pollMsg.id)}
                    />
                  ))
              )}
            </div>
          </div>
        ) : (
          <div>
            {/* Heading without count badge */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Thread Files
              </h3>
              <button
                type="button"
                onClick={onTriggerFileUpload}
                className="p-1 rounded-md text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Upload new file"
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="space-y-2.5">
              {activeThreadFiles.length === 0 ? (
                <div className="text-center py-8 px-4 text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-850 dark:bg-slate-800/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                  No files uploaded to this thread yet. Attach files using the clip icon below.
                </div>
              ) : (
                activeThreadFiles.map((file) => {
                  const annotationCount = allMessages.filter(
                    (m) => m.annotationFileId === file.id
                  ).length;
                  const isAudio = file.type.startsWith('audio/') || file.name.endsWith('.mp3');
                  const isVideo = file.type.startsWith('video/') || file.name.endsWith('.mp4');

                  return (
                    <div
                      key={file.id}
                      onClick={() => onOpenFileAtPin(file.id)}
                      className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors group bg-white dark:bg-slate-850 shadow-sm"
                    >
                      {file.type.startsWith('image/') ? (
                        <img
                          src={file.url}
                          className="w-12 h-12 object-cover rounded-lg bg-slate-200 dark:bg-slate-700 shrink-0 border dark:border-slate-700"
                          alt="thumbnail"
                        />
                      ) : isAudio ? (
                        <div className="w-12 h-12 rounded-lg bg-amber-500/10 dark:bg-amber-400/10 border border-amber-200 dark:border-amber-800/80 flex items-center justify-center shrink-0 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
                          <Music size={22} />
                        </div>
                      ) : isVideo ? (
                        <div className="w-12 h-12 rounded-lg bg-rose-500/10 dark:bg-rose-400/10 border border-rose-200 dark:border-rose-800/80 flex items-center justify-center shrink-0 text-rose-600 dark:text-rose-400 group-hover:scale-105 transition-transform">
                          <Video size={22} />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-400 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
                          <FileIcon size={24} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate group-hover:text-slate-900 dark:group-hover:text-white">
                          {file.name}
                        </div>
                        <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                          {file.duration ? (
                            <span className="font-mono text-slate-500 dark:text-slate-400">
                              {formatTimecode(file.duration)} •
                            </span>
                          ) : null}
                          <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                          {annotationCount > 0 && (
                            <span className="text-slate-700 dark:text-slate-300 font-medium bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded-md border border-slate-200 dark:border-slate-700">
                              {annotationCount}{' '}
                              {isAudio || isVideo
                                ? annotationCount === 1
                                  ? 'timeline pin'
                                  : 'timeline pins'
                                : annotationCount === 1
                                ? 'pin'
                                : 'pins'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Cover Picker Modal */}
      <CoverPickerModal
        isOpen={isCoverPickerOpen}
        onClose={() => setIsCoverPickerOpen(false)}
        currentCover={activeThread.coverImage}
        onSelectCover={(newCover) => {
          if (onUpdateThreadCover) {
            onUpdateThreadCover(activeThread.id, newCover);
          }
        }}
      />
    </aside>
  );
}

