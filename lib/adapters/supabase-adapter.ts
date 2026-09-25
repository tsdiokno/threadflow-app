import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '@/lib/config/environment';
import {
  MOCK_FILES,
  MOCK_MESSAGES,
  MOCK_THREADS,
  MOCK_USERS,
} from '@/lib/mock-data';
import {
  AdapterInitResult,
  AdapterRealtimeEvent,
  ChatDataAdapter,
} from '@/types/adapters';
import { FileAttachment, Message, Thread, User } from '@/types/chat';

type EventListener = (event: AdapterRealtimeEvent) => void;

export class SupabaseChatAdapter implements ChatDataAdapter {
  public readonly isProduction = true;
  private client: SupabaseClient | null = null;
  private listeners: Set<EventListener> = new Set();
  private threadListeners: Map<string, Set<EventListener>> = new Map();
  private realtimeChannel: any = null;
  private isConfigured: boolean = false;

  constructor() {
    if (SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
      try {
        this.client = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        this.isConfigured = true;
      } catch (err) {
        console.error('[SupabaseAdapter] Failed to initialize Supabase client:', err);
      }
    }
  }

  /**
   * WordPress-Style 5-Minute Automated Installation & Verification
   * Checks database tables and seeds foundation dataset if fresh install.
   */
  async initialize(): Promise<AdapterInitResult> {
    if (!this.client || !this.isConfigured) {
      return {
        status: 'fallback_to_mock',
        isProduction: true,
        message:
          'Production mode is enabled, but NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing. ' +
          'Please set these environment variables to connect your Supabase instance.',
      };
    }

    try {
      // 1. Verify connection and check if threads table has existing records
      const { data: existingThreads, error: checkError } = await this.client
        .from('threads')
        .select('id')
        .limit(1);

      if (checkError) {
        // Table might not be created yet, provide actionable instructions
        console.warn('[SupabaseAdapter] Error querying threads table:', checkError.message);
        return {
          status: 'fallback_to_mock',
          isProduction: true,
          message: `Connected to Supabase, but schema not initialized yet: ${checkError.message}. Run supabase-schema.sql in the Supabase SQL editor.`,
          details: { error: checkError.message },
        };
      }

      // 2. Automated 5-Minute Install / Seeding
      // If table is completely empty, automatically seed initial rooms and users
      if (!existingThreads || existingThreads.length === 0) {
        console.log('[SupabaseAdapter] Fresh production install detected! Executing automated seed...');

        // Seed users
        const usersToInsert = MOCK_USERS.map((u) => ({
          id: u.id,
          name: u.name,
          avatar: u.avatar || '',
          avatar_bg: u.avatarBg,
          role: u.role,
          status: u.status || 'online',
        }));
        await this.client.from('users').upsert(usersToInsert);

        // Seed threads
        const threadsToInsert = MOCK_THREADS.map((t) => ({
          id: t.id,
          name: t.name,
          description: t.description,
          cover_url: t.coverImage || null,
          type: t.type,
          member_ids: t.memberIds,
          is_pinned: t.isPinned ?? false,
          pinned_message_id: t.pinnedMessageId || null,
          tag_defs: t.tagDefs || [],
          custom_fields: t.customFields || {},
          thread_tags: t.threadTags || [],
        }));
        await this.client.from('threads').upsert(threadsToInsert);

        // Seed initial core messages
        const messagesToInsert = MOCK_MESSAGES.map((m) => ({
          id: m.id,
          thread_id: m.threadId,
          sender: m.sender,
          sender_name: m.senderName,
          content: m.content,
          tag_ids: m.tagIds || [],
          is_pinned: m.isPinned ?? false,
          is_edited: m.isEdited ?? false,
          edited_at: m.editedAt || null,
          poll: m.poll || null,
          annotation_file_id: m.annotationFileId || null,
          annotation_point: m.annotationPoint || null,
          annotation_parent_id: m.annotationParentId || null,
          annotation_reply_to_name: m.annotationReplyToName || null,
          annotation_root_content: m.annotationRootContent || null,
          reply_parent_id: m.replyParentId || null,
          reply_to_name: m.replyToName || null,
          reply_snippet: m.replySnippet || null,
          attachments: [],
          edit_history: m.editHistory || [],
        }));
        await this.client.from('messages').upsert(messagesToInsert);

        // Seed sample file assets
        const filesToInsert = MOCK_FILES.map((f) => ({
          id: f.id,
          thread_id: f.threadId,
          name: f.name,
          url: f.url,
          type: f.type,
          size: f.size,
        }));
        await this.client.from('file_assets').upsert(filesToInsert);

        this.setupRealtimeSubscriptions();

        return {
          status: 'fresh_install_completed',
          isProduction: true,
          message: 'Automated 5-minute install completed successfully! Bootstrapped production database with foundational project rooms.',
          details: {
            seededThreads: threadsToInsert.length,
            seededMessages: messagesToInsert.length,
          },
        };
      }

      // Existing database is ready
      this.setupRealtimeSubscriptions();

      return {
        status: 'ready',
        isProduction: true,
        message: 'Production Supabase adapter connected and live Realtime WebSockets active.',
      };
    } catch (err: any) {
      console.error('[SupabaseAdapter] Failed during initialization:', err);
      return {
        status: 'fallback_to_mock',
        isProduction: true,
        message: `Initialization failed: ${err?.message || 'Unknown error'}. Falling back gracefully.`,
      };
    }
  }

