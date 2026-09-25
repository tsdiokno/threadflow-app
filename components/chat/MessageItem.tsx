'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Pin,
  Tag as TagIcon,
  Link2,
  Share2,
  CornerDownRight,
  Eye,
  Check,
  CheckCheck,
  MapPin,
  ExternalLink,
  BarChart2,
  MoreHorizontal,
  Pencil,
  History,
  ChevronRight,
  Plus,
  Play,
  Music,
  Video,
} from 'lucide-react';
import { cn, formatTimecode } from '@/lib/utils';
import { FileAttachment, Message, Thread, User } from '@/types/chat';
import { MessageContentRenderer } from './MessageContentRenderer';
import { TagBadge } from '@/components/chat/TagBadge';

interface MessageItemProps {
  msg: Message;
  activeThread: Thread | null;
  allMessages: Message[];
  allUsers: User[];
  files: FileAttachment[];
  currentUserId: string;
  currentUserName: string;
  filterTagId: string | null;
  highlightedMsgId: string | null;
  tagPopoverMsgId: string | null;
  activeActionsMenuMsgId?: string | null;
  onClearFilterTag: () => void;
  onScrollToMessage: (msgId: string) => void;
  onOpenFileAtPin: (fileId: string, pinNumber?: number, timestampSeconds?: number) => void;
  onVotePoll: (msgId: string, optionId: string) => void;
  onTagClick: (tagId: string) => void;
  onReply: (msg: Message) => void;
  onRequestPinMessage: (msg: Message) => void;
  onToggleTagPopover: (msgId: string | null) => void;
  onToggleActionsMenu?: (msgId: string | null) => void;
  onToggleMessageTag: (msgId: string, tagId: string) => void;
  onCreateTag: () => void;
  onCopyMessageLink: (msg: Message) => void;
  onInsertMessageReference: (msg: Message) => void;
  onNavigateToMessageLink: (threadId: string, messageId: string) => void;
  onEditMessage?: (msgId: string, newContent: string) => void;
  onOpenEditHistory?: (msg: Message) => void;
}

