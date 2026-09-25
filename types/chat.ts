// types/chat.ts
// Core data contracts and domain types for ThreadFlow

export type User = {
  id: string;
  name: string;
  role: string;
  avatarBg: string;
  avatar?: string;
  status?: 'online' | 'offline' | 'busy' | 'away';
};

export type TagCategory = 'inspiration' | 'decision' | 'resource' | 'action' | 'general';

export type TagDef = {
  id: string;
  name: string;
  color: string;
  isUnique: boolean;
  description?: string;
  category?: TagCategory;
  icon?: string;
  createdAt?: string;
  lastUsedAt?: string;
  usageCount?: number;
};

export type TagDefinition = TagDef;

export type FileAsset = {
  id: string;
  threadId: string;
  name: string;
  url: string;
  type: string;
  size: number;
  duration?: number; // Duration in seconds for audio/video media
};

export type FileAttachment = FileAsset;

export type AnnotationPoint = {
  x: number; // Percentage from left (0 to 100) or timeline progress %
  y: number; // Percentage from top (0 to 100)
  pinNumber: number;
  timestampSeconds?: number; // Timeline timestamp in seconds for audio/video media
};

export type PollOption = {
  id: string;
  text: string;
  voterIds: string[];
};

export type Poll = {
  id: string;
  question: string;
  options: PollOption[];
  allowMultiple?: boolean;
  createdBy: string;
  createdAt: string;
  isClosed?: boolean;
};

export type MessageEditRecord = {
  content: string;
  editedAt: string;
};

export type Message = {
  id: string;
  threadId: string;
  content: string;
  sender: 'me' | 'other';
  senderName: string;
  timestamp: string;
  tagIds: string[];
  isPinned?: boolean;
  isEdited?: boolean;
  editedAt?: string;
  editHistory?: MessageEditRecord[];
  poll?: Poll;
  // Annotation properties:
  annotationFileId?: string;
  annotationPoint?: AnnotationPoint;
  annotationParentId?: string;
  annotationReplyToName?: string;
  annotationRootContent?: string;
  // Reply properties:
  replyParentId?: string;
  replyToName?: string;
  replySnippet?: string;
};

export type ThreadTagPermission = 'all' | 'creator' | 'admins' | 'custom';

export type Thread = {
  id: string;
  name: string;
  description?: string;
  coverImage?: string;
  type: 'dm' | 'group';
  tagDefs: TagDef[];
  memberIds: string[];
  isPrivate?: boolean;
  isPinned?: boolean;
  pinnedMessageId?: string;
  threadTags?: string[];
  tagPermission?: ThreadTagPermission;
  allowedTaggerIds?: string[];
  creatorId?: string;
  createdAt?: string;
  customFields?: Record<string, any>;
};

export type SearchScope = 'all' | 'current-thread';
export type SearchTypeFilter = 'all' | 'messages' | 'files' | 'polls' | 'tags';

export type SearchResult = {
  message: Message;
  thread: Thread;
  score: number;
  highlightSnippet: string;
};

export type AccessDeniedInfo = {
  thread: Thread;
  targetMessageId?: string;
} | null;

export type ConflictDialogState = {
  tagDef: TagDef;
  targetMessageId: string;
  conflictingMessage: Message;
} | null;
