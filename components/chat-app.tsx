'use client';

import React, { useState, useRef, useMemo, useEffect, useCallback, useSyncExternalStore } from 'react';
import { Pin, Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  FileAttachment,
  Message,
  MessageEditRecord,
  TagCategory,
  TagDef,
  Thread,
  ThreadTagPermission,
  User,
} from '@/types/chat';
import {
  MOCK_USERS,
  MOCK_THREADS,
  MOCK_FILES,
  MOCK_MESSAGES,
} from '@/lib/mock-data';
import {
  createId,
  getNowTime,
  canUserManageThreadTags,
} from '@/lib/chat-utils';

// UI Subcomponents
import { ConversationsSidebar } from './chat/ConversationsSidebar';
import { ChatHeader } from './chat/ChatHeader';
import { MessageItem } from './chat/MessageItem';
import { MessageInput } from './chat/MessageInput';
import { MetadataSidebar } from './chat/MetadataSidebar';
import { ToastNotification, ToastInfo } from './chat/ToastNotification';

// Modals
import { SettingsModal, SettingsTabType } from './modals/SettingsModal';
import { ReadmeModal } from './modals/ReadmeModal';
import { SearchModal } from './modals/SearchModal';
import { CreatePollModal } from './modals/CreatePollModal';
import { ThreadSettingsModal, ThreadSettingsTab } from './modals/ThreadSettingsModal';
import { ReplacePinModal, ReplacePinPrompt } from './modals/ReplacePinModal';
import { TagConflictModal, UniqueConflictPrompt } from './modals/TagConflictModal';
import { AccessDeniedModal, AccessDeniedModalData } from './modals/AccessDeniedModal';
import { ImageAnnotationModal } from './modals/ImageAnnotationModal';
import {
  DynamicThemeScheme,
  generateThemeScheme,
  subscribeUserTint,
  getUserTintSnapshot,
  getUserTintServerSnapshot,
  saveUserTint,
  applyThemeCssVariables,
} from '@/lib/theme-utils';
import { EditHistoryModal } from './modals/EditHistoryModal';

// Extensions & Plugins System
import { WorkspaceViewMode } from '@/types/plugins';
import {
  subscribePlugins,
  getPluginStates,
  getDefaultPluginStates,
  getThreadSkin,
  togglePlugin,
} from '@/lib/plugins/plugin-registry';
import { ProjectViews } from './plugins/ProjectViews';
import { RevampPluginView } from './plugins/RevampPluginView';
import { PluginErrorBoundary } from './plugins/PluginErrorBoundary';
import { CustomSkinsCustomizer } from './plugins/CustomSkinsCustomizer';
import { WebhookDispatcherModal } from './plugins/WebhookDispatcherModal';

// Flipswitch Environment & Data Adapters
import { FLIPSWITCH_PRODUCTION_MODE } from '@/lib/config/environment';
import { getWorkspaceAdapter } from '@/lib/adapters';
import { AdapterRealtimeEvent } from '@/types/adapters';

const themeListeners = new Set<() => void>();

function subscribeTheme(callback: () => void) {
  themeListeners.add(callback);
  const onStorage = () => callback();
  window.addEventListener('storage', onStorage);
  return () => {
    themeListeners.delete(callback);
    window.removeEventListener('storage', onStorage);
  };
}

function getThemeSnapshot(): boolean {
  if (typeof window === 'undefined') return false;
  const saved = localStorage.getItem('stride_dark_mode');
  if (saved !== null) return saved === 'true';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function getThemeServerSnapshot(): boolean {
  return false;
}

function setAppTheme(isDark: boolean) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('stride_dark_mode', String(isDark));
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    themeListeners.forEach((fn) => fn());
  }
}

const sidebarListeners = new Set<() => void>();

function subscribeSidebar(callback: () => void) {
  sidebarListeners.add(callback);
  window.addEventListener('storage', callback);
  return () => {
    sidebarListeners.delete(callback);
    window.removeEventListener('storage', callback);
  };
}

function getLeftSidebarSnapshot(): boolean {
  if (typeof window === 'undefined') return true;
  const saved = localStorage.getItem('stride_left_sidebar_open');
  return saved === null ? true : saved === 'true';
}

function getRightSidebarSnapshot(): boolean {
  if (typeof window === 'undefined') return true;
  const saved = localStorage.getItem('stride_metadata_sidebar_open');
  return saved === null ? true : saved === 'true';
}

function getSidebarServerSnapshot(): boolean {
  return true;
}

function setPersistedLeftSidebar(open: boolean) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('stride_left_sidebar_open', String(open));
    } catch {}
    sidebarListeners.forEach((fn) => fn());
  }
}

function setPersistedRightSidebar(open: boolean) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('stride_metadata_sidebar_open', String(open));
    } catch {}
    sidebarListeners.forEach((fn) => fn());
  }
}

const emptySubscribe = () => () => {};