export function MessageItem({
  msg,
  activeThread,
  allMessages,
  allUsers,
  files,
  currentUserId,
  currentUserName,
  filterTagId,
  highlightedMsgId,
  tagPopoverMsgId,
  activeActionsMenuMsgId,
  onClearFilterTag,
  onScrollToMessage,
  onOpenFileAtPin,
  onVotePoll,
  onTagClick,
  onReply,
  onRequestPinMessage,
  onToggleTagPopover,
  onToggleActionsMenu,
  onToggleMessageTag,
  onCreateTag,
  onCopyMessageLink,
  onInsertMessageReference,
  onNavigateToMessageLink,
  onEditMessage,
  onOpenEditHistory,
}: MessageItemProps) {
  const isMe = msg.sender === 'me';
  const msgTags = activeThread?.tagDefs.filter((t) => msg.tagIds.includes(t.id)) || [];
  const annotatedFile = msg.annotationFileId ? files.find((f) => f.id === msg.annotationFileId) : null;
  const replyTargetId = msg.replyParentId || msg.annotationParentId;
  const isReply = Boolean(replyTargetId);
  const parentMsg = replyTargetId ? allMessages.find((m) => m.id === replyTargetId) : null;
  const replyAuthor = msg.replyToName || msg.annotationReplyToName || parentMsg?.senderName || 'author';
  const replyQuote = msg.replySnippet || msg.annotationRootContent || parentMsg?.content || '';
  const isRootAnnotation = Boolean(msg.annotationFileId && !msg.annotationParentId && !msg.replyParentId);

  // Message Editing State
  const [isEditing, setIsEditing] = useState(false);
  const [editDraft, setEditDraft] = useState(msg.content);
  const [showTagsSubmenu, setShowTagsSubmenu] = useState(false);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const isMenuOpen = activeActionsMenuMsgId === msg.id;

  const handleStartEdit = () => {
    setEditDraft(msg.content);
    setIsEditing(true);
    setShowTagsSubmenu(false);
    onToggleActionsMenu?.(null);
  };

  // Focus textarea when editing starts
  useEffect(() => {
    if (isEditing && editTextareaRef.current) {
      editTextareaRef.current.focus();
      editTextareaRef.current.selectionStart = editTextareaRef.current.value.length;
      editTextareaRef.current.selectionEnd = editTextareaRef.current.value.length;
    }
  }, [isEditing]);

  // Close options menu on outside click or escape
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleMousedown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowTagsSubmenu(false);
        onToggleActionsMenu?.(null);
      }
    };
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowTagsSubmenu(false);
        onToggleActionsMenu?.(null);
      }
    };
    document.addEventListener('mousedown', handleMousedown);
    document.addEventListener('keydown', handleKeydown);
    return () => {
      document.removeEventListener('mousedown', handleMousedown);
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [isMenuOpen, onToggleActionsMenu]);

  const handleSaveEdit = () => {
    const trimmed = editDraft.trim();
    if (!trimmed) return;
    if (trimmed !== msg.content) {
      onEditMessage?.(msg.id, trimmed);
    }
    setIsEditing(false);
  };

  return (
    <div
      key={msg.id}
      id={`msg-${msg.id}`}
      className={cn('flex flex-col scroll-mt-20', isMe ? 'items-end' : 'items-start')}
    >
      {/* View in Context Option when Filter is Active */}
      {filterTagId && (
        <div className={cn('mb-1.5 flex', isMe ? 'justify-end' : 'justify-start')}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClearFilterTag();
              setTimeout(() => {
                onScrollToMessage(msg.id);
              }, 50);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 shadow-2xs transition-colors cursor-pointer group/ctx"
            title="Remove sibling filter and view this message in full conversation context"
          >
            <Eye size={13} className="text-indigo-600 dark:text-indigo-400 group-hover/ctx:scale-110 transition-transform" />
            <span>View in context</span>
          </button>
        </div>
      )}

      {/* Sender & Timestamp, (edited) status, and 3-dots Menu Trigger */}
      <div
        className={cn(
          'flex items-center gap-2 mb-1 px-1 text-xs relative',
          isMe ? 'justify-end' : 'justify-start'
        )}
      >
        <span className="font-medium text-slate-700 dark:text-slate-300">{msg.senderName}</span>
        <span className="text-slate-400 dark:text-slate-500">{msg.timestamp}</span>

        {/* (edited) label button */}
        {msg.isEdited && (
          <button
            type="button"
            id={`edited-badge-${msg.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onOpenEditHistory?.(msg);
            }}
            className="text-[11px] text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline cursor-pointer flex items-center gap-0.5"
            title="Message was edited. Click to view edit history."
          >
            <span>(edited)</span>
          </button>
        )}

        {/* Conventional 3-dots trigger button (click-invoked, NOT hover) */}
        <div className="relative inline-flex items-center">
          <button
            type="button"
            id={`msg-actions-btn-${msg.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleActionsMenu?.(isMenuOpen ? null : msg.id);
            }}
            className={cn(
              'p-1 rounded-md text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-colors cursor-pointer',
              isMenuOpen && 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100'
            )}
            title="Message options (click to open)"
            aria-label="Message options"
            aria-expanded={isMenuOpen}
          >
            <MoreHorizontal size={14} />
          </button>

          {/* Conventional Pop-up Options Menu (Click-invoked, NOT hover) */}
          {isMenuOpen && (
            <div
              ref={menuRef}
              className={cn(
                'absolute top-6 z-40 w-52 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-1 animate-in fade-in zoom-in-95 duration-100 text-left',
                isMe ? 'right-0' : 'left-0'
              )}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                id={`reply-menu-btn-${msg.id}`}
                type="button"
                onClick={() => {
                  onReply(msg);
                  onToggleActionsMenu?.(null);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer text-left"
              >
                <CornerDownRight size={14} className="text-slate-400 dark:text-slate-500 shrink-0" />
                <span className="font-medium">Reply</span>
              </button>

              {/* Edit Message option (for current user's messages, excluding polls) */}
              {isMe && !msg.poll && (
                <button
                  id={`edit-menu-btn-${msg.id}`}
                  type="button"
                  onClick={handleStartEdit}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer text-left"
                >
                  <Pencil size={14} className="text-slate-400 dark:text-slate-500 shrink-0" />
                  <span className="font-medium">Edit message</span>
                </button>
              )}

              {/* Pin / Unpin option */}
              <button
                id={`pin-menu-btn-${msg.id}`}
                type="button"
                onClick={() => {
                  onRequestPinMessage(msg);
                  onToggleActionsMenu?.(null);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer text-left"
              >
                <Pin
                  size={14}
                  className={cn(
                    'shrink-0',
                    msg.isPinned
                      ? 'fill-amber-500 text-amber-600 dark:text-amber-400'
                      : 'text-slate-400 dark:text-slate-500'
                  )}
                />
                <span className="font-medium">{msg.isPinned ? 'Unpin message' : 'Pin to thread'}</span>
              </button>

              {/* Tags toggle / submenu */}
              <div>
                <button
                  id={`tag-menu-btn-${msg.id}`}
                  type="button"
                  onClick={() => setShowTagsSubmenu((prev) => !prev)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <TagIcon size={14} className="text-slate-400 dark:text-slate-500 shrink-0" />
                    <span className="font-medium">Tags</span>
                  </div>
                  <ChevronRight
                    size={13}
                    className={cn('text-slate-400 transition-transform shrink-0', showTagsSubmenu && 'rotate-90')}
                  />
                </button>

                {showTagsSubmenu && (
                  <div className="my-1 py-1 px-1 bg-slate-50 dark:bg-slate-900/60 rounded-lg border border-slate-100 dark:border-slate-700/60 space-y-0.5 max-h-40 overflow-y-auto">
                    <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 px-2 py-0.5 uppercase tracking-wider flex items-center justify-between">
                      <span>Thread tags</span>
                      <button
                        type="button"
                        onClick={() => {
                          onCreateTag();
                          onToggleActionsMenu?.(null);
                        }}
                        className="text-indigo-600 dark:text-indigo-400 hover:underline lowercase font-medium flex items-center gap-0.5 cursor-pointer"
                      >
                        <Plus size={10} /> new
                      </button>
                    </div>
                    {(!activeThread?.tagDefs || activeThread.tagDefs.length === 0) && (
                      <div className="text-xs text-slate-400 px-2 py-1">No tags configured</div>
                    )}
                    {activeThread?.tagDefs.map((tag) => {
                      const isApplied = msg.tagIds.includes(tag.id);
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => onToggleMessageTag(msg.id, tag.id)}
                          className={cn(
                            'w-full flex items-center justify-between px-2 py-1 rounded text-xs text-left transition-colors cursor-pointer',
                            isApplied
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold'
                              : 'hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                          )}
                        >
                          <span className="truncate">{tag.name}</span>
                          {isApplied && <Check size={12} className="text-indigo-600 dark:text-indigo-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Copy link */}
              <button
                id={`copy-link-menu-btn-${msg.id}`}
                type="button"
                onClick={() => {
                  onCopyMessageLink(msg);
                  onToggleActionsMenu?.(null);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer text-left"
              >
                <Link2 size={14} className="text-slate-400 dark:text-slate-500 shrink-0" />
                <span className="font-medium">Copy link</span>
              </button>

              {/* Reference in Composer */}
              <button
                id={`ref-menu-btn-${msg.id}`}
                type="button"
                onClick={() => {
                  onInsertMessageReference(msg);
                  onToggleActionsMenu?.(null);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer text-left"
              >
                <Share2 size={14} className="text-slate-400 dark:text-slate-500 shrink-0" />
                <span className="font-medium">Reference in composer</span>
              </button>

              {/* View Edit History (if message has been edited) */}
              {msg.isEdited && (
                <button
                  id={`history-menu-btn-${msg.id}`}
                  type="button"
                  onClick={() => {
                    onOpenEditHistory?.(msg);
                    onToggleActionsMenu?.(null);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors cursor-pointer text-left border-t border-slate-100 dark:border-slate-700/60 mt-1 pt-1.5"
                >
                  <History size={14} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                  <span className="font-semibold">View edit history</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pinned Message Tag Badge if msg is pinned */}
      {msg.isPinned && (
        <div
          className={cn(
            'flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300 mb-1 px-1',
            isMe ? 'justify-end' : 'justify-start'
          )}
        >
          <button
            type="button"
            id={`unpin-badge-btn-${msg.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onRequestPinMessage(msg);
            }}
            className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-md shadow-2xs hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors cursor-pointer"
            title="Click to toggle pin / unpin message"
          >
            <Pin size={10} className="fill-amber-600 text-amber-600 dark:text-amber-400" />
            <span>Pinned to thread</span>
          </button>
        </div>
      )}

      <div className="relative group max-w-[78%]">
        {/* Standardized Message Bubble */}
        <div
          className={cn(
            'px-4 py-3 rounded-2xl shadow-sm text-[15px] leading-relaxed transition-all',
            isMe
              ? 'bg-indigo-600 text-white rounded-br-sm'
              : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-bl-sm',
            highlightedMsgId === msg.id && 'ring-4 ring-amber-400 ring-offset-2 animate-pulse',
            msg.isPinned && !isMe && 'border-amber-300 dark:border-amber-600 ring-1 ring-amber-200 dark:ring-amber-900/60'
          )}
        >
          {/* Truncated Quote Linked to Parent Message */}
          {isReply && replyQuote && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (replyTargetId) onScrollToMessage(replyTargetId);
              }}
              className={cn(
                'w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs mb-2 border-l-2 transition-colors cursor-pointer truncate group/quote',
                isMe
                  ? 'bg-indigo-700/60 hover:bg-indigo-700 border-indigo-300 text-indigo-100'
                  : 'bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200/80 dark:hover:bg-slate-700 border-indigo-500 text-slate-600 dark:text-slate-300'
              )}
              title={`Jump to ${replyAuthor}'s message`}
            >
              <CornerDownRight
                size={13}
                className={cn('shrink-0', isMe ? 'text-indigo-200' : 'text-indigo-500 dark:text-indigo-400')}
              />
              <span className={cn('font-semibold shrink-0', isMe ? 'text-white' : 'text-slate-800 dark:text-slate-100')}>
                {replyAuthor}:
              </span>
              <span className="truncate italic">&ldquo;{replyQuote}&rdquo;</span>
              {msg.annotationPoint?.pinNumber && (
                <span
                  onClick={(e) => {
                    if (annotatedFile) {
                      e.stopPropagation();
                      onOpenFileAtPin(
                        annotatedFile.id,
                        msg.annotationPoint?.pinNumber,
                        msg.annotationPoint?.timestampSeconds
                      );
                    }
                  }}
                  className={cn(
                    'ml-auto shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 hover:opacity-90',
                    isMe ? 'bg-indigo-800 text-white' : 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200'
                  )}
                  title="Open annotation in preview"
                >
                  {msg.annotationPoint?.timestampSeconds !== undefined ? (
                    <>
                      <Play size={8} className="fill-current" />
                      <span>{formatTimecode(msg.annotationPoint.timestampSeconds)}</span>
                      <span className="opacity-70 font-normal">#P{msg.annotationPoint.pinNumber}</span>
                    </>
                  ) : (
                    <>
                      <MapPin size={9} /> Pin #{msg.annotationPoint.pinNumber}
                    </>
                  )}
                </span>
              )}
            </button>
          )}

          {/* Root Annotation Image or Media Header */}
          {isRootAnnotation && annotatedFile && (() => {
            const isAudioFile = annotatedFile.type.startsWith('audio/') || annotatedFile.name.endsWith('.mp3');
            const isVideoFile = annotatedFile.type.startsWith('video/') || annotatedFile.name.endsWith('.mp4');
            const sec = msg.annotationPoint?.timestampSeconds;
            const timeStr = sec !== undefined ? formatTimecode(sec) : null;

            return (
              <div
                onClick={() => onOpenFileAtPin(annotatedFile.id, msg.annotationPoint?.pinNumber, sec)}
                className={cn(
                  'flex items-center gap-2 px-2.5 py-1.5 rounded-lg mb-2 text-xs font-medium cursor-pointer border transition-colors',
                  isMe
                    ? 'bg-indigo-700/60 hover:bg-indigo-700 border-indigo-500 text-white'
                    : 'bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200'
                )}
                title="Click to view file annotation"
              >
                {isAudioFile ? (
                  <Music size={13} className={cn('shrink-0', isMe ? 'text-amber-200' : 'text-amber-500 dark:text-amber-400')} />
                ) : isVideoFile ? (
                  <Video size={13} className={cn('shrink-0', isMe ? 'text-rose-200' : 'text-rose-500 dark:text-rose-400')} />
                ) : (
                  <MapPin size={12} className={cn('shrink-0', isMe ? 'text-indigo-200' : 'text-indigo-500 dark:text-indigo-400')} />
                )}
                <span className="font-semibold truncate">{annotatedFile.name}</span>
                {timeStr ? (
                  <span
                    className={cn(
                      'shrink-0 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold flex items-center gap-1',
                      isMe
                        ? 'bg-amber-800/80 text-amber-200'
                        : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300/50 dark:border-amber-700/50'
                    )}
                  >
                    <Play size={8} className="fill-current" />
                    <span>{timeStr}</span>
                    {msg.annotationPoint?.pinNumber && (
                      <span className="opacity-75 font-sans font-normal">#P{msg.annotationPoint.pinNumber}</span>
                    )}
                  </span>
                ) : msg.annotationPoint?.pinNumber ? (
                  <span
                    className={cn(
                      'shrink-0 px-1.5 py-0.2 rounded text-[10px] font-bold',
                      isMe ? 'bg-indigo-800 text-white' : 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                    )}
                  >
                    Pin #{msg.annotationPoint.pinNumber}
                  </span>
                ) : null}
                <ExternalLink
                  size={12}
                  className={cn('ml-auto shrink-0', isMe ? 'text-indigo-200' : 'text-slate-400 dark:text-slate-500')}
                />
              </div>
            );
          })()}

          {/* Message Body Content or Inline Editor with interactive reference links & @mentions */}
          {isEditing ? (
            <div className="w-full space-y-2 my-1" onClick={(e) => e.stopPropagation()}>
              <textarea
                ref={editTextareaRef}
                value={editDraft}
                onChange={(e) => setEditDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSaveEdit();
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    setIsEditing(false);
                    setEditDraft(msg.content);
                  }
                }}
                className={cn(
                  'w-full px-3 py-2 rounded-xl text-sm border focus:outline-hidden focus:ring-2 focus:ring-indigo-500 resize-none leading-relaxed transition-colors',
                  isMe
                    ? 'bg-indigo-700/90 text-white border-indigo-400 placeholder:text-indigo-200'
                    : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-600'
                )}
                rows={Math.max(2, Math.min(8, editDraft.split('\n').length))}
                placeholder="Edit message..."
              />
              <div className="flex items-center justify-between text-xs gap-2">
                <span className={cn('text-[11px]', isMe ? 'text-indigo-200' : 'text-slate-400 dark:text-slate-500')}>
                  esc to <button type="button" onClick={() => { setIsEditing(false); setEditDraft(msg.content); }} className="underline hover:opacity-80 cursor-pointer">cancel</button> • enter to <button type="button" onClick={handleSaveEdit} className="underline hover:opacity-80 cursor-pointer">save</button>
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setEditDraft(msg.content);
                    }}
                    className={cn(
                      'px-2.5 py-1 text-xs rounded-lg transition-colors cursor-pointer',
                      isMe
                        ? 'text-indigo-100 hover:bg-indigo-700'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    )}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    disabled={!editDraft.trim()}
                    className={cn(
                      'px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-2xs',
                      isMe
                        ? 'bg-white text-indigo-900 hover:bg-indigo-50 disabled:opacity-50'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50'
                    )}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <MessageContentRenderer
              content={msg.content}
              isMe={isMe}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              allUsers={allUsers}
              onNavigateToMessageLink={onNavigateToMessageLink}
            />
          )}

          {/* Interactive Poll Display */}
          {msg.poll && (
            <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 w-full text-left">
              <div
                className={cn(
                  'rounded-xl p-3.5 border shadow-2xs space-y-3',
                  isMe
                    ? 'bg-indigo-800/60 border-indigo-500/60 text-white'
                    : 'bg-slate-50 dark:bg-slate-900/80 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div
                      className={cn(
                        'flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider mb-1',
                        isMe ? 'text-indigo-200' : 'text-indigo-600 dark:text-indigo-400'
                      )}
                    >
                      <BarChart2 size={12} />
                      <span>Poll</span>
                      <span className={cn('font-normal lowercase', isMe ? 'text-indigo-300' : 'text-slate-400 dark:text-slate-500')}>
                        ({msg.poll.allowMultiple ? 'multiple choices allowed' : 'single choice'})
                      </span>
                    </div>
                    <h4 className={cn('font-semibold text-sm leading-snug', isMe ? 'text-white' : 'text-slate-900 dark:text-slate-100')}>
                      {msg.poll.question}
                    </h4>
                  </div>
                  <span
                    className={cn(
                      'text-[10px] shrink-0 font-medium',
                      isMe ? 'text-indigo-200' : 'text-slate-400 dark:text-slate-500'
                    )}
                  >
                    by {msg.poll.createdBy}
                  </span>
                </div>

                <div className="space-y-2">
                  {msg.poll.options.map((opt) => {
                    const totalVotes = msg.poll!.options.reduce((acc, o) => acc + o.voterIds.length, 0);
                    const optVotes = opt.voterIds.length;
                    const pct = totalVotes > 0 ? Math.round((optVotes / totalVotes) * 100) : 0;
                    const hasVoted = opt.voterIds.includes(currentUserId);

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => onVotePoll(msg.id, opt.id)}
                        className={cn(
                          'relative w-full text-left p-2.5 rounded-xl border transition-all overflow-hidden cursor-pointer text-xs',
                          hasVoted
                            ? isMe
                              ? 'border-amber-400 bg-indigo-950/70'
                              : 'border-indigo-500 dark:border-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/50'
                            : isMe
                            ? 'border-indigo-500/40 bg-indigo-900/40 hover:border-indigo-400'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                        )}
                      >
                        {/* Percentage background bar */}
                        <div
                          className={cn(
                            'absolute top-0 bottom-0 left-0 transition-all duration-300 pointer-events-none rounded-xl',
                            hasVoted
                              ? isMe
                                ? 'bg-indigo-600/40'
                                : 'bg-indigo-100 dark:bg-indigo-900/60'
                              : isMe
                              ? 'bg-indigo-700/20'
                              : 'bg-slate-100 dark:bg-slate-700/50'
                          )}
                          style={{ width: `${pct}%` }}
                        />

                        <div className="relative z-10 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className={cn(
                                'w-4 h-4 rounded-md flex items-center justify-center shrink-0 border transition-colors',
                                hasVoted
                                  ? isMe
                                    ? 'bg-amber-400 border-amber-400 text-amber-950'
                                    : 'bg-indigo-600 dark:bg-indigo-500 border-indigo-600 dark:border-indigo-500 text-white'
                                  : isMe
                                  ? 'border-indigo-300/60 bg-indigo-700/50'
                                  : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                              )}
                            >
                              {hasVoted && <Check size={11} />}
                            </div>
                            <span className={cn('font-medium truncate', hasVoted ? 'font-bold' : '')}>
                              {opt.text}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 text-[11px] font-semibold">
                            <span>{optVotes}</span>
                            <span className={cn('text-[10px]', isMe ? 'text-indigo-200' : 'text-slate-400 dark:text-slate-500')}>
                              ({pct}%)
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div
                  className={cn(
                    'flex items-center justify-between text-[11px] pt-1.5 border-t',
                    isMe ? 'border-indigo-600/60 text-indigo-200' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                  )}
                >
                  <span>
                    {msg.poll.options.reduce((acc, o) => acc + o.voterIds.length, 0)} total{' '}
                    {msg.poll.options.reduce((acc, o) => acc + o.voterIds.length, 0) === 1 ? 'vote' : 'votes'}
                  </span>
                  {msg.poll.options.some((o) => o.voterIds.includes(currentUserId)) ? (
                    <span
                      className={cn(
                        'font-semibold flex items-center gap-1',
                        isMe ? 'text-amber-300' : 'text-indigo-600 dark:text-indigo-400'
                      )}
                    >
                      <CheckCheck size={12} /> You voted
                    </span>
                  ) : (
                    <span className="italic opacity-80">Click option to vote</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Inline Message Tags */}
        {msgTags.length > 0 && (
          <div className={cn('flex flex-wrap gap-1.5 mt-2', isMe ? 'justify-end' : 'justify-start')}>
            {msgTags.map((tag) => {
              const count = allMessages.filter(
                (m) => m.threadId === activeThread?.id && m.tagIds.includes(tag.id)
              ).length;
              return (
                <TagBadge
                  key={tag.id}
                  tag={tag}
                  size="xs"
                  showIcon={true}
                  onClick={() => onTagClick(tag.id)}
                  title={
                    count === 1
                      ? 'Single-message tag: click to scroll to tagged message'
                      : `Click to filter messages tagged with "${tag.name}"`
                  }
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
