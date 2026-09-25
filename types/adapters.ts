import { FileAttachment, Message, Thread, User } from './chat';

export type RealtimeEventType =
  | 'message:created'
  | 'message:updated'
  | 'message:deleted'
  | 'thread:updated'
  | 'poll:voted'
  | 'presence:sync';

export interface AdapterRealtimeEvent {
  type: RealtimeEventType;
  threadId: string;
  payload: any;
  timestamp: string;
}

export interface AdapterInitResult {
  status: 'ready' | 'fresh_install_completed' | 'fallback_to_mock';
  isProduction: boolean;
  message: string;
  details?: Record<string, any>;
}

export interface ChatDataAdapter {
  readonly isProduction: boolean;

  /**
   * Initializes the adapter. On production, executes the automated
   * WordPress-style 5-minute install check (creates tables/seeds if empty).
   */
  initialize(): Promise<AdapterInitResult>;

  /**
   * Fetch all workspace threads
   */
  getThreads(): Promise<Thread[]>;

  /**
   * Save or update a thread record
   */
  saveThread(thread: Thread): Promise<void>;

  /**
   * Fetch messages for a specific thread
   */
  getMessages(threadId: string): Promise<Message[]>;

  /**
   * Post a new message
   */
  sendMessage(message: Message): Promise<Message>;

  /**
   * Update message metadata, edits, tags, or poll status
   */
  updateMessage(messageId: string, patch: Partial<Message>): Promise<void>;

  /**
   * Delete a message
   */
  deleteMessage(messageId: string): Promise<void>;

  /**
   * Fetch workspace members
   */
  getUsers(): Promise<User[]>;

  /**
   * Upload an asset file (Supabase storage in prod, local object URL in dev)
   */
  uploadFile(threadId: string, file: File): Promise<FileAttachment>;

  /**
   * Realtime subscription for a thread
   */
  subscribeToThread(
    threadId: string,
    onEvent: (event: AdapterRealtimeEvent) => void
  ): () => void;

  /**
   * Global workspace realtime subscription
   */
  subscribeToWorkspace(
    onEvent: (event: AdapterRealtimeEvent) => void
  ): () => void;
}