export default function ChatApp() {
  // --- Core Application State ---
  const [threads, setThreads] = useState<Thread[]>(MOCK_THREADS);
  const [activeThreadId, setActiveThreadId] = useState<string>('t1');
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [files, setFiles] = useState<FileAttachment[]>(MOCK_FILES);
  const [currentUser, setCurrentUser] = useState<User>(MOCK_USERS[0]);

  // Tag & Context Filtering
  const [filterTagId, setFilterTagId] = useState<string | null>(null);
  const [selectedThreadTagFilter, setSelectedThreadTagFilter] = useState<string | null>(null);
  const [highlightedMsgId, setHighlightedMsgId] = useState<string | null>(null);
  const [tagPopoverMsgId, setTagPopoverMsgId] = useState<string | null>(null);

  // Composer State
  const [inputValue, setInputValue] = useState<string>('');
  const [replyingToMessage, setReplyingToMessage] = useState<Message | null>(null);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [selectedMentionIdx, setSelectedMentionIdx] = useState<number>(0);

  // Sidebar & Navigation State
  const [rightSidebarTab, setRightSidebarTab] = useState<'tags' | 'polls' | 'files'>('tags');
  const isLeftSidebarOpen = useSyncExternalStore(
    subscribeSidebar,
    getLeftSidebarSnapshot,
    getSidebarServerSnapshot
  );
  const isRightSidebarOpen = useSyncExternalStore(
    subscribeSidebar,
    getRightSidebarSnapshot,
    getSidebarServerSnapshot
  );

  const setIsLeftSidebarOpen = (action: boolean | ((prev: boolean) => boolean)) => {
    const current = getLeftSidebarSnapshot();
    const next = typeof action === 'function' ? action(current) : action;
    setPersistedLeftSidebar(next);
  };

  const setIsRightSidebarOpen = (action: boolean | ((prev: boolean) => boolean)) => {
    const current = getRightSidebarSnapshot();
    const next = typeof action === 'function' ? action(current) : action;
    setPersistedRightSidebar(next);
  };

  // Modals & Dialogs State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTabType>('general');
  const [isReadmeOpen, setIsReadmeOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCreatePollOpen, setIsCreatePollOpen] = useState(false);
  const [threadSettingsState, setThreadSettingsState] = useState<{
    threadId: string;
    tab?: ThreadSettingsTab;
  } | null>(null);
  const [previewFileId, setPreviewFileId] = useState<string | null>(null);
  const [targetPinNumber, setTargetPinNumber] = useState<number | null>(null);
  const [targetTimestamp, setTargetTimestamp] = useState<number | null>(null);

  const [accessDeniedInfo, setAccessDeniedInfo] = useState<AccessDeniedModalData>(null);
  const [replacePinPrompt, setReplacePinPrompt] = useState<ReplacePinPrompt>(null);
  const [uniqueConflictPrompt, setUniqueConflictPrompt] = useState<UniqueConflictPrompt>(null);
  const [activeActionsMenuMsgId, setActiveActionsMenuMsgId] = useState<string | null>(null);
  const [historyModalMessage, setHistoryModalMessage] = useState<Message | null>(null);

  // --- First-Party Plugins & Sandboxed Extensions State ---
  const [workspaceViewMode, setWorkspaceViewMode] = useState<WorkspaceViewMode>('chat');
  const [isSkinsModalOpen, setIsSkinsModalOpen] = useState(false);
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);
  const [activeSkinRefreshKey, setActiveSkinRefreshKey] = useState(0);

  // Synchronized Plugin States (SSR safe, zero hydration mismatch)
  const pluginStates = useSyncExternalStore(
    subscribePlugins,
    getPluginStates,
    getDefaultPluginStates
  );

  const isProjectViewsEnabled = pluginStates['thread-project-views']?.isEnabled ?? true;
  const isCustomSkinsEnabled = pluginStates['thread-custom-skins']?.isEnabled ?? true;
  const isWebhookEnabled = pluginStates['webhook-dispatcher']?.isEnabled ?? true;

  // Toast System
  const [toastInfo, setToastInfo] = useState<ToastInfo>(null);

  const showToast = useCallback((
    title: string,
    message?: string,
    referencedThreadId?: string | null,
    referencedMsgId?: string | null
  ) => {
    setToastInfo({
      show: true,
      title,
      message,
      referencedThreadId,
      referencedMsgId,
    });
    setTimeout(() => {
      setToastInfo((curr) => (curr?.title === title ? null : curr));
    }, 3500);
  }, []);

  // Dynamic User Theming State (SSR safe, zero hydration mismatch)
  const userTint = useSyncExternalStore(
    subscribeUserTint,
    getUserTintSnapshot,
    getUserTintServerSnapshot
  );

  const themeScheme = useMemo(() => generateThemeScheme(userTint), [userTint]);

  useEffect(() => {
    applyThemeCssVariables(themeScheme);
  }, [themeScheme]);

  const handleSelectTint = (hex: string, name?: string) => {
    const updated = saveUserTint(hex);
    if (name) updated.tintName = name;
    showToast('Theme Updated', `Active workspace tint: ${name || updated.tintName}`);
  };

  const handleResetTint = () => {
    saveUserTint('#4f46e5');
    showToast('Theme Reset', 'Restored default brand tint.');
  };

  // Plugin Callbacks & Event Listeners
  const handlePluginToggled = (pluginId: string, isEnabled: boolean) => {
    if (pluginId === 'thread-project-views') {
      if (!isEnabled && (workspaceViewMode === 'table' || workspaceViewMode === 'kanban' || workspaceViewMode === 'gantt')) {
        setWorkspaceViewMode('chat');
      }
    }
    if (pluginId === 'thread-custom-skins') {
      if (!isEnabled && workspaceViewMode === 'revamp') {
        setWorkspaceViewMode('chat');
      }
    }
    showToast('Extensions Updated', `Extension status changed to ${isEnabled ? 'Active' : 'Disabled'}.`);
  };

  const handleUpdateThreadMetadata = (threadId: string, updates: Partial<Thread>) => {
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === threadId) {
          const updated = { ...t, ...updates };
          getWorkspaceAdapter().saveThread(updated).catch(console.warn);
          return updated;
        }
        return t;
      })
    );
  };

  const handleDispatchWebhook = (threadId: string, content: string, senderName: string) => {
    const newMsg: Message = {
      id: createId(),
      threadId,
      sender: 'other',
      senderName: senderName || 'Webhook Bot',
      content,
      timestamp: getNowTime(),
      tagIds: [],
    };
    setMessages((prev) => [...prev, newMsg]);
    const targetThread = threads.find((t) => t.id === threadId);
    showToast('Inbound Webhook Dispatched', `Simulated event posted into #${targetThread?.name || 'thread'}.`);
  };

  // User Preferences
  const darkMode = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getThemeServerSnapshot);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [enterToSend, setEnterToSend] = useState(true);

  // Sync document class when theme changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const setDarkMode = (valOrFn: boolean | ((prev: boolean) => boolean)) => {
    const nextVal = typeof valOrFn === 'function' ? valOrFn(darkMode) : valOrFn;
    setAppTheme(nextVal);
  };

  // --- Production/Dev Data Adapter Initialization & Realtime Sync ---
  useEffect(() => {
    const adapter = getWorkspaceAdapter();
    let isSubscribed = true;

    adapter.initialize().then(async (result) => {
      if (!isSubscribed) return;
      if (result.isProduction) {
        if (result.status === 'fresh_install_completed') {
          showToast(
            'Production Install Complete',
            'Automated 5-minute setup initialized database tables and seeded foundation rooms.'
          );
        } else if (result.status === 'ready') {
          showToast(
            'Production Mode Active',
            'Connected to Supabase with live Realtime WebSockets.'
          );
        }

        try {
          const prodThreads = await adapter.getThreads();
          if (isSubscribed && prodThreads.length > 0) {
            setThreads(prodThreads);
          }
        } catch (err) {
          console.error('[ChatApp] Error syncing production data:', err);
        }
      }
    });

    const unsubscribe = adapter.subscribeToWorkspace((event: AdapterRealtimeEvent) => {
      if (!isSubscribed) return;
      if (event.type === 'message:created') {
        const newMsg = event.payload as Message;
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      } else if (event.type === 'message:updated') {
        const updatedMsg = event.payload as Message;
        setMessages((prev) =>
          prev.map((m) => (m.id === updatedMsg.id ? updatedMsg : m))
        );
      } else if (event.type === 'message:deleted') {
        const { messageId } = event.payload;
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
      } else if (event.type === 'thread:updated') {
        const updatedThread = event.payload as Thread;
        setThreads((prev) =>
          prev.map((t) => (t.id === updatedThread.id ? updatedThread : t))
        );
      }
    });

    return () => {
      isSubscribed = false;
      unsubscribe();
    };
  }, [showToast]);

  // Sync messages on thread change in production mode
  useEffect(() => {
    if (!FLIPSWITCH_PRODUCTION_MODE) return;
    const adapter = getWorkspaceAdapter();
    let isSubscribed = true;

    adapter
      .getMessages(activeThreadId)
      .then((threadMsgs) => {
        if (isSubscribed && threadMsgs.length > 0) {
          setMessages((prev) => {
            const otherMsgs = prev.filter((m) => m.threadId !== activeThreadId);
            return [...otherMsgs, ...threadMsgs];
          });
        }
      })
      .catch(console.warn);

    return () => {
      isSubscribed = false;
    };
  }, [activeThreadId]);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const mainInputRef = useRef<HTMLTextAreaElement>(null);

  // Hydration safety using React's useSyncExternalStore
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  // --- Derived Calculations ---
  const activeThread = useMemo(
    () => threads.find((t) => t.id === activeThreadId) || null,
    [threads, activeThreadId]
  );

  const activeMessages = useMemo(
    () => messages.filter((m) => m.threadId === activeThreadId),
    [messages, activeThreadId]
  );

  const displayedMessages = useMemo(() => {
    if (!filterTagId) return activeMessages;
    return activeMessages.filter((m) => m.tagIds.includes(filterTagId));
  }, [activeMessages, filterTagId]);

  const activeThreadFiles = useMemo(
    () => files.filter((f) => f.threadId === activeThreadId),
    [files, activeThreadId]
  );

  const activeThreadSkin = useMemo(() => {
    if (!isMounted || !isCustomSkinsEnabled || !activeThreadId) return null;
    return getThreadSkin(activeThreadId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted, activeThreadId, isCustomSkinsEnabled, activeSkinRefreshKey]);

  const currentPreviewFile = useMemo(
    () => files.find((f) => f.id === previewFileId) || null,
    [files, previewFileId]
  );

  const currentFilterTag = useMemo(
    () => activeThread?.tagDefs.find((t) => t.id === filterTagId) || null,
    [activeThread, filterTagId]
  );

  const allThreadTags = useMemo(() => {
    const tagsSet = new Set<string>();
    threads.forEach((t) => {
      t.threadTags?.forEach((tag) => tagsSet.add(tag));
    });
    return Array.from(tagsSet);
  }, [threads]);

  // Mention Autocomplete Items
  const mentionableUsers = useMemo(() => {
    if (mentionQuery === null) return [];
    const q = mentionQuery.toLowerCase();
    const systemBroadcasters: User[] = [
      { id: 'broad-channel', name: 'channel', role: 'Notify all members of channel', avatarBg: 'bg-amber-600' },
      { id: 'broad-here', name: 'here', role: 'Notify active members', avatarBg: 'bg-amber-600' },
    ];
    const combined = [...MOCK_USERS, ...systemBroadcasters];
    return combined.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    );
  }, [mentionQuery]);

  // --- Helpers & Scrolling ---
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    const container = messagesContainerRef.current;
    if (container) {
      if (behavior === 'instant') {
        container.scrollTop = container.scrollHeight;
      } else {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth',
        });
      }
    }
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior, block: 'end' });
    }
  };

  // Automatically scroll to bottom when entering a thread or when new message is created
  const lastActiveMessageId = activeMessages[activeMessages.length - 1]?.id;
  const isInitialMount = useRef(true);
  const prevThreadIdRef = useRef(activeThreadId);
  const prevLastMsgIdRef = useRef(lastActiveMessageId);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      scrollToBottom('instant');
      const timer = setTimeout(() => scrollToBottom('instant'), 60);
      return () => clearTimeout(timer);
    }

    if (prevThreadIdRef.current !== activeThreadId) {
      prevThreadIdRef.current = activeThreadId;
      prevLastMsgIdRef.current = lastActiveMessageId;
      scrollToBottom('instant');
      const timer = setTimeout(() => scrollToBottom('instant'), 60);
      return () => clearTimeout(timer);
    }

    if (lastActiveMessageId && lastActiveMessageId !== prevLastMsgIdRef.current) {
      prevLastMsgIdRef.current = lastActiveMessageId;
      scrollToBottom('smooth');
      const timer = setTimeout(() => scrollToBottom('smooth'), 60);
      return () => clearTimeout(timer);
    }
  }, [activeThreadId, lastActiveMessageId]);

  const scrollToMessage = (msgId: string) => {
    const el = document.getElementById(`msg-${msgId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setHighlightedMsgId(msgId);
      setTimeout(() => setHighlightedMsgId(null), 2500);
    }
  };

  // Keyboard shortcut for search
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // --- Handlers: Personas & Threads ---
  const handleSwitchPersona = (userId: string) => {
    const targetUser = MOCK_USERS.find((u) => u.id === userId);
    if (!targetUser) return;
    setCurrentUser(targetUser);

    // If current thread is inaccessible to new persona, navigate to first available
    if (activeThread && !activeThread.memberIds.includes(targetUser.id)) {
      const firstAccessible = threads.find((t) => t.memberIds.includes(targetUser.id));
      if (firstAccessible) {
        setActiveThreadId(firstAccessible.id);
      }
    }

    showToast('Persona Switched', `Now acting as ${targetUser.name} (${targetUser.role})`);
  };

  const handleSelectThread = (threadId: string) => {
    const target = threads.find((t) => t.id === threadId);
    if (!target) return;

    if (!target.memberIds.includes(currentUser.id)) {
      setAccessDeniedInfo({
        isOpen: true,
        threadName: target.name,
        threadType: target.type,
        reason: 'Restricted conversation. You are not listed among the designated members.',
        authorizedMembers: target.memberIds.map(
          (id) => MOCK_USERS.find((u) => u.id === id)?.name || id
        ),
      });
      return;
    }

    setActiveThreadId(threadId);
    setFilterTagId(null);
    setReplyingToMessage(null);
    setWorkspaceViewMode('chat');
    setTimeout(() => scrollToBottom('instant'), 50);
  };

  const handleTogglePinThread = (threadId: string) => {
    setThreads((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, isPinned: !t.isPinned } : t))
    );
    const target = threads.find((t) => t.id === threadId);
    const willBePinned = !target?.isPinned;
    showToast(
      willBePinned ? 'Thread Pinned' : 'Thread Unpinned',
      `"${target?.name}" ${willBePinned ? 'moved to pinned conversations' : 'unpinned'}`
    );
  };

  // --- Handlers: Pinning Messages (Max 1 per thread constraint) ---
  const handleRequestPinMessage = (msg: Message) => {
    const currentPinned = messages.find(
      (m) =>
        m.threadId === activeThreadId &&
        (m.isPinned || m.id === activeThread?.pinnedMessageId)
    );

    if (msg.isPinned || currentPinned?.id === msg.id) {
      handleUnpinMessage(msg.id);
      return;
    }

    if (currentPinned && currentPinned.id !== msg.id) {
      setReplacePinPrompt({
        currentPinnedMsg: currentPinned,
        newMsgToPin: msg,
      });
      return;
    }

    executePinMessage(msg.id);
  };

  const executePinMessage = (msgId: string) => {
    setThreads((prev) =>
      prev.map((t) => (t.id === activeThreadId ? { ...t, pinnedMessageId: msgId } : t))
    );
    setMessages((prev) =>
      prev.map((m) =>
        m.threadId === activeThreadId ? { ...m, isPinned: m.id === msgId } : m
      )
    );
    setReplacePinPrompt(null);
    showToast('Message Pinned', 'This message is now pinned to the top of this conversation.');
  };

  const handleUnpinMessage = (msgId: string) => {
    setThreads((prev) =>
      prev.map((t) => (t.id === activeThreadId ? { ...t, pinnedMessageId: undefined } : t))
    );
    setMessages((prev) =>
      prev.map((m) =>
        m.threadId === activeThreadId && (m.id === msgId || m.isPinned)
          ? { ...m, isPinned: false }
          : m
      )
    );
    showToast('Message Unpinned', 'The message was unpinned from this conversation.');
  };

  // --- Handlers: Polls ---
  const handleVotePoll = (messageId: string, optionId: string) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== messageId || !m.poll) return m;

        const currentOptions = m.poll.options;
        const targetOpt = currentOptions.find((o) => o.id === optionId);
        if (!targetOpt) return m;

        const alreadyVotedTarget = targetOpt.voterIds.includes(currentUser.id);

        let updatedOptions;
        if (m.poll.allowMultiple) {
          updatedOptions = currentOptions.map((opt) => {
            if (opt.id === optionId) {
              return {
                ...opt,
                voterIds: alreadyVotedTarget
                  ? opt.voterIds.filter((id) => id !== currentUser.id)
                  : [...opt.voterIds, currentUser.id],
              };
            }
            return opt;
          });
        } else {
          updatedOptions = currentOptions.map((opt) => {
            if (opt.id === optionId) {
              return {
                ...opt,
                voterIds: alreadyVotedTarget
                  ? opt.voterIds.filter((id) => id !== currentUser.id)
                  : [...opt.voterIds.filter((id) => id !== currentUser.id), currentUser.id],
              };
            } else {
              return {
                ...opt,
                voterIds: opt.voterIds.filter((id) => id !== currentUser.id),
              };
            }
          });
        }

        const updatedPoll = {
          ...m.poll,
          options: updatedOptions,
        };
        getWorkspaceAdapter().updateMessage(messageId, { poll: updatedPoll }).catch(console.warn);

        return {
          ...m,
          poll: updatedPoll,
        };
      })
    );
  };

  const handleCreatePollSubmit = (
    question: string,
    options: string[],
    allowMultiple: boolean
  ) => {
    if (!activeThreadId) return;

    const newPollMessage: Message = {
      id: createId('msg-poll'),
      threadId: activeThreadId,
      content: `📊 Poll: ${question}`,
      sender: 'me',
      senderName: currentUser.name,
      timestamp: getNowTime(),
      tagIds: [],
      poll: {
        id: createId('poll'),
        question,
        options: options.map((optText, idx) => ({
          id: `opt-${idx + 1}-${Date.now()}`,
          text: optText,
          voterIds: [],
        })),
        allowMultiple,
        createdBy: currentUser.name,
        createdAt: getNowTime(),
      },
    };

    setMessages((prev) => [...prev, newPollMessage]);
    setFilterTagId(null);
    scrollToBottom('smooth');
    showToast('Poll Created', `"${question}" published to conversation.`);
  };

  // --- Handlers: Message Composer & Input ---
  const handleMainInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInputValue(val);

    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, cursorPos);
    const lastAtIdx = textBeforeCursor.lastIndexOf('@');

    if (lastAtIdx !== -1) {
      const charBeforeAt = textBeforeCursor[lastAtIdx - 1];
      if (lastAtIdx === 0 || /\s/.test(charBeforeAt)) {
        const query = textBeforeCursor.slice(lastAtIdx + 1);
        if (!/\s/.test(query)) {
          setMentionQuery(query);
          setSelectedMentionIdx(0);
          return;
        }
      }
    }

    setMentionQuery(null);
  };

  const handleSelectMention = (name: string) => {
    if (!mainInputRef.current) return;
    const cursorPos = mainInputRef.current.selectionStart;
    const text = inputValue;
    const textBeforeCursor = text.slice(0, cursorPos);
    const lastAtIdx = textBeforeCursor.lastIndexOf('@');

    if (lastAtIdx !== -1) {
      const textAfterCursor = text.slice(cursorPos);
      const token = name.toLowerCase().replace(/\s+/g, '_');
      const newText = `${text.slice(0, lastAtIdx)}@${token} ${textAfterCursor}`;
      setInputValue(newText);
      setMentionQuery(null);

      setTimeout(() => {
        if (mainInputRef.current) {
          mainInputRef.current.focus();
          const newCursor = lastAtIdx + token.length + 2;
          mainInputRef.current.setSelectionRange(newCursor, newCursor);
        }
      }, 10);
    }
  };

  const handleMainInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (mentionQuery !== null && mentionableUsers.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedMentionIdx((prev) => (prev + 1) % mentionableUsers.length);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedMentionIdx(
          (prev) => (prev - 1 + mentionableUsers.length) % mentionableUsers.length
        );
        return;
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        handleSelectMention(mentionableUsers[selectedMentionIdx].name);
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setMentionQuery(null);
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey && enterToSend) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || !activeThreadId) return;

    const newMessage: Message = {
      id: createId('msg'),
      threadId: activeThreadId,
      content: inputValue.trim(),
      sender: 'me',
      senderName: currentUser.name,
      timestamp: getNowTime(),
      tagIds: [],
      replyParentId: replyingToMessage ? replyingToMessage.id : undefined,
      replyToName: replyingToMessage ? replyingToMessage.senderName : undefined,
      replySnippet: replyingToMessage ? replyingToMessage.content : undefined,
      annotationFileId: replyingToMessage?.annotationFileId,
      annotationPoint: replyingToMessage?.annotationPoint,
      annotationParentId:
        replyingToMessage?.annotationParentId ||
        (replyingToMessage?.annotationFileId ? replyingToMessage.id : undefined),
      annotationReplyToName: replyingToMessage ? replyingToMessage.senderName : undefined,
      annotationRootContent: replyingToMessage ? replyingToMessage.content : undefined,
    };

    setMessages((prev) => [...prev, newMessage]);
    getWorkspaceAdapter().sendMessage(newMessage).catch(console.warn);
    setInputValue('');
    setReplyingToMessage(null);
    setFilterTagId(null);
    scrollToBottom('smooth');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || !activeThreadId) return;

    const newAssets: FileAttachment[] = Array.from(selectedFiles).map((file) => ({
      id: createId('file'),
      threadId: activeThreadId,
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type,
      size: file.size,
    }));

    setFiles((prev) => [...prev, ...newAssets]);
    setRightSidebarTab('files');

    if (newAssets.length > 0) {
      setPreviewFileId(newAssets[0].id);
      setTargetPinNumber(null);
    }
  };

  // --- Handlers: Tagging & Unique Constraint Enforcement ---
  const handleTagClick = (tagId: string) => {
    setFilterTagId((prev) => (prev === tagId ? null : tagId));
    const taggedMessages = activeMessages.filter((m) => m.tagIds.includes(tagId));
    if (taggedMessages.length > 0) {
      scrollToMessage(taggedMessages[0].id);
    }
  };

  const handleToggleMessageTag = (msgId: string, tagId: string) => {
    const targetTag = activeThread?.tagDefs.find((t) => t.id === tagId);
    if (!targetTag) return;

    const targetMsg = messages.find((m) => m.id === msgId);
    if (!targetMsg) return;

    const isAlreadyTagged = targetMsg.tagIds.includes(tagId);

    if (!isAlreadyTagged && targetTag.isUnique) {
      const existingMessageWithTag = messages.find(
        (m) => m.threadId === activeThreadId && m.tagIds.includes(tagId) && m.id !== msgId
      );

      if (existingMessageWithTag) {
        setUniqueConflictPrompt({
          tag: targetTag,
          currentMessage: existingMessageWithTag,
          targetMessage: targetMsg,
        });
        return;
      }
    }

    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== msgId) return m;
        return {
          ...m,
          tagIds: isAlreadyTagged
            ? m.tagIds.filter((id) => id !== tagId)
            : [...m.tagIds, tagId],
        };
      })
    );
  };

  const handleEditMessage = (msgId: string, newContent: string) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== msgId) return m;
        const previousRecord: MessageEditRecord = {
          content: m.content,
          editedAt: m.editedAt || m.timestamp,
        };
        const updatedHistory = [...(m.editHistory || []), previousRecord];
        getWorkspaceAdapter()
          .updateMessage(msgId, {
            text: newContent,
            editHistory: updatedHistory,
          } as any)
          .catch(console.warn);
        return {
          ...m,
          content: newContent,
          isEdited: true,
          editedAt: getNowTime(),
          editHistory: updatedHistory,
        };
      })
    );
    showToast('Message Edited', 'Message content updated successfully.');
  };

  const handleConfirmTagConflict = () => {
    if (!uniqueConflictPrompt) return;
    const { tag, currentMessage, targetMessage } = uniqueConflictPrompt;

    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === currentMessage.id) {
          return { ...m, tagIds: m.tagIds.filter((id) => id !== tag.id) };
        }
        if (m.id === targetMessage.id) {
          return { ...m, tagIds: [...m.tagIds, tag.id] };
        }
        return m;
      })
    );

    setUniqueConflictPrompt(null);
    showToast('Unique Tag Moved', `"${tag.name}" reassigned to selected message.`);
  };

  const handleToggleTagUnique = (tagId: string) => {
    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeThreadId
          ? {
              ...t,
              tagDefs: t.tagDefs.map((def) =>
                def.id === tagId ? { ...def, isUnique: !def.isUnique } : def
              ),
            }
          : t
      )
    );
  };

  const handleCreateTag = (preset?: Partial<TagDef>) => {
    if (!activeThread) return;
    const newTagId = createId('tg');
    const newTag: TagDef = {
      id: newTagId,
      name: preset?.name || `Tag ${activeThread.tagDefs.length + 1}`,
      color: preset?.color || 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/80',
      isUnique: preset?.isUnique ?? false,
      description: preset?.description || '',
      category: preset?.category || 'general',
      icon: preset?.icon,
    };

    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeThread.id ? { ...t, tagDefs: [...t.tagDefs, newTag] } : t
      )
    );
    showToast('Tag Created', `Tag "${newTag.name}" added to thread.`);
  };

  const handleCreateCustomTag = (newTag: {
    name: string;
    description: string;
    color: string;
    isUnique: boolean;
    category?: TagCategory;
    icon?: string;
  }) => {
    const targetThreadId = threadSettingsState?.threadId || activeThreadId;
    if (!targetThreadId) return;
    const newTagDef: TagDef = {
      id: createId('tg'),
      name: newTag.name,
      description: newTag.description,
      color: newTag.color,
      isUnique: newTag.isUnique,
      category: newTag.category || 'general',
      icon: newTag.icon,
    };
    setThreads((prev) =>
      prev.map((t) =>
        t.id === targetThreadId ? { ...t, tagDefs: [...t.tagDefs, newTagDef] } : t
      )
    );
    showToast(`Tag "${newTag.name}" created`);
  };

  const handleSaveTagEdit = (
    tagId: string,
    name: string,
    desc: string,
    color: string,
    isUnique: boolean,
    category?: TagCategory,
    icon?: string
  ) => {
    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeThreadId
          ? {
              ...t,
              tagDefs: t.tagDefs.map((td) =>
                td.id === tagId
                  ? { ...td, name, description: desc, color, isUnique, category: category || td.category, icon: icon || td.icon }
                  : td
              ),
            }
          : t
      )
    );
    showToast('Tag Updated');
  };

  const handleDeleteTag = (tagId: string) => {
    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeThreadId
          ? { ...t, tagDefs: t.tagDefs.filter((td) => td.id !== tagId) }
          : t
      )
    );
    setMessages((prev) =>
      prev.map((m) =>
        m.threadId === activeThreadId
          ? { ...m, tagIds: m.tagIds.filter((id) => id !== tagId) }
          : m
      )
    );
    if (filterTagId === tagId) setFilterTagId(null);
  };

  // --- Handlers: Thread Details & Thread-level Tags ---
  const handleSaveThreadTitle = (newTitle: string) => {
    setThreads((prev) =>
      prev.map((t) => (t.id === activeThreadId ? { ...t, name: newTitle } : t))
    );
    showToast('Thread Title Updated');
  };

  const handleSaveThreadDesc = (newDesc: string) => {
    setThreads((prev) =>
      prev.map((t) => (t.id === activeThreadId ? { ...t, description: newDesc } : t))
    );
    showToast('Thread Description Updated');
  };

  const handleUpdateThreadCover = (threadId: string, coverUrl: string | null) => {
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId ? { ...t, coverImage: coverUrl || undefined } : t
      )
    );
    showToast(coverUrl ? 'Cover photo updated' : 'Cover photo removed');
  };

  const handleAddThreadTag = (threadId: string, tagName: string) => {
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id !== threadId) return t;
        const current = t.threadTags || [];
        if (current.includes(tagName)) return t;
        return { ...t, threadTags: [...current, tagName] };
      })
    );
  };

  const handleRemoveThreadTag = (threadId: string, tagName: string) => {
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id !== threadId) return t;
        return {
          ...t,
          threadTags: (t.threadTags || []).filter((tag) => tag !== tagName),
        };
      })
    );
  };

  const handleUpdateThreadPermission = (
    threadId: string,
    permission: ThreadTagPermission,
    allowedTaggerIds?: string[]
  ) => {
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId
          ? {
              ...t,
              tagPermission: permission,
              allowedTaggerIds: allowedTaggerIds || t.allowedTaggerIds,
            }
          : t
      )
    );
    showToast('Permissions Updated', `Thread tag policy changed to "${permission}".`);
  };

  const handleAddThreadMember = (threadId: string, userId: string) => {
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id !== threadId) return t;
        if (t.memberIds.includes(userId)) return t;
        return {
          ...t,
          memberIds: [...t.memberIds, userId],
          allowedTaggerIds: t.allowedTaggerIds ? [...t.allowedTaggerIds, userId] : [userId],
        };
      })
    );
    const addedUser = MOCK_USERS.find((u) => u.id === userId);
    showToast('Member Added', `${addedUser?.name || 'Member'} added to thread.`);
  };

  const handleRemoveThreadMember = (threadId: string, userId: string) => {
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id !== threadId) return t;
        return {
          ...t,
          memberIds: t.memberIds.filter((id) => id !== userId),
          allowedTaggerIds: t.allowedTaggerIds?.filter((id) => id !== userId),
        };
      })
    );
    const removedUser = MOCK_USERS.find((u) => u.id === userId);
    showToast('Member Removed', `${removedUser?.name || 'Member'} removed from thread.`);
  };

  // --- Handlers: Message Links & References ---
  const handleCopyMessageLink = (msg: Message) => {
    const thread = threads.find((t) => t.id === msg.threadId);
    const link = `https://threadflow.internal/chat?threadId=${msg.threadId}&messageId=${msg.id}`;
    navigator.clipboard?.writeText(link);
    showToast(
      'Message Link Copied',
      link,
      msg.threadId,
      msg.id
    );
  };

  const handleInsertMessageReference = (msg: Message) => {
    const thread = threads.find((t) => t.id === msg.threadId);
    const preview = msg.content.slice(0, 30);
    const referenceMarkdown = `[${msg.senderName}: "${preview}..."](?threadId=${msg.threadId}&messageId=${msg.id}) `;
    setInputValue((prev) => `${prev}${referenceMarkdown}`);
    mainInputRef.current?.focus();
  };

  const handleNavigateToMessageLink = (threadId: string | null, messageId: string) => {
    const targetThreadId = threadId || activeThreadId;
    const targetThread = threads.find((t) => t.id === targetThreadId);

    if (!targetThread) return;

    if (!targetThread.memberIds.includes(currentUser.id)) {
      const targetMsg = messages.find((m) => m.id === messageId);
      setAccessDeniedInfo({
        isOpen: true,
        threadName: targetThread.name,
        threadType: targetThread.type,
        reason: 'You do not have permission to access the thread containing this message link.',
        authorizedMembers: targetThread.memberIds.map(
          (id) => MOCK_USERS.find((u) => u.id === id)?.name || id
        ),
        referencedMsgSnippet: targetMsg?.content,
      });
      return;
    }

    if (targetThreadId !== activeThreadId) {
      setActiveThreadId(targetThreadId);
    }
    setFilterTagId(null);

    setTimeout(() => {
      scrollToMessage(messageId);
    }, 150);
  };

  // Media and image annotation handler
  const openFileAtPin = (fileId: string, pinNumber?: number, timestampSeconds?: number) => {
    setPreviewFileId(fileId);
    setTargetPinNumber(pinNumber || null);
    setTargetTimestamp(timestampSeconds !== undefined ? timestampSeconds : null);
  };

  const handleSendAnnotationMessage = (
    content: string,
    options?: {
      annotationFileId?: string;
      annotationPoint?: { x: number; y: number; pinNumber: number; timestampSeconds?: number };
      replyTo?: {
        messageId: string;
        senderName: string;
        content: string;
        annotationPinNumber?: number;
        timestampSeconds?: number;
      };
      rootAnnotation?: {
        id: string;
        senderName: string;
        content: string;
        pinPoint?: { x: number; y: number; pinNumber: number; timestampSeconds?: number };
      };
    }
  ) => {
    if (!activeThreadId) return;

    const newMessage: Message = {
      id: createId('msg-ann'),
      threadId: activeThreadId,
      content,
      sender: 'me',
      senderName: currentUser.name,
      timestamp: getNowTime(),
      tagIds: [],
      annotationFileId: options?.annotationFileId,
      // Only set annotationPoint for new pin definitions, not child replies
      annotationPoint: options?.annotationPoint,
      annotationParentId: options?.rootAnnotation?.id || options?.replyTo?.messageId,
      annotationReplyToName:
        options?.replyTo?.senderName || options?.rootAnnotation?.senderName,
      annotationRootContent: options?.rootAnnotation?.content || options?.replyTo?.content,
      replyParentId: options?.replyTo?.messageId,
      replyToName: options?.replyTo?.senderName,
      replySnippet: options?.replyTo?.content,
    };

    setMessages((prev) => [...prev, newMessage]);
  };

  // Pinned message of active thread
  const activePinnedMessage = useMemo(
    () =>
      messages.find(
        (m) =>
          m.threadId === activeThreadId &&
          (m.isPinned || m.id === activeThread?.pinnedMessageId)
      ) || null,
    [messages, activeThreadId, activeThread?.pinnedMessageId]
  );

  return (
    <div
      className={cn(
        'flex h-screen w-screen overflow-hidden bg-slate-100 font-sans antialiased text-slate-800 transition-colors',
        darkMode && 'dark bg-slate-950 text-slate-100'
      )}
    >
      {/* 1. Left Navigation & Conversations Sidebar */}
      {isLeftSidebarOpen && (
        <ConversationsSidebar
          threads={threads}
          activeThreadId={activeThreadId}
          currentUserId={currentUser.id}
          currentUser={currentUser}
          allUsers={MOCK_USERS}
          selectedThreadTagFilter={selectedThreadTagFilter}
          allThreadTags={allThreadTags}
          onSelectThread={handleSelectThread}
          onAccessDenied={(t) =>
            setAccessDeniedInfo({
              isOpen: true,
              threadName: t.name,
              threadType: t.type,
              reason: 'Restricted conversation.',
              authorizedMembers: t.memberIds.map(
                (id) => MOCK_USERS.find((u) => u.id === id)?.name || id
              ),
            })
          }
          onTogglePinThread={handleTogglePinThread}
          onOpenThreadTagModal={(tId) => setThreadSettingsState({ threadId: tId, tab: 'thread-tags' })}
          onSetThreadTagFilter={(tag) => setSelectedThreadTagFilter(tag)}
          onSwitchUser={handleSwitchPersona}
          onOpenSettings={(tab) => {
            setSettingsTab(tab);
            setIsSettingsOpen(true);
          }}
          onCollapse={() => setIsLeftSidebarOpen(false)}
          workspaceViewMode={workspaceViewMode}
          onChangeWorkspaceViewMode={(mode) => setWorkspaceViewMode(mode)}
          isProjectViewsEnabled={isProjectViewsEnabled}
          isCustomSkinsEnabled={isCustomSkinsEnabled}
        />
      )}

      {/* 2. Main Canvas: Either Revamp Plugin View OR Classic Project Views (replacing Chat & Metadata panel) OR Core Thread Chat Module */}
      {workspaceViewMode === 'revamp' && isCustomSkinsEnabled ? (
        <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900 transition-colors">
          <PluginErrorBoundary
            pluginId="thread-custom-skins"
            pluginName="Revamp: Custom Skins & Cosmetics"
            onDisablePlugin={() => {
              togglePlugin('thread-custom-skins', false);
              setWorkspaceViewMode('chat');
            }}
          >
            <RevampPluginView
              threads={threads}
              activeThreadId={activeThreadId}
              currentUserId={currentUser.id}
              onSelectThread={(id) => {
                handleSelectThread(id);
              }}
              onBackToChat={() => {
                setWorkspaceViewMode('chat');
              }}
              onSkinApplied={() => setActiveSkinRefreshKey((k) => k + 1)}
              isLeftSidebarOpen={isLeftSidebarOpen}
              onToggleLeftSidebar={() => setIsLeftSidebarOpen((prev) => !prev)}
            />
          </PluginErrorBoundary>
        </main>
      ) : (workspaceViewMode === 'table' || workspaceViewMode === 'kanban' || workspaceViewMode === 'gantt') && isProjectViewsEnabled ? (
        <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900 transition-colors">
          <PluginErrorBoundary
            pluginId="thread-project-views"
            pluginName="Classic Project Views"
            onDisablePlugin={() => {
              togglePlugin('thread-project-views', false);
              setWorkspaceViewMode('chat');
            }}
          >
            <ProjectViews
              threads={threads}
              activeThreadId={activeThreadId}
              onSelectThread={(id) => {
                handleSelectThread(id);
              }}
              viewMode={workspaceViewMode}
              onChangeViewMode={(mode) => setWorkspaceViewMode(mode)}
              users={MOCK_USERS}
              messages={messages}
              currentUserId={currentUser.id}
              onBackToChat={() => {
                setWorkspaceViewMode('chat');
              }}
              onUpdateThreadMetadata={handleUpdateThreadMetadata}
              isLeftSidebarOpen={isLeftSidebarOpen}
              onToggleLeftSidebar={() => setIsLeftSidebarOpen((prev) => !prev)}
            />
          </PluginErrorBoundary>
        </main>
      ) : (
        <>
          {/* Main Chat Canvas */}
          <main className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900 transition-colors">
            {/* Chat Header */}
            <ChatHeader
              activeThread={activeThread}
              users={MOCK_USERS}
              currentUserId={currentUser.id}
              isLeftSidebarOpen={isLeftSidebarOpen}
              onToggleLeftSidebar={() => setIsLeftSidebarOpen((prev) => !prev)}
              isRightSidebarOpen={isRightSidebarOpen}
              onToggleRightSidebar={() => setIsRightSidebarOpen((prev) => !prev)}
              activeThreadFilesCount={activeThreadFiles.length}
              activeMessagesWithPollsCount={activeMessages.filter((m) => Boolean(m.poll)).length}
              rightSidebarTab={rightSidebarTab}
              darkMode={darkMode}
              onToggleDarkMode={() => setDarkMode((prev) => !prev)}
              onTogglePinThread={handleTogglePinThread}
              onOpenSearch={() => setIsSearchOpen(true)}
              onSelectRightSidebarTab={(tab) => setRightSidebarTab(tab)}
              workspaceViewMode={workspaceViewMode}
              onChangeWorkspaceViewMode={(mode) => setWorkspaceViewMode(mode)}
              isProjectViewsEnabled={isProjectViewsEnabled}
              onOpenThreadSkins={() => setWorkspaceViewMode('revamp')}
              isCustomSkinsEnabled={isCustomSkinsEnabled}
              onOpenWebhookModal={() => setIsWebhookModalOpen(true)}
              isWebhookEnabled={isWebhookEnabled}
            />

            {/* Sticky Thread Pinned Message (Truncated message preview only, no button, no x, clicking scrolls to actual message) */}
            {activePinnedMessage && (
              <div
                id="sticky-pinned-message-banner"
                role="button"
                tabIndex={0}
                onClick={() => scrollToMessage(activePinnedMessage.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    scrollToMessage(activePinnedMessage.id);
                  }
                }}
                className="bg-amber-50/95 dark:bg-amber-950/70 border-b border-amber-200/90 dark:border-amber-800/80 px-5 py-2.5 flex items-center shadow-2xs shrink-0 z-10 animate-in fade-in slide-in-from-top-1 duration-150 cursor-pointer hover:bg-amber-100/90 dark:hover:bg-amber-900/40 transition-colors select-none group"
                title="Click to scroll to pinned message"
              >
                <p className="text-xs text-slate-800 dark:text-slate-200 truncate font-medium flex-1 min-w-0">
                  {activePinnedMessage.content?.trim() ||
                    (activePinnedMessage.poll ? `Poll: ${activePinnedMessage.poll.question}` : 'Pinned message')}
                </p>
              </div>
            )}

            {/* Message Stream */}
            <div
              ref={messagesContainerRef}
              className={cn(
                'flex-1 overflow-y-auto p-6 space-y-6 transition-colors',
                isMounted && activeThreadSkin?.chatWallpaper === 'grid' && 'bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.08),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.12),rgba(15,23,42,0))]',
                isMounted && activeThreadSkin?.chatWallpaper === 'dots' && 'bg-[radial-gradient(#94a3b8_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px]',
                isMounted && activeThreadSkin?.chatWallpaper === 'gradient' && 'bg-gradient-to-b from-slate-50/80 to-white dark:from-slate-900 dark:to-slate-950'
              )}
              onClick={() => setTagPopoverMsgId(null)}
            >
              {/* Active Tag Filter Banner */}
              {filterTagId && currentFilterTag && (
                <div className="bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 flex items-center justify-between shadow-2xs mb-2 animate-in fade-in duration-150">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center shrink-0">
                      <Filter size={14} />
                    </div>
                    <div className="min-w-0 flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        Filtered by tag:
                      </span>
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded-md text-xs font-bold border shadow-2xs',
                          currentFilterTag.color
                        )}
                      >
                        {currentFilterTag.name}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        ({displayedMessages.length}{' '}
                        {displayedMessages.length === 1 ? 'message' : 'messages'})
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    id="clear-tag-filter-banner-btn"
                    onClick={() => setFilterTagId(null)}
                    className="px-2.5 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-300 dark:border-slate-600 rounded-lg transition-colors cursor-pointer shrink-0 ml-2 shadow-2xs flex items-center gap-1"
                  >
                    <X size={12} />
                    <span>Clear</span>
                  </button>
                </div>
              )}

              {/* Empty Filter State */}
              {filterTagId && displayedMessages.length === 0 && (
                <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs">
                  No messages found with tag &ldquo;{currentFilterTag?.name}&rdquo; in this thread.
                  <div className="mt-2.5">
                    <button
                      type="button"
                      onClick={() => setFilterTagId(null)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 rounded-lg cursor-pointer shadow-2xs"
                    >
                      Clear Tag Filter
                    </button>
                  </div>
                </div>
              )}

              {/* Message List */}
              {displayedMessages.map((msg) => (
                <MessageItem
                  key={msg.id}
                  msg={msg}
                  activeThread={activeThread}
                  allMessages={messages}
                  allUsers={MOCK_USERS}
                  files={files}
                  currentUserId={currentUser.id}
                  currentUserName={currentUser.name}
                  filterTagId={filterTagId}
                  highlightedMsgId={highlightedMsgId}
                  tagPopoverMsgId={tagPopoverMsgId}
                  activeActionsMenuMsgId={activeActionsMenuMsgId}
                  onClearFilterTag={() => setFilterTagId(null)}
                  onScrollToMessage={scrollToMessage}
                  onOpenFileAtPin={openFileAtPin}
                  onVotePoll={handleVotePoll}
                  onTagClick={handleTagClick}
                  onReply={(m) => setReplyingToMessage(m)}
                  onRequestPinMessage={handleRequestPinMessage}
                  onToggleTagPopover={(msgId) => setTagPopoverMsgId(msgId)}
                  onToggleActionsMenu={(msgId) => setActiveActionsMenuMsgId(msgId)}
                  onToggleMessageTag={handleToggleMessageTag}
                  onCreateTag={handleCreateTag}
                  onCopyMessageLink={handleCopyMessageLink}
                  onInsertMessageReference={handleInsertMessageReference}
                  onNavigateToMessageLink={handleNavigateToMessageLink}
                  onEditMessage={handleEditMessage}
                  onOpenEditHistory={(m) => setHistoryModalMessage(m)}
                />
              ))}

              <div ref={messagesEndRef} />
            </div>

            {/* Message Input Composer */}
            <MessageInput
              inputValue={inputValue}
              onInputChange={handleMainInputChange}
              onKeyDown={handleMainInputKeyDown}
              replyingToMessage={replyingToMessage}
              onCancelReply={() => setReplyingToMessage(null)}
              onSubmit={handleSendMessage}
              onFileUpload={handleFileUpload}
              onOpenCreatePoll={() => setIsCreatePollOpen(true)}
              mentionQuery={mentionQuery}
              mentionableUsers={mentionableUsers}
              selectedMentionIdx={selectedMentionIdx}
              setSelectedMentionIdx={setSelectedMentionIdx}
              onSelectMention={handleSelectMention}
              inputRef={mainInputRef}
            />
          </main>

          {/* 3. Right Metadata & Files Sidebar (Core Chat Module only) */}
          {isRightSidebarOpen && (
            <MetadataSidebar
              activeThread={activeThread}
              allMessages={messages}
              activeMessages={activeMessages}
              activeThreadFiles={activeThreadFiles}
              currentUserId={currentUser.id}
              rightSidebarTab={rightSidebarTab}
              setRightSidebarTab={setRightSidebarTab}
              filterTagId={filterTagId}
              onTagClick={handleTagClick}
              onCreateTag={handleCreateTag}
              onOpenThreadSettings={(tId, tab) => setThreadSettingsState({ threadId: tId, tab })}
              onOpenThreadTagModal={(tId, tab) => setThreadSettingsState({ threadId: tId, tab: tab || 'thread-tags' })}
              onUpdateThreadCover={handleUpdateThreadCover}
              onRemoveThreadTag={handleRemoveThreadTag}
              onSaveThreadTitle={handleSaveThreadTitle}
              onSaveThreadDesc={handleSaveThreadDesc}
              onSaveTagEdit={handleSaveTagEdit}
              onDeleteTag={handleDeleteTag}
              onToggleTagUnique={handleToggleTagUnique}
              onScrollToMessage={scrollToMessage}
              onVotePoll={handleVotePoll}
              onOpenCreatePoll={() => setIsCreatePollOpen(true)}
              onOpenFileAtPin={openFileAtPin}
              onTriggerFileUpload={() => {
                // Trigger file picker via file input inside composer
                const input = document.querySelector('input[type="file"]') as HTMLInputElement;
                input?.click();
              }}
              onCollapse={() => setIsRightSidebarOpen(false)}
            />
          )}
        </>
      )}

      {/* 4. Modals & Dialogs */}
      <AccessDeniedModal
        accessDeniedInfo={accessDeniedInfo}
        onClose={() => setAccessDeniedInfo(null)}
        currentUserId={currentUser.id}
        onSwitchUser={handleSwitchPersona}
        users={MOCK_USERS}
      />

      <ReplacePinModal
        replacePinPrompt={replacePinPrompt}
        activeThreadName={activeThread?.name}
        onClose={() => setReplacePinPrompt(null)}
        onConfirm={executePinMessage}
      />

      <TagConflictModal
        uniqueConflictPrompt={uniqueConflictPrompt}
        onClose={() => setUniqueConflictPrompt(null)}
        onConfirm={handleConfirmTagConflict}
      />

      <CreatePollModal
        isOpen={isCreatePollOpen}
        activeThreadName={activeThread?.name}
        onClose={() => setIsCreatePollOpen(false)}
        onSubmit={handleCreatePollSubmit}
      />

      <ThreadSettingsModal
        threadId={threadSettingsState?.threadId ?? null}
        initialTab={threadSettingsState?.tab ?? 'general'}
        threads={threads}
        currentUserId={currentUser.id}
        currentUser={currentUser}
        users={MOCK_USERS}
        allMessages={messages}
        onClose={() => setThreadSettingsState(null)}
        onSaveThreadTitle={handleSaveThreadTitle}
        onSaveThreadDesc={handleSaveThreadDesc}
        onUpdateThreadCover={handleUpdateThreadCover}
        onAddThreadTag={handleAddThreadTag}
        onRemoveThreadTag={handleRemoveThreadTag}
        onUpdatePermission={handleUpdateThreadPermission}
        onAddMember={handleAddThreadMember}
        onRemoveMember={handleRemoveThreadMember}
        onSwitchUser={handleSwitchPersona}
        onCreateMessageTag={handleCreateCustomTag}
        onSaveTagEdit={handleSaveTagEdit}
        onDeleteTag={handleDeleteTag}
        onToggleTagUnique={handleToggleTagUnique}
        onOpenCreatePoll={() => setIsCreatePollOpen(true)}
        onScrollToMessage={scrollToMessage}
        onNavigateToMessage={handleNavigateToMessageLink}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        threads={threads}
        messages={messages}
        users={MOCK_USERS}
        onNavigate={handleNavigateToMessageLink}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        activeTab={settingsTab}
        setActiveTab={setSettingsTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        enterToSend={enterToSend}
        setEnterToSend={setEnterToSend}
        currentUserId={currentUser.id}
        onSwitchUser={handleSwitchPersona}
        users={MOCK_USERS}
        themeScheme={themeScheme}
        onSelectTint={handleSelectTint}
        onResetTint={handleResetTint}
        onPluginToggled={handlePluginToggled}
        onOpenSkinsModal={() => setIsSkinsModalOpen(true)}
        onOpenWebhookModal={() => setIsWebhookModalOpen(true)}
        onOpenReadme={() => {
          setIsSettingsOpen(false);
          setIsReadmeOpen(true);
        }}
      />

      {/* First-Party Plugin: Thread Custom Skins & Cosmetics Modal */}
      {activeThread && (
        <CustomSkinsCustomizer
          isOpen={isSkinsModalOpen}
          onClose={() => setIsSkinsModalOpen(false)}
          threadId={activeThread.id}
          threadName={activeThread.name}
          onSkinApplied={() => {
            setActiveSkinRefreshKey((k) => k + 1);
            showToast('Skin Applied', `Updated cosmetics for #${activeThread.name}`);
          }}
        />
      )}

      {/* First-Party Plugin: Webhook Dispatcher Modal */}
      {activeThread && (
        <WebhookDispatcherModal
          isOpen={isWebhookModalOpen}
          onClose={() => setIsWebhookModalOpen(false)}
          activeThread={activeThread}
          onDispatchWebhook={handleDispatchWebhook}
        />
      )}

      <ReadmeModal
        isOpen={isReadmeOpen}
        onClose={() => setIsReadmeOpen(false)}
      />

      {previewFileId && currentPreviewFile && (
        <ImageAnnotationModal
          activeFile={currentPreviewFile}
          activeThread={activeThread}
          messages={messages}
          currentUser={currentUser}
          onClose={() => {
            setPreviewFileId(null);
            setTargetPinNumber(null);
            setTargetTimestamp(null);
          }}
          onSendMessage={handleSendAnnotationMessage}
          targetPinNumber={targetPinNumber}
          targetTimestamp={targetTimestamp}
          onCopyLink={handleCopyMessageLink}
          onNavigateToMessage={handleNavigateToMessageLink}
        />
      )}

      {/* Message Edit History & Diff Modal */}
      <EditHistoryModal
        isOpen={Boolean(historyModalMessage)}
        onClose={() => setHistoryModalMessage(null)}
        message={historyModalMessage}
      />

      {/* 5. Interactive Toast Notifications */}
      <ToastNotification
        toastInfo={toastInfo}
        onClose={() => setToastInfo(null)}
        onNavigate={handleNavigateToMessageLink}
      />
    </div>
  );
}