  /**
   * Sets up Supabase Realtime WebSocket listeners
   */
  private setupRealtimeSubscriptions() {
    if (!this.client || this.realtimeChannel) return;

    this.realtimeChannel = this.client
      .channel('workspace-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        (payload: any) => {
          this.handleRealtimeMessageChange(payload);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'threads' },
        (payload: any) => {
          this.handleRealtimeThreadChange(payload);
        }
      )
      .subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          console.log('[SupabaseAdapter] Realtime WebSocket connected successfully.');
        }
      });
  }

  private handleRealtimeMessageChange(payload: any) {
    const { eventType, new: newRecord, old: oldRecord } = payload;
    let event: AdapterRealtimeEvent | null = null;

    if (eventType === 'INSERT' && newRecord) {
      const msg = this.mapMessageRowToDomain(newRecord);
      event = {
        type: 'message:created',
        threadId: msg.threadId,
        payload: msg,
        timestamp: new Date().toISOString(),
      };
    } else if (eventType === 'UPDATE' && newRecord) {
      const msg = this.mapMessageRowToDomain(newRecord);
      event = {
        type: 'message:updated',
        threadId: msg.threadId,
        payload: msg,
        timestamp: new Date().toISOString(),
      };
    } else if (eventType === 'DELETE' && oldRecord) {
      event = {
        type: 'message:deleted',
        threadId: oldRecord.thread_id,
        payload: { messageId: oldRecord.id },
        timestamp: new Date().toISOString(),
      };
    }

    if (event) {
      this.broadcast(event);
    }
  }

  private handleRealtimeThreadChange(payload: any) {
    const { eventType, new: newRecord } = payload;
    if ((eventType === 'INSERT' || eventType === 'UPDATE') && newRecord) {
      const thread = this.mapThreadRowToDomain(newRecord);
      this.broadcast({
        type: 'thread:updated',
        threadId: thread.id,
        payload: thread,
        timestamp: new Date().toISOString(),
      });
    }
  }

  async getThreads(): Promise<Thread[]> {
    if (!this.client) return [...MOCK_THREADS];

    const { data, error } = await this.client
      .from('threads')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error || !data) {
      console.error('[SupabaseAdapter] Error fetching threads:', error);
      return [...MOCK_THREADS];
    }

    return data.map((row) => this.mapThreadRowToDomain(row));
  }

  async saveThread(thread: Thread): Promise<void> {
    if (!this.client) return;

    const row = {
      id: thread.id,
      name: thread.name,
      description: thread.description || '',
      cover_url: thread.coverImage || null,
      type: thread.type,
      member_ids: thread.memberIds,
      is_pinned: thread.isPinned ?? false,
      pinned_message_id: thread.pinnedMessageId || null,
      tag_defs: thread.tagDefs || [],
      custom_fields: thread.customFields || {},
      thread_tags: thread.threadTags || [],
      updated_at: new Date().toISOString(),
    };

    const { error } = await this.client.from('threads').upsert(row);
    if (error) {
      console.error('[SupabaseAdapter] Error saving thread:', error);
      throw error;
    }
  }

  async getMessages(threadId: string): Promise<Message[]> {
    if (!this.client) {
      return MOCK_MESSAGES.filter((m) => m.threadId === threadId);
    }

    const { data, error } = await this.client
      .from('messages')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });

    if (error || !data) {
      console.error('[SupabaseAdapter] Error fetching messages:', error);
      return MOCK_MESSAGES.filter((m) => m.threadId === threadId);
    }

    return data.map((row) => this.mapMessageRowToDomain(row));
  }

  async sendMessage(message: Message): Promise<Message> {
    if (!this.client) return message;

    const row = {
      id: message.id,
      thread_id: message.threadId,
      sender: message.sender,
      sender_name: message.senderName,
      content: message.content,
      tag_ids: message.tagIds || [],
      is_pinned: message.isPinned ?? false,
      is_edited: message.isEdited ?? false,
      edited_at: message.editedAt || null,
      poll: message.poll || null,
      annotation_file_id: message.annotationFileId || null,
      annotation_point: message.annotationPoint || null,
      annotation_parent_id: message.annotationParentId || null,
      annotation_reply_to_name: message.annotationReplyToName || null,
      annotation_root_content: message.annotationRootContent || null,
      reply_parent_id: message.replyParentId || null,
      reply_to_name: message.replyToName || null,
      reply_snippet: message.replySnippet || null,
      attachments: [],
      edit_history: message.editHistory || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await this.client
      .from('messages')
      .insert(row)
      .select()
      .single();

    if (error) {
      console.error('[SupabaseAdapter] Error sending message:', error);
      throw error;
    }

    return this.mapMessageRowToDomain(data);
  }

  async updateMessage(messageId: string, patch: Partial<Message>): Promise<void> {
    if (!this.client) return;

    const rowPatch: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    if (patch.content !== undefined) rowPatch.content = patch.content;
    if (patch.tagIds !== undefined) rowPatch.tag_ids = patch.tagIds;
    if (patch.poll !== undefined) rowPatch.poll = patch.poll;
    if (patch.isPinned !== undefined) rowPatch.is_pinned = patch.isPinned;
    if (patch.isEdited !== undefined) rowPatch.is_edited = patch.isEdited;
    if (patch.editedAt !== undefined) rowPatch.edited_at = patch.editedAt;
    if (patch.annotationPoint !== undefined) rowPatch.annotation_point = patch.annotationPoint;
    if (patch.annotationFileId !== undefined) rowPatch.annotation_file_id = patch.annotationFileId;
    if (patch.editHistory !== undefined) rowPatch.edit_history = patch.editHistory;

    const { error } = await this.client
      .from('messages')
      .update(rowPatch)
      .eq('id', messageId);

    if (error) {
      console.error('[SupabaseAdapter] Error updating message:', error);
      throw error;
    }
  }

  async deleteMessage(messageId: string): Promise<void> {
    if (!this.client) return;

    const { error } = await this.client.from('messages').delete().eq('id', messageId);
    if (error) {
      console.error('[SupabaseAdapter] Error deleting message:', error);
      throw error;
    }
  }

  async getUsers(): Promise<User[]> {
    if (!this.client) return [...MOCK_USERS];

    const { data, error } = await this.client.from('users').select('*');
    if (error || !data || data.length === 0) {
      return [...MOCK_USERS];
    }

    return data.map((u) => ({
      id: u.id,
      name: u.name,
      avatar: u.avatar || '',
      avatarBg: u.avatar_bg || 'bg-indigo-600',
      role: u.role || 'developer',
      status: (u.status as any) || 'online',
    }));
  }

  async uploadFile(threadId: string, file: File): Promise<FileAttachment> {
    if (!this.client) {
      return {
        id: `file-${Date.now()}`,
        threadId,
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type || 'application/octet-stream',
        size: file.size,
      };
    }

    const fileExt = file.name.split('.').pop();
    const filePath = `${threadId}/${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

    try {
      const { error: uploadError } = await this.client.storage
        .from(SUPABASE_CONFIG.storageBucket)
        .upload(filePath, file);

      if (uploadError) {
        console.warn('[SupabaseAdapter] Storage upload error, falling back to data URL:', uploadError.message);
      } else {
        const { data: publicUrlData } = this.client.storage
          .from(SUPABASE_CONFIG.storageBucket)
          .getPublicUrl(filePath);

        const asset: FileAttachment = {
          id: `file-${Date.now()}`,
          threadId,
          name: file.name,
          url: publicUrlData?.publicUrl || URL.createObjectURL(file),
          type: file.type || 'application/octet-stream',
          size: file.size,
        };

        // Also record in file_assets table
        await this.client.from('file_assets').insert({
          id: asset.id,
          thread_id: threadId,
          name: asset.name,
          url: asset.url,
          type: asset.type,
          size: asset.size,
        });

        return asset;
      }
    } catch (err) {
      console.warn('[SupabaseAdapter] Storage exception, using local object URL:', err);
    }

    // Graceful fallback
    return {
      id: `file-${Date.now()}`,
      threadId,
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type || 'application/octet-stream',
      size: file.size,
    };
  }

  subscribeToThread(
    threadId: string,
    onEvent: (event: AdapterRealtimeEvent) => void
  ): () => void {
    if (!this.threadListeners.has(threadId)) {
      this.threadListeners.set(threadId, new Set());
    }
    const set = this.threadListeners.get(threadId)!;
    set.add(onEvent);

    return () => {
      set.delete(onEvent);
      if (set.size === 0) {
        this.threadListeners.delete(threadId);
      }
    };
  }

  subscribeToWorkspace(onEvent: (event: AdapterRealtimeEvent) => void): () => void {
    this.listeners.add(onEvent);
    return () => {
      this.listeners.delete(onEvent);
    };
  }

  private broadcast(event: AdapterRealtimeEvent) {
    this.listeners.forEach((fn) => fn(event));
    const threadSet = this.threadListeners.get(event.threadId);
    if (threadSet) {
      threadSet.forEach((fn) => fn(event));
    }
  }

  private mapThreadRowToDomain(row: any): Thread {
    return {
      id: row.id,
      name: row.name,
      description: row.description || '',
      coverImage: row.cover_url || undefined,
      type: row.type || 'group',
      memberIds: Array.isArray(row.member_ids) ? row.member_ids : [],
      isPinned: Boolean(row.is_pinned),
      pinnedMessageId: row.pinned_message_id || undefined,
      tagDefs: Array.isArray(row.tag_defs) ? row.tag_defs : [],
      customFields: typeof row.custom_fields === 'object' && row.custom_fields !== null ? row.custom_fields : {},
      threadTags: Array.isArray(row.thread_tags) ? row.thread_tags : [],
    };
  }

  private mapMessageRowToDomain(row: any): Message {
    return {
      id: row.id,
      threadId: row.thread_id,
      sender: row.sender || 'other',
      senderName: row.sender_name || 'Member',
      content: row.content || '',
      timestamp: row.created_at || new Date().toISOString(),
      tagIds: Array.isArray(row.tag_ids) ? row.tag_ids : [],
      isPinned: Boolean(row.is_pinned),
      isEdited: Boolean(row.is_edited),
      editedAt: row.edited_at || undefined,
      poll: row.poll || undefined,
      annotationFileId: row.annotation_file_id || undefined,
      annotationPoint: row.annotation_point || undefined,
      annotationParentId: row.annotation_parent_id || undefined,
      annotationReplyToName: row.annotation_reply_to_name || undefined,
      annotationRootContent: row.annotation_root_content || undefined,
      replyParentId: row.reply_parent_id || undefined,
      replyToName: row.reply_to_name || undefined,
      replySnippet: row.reply_snippet || undefined,
      editHistory: Array.isArray(row.edit_history) ? row.edit_history : [],
    };
  }
}
