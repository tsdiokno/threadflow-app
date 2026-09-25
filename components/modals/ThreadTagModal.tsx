'use client';

import React from 'react';
import { Thread, ThreadTagPermission, User, Message } from '@/types/chat';
import { ThreadSettingsModal, ThreadSettingsTab } from './ThreadSettingsModal';

interface ThreadTagModalProps {
  threadId: string | null;
  threads: Thread[];
  currentUserId: string;
  currentUser: User;
  users: User[];
  allMessages?: Message[];
  initialTab?: ThreadSettingsTab;
  onClose: () => void;
  onAddTag: (threadId: string, tagName: string) => void;
  onRemoveTag: (threadId: string, tagName: string) => void;
  onUpdatePermission: (
    threadId: string,
    permission: ThreadTagPermission,
    allowedTaggerIds?: string[]
  ) => void;
  onSwitchUser: (userId: string) => void;
  onSaveThreadTitle?: (newTitle: string) => void;
  onSaveThreadDesc?: (newDesc: string) => void;
  onCreateMessageTag?: (newTag: { name: string; description: string; color: string; isUnique: boolean }) => void;
  onSaveTagEdit?: (tagId: string, name: string, desc: string, color: string, isUnique: boolean) => void;
  onDeleteTag?: (tagId: string) => void;
  onToggleTagUnique?: (tagId: string) => void;
  onOpenCreatePoll?: () => void;
  onScrollToMessage?: (msgId: string) => void;
  onNavigateToMessage?: (threadId: string, msgId: string) => void;
}

export function ThreadTagModal({
  threadId,
  threads,
  currentUserId,
  currentUser,
  users,
  allMessages,
  initialTab = 'thread-tags',
  onClose,
  onAddTag,
  onRemoveTag,
  onUpdatePermission,
  onSwitchUser,
  onSaveThreadTitle,
  onSaveThreadDesc,
  onCreateMessageTag,
  onSaveTagEdit,
  onDeleteTag,
  onToggleTagUnique,
  onOpenCreatePoll,
  onScrollToMessage,
  onNavigateToMessage,
}: ThreadTagModalProps) {
  return (
    <ThreadSettingsModal
      threadId={threadId}
      threads={threads}
      currentUserId={currentUserId}
      currentUser={currentUser}
      users={users}
      allMessages={allMessages}
      initialTab={initialTab}
      onClose={onClose}
      onAddThreadTag={onAddTag}
      onRemoveThreadTag={onRemoveTag}
      onUpdatePermission={onUpdatePermission}
      onSwitchUser={onSwitchUser}
      onSaveThreadTitle={onSaveThreadTitle}
      onSaveThreadDesc={onSaveThreadDesc}
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
