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

export class MockChatAdapter implements ChatDataAdapter {
  public readonly isProduction = false;
  private threads: Thread[] = [...MOCK_THREADS];
  private messages: Message[] = [...MOCK_MESSAGES];
  private files: FileAttachment[] = [...MOCK_FILES];
  private users: User[] = [...MOCK_USERS];
  private listeners: Set<EventListener> = new Set();
  private threadListeners: Map<string, Set<EventListener>> = new Map();

  async initialize(): Promise<AdapterInitResult> {
    // Development mode initializes instantly with JSON mock dummy data
    return {
      status: 'ready',
      isProduction: false,
      message: 'Development Mock Adapter initialized with local JSON dummy dataset and simulated WebSockets.',
      details: {
        threadsCount: this.threads.length,
        messagesCount: this.messages.length,
        usersCount: this.users.length,
      },
    };
  }

  async getThreads(): Promise<Thread[]> {
    return [...this.threads];
  }

  async saveThread(thread: Thread): Promise<void> {
    const idx = this.threads.findIndex((t) => t.id === thread.id);
    if (idx >= 0) {
      this.threads[idx] = { ...thread };
    } else {
      this.threads.push({ ...thread });
    }
    this.broadcast({
      type: 'thread:updated',
      threadId: thread.id,
      payload: thread,
      timestamp: new Date().toISOString(),
    });
  }

  async getMessages(threadId: string): Promise<Message[]> {
    return this.messages.filter((m) => m.threadId === threadId);
  }

  async sendMessage(message: Message): Promise<Message> {
    const newMsg = { ...message };
    this.messages.push(newMsg);
    this.broadcast({
      type: 'message:created',
      threadId: message.threadId,
      payload: newMsg,
      timestamp: new Date().toISOString(),
    });
    return newMsg;
  }

  async updateMessage(messageId: string, patch: Partial<Message>): Promise<void> {
    const idx = this.messages.findIndex((m) => m.id === messageId);
    if (idx >= 0) {
      this.messages[idx] = { ...this.messages[idx], ...patch };
      this.broadcast({
        type: 'message:updated',
        threadId: this.messages[idx].threadId,
        payload: this.messages[idx],
        timestamp: new Date().toISOString(),
      });
    }
  }

  async deleteMessage(messageId: string): Promise<void> {
    const target = this.messages.find((m) => m.id === messageId);
    if (target) {
      this.messages = this.messages.filter((m) => m.id !== messageId);
      this.broadcast({
        type: 'message:deleted',
        threadId: target.threadId,
        payload: { messageId },
        timestamp: new Date().toISOString(),
      });
    }
  }

  async getUsers(): Promise<User[]> {
    return [...this.users];
  }

  async uploadFile(threadId: string, file: File): Promise<FileAttachment> {
    const mockAsset: FileAttachment = {
      id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      threadId,
      name: file.name,
      url: typeof window !== 'undefined' ? URL.createObjectURL(file) : '',
      type: file.type || 'application/octet-stream',
      size: file.size,
    };
    this.files.push(mockAsset);
    return mockAsset;
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
    // Notify global workspace listeners
    this.listeners.forEach((fn) => fn(event));

    // Notify thread-specific listeners
    const threadSet = this.threadListeners.get(event.threadId);
    if (threadSet) {
      threadSet.forEach((fn) => fn(event));
    }
  }
}
