// components/plugins/ProjectViews.tsx
// Notion-like Decoupled Project Views (Table, Kanban, Gantt) for ThreadFlow
// Features: Dynamic user-defined columns, sandboxed metadata injection,
// thread tags as Kanban columns & filters, and rich tag metadata exposure.

'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Table,
  Kanban,
  Calendar,
  Search,
  ArrowRight,
  Clock,
  Hash,
  User as UserIcon,
  MessageSquare,
  ChevronDown,
  Plus,
  SlidersHorizontal,
  X,
  Check,
  Tag as TagIcon,
  Trash2,
  CalendarDays,
  Type,
  Binary,
  ListFilter,
  CheckSquare,
  Link2,
  Info,
  Layers,
  ArrowUpDown,
  MoveRight,
  PanelLeftOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Thread, User, Message, TagDef } from '@/types/chat';
import {
  WorkspaceViewMode,
  ThreadCustomFields,
  ProjectColumnDef,
  ProjectColumnType,
  ProjectColumnSelectOption,
} from '@/types/plugins';
import {
  getAllThreadCustomFields,
  updateThreadCustomFields,
  getProjectColumns,
  addProjectColumn,
  updateProjectColumn,
  deleteProjectColumn,
  resetProjectColumns,
} from '@/lib/plugins/plugin-registry';
import { UserAvatar } from '@/components/chat/UserAvatar';
import { getThreadTagColor } from '@/lib/chat-utils';

interface ProjectViewsProps {
  threads: Thread[];
  activeThreadId: string;
  onSelectThread: (threadId: string) => void;
  viewMode: WorkspaceViewMode;
  onChangeViewMode: (mode: WorkspaceViewMode) => void;
  users: User[];
  messages: Message[];
  currentUserId: string;
  onBackToChat: () => void;
  onUpdateThreadMetadata?: (threadId: string, updates: Partial<Thread>) => void;
  isLeftSidebarOpen?: boolean;
  onToggleLeftSidebar?: () => void;
}

export const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; dotColor: string }
> = {
  backlog: {
    label: 'Backlog',
    color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700',
    dotColor: 'bg-slate-400',
  },
  in_progress: {
    label: 'In Progress',
    color: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    dotColor: 'bg-blue-500',
  },
  review: {
    label: 'In Review',
    color: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    dotColor: 'bg-amber-500',
  },
  done: {
    label: 'Completed',
    color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    dotColor: 'bg-emerald-500',
  },
  blocked: {
    label: 'Blocked',
    color: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    dotColor: 'bg-rose-500',
  },
};

export const PRIORITY_CONFIG: Record<string, { label: string; badge: string }> = {
  p0: { label: 'P0 Urgent', badge: 'bg-rose-600 text-white font-bold' },
  p1: { label: 'P1 High', badge: 'bg-amber-500 text-white font-semibold' },
  p2: { label: 'P2 Normal', badge: 'bg-blue-500 text-white' },
  p3: { label: 'P3 Low', badge: 'bg-slate-400 text-white' },
};

export function ProjectViews({
  threads,
  activeThreadId,
  onSelectThread,
  viewMode,
  onChangeViewMode,
  users,
  messages,
  currentUserId,
  onBackToChat,
  onUpdateThreadMetadata,
  isLeftSidebarOpen,
  onToggleLeftSidebar,
}: ProjectViewsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  // Kanban Group By State ('thread_tags' | 'status' | 'priority' | custom select col)
  const [kanbanGroupBy, setKanbanGroupBy] = useState<string>('thread_tags');

  // Columns Configuration
  const [columns, setColumns] = useState<ProjectColumnDef[]>(() => getProjectColumns());

  // Sandboxed custom fields state
  const [customFields, setCustomFields] = useState<Record<string, ThreadCustomFields>>(() =>
    getAllThreadCustomFields()
  );

  // Sorting State
  const [sortColumnId, setSortColumnId] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Modals & Panels
  const [isAddPropertyOpen, setIsAddPropertyOpen] = useState(false);
  const [isColumnVisibilityOpen, setIsColumnVisibilityOpen] = useState(false);
  const [selectedTagForInspection, setSelectedTagForInspection] = useState<{
    tag: TagDef;
    thread: Thread;
  } | null>(null);

  // New tag prompt modal for Kanban
  const [isAddTagColumnOpen, setIsAddTagColumnOpen] = useState(false);
  const [newTagInput, setNewTagInput] = useState('');

  // Derive last message timestamp and content per thread
  const lastMessageMap = useMemo(() => {
    const map: Record<string, Message> = {};
    messages.forEach((msg) => {
      if (!map[msg.threadId]) {
        map[msg.threadId] = msg;
      }
    });
    return map;
  }, [messages]);

  // Extract all unique thread tags across threads
  const allUniqueTags = useMemo(() => {
    const tags = new Set<string>();
    threads.forEach((t) => {
      (t.threadTags || []).forEach((tag) => tags.add(tag));
    });
    return Array.from(tags);
  }, [threads]);

  // Handle custom field updates (non-destructively injects into sandboxed storage and thread metadata)
  const handleFieldChange = (threadId: string, patch: Partial<ThreadCustomFields>) => {
    // 1. Update sandboxed storage
    updateThreadCustomFields(threadId, patch);

    // 2. Update local state
    setCustomFields((prev) => ({
      ...prev,
      [threadId]: {
        ...(prev[threadId] || {}),
        ...patch,
      },
    }));

    // 3. Inject into thread's customFields metadata non-destructively
    if (onUpdateThreadMetadata) {
      const targetThread = threads.find((t) => t.id === threadId);
      const existing = targetThread?.customFields || {};
      onUpdateThreadMetadata(threadId, {
        customFields: {
          ...existing,
          ...patch,
        },
      });
    }
  };

  // Handle direct Thread metadata changes (threadTags, name, description, etc.)
  const handleThreadMetadataChange = (threadId: string, patch: Partial<Thread>) => {
    if (onUpdateThreadMetadata) {
      onUpdateThreadMetadata(threadId, patch);
    }
  };

  // Column management actions
  const handleAddColumn = (newCol: ProjectColumnDef) => {
    const updated = addProjectColumn(newCol);
    setColumns(updated);
    setIsAddPropertyOpen(false);
  };

  const handleUpdateColumn = (colId: string, patch: Partial<ProjectColumnDef>) => {
    const updated = updateProjectColumn(colId, patch);
    setColumns(updated);
  };

  const handleDeleteColumn = (colId: string) => {
    const updated = deleteProjectColumn(colId);
    setColumns(updated);
  };

  const handleResetColumns = () => {
    const reset = resetProjectColumns();
    setColumns(reset);
  };

  const handleToggleColumnVisibility = (colId: string) => {
    const col = columns.find((c) => c.id === colId);
    if (!col) return;
    handleUpdateColumn(colId, { visible: !col.visible });
  };

  // Sorting helper
  const handleSort = (colId: string) => {
    if (sortColumnId === colId) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortColumnId(null);
        setSortDirection('asc');
      }
    } else {
      setSortColumnId(colId);
      setSortDirection('asc');
    }
  };

  // Filtered & sorted threads
  const filteredThreads = useMemo(() => {
    let result = threads.filter((t) => {
      // Access check
      const hasAccess = !t.isPrivate || t.memberIds.includes(currentUserId);
      if (!hasAccess) return false;

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = t.name.toLowerCase().includes(q);
        const matchesDesc = (t.description || '').toLowerCase().includes(q);
        const matchesTags = (t.threadTags || []).some((tag) => tag.toLowerCase().includes(q));
        const notes = customFields[t.id]?.customNotes || '';
        const matchesNotes = typeof notes === 'string' && notes.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesTags && !matchesNotes) return false;
      }

      // Tag filter
      if (selectedTagFilter !== 'all') {
        if (!(t.threadTags || []).includes(selectedTagFilter)) return false;
      }

      // Status filter
      if (selectedStatusFilter !== 'all') {
        const status = customFields[t.id]?.status || 'in_progress';
        if (status !== selectedStatusFilter) return false;
      }

      return true;
    });

    if (sortColumnId) {
      result = [...result].sort((a, b) => {
        let valA: any = '';
        let valB: any = '';

        if (sortColumnId === 'title') {
          valA = a.name;
          valB = b.name;
        } else if (sortColumnId === 'created_at') {
          valA = a.createdAt || '';
          valB = b.createdAt || '';
        } else if (sortColumnId === 'thread_tags') {
          valA = (a.threadTags || []).join(',');
          valB = (b.threadTags || []).join(',');
        } else {
          valA = customFields[a.id]?.[sortColumnId] ?? '';
          valB = customFields[b.id]?.[sortColumnId] ?? '';
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [
    threads,
    currentUserId,
    searchQuery,
    selectedTagFilter,
    selectedStatusFilter,
    customFields,
    sortColumnId,
    sortDirection,
  ]);

  const visibleColumns = useMemo(() => {
    return columns.filter((c) => c.visible !== false);
  }, [columns]);

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-900 overflow-hidden select-none">
      {/* View Header Bar */}
      <div className="px-5 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          {onToggleLeftSidebar && !isLeftSidebarOpen && (
            <button
              type="button"
              id="project-views-toggle-left-sidebar"
              onClick={onToggleLeftSidebar}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-200 dark:border-indigo-800 shadow-2xs"
              title="Expand conversations panel"
              aria-label="Expand conversations panel"
            >
              <PanelLeftOpen size={16} />
            </button>
          )}

          {/* View Mode Switcher */}
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl flex items-center gap-1 border border-slate-200 dark:border-slate-700 shadow-2xs">
            <button
              type="button"
              onClick={() => onChangeViewMode('table')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer',
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              )}
            >
              <Table size={14} />
              <span>Table</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeViewMode('kanban')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer',
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              )}
            >
              <Kanban size={14} />
              <span>Kanban</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeViewMode('gantt')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer',
                viewMode === 'gantt'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              )}
            >
              <Calendar size={14} />
              <span>Gantt</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium border-l border-slate-200 dark:border-slate-800 pl-3">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {filteredThreads.length}
            </span>
            <span>of {threads.length} rooms</span>
          </div>
        </div>

        {/* Filters, Custom Properties & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Search */}
          <div className="relative">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search rooms, tags, notes..."
              className="pl-8 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none focus:border-indigo-500 w-44 md:w-52 transition-all"
            />
          </div>

          {/* Tag Filter (Thread Tags as filter) */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1 text-xs text-slate-600 dark:text-slate-400">
            <TagIcon size={12} className="text-slate-400" />
            <select
              value={selectedTagFilter}
              onChange={(e) => setSelectedTagFilter(e.target.value)}
              className="bg-transparent text-slate-800 dark:text-slate-200 text-xs outline-none cursor-pointer pr-1"
            >
              <option value="all">All Tags</option>
              {allUniqueTags.map((tag) => (
                <option key={tag} value={tag}>
                  #{tag}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="backlog">Backlog</option>
            <option value="in_progress">In Progress</option>
            <option value="review">In Review</option>
            <option value="done">Completed</option>
            <option value="blocked">Blocked</option>
          </select>

          {/* Kanban Group By (Only visible in Kanban view) */}
          {viewMode === 'kanban' && (
            <div className="flex items-center gap-1.5 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 rounded-xl px-2.5 py-1 text-xs">
              <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-tight">
                Group by:
              </span>
              <select
                value={kanbanGroupBy}
                onChange={(e) => setKanbanGroupBy(e.target.value)}
                className="bg-transparent text-xs font-semibold text-indigo-900 dark:text-indigo-200 outline-none cursor-pointer"
              >
                <option value="thread_tags">🏷️ Thread Tags</option>
                <option value="status">📌 Status</option>
                <option value="priority">⚡ Priority</option>
                {columns
                  .filter((c) => c.type === 'select' && c.id !== 'status' && c.id !== 'priority')
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Notion-style Column Customizer */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsColumnVisibilityOpen(!isColumnVisibilityOpen)}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              title="Customize Columns"
            >
              <SlidersHorizontal size={14} />
            </button>

            {isColumnVisibilityOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-60 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Properties & Columns
                  </span>
                  <button
                    type="button"
                    onClick={handleResetColumns}
                    className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
                <div className="max-h-56 overflow-y-auto flex flex-col gap-1 pr-1">
                  {columns.map((col) => (
                    <label
                      key={col.id}
                      className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer text-xs text-slate-700 dark:text-slate-300"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <input
                          type="checkbox"
                          checked={col.visible !== false}
                          onChange={() => handleToggleColumnVisibility(col.id)}
                          className="rounded text-indigo-600 focus:ring-0 cursor-pointer"
                        />
                        <span className="truncate">{col.title}</span>
                      </div>
                      {col.isBuiltIn ? (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 font-mono">
                          1:1
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteColumn(col.id);
                          }}
                          className="text-slate-400 hover:text-rose-500 p-0.5 rounded cursor-pointer"
                          title="Delete custom property"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </label>
                  ))}
                </div>
                <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setIsColumnVisibilityOpen(false);
                      setIsAddPropertyOpen(true);
                    }}
                    className="w-full py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>+ Add New Property</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Return to Chat */}
          <button
            type="button"
            onClick={onBackToChat}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Return to message stream"
          >
            <MessageSquare size={13} />
            <span>Chat View</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-white dark:bg-slate-900">
        {viewMode === 'table' && (
          <TableView
            threads={filteredThreads}
            activeThreadId={activeThreadId}
            onSelectThread={onSelectThread}
            users={users}
            messages={messages}
            lastMessageMap={lastMessageMap}
            customFields={customFields}
            onFieldChange={handleFieldChange}
            onThreadMetadataChange={handleThreadMetadataChange}
            columns={visibleColumns}
            onOpenAddProperty={() => setIsAddPropertyOpen(true)}
            onInspectTag={(tag, thread) => setSelectedTagForInspection({ tag, thread })}
            sortColumnId={sortColumnId}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
        )}

        {viewMode === 'kanban' && (
          <KanbanView
            threads={filteredThreads}
            activeThreadId={activeThreadId}
            onSelectThread={onSelectThread}
            users={users}
            customFields={customFields}
            onFieldChange={handleFieldChange}
            onThreadMetadataChange={handleThreadMetadataChange}
            groupBy={kanbanGroupBy}
            columns={columns}
            allUniqueTags={allUniqueTags}
            onOpenAddTagColumn={() => setIsAddTagColumnOpen(true)}
          />
        )}

        {viewMode === 'gantt' && (
          <GanttView
            threads={filteredThreads}
            activeThreadId={activeThreadId}
            onSelectThread={onSelectThread}
            customFields={customFields}
            onFieldChange={handleFieldChange}
          />
        )}
      </div>

      {/* Modal: Add Property (Notion-style) */}
      {isAddPropertyOpen && (
        <AddPropertyModal
          onClose={() => setIsAddPropertyOpen(false)}
          onAdd={handleAddColumn}
          existingColumns={columns}
        />
      )}

      {/* Modal: Tag Metadata Inspector */}
      {selectedTagForInspection && (
        <TagMetadataModal
          tag={selectedTagForInspection.tag}
          thread={selectedTagForInspection.thread}
          messages={messages}
          onClose={() => setSelectedTagForInspection(null)}
        />
      )}

      {/* Modal: Add Tag Column (Kanban) */}
      {isAddTagColumnOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 max-w-sm w-full">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
              Add New Thread Tag Column
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Enter a new tag name to create a column in the Kanban board.
            </p>
            <input
              type="text"
              autoFocus
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
              placeholder="e.g. sprint-launch, blocker, qa-review"
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500 mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsAddTagColumnOpen(false);
                  setNewTagInput('');
                }}
                className="px-3 py-1.5 rounded-xl text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!newTagInput.trim()}
                onClick={() => {
                  const cleaned = newTagInput.trim();
                  if (cleaned && threads[0]) {
                    // Assign to current active thread or first thread
                    const targetThread = threads.find((t) => t.id === activeThreadId) || threads[0];
                    const existingTags = targetThread.threadTags || [];
                    if (!existingTags.includes(cleaned)) {
                      handleThreadMetadataChange(targetThread.id, {
                        threadTags: [...existingTags, cleaned],
                      });
                    }
                  }
                  setIsAddTagColumnOpen(false);
                  setNewTagInput('');
                }}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
              >
                Create Tag Column
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------
// 1. Notion-Like Dynamic Table View
// ----------------------------------------------------
function TableView({
  threads,
  activeThreadId,
  onSelectThread,
  users,
  messages,
  lastMessageMap,
  customFields,
  onFieldChange,
  onThreadMetadataChange,
  columns,
  onOpenAddProperty,
  onInspectTag,
  sortColumnId,
  sortDirection,
  onSort,
}: {
  threads: Thread[];
  activeThreadId: string;
  onSelectThread: (id: string) => void;
  users: User[];
  messages: Message[];
  lastMessageMap: Record<string, Message>;
  customFields: Record<string, ThreadCustomFields>;
  onFieldChange: (id: string, patch: Partial<ThreadCustomFields>) => void;
  onThreadMetadataChange: (id: string, patch: Partial<Thread>) => void;
  columns: ProjectColumnDef[];
  onOpenAddProperty: () => void;
  onInspectTag: (tag: TagDef, thread: Thread) => void;
  sortColumnId: string | null;
  sortDirection: 'asc' | 'desc';
  onSort: (colId: string) => void;
}) {
  return (
    <div className="w-full h-full flex-1 overflow-auto bg-white dark:bg-slate-900 flex flex-col">
      <div className="min-w-full overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-max">
          <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 shadow-2xs">
            <tr className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {columns.map((col) => (
                <th
                  key={col.id}
                  style={{ width: col.width ? `${col.width}px` : undefined }}
                  className="py-3 px-3.5 border-r border-slate-100 dark:border-slate-800/80 last:border-r-0 group cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-800/50 transition-colors bg-slate-50 dark:bg-slate-850"
                  onClick={() => onSort(col.id)}
                >
                  <div className="flex items-center justify-between gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <ColumnTypeIcon type={col.type} />
                      <span>{col.title}</span>
                      {col.isBuiltIn && (
                        <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-normal">
                          1:1
                        </span>
                      )}
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      {sortColumnId === col.id ? (
                        <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      ) : (
                        <ArrowUpDown size={11} className="text-slate-400" />
                      )}
                    </div>
                  </div>
                </th>
              ))}
              {/* + Add Property Column Button */}
              <th className="py-3 px-3 w-12 text-center bg-slate-50 dark:bg-slate-850">
                <button
                  type="button"
                  onClick={onOpenAddProperty}
                  className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Add custom property (Dates, text, select, checkbox, etc.)"
                >
                  <Plus size={14} />
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {threads.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="py-16 text-center text-xs text-slate-400 dark:text-slate-500">
                  No project threads found
                </td>
              </tr>
            ) : (
              threads.map((thread) => {
                const fields = customFields[thread.id] || {};
                const isActive = thread.id === activeThreadId;
                const lastMsg = lastMessageMap[thread.id];

                return (
                  <tr
                    key={thread.id}
                    className={cn(
                      'hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group',
                      isActive && 'bg-indigo-50/30 dark:bg-indigo-950/20'
                    )}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.id}
                        className="py-2.5 px-3.5 border-r border-slate-100 dark:border-slate-800/60 last:border-r-0 align-middle"
                      >
                        <TableCellRenderer
                          col={col}
                          thread={thread}
                          fields={fields}
                          users={users}
                          messages={messages}
                          lastMsg={lastMsg}
                          isActive={isActive}
                          onSelectThread={onSelectThread}
                          onFieldChange={onFieldChange}
                          onThreadMetadataChange={onThreadMetadataChange}
                          onInspectTag={onInspectTag}
                        />
                      </td>
                    ))}
                    {/* Action cell */}
                    <td className="py-2.5 px-3 text-center align-middle">
                      <button
                        type="button"
                        onClick={() => onSelectThread(thread.id)}
                        className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                        title="Open thread stream"
                      >
                        <ArrowRight size={11} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Table Cell Renderer (Supports all Notion data types)
// ----------------------------------------------------
function TableCellRenderer({
  col,
  thread,
  fields,
  users,
  messages,
  lastMsg,
  isActive,
  onSelectThread,
  onFieldChange,
  onThreadMetadataChange,
  onInspectTag,
}: {
  col: ProjectColumnDef;
  thread: Thread;
  fields: ThreadCustomFields;
  users: User[];
  messages: Message[];
  lastMsg?: Message;
  isActive: boolean;
  onSelectThread: (id: string) => void;
  onFieldChange: (id: string, patch: Partial<ThreadCustomFields>) => void;
  onThreadMetadataChange: (id: string, patch: Partial<Thread>) => void;
  onInspectTag: (tag: TagDef, thread: Thread) => void;
}) {
  const [isEditingText, setIsEditingText] = useState(false);
  const [localText, setLocalText] = useState('');
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);

  // 1. Title / Room Name (Built-in)
  if (col.type === 'title' || col.id === 'title') {
    return (
      <div className="flex items-center gap-2.5">
        <div
          className={cn(
            'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0',
            isActive
              ? 'bg-indigo-600 text-white shadow-2xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          )}
        >
          {thread.type === 'dm' ? <UserIcon size={13} /> : <Hash size={13} />}
        </div>
        <div className="min-w-0 max-w-[220px]">
          <button
            type="button"
            onClick={() => onSelectThread(thread.id)}
            className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 text-left truncate block cursor-pointer text-xs"
          >
            {thread.name}
          </button>
          <p className="text-[11px] text-slate-400 truncate">
            {thread.description || (thread.type === 'dm' ? 'Direct Message' : 'Team Room')}
          </p>
        </div>
      </div>
    );
  }

  // 2. Thread Tags (Built-in, can act as status, filter, or kanban columns)
  if (col.type === 'thread_tags' || col.id === 'thread_tags') {
    const threadTags = thread.threadTags || [];

    const handleRemoveTag = (tagToRemove: string) => {
      onThreadMetadataChange(thread.id, {
        threadTags: threadTags.filter((t) => t !== tagToRemove),
      });
    };

    const handleAddTag = (newTag: string) => {
      if (!threadTags.includes(newTag)) {
        onThreadMetadataChange(thread.id, {
          threadTags: [...threadTags, newTag],
        });
      }
      setIsTagDropdownOpen(false);
    };

    return (
      <div className="relative flex items-center flex-wrap gap-1">
        {threadTags.map((tag) => (
          <span
            key={tag}
            className={cn(
              'inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border group/tag transition-all',
              getThreadTagColor(tag)
            )}
          >
            <span>#{tag}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveTag(tag);
              }}
              className="opacity-0 group-hover/tag:opacity-100 hover:text-rose-600 p-0.5"
              title="Remove tag"
            >
              <X size={10} />
            </button>
          </span>
        ))}

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
            className="text-[10px] px-1.5 py-0.5 rounded border border-dashed border-slate-300 dark:border-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            + Tag
          </button>

          {isTagDropdownOpen && (
            <div className="absolute left-0 top-full mt-1 w-40 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-40">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 pb-1">
                Select or Add Tag
              </p>
              {['urgent', 'to-review', 'confidential', 'hr-pending', 'in-sprint', 'design-qa'].map(
                (presetTag) => (
                  <button
                    key={presetTag}
                    type="button"
                    onClick={() => handleAddTag(presetTag)}
                    className="w-full text-left px-2 py-1 rounded-md text-xs hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    #{presetTag}
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 3. Status (Select / Built-in)
  if (col.type === 'status' || col.id === 'status') {
    const status = fields.status || 'in_progress';
    const statusDef = STATUS_CONFIG[status] || STATUS_CONFIG.in_progress;

    return (
      <select
        value={status}
        onChange={(e) =>
          onFieldChange(thread.id, {
            status: e.target.value as any,
          })
        }
        className={cn(
          'px-2 py-1 rounded-lg text-[11px] font-semibold border outline-none cursor-pointer transition-colors',
          statusDef.color
        )}
      >
        <option value="backlog">Backlog</option>
        <option value="in_progress">In Progress</option>
        <option value="review">In Review</option>
        <option value="done">Completed</option>
        <option value="blocked">Blocked</option>
      </select>
    );
  }

  // 4. Priority (Select / Built-in)
  if (col.type === 'priority' || col.id === 'priority') {
    const priority = fields.priority || 'p2';
    const priorityDef = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.p2;

    return (
      <select
        value={priority}
        onChange={(e) =>
          onFieldChange(thread.id, {
            priority: e.target.value as any,
          })
        }
        className={cn(
          'px-2 py-0.5 rounded-md text-[11px] outline-none cursor-pointer transition-colors',
          priorityDef.badge
        )}
      >
        <option value="p0">P0 Urgent</option>
        <option value="p1">P1 High</option>
        <option value="p2">P2 Normal</option>
        <option value="p3">P3 Low</option>
      </select>
    );
  }

  // 5. Timeline / Date Range (Built-in dates)
  if (col.id === 'timeline') {
    return (
      <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
        <input
          type="date"
          value={fields.startDate || ''}
          onChange={(e) => onFieldChange(thread.id, { startDate: e.target.value })}
          className="bg-transparent border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-[10px] w-24 outline-none"
        />
        <span className="text-slate-400">→</span>
        <input
          type="date"
          value={fields.dueDate || ''}
          onChange={(e) => onFieldChange(thread.id, { dueDate: e.target.value })}
          className="bg-transparent border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-[10px] w-24 outline-none"
        />
      </div>
    );
  }

  // 6. Created At (Built-in Thread Metadata: 1:1 exposure)
  if (col.type === 'created_at' || col.id === 'created_at') {
    const rawDate = thread.createdAt || '2026-09-01T08:30:00.000Z';
    const formatted = new Date(rawDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return (
      <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
        <CalendarDays size={12} className="text-slate-400" />
        <span>{formatted}</span>
      </div>
    );
  }

  // 7. Last Message Date & Time (Built-in 1:1 metadata)
  if (col.type === 'last_message' || col.id === 'last_message') {
    const timeStr = lastMsg?.timestamp || 'No messages';
    const snippet = lastMsg?.content ? lastMsg.content.slice(0, 30) + '...' : 'No activity';

    return (
      <div className="flex flex-col text-[11px] max-w-[170px]">
        <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
          <Clock size={11} className="text-slate-400 shrink-0" />
          <span>{timeStr}</span>
        </div>
        <span className="text-[10px] text-slate-400 truncate">{snippet}</span>
      </div>
    );
  }

  // 8. Message Tags Defined in Thread (TagDef metadata 1:1 exposure)
  if (col.type === 'tag_defs' || col.id === 'tag_defs') {
    const tagDefs = thread.tagDefs || [];

    if (tagDefs.length === 0) {
      return <span className="text-[11px] text-slate-400 italic">No tags defined</span>;
    }

    return (
      <div className="flex items-center flex-wrap gap-1 max-w-[190px]">
        {tagDefs.map((tDef) => (
          <button
            key={tDef.id}
            type="button"
            onClick={() => onInspectTag(tDef, thread)}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-slate-700 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-700 cursor-pointer"
            title="Inspect tag metadata (Date created, last message, usage count)"
          >
            {tDef.icon && <span>{tDef.icon}</span>}
            <span>{tDef.name}</span>
            <Info size={9} className="text-slate-400" />
          </button>
        ))}
      </div>
    );
  }

  // 9. Members / Assignees (Built-in 1:1 metadata)
  if (col.type === 'members' || col.id === 'members') {
    const threadMembers = users.filter((u) => thread.memberIds.includes(u.id));

    return (
      <div className="flex items-center -space-x-1.5">
        {threadMembers.map((user) => (
          <UserAvatar
            key={user.id}
            user={user}
            size="xs"
            className="border-2 border-white dark:border-slate-900 shadow-2xs"
          />
        ))}
        <span className="text-[10px] text-slate-400 pl-2">
          {threadMembers.length} {threadMembers.length === 1 ? 'member' : 'members'}
        </span>
      </div>
    );
  }

  // 10. Progress % (Slider)
  if (col.type === 'progress' || col.id === 'progress') {
    const val = fields.progressPercent ?? 30;

    return (
      <div className="flex items-center gap-2">
        <input
          type="range"
          min="0"
          max="100"
          value={val}
          onChange={(e) =>
            onFieldChange(thread.id, { progressPercent: parseInt(e.target.value, 10) })
          }
          className="w-16 h-1.5 bg-slate-200 dark:bg-slate-750 rounded-lg appearance-none cursor-pointer accent-indigo-600"
        />
        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 w-8">{val}%</span>
      </div>
    );
  }

  // 11. Custom Date Property (e.g. targetMilestone, releaseDate)
  if (col.type === 'date') {
    const dateVal = fields[col.id] || '';

    return (
      <input
        type="date"
        value={dateVal}
        onChange={(e) => onFieldChange(thread.id, { [col.id]: e.target.value })}
        className="bg-transparent border border-slate-200 dark:border-slate-700 rounded px-2 py-0.5 text-[11px] text-slate-700 dark:text-slate-300 outline-none w-28"
      />
    );
  }

  // 12. Custom Number Property
  if (col.type === 'number') {
    const numVal = fields[col.id] ?? '';

    return (
      <input
        type="number"
        value={numVal}
        onChange={(e) =>
          onFieldChange(thread.id, {
            [col.id]: e.target.value === '' ? '' : Number(e.target.value),
          })
        }
        placeholder="0"
        className="bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-indigo-500 px-1 py-0.5 text-xs text-slate-800 dark:text-slate-200 outline-none w-20 transition-colors"
      />
    );
  }

  // 13. Custom Checkbox Property
  if (col.type === 'checkbox') {
    const checked = Boolean(fields[col.id]);

    return (
      <button
        type="button"
        onClick={() => onFieldChange(thread.id, { [col.id]: !checked })}
        className={cn(
          'w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer',
          checked
            ? 'bg-indigo-600 border-indigo-600 text-white'
            : 'border-slate-300 dark:border-slate-700 hover:border-indigo-500 text-transparent'
        )}
      >
        <Check size={12} className={checked ? 'opacity-100' : 'opacity-0'} />
      </button>
    );
  }

  // 14. Custom URL / Link Property
  if (col.type === 'url') {
    const urlVal = fields[col.id] || '';

    return (
      <div className="flex items-center gap-1.5 max-w-[200px]">
        <input
          type="text"
          value={urlVal}
          onChange={(e) => onFieldChange(thread.id, { [col.id]: e.target.value })}
          placeholder="https://..."
          className="bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-600 focus:border-indigo-500 px-1 py-0.5 text-xs text-slate-700 dark:text-slate-300 outline-none truncate w-full"
        />
        {urlVal && (
          <a
            href={urlVal.startsWith('http') ? urlVal : `https://${urlVal}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 dark:text-indigo-400 p-0.5 hover:underline shrink-0"
            title="Open link"
          >
            <Link2 size={12} />
          </a>
        )}
      </div>
    );
  }

  // 15. Custom Person Property
  if (col.type === 'person') {
    const personId = fields[col.id];
    const assignedUser = users.find((u) => u.id === personId);

    return (
      <div className="flex items-center gap-1.5">
        <select
          value={personId || ''}
          onChange={(e) => onFieldChange(thread.id, { [col.id]: e.target.value })}
          className="bg-transparent border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-0.5 text-xs text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
        >
          <option value="">Unassigned</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
        {assignedUser && <UserAvatar user={assignedUser} size="xs" />}
      </div>
    );
  }

  // 16. Custom Select Property
  if (col.type === 'select') {
    const val = fields[col.id] || '';
    const options = col.options || [];

    return (
      <select
        value={val}
        onChange={(e) => onFieldChange(thread.id, { [col.id]: e.target.value })}
        className="px-2 py-1 rounded-lg text-[11px] font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
      >
        <option value="">None</option>
        {options.map((opt) => (
          <option key={opt.id} value={opt.id}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }

  // 17. Default: Arbitrary Text String (Freeform editable cell like Notion)
  const textVal = fields[col.id] || '';

  if (isEditingText) {
    return (
      <input
        type="text"
        autoFocus
        value={localText}
        onChange={(e) => setLocalText(e.target.value)}
        onBlur={() => {
          onFieldChange(thread.id, { [col.id]: localText });
          setIsEditingText(false);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onFieldChange(thread.id, { [col.id]: localText });
            setIsEditingText(false);
          } else if (e.key === 'Escape') {
            setIsEditingText(false);
          }
        }}
        className="w-full bg-white dark:bg-slate-800 border border-indigo-500 rounded px-1.5 py-0.5 text-xs text-slate-800 dark:text-slate-200 outline-none shadow-2xs"
      />
    );
  }

  return (
    <div
      onClick={() => {
        setLocalText(textVal);
        setIsEditingText(true);
      }}
      className="cursor-pointer min-h-[24px] flex items-center text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 rounded px-1 py-0.5 truncate"
      title="Click to edit text"
    >
      {textVal || <span className="text-slate-400 italic text-[11px]">Empty</span>}
    </div>
  );
}

// ----------------------------------------------------
// 2. Kanban Board View Subcomponent
// (Supports Grouping by Thread Tags, Status, Priority, or Custom Select)
// ----------------------------------------------------
function KanbanView({
  threads,
  activeThreadId,
  onSelectThread,
  users,
  customFields,
  onFieldChange,
  onThreadMetadataChange,
  groupBy,
  columns,
  allUniqueTags,
  onOpenAddTagColumn,
}: {
  threads: Thread[];
  activeThreadId: string;
  onSelectThread: (id: string) => void;
  users: User[];
  customFields: Record<string, ThreadCustomFields>;
  onFieldChange: (id: string, patch: Partial<ThreadCustomFields>) => void;
  onThreadMetadataChange: (id: string, patch: Partial<Thread>) => void;
  groupBy: string;
  columns: ProjectColumnDef[];
  allUniqueTags: string[];
  onOpenAddTagColumn: () => void;
}) {
  // Compute dynamic Kanban columns based on groupBy choice
  const kanbanColumns = useMemo(() => {
    // A. Group by Thread Tags
    if (groupBy === 'thread_tags') {
      const tagCols = allUniqueTags.map((tag) => ({
        id: tag,
        label: `#${tag}`,
        isTag: true,
      }));
      return [...tagCols, { id: '__untagged__', label: 'Untagged Rooms', isTag: true }];
    }

    // B. Group by Status
    if (groupBy === 'status') {
      return [
        { id: 'backlog', label: 'Backlog', isTag: false },
        { id: 'in_progress', label: 'In Progress', isTag: false },
        { id: 'review', label: 'In Review', isTag: false },
        { id: 'done', label: 'Completed', isTag: false },
        { id: 'blocked', label: 'Blocked', isTag: false },
      ];
    }

    // C. Group by Priority
    if (groupBy === 'priority') {
      return [
        { id: 'p0', label: 'P0 Urgent', isTag: false },
        { id: 'p1', label: 'P1 High', isTag: false },
        { id: 'p2', label: 'P2 Normal', isTag: false },
        { id: 'p3', label: 'P3 Low', isTag: false },
      ];
    }

    // D. Group by Custom Select Column
    const customCol = columns.find((c) => c.id === groupBy);
    if (customCol && customCol.options) {
      return customCol.options.map((opt) => ({
        id: opt.id,
        label: opt.label,
        isTag: false,
      }));
    }

    return [{ id: 'all', label: 'All Rooms', isTag: false }];
  }, [groupBy, allUniqueTags, columns]);

  // Group threads into their respective columns
  const groupedThreads = useMemo(() => {
    const map: Record<string, Thread[]> = {};
    kanbanColumns.forEach((col) => {
      map[col.id] = [];
    });

    threads.forEach((t) => {
      if (groupBy === 'thread_tags') {
        const tags = t.threadTags || [];
        if (tags.length === 0) {
          if (map['__untagged__']) map['__untagged__'].push(t);
        } else {
          // If a thread has multiple tags, show it under its primary tag or matching tag columns
          let placed = false;
          tags.forEach((tag) => {
            if (map[tag]) {
              map[tag].push(t);
              placed = true;
            }
          });
          if (!placed && map['__untagged__']) {
            map['__untagged__'].push(t);
          }
        }
      } else if (groupBy === 'status') {
        const status = customFields[t.id]?.status || 'in_progress';
        if (map[status]) {
          map[status].push(t);
        } else if (map.in_progress) {
          map.in_progress.push(t);
        }
      } else if (groupBy === 'priority') {
        const priority = customFields[t.id]?.priority || 'p2';
        if (map[priority]) {
          map[priority].push(t);
        } else if (map.p2) {
          map.p2.push(t);
        }
      } else {
        const val = customFields[t.id]?.[groupBy];
        if (val && map[val]) {
          map[val].push(t);
        }
      }
    });

    return map;
  }, [threads, groupBy, kanbanColumns, customFields]);

  // Handle moving thread to another column
  const handleMoveThread = (thread: Thread, targetColId: string) => {
    if (groupBy === 'thread_tags') {
      if (targetColId === '__untagged__') {
        onThreadMetadataChange(thread.id, { threadTags: [] });
      } else {
        // Set tag or replace
        onThreadMetadataChange(thread.id, {
          threadTags: [targetColId],
        });
      }
    } else if (groupBy === 'status') {
      onFieldChange(thread.id, { status: targetColId as any });
    } else if (groupBy === 'priority') {
      onFieldChange(thread.id, { priority: targetColId as any });
    } else {
      onFieldChange(thread.id, { [groupBy]: targetColId });
    }
  };

  return (
    <div className="w-full h-full flex-1 overflow-x-auto overflow-y-auto p-4 md:p-6 flex gap-4 items-start bg-slate-50/50 dark:bg-slate-950/50">
      {kanbanColumns.map((col) => {
        const colThreads = groupedThreads[col.id] || [];
        const statusDef = STATUS_CONFIG[col.id] || STATUS_CONFIG.in_progress;

        return (
          <div
            key={col.id}
            className="w-72 md:w-80 shrink-0 bg-slate-100/70 dark:bg-slate-900/60 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 flex flex-col gap-3 min-h-[500px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 truncate">
                {col.isTag ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shrink-0" />
                ) : (
                  <span className={cn('w-2.5 h-2.5 rounded-full shrink-0', statusDef.dotColor)} />
                )}
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider truncate">
                  {col.label}
                </h4>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shadow-2xs shrink-0">
                {colThreads.length}
              </span>
            </div>

            {/* Column Cards */}
            <div className="flex-1 flex flex-col gap-2.5">
              {colThreads.map((thread) => {
                const fields = customFields[thread.id] || {};
                const priority = fields.priority || 'p2';
                const priorityDef = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.p2;
                const isActive = thread.id === activeThreadId;

                return (
                  <div
                    key={thread.id}
                    onClick={() => onSelectThread(thread.id)}
                    className={cn(
                      'p-3.5 rounded-xl bg-white dark:bg-slate-850 border transition-all cursor-pointer shadow-2xs group hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-600',
                      isActive
                        ? 'border-indigo-500 dark:border-indigo-500 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                          {thread.type === 'dm' ? <UserIcon size={12} /> : <Hash size={12} />}
                        </div>
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {thread.name}
                        </h5>
                      </div>
                      <span
                        className={cn('text-[10px] px-1.5 py-0.5 rounded shrink-0', priorityDef.badge)}
                      >
                        {priority.toUpperCase()}
                      </span>
                    </div>

                    {thread.description && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                        {thread.description}
                      </p>
                    )}

                    {/* Thread Tags */}
                    {(thread.threadTags || []).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2.5">
                        {thread.threadTags!.map((tag) => (
                          <span
                            key={tag}
                            className={cn(
                              'text-[9px] font-bold px-1.5 py-0.5 rounded border',
                              getThreadTagColor(tag)
                            )}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Quick Move Selector Footer */}
                    <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <Clock size={11} />
                        <span>{fields.dueDate || 'No due date'}</span>
                      </div>
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-[10px]"
                      >
                        <span className="text-slate-400">Move:</span>
                        <select
                          value={col.id}
                          onChange={(e) => handleMoveThread(thread, e.target.value)}
                          className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-[10px] text-slate-700 dark:text-slate-300 outline-none cursor-pointer"
                        >
                          {kanbanColumns.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}

              {colThreads.length === 0 && (
                <div className="h-32 flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-[11px] text-slate-400 italic">
                  No rooms in {col.label}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* + Add Tag Column Button (When grouped by Thread Tags) */}
      {groupBy === 'thread_tags' && (
        <button
          type="button"
          onClick={onOpenAddTagColumn}
          className="w-72 md:w-80 shrink-0 h-40 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all cursor-pointer"
        >
          <Plus size={20} />
          <span className="text-xs font-bold">+ Add New Tag Column</span>
        </button>
      )}
    </div>
  );
}

// ----------------------------------------------------
// 3. Gantt Timeline View Subcomponent
// ----------------------------------------------------
function GanttView({
  threads,
  activeThreadId,
  onSelectThread,
  customFields,
  onFieldChange,
}: {
  threads: Thread[];
  activeThreadId: string;
  onSelectThread: (id: string) => void;
  customFields: Record<string, ThreadCustomFields>;
  onFieldChange: (id: string, patch: Partial<ThreadCustomFields>) => void;
}) {
  const timelineDays = Array.from({ length: 24 }, (_, i) => {
    const dayNum = i + 10;
    return {
      day: dayNum,
      label: `Sep ${dayNum}`,
      isToday: dayNum === 23,
    };
  });

  return (
    <div className="w-full h-full flex-1 overflow-auto bg-white dark:bg-slate-900 flex flex-col">
      {/* Gantt Header */}
      <div className="sticky top-0 z-10 flex border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-850 shadow-2xs">
        <div className="w-64 p-3 border-r border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-850">
          Thread Project / Room
        </div>
        <div className="flex-1 flex overflow-x-auto">
          {timelineDays.map((d) => (
            <div
              key={d.day}
              className={cn(
                'flex-1 min-w-[38px] text-center py-2.5 border-r border-slate-100 dark:border-slate-800 text-[10px] shrink-0',
                d.isToday &&
                  'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold'
              )}
            >
              {d.label}
              {d.isToday && <div className="text-[9px] uppercase tracking-tighter">Today</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Gantt Rows */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800 flex-1">
        {threads.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400 dark:text-slate-500">
            No project threads found
          </div>
        ) : (
          threads.map((thread, idx) => {
            const fields = customFields[thread.id] || {};
            const isActive = thread.id === activeThreadId;

            const startDay = fields.startDate
              ? parseInt(fields.startDate.split('-')[2], 10)
              : 12 + idx * 2;
            const dueDay = fields.dueDate ? parseInt(fields.dueDate.split('-')[2], 10) : startDay + 6;
            const leftPercent = Math.max(0, Math.min(85, ((startDay - 10) / 24) * 100));
            const widthPercent = Math.max(10, Math.min(80, ((dueDay - startDay) / 24) * 100));

            return (
              <div
                key={thread.id}
                className={cn(
                  'flex items-center hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors',
                  isActive && 'bg-indigo-50/30 dark:bg-indigo-950/20'
                )}
              >
                {/* Left Label */}
                <div className="w-64 p-3 border-r border-slate-200 dark:border-slate-800 shrink-0 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectThread(thread.id)}
                    className="text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 truncate text-left cursor-pointer"
                  >
                    {thread.name}
                  </button>
                  <span className="text-[10px] font-bold text-slate-400 shrink-0">
                    {fields.progressPercent ?? 30}%
                  </span>
                </div>

                {/* Right Gantt Bar Lane */}
                <div className="flex-1 relative h-12 flex items-center px-2 overflow-hidden">
                  <div
                    onClick={() => onSelectThread(thread.id)}
                    className="absolute h-7 rounded-xl shadow-xs flex items-center px-2.5 text-[11px] font-semibold text-white cursor-pointer hover:brightness-110 transition-all overflow-hidden"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                      backgroundColor: 'var(--theme-primary-light, #4f46e5)',
                    }}
                    title={`${thread.name} (Start: Sep ${startDay} → Due: Sep ${dueDay})`}
                  >
                    <span className="truncate flex-1">{thread.name}</span>
                    <span className="text-[9px] opacity-80 shrink-0 ml-1">
                      {fields.progressPercent ?? 30}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 4. Modal: Add Property (Notion-style)
// ----------------------------------------------------
function AddPropertyModal({
  onClose,
  onAdd,
  existingColumns,
}: {
  onClose: () => void;
  onAdd: (col: ProjectColumnDef) => void;
  existingColumns: ProjectColumnDef[];
}) {
  const [propertyName, setPropertyName] = useState('');
  const [propertyType, setPropertyType] = useState<ProjectColumnType>('text');
  const [selectOptionsText, setSelectOptionsText] = useState('Option A, Option B, Option C');

  const propertyTypesList: {
    type: ProjectColumnType;
    label: string;
    description: string;
    icon: any;
  }[] = [
    { type: 'text', label: 'Text / String', description: 'Arbitrary notes, sprint goals, or keys', icon: Type },
    { type: 'date', label: 'Date', description: 'Milestones, sprint deadlines, or reminders', icon: CalendarDays },
    { type: 'number', label: 'Number', description: 'Story points, budget, or estimates', icon: Binary },
    { type: 'select', label: 'Select', description: 'Single select dropdown with color options', icon: ListFilter },
    { type: 'checkbox', label: 'Checkbox', description: 'Boolean completion or signoff status', icon: CheckSquare },
    { type: 'url', label: 'URL / Link', description: 'External Figma specs, GitHub PRs, or docs', icon: Link2 },
    { type: 'person', label: 'Person / Assignee', description: 'Assign workspace team member', icon: UserIcon },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyName.trim()) return;

    const colId = `custom_${propertyName.trim().toLowerCase().replace(/[^a-z0-9]/g, '_')}_${Date.now().toString(36)}`;

    let options: ProjectColumnSelectOption[] | undefined = undefined;
    if (propertyType === 'select') {
      options = selectOptionsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((label, idx) => ({
          id: label.toLowerCase().replace(/\s+/g, '_'),
          label,
          color: [
            'bg-blue-100 text-blue-700',
            'bg-emerald-100 text-emerald-700',
            'bg-amber-100 text-amber-700',
            'bg-purple-100 text-purple-700',
          ][idx % 4],
        }));
    }

    const newCol: ProjectColumnDef = {
      id: colId,
      title: propertyName.trim(),
      type: propertyType,
      isBuiltIn: false,
      isCustom: true,
      width: propertyType === 'text' ? 200 : 150,
      visible: true,
      options,
    };

    onAdd(newCol);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Plus size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Add Notion-Style Property
              </h3>
              <p className="text-[11px] text-slate-400">
                Non-destructively injects data components into thread metadata
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Property Name
            </label>
            <input
              type="text"
              required
              autoFocus
              value={propertyName}
              onChange={(e) => setPropertyName(e.target.value)}
              placeholder="e.g. Target Milestone, QA Signoff, Sprint Points"
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Property Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
              {propertyTypesList.map((pt) => {
                const IconComponent = pt.icon;
                const isSelected = propertyType === pt.type;

                return (
                  <button
                    key={pt.type}
                    type="button"
                    onClick={() => setPropertyType(pt.type)}
                    className={cn(
                      'p-2 rounded-xl border text-left flex items-start gap-2.5 transition-all cursor-pointer',
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 ring-1 ring-indigo-500'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                    )}
                  >
                    <IconComponent
                      size={15}
                      className={cn(
                        'mt-0.5 shrink-0',
                        isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'
                      )}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">{pt.label}</p>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{pt.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {propertyType === 'select' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Select Options (Comma-separated)
              </label>
              <input
                type="text"
                value={selectOptionsText}
                onChange={(e) => setSelectOptionsText(e.target.value)}
                placeholder="High, Medium, Low"
                className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!propertyName.trim()}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer disabled:opacity-50"
            >
              Create Property
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// 5. Modal: Tag Metadata Inspector
// (Exposes Date Created, Date & Time Last Message, Count, etc.)
// ----------------------------------------------------
function TagMetadataModal({
  tag,
  thread,
  messages,
  onClose,
}: {
  tag: TagDef;
  thread: Thread;
  messages: Message[];
  onClose: () => void;
}) {
  // Count how many messages in this thread use this tag
  const taggedMessages = useMemo(() => {
    return messages.filter(
      (m) => m.threadId === thread.id && (m.tagIds || []).includes(tag.id)
    );
  }, [messages, thread.id, tag.id]);

  const lastTaggedMsg = taggedMessages[0]; // assuming messages in chronological or reverse-chronological

  const createdFormatted = tag.createdAt
    ? new Date(tag.createdAt).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : 'Sep 1, 2026, 9:00 AM';

  const lastUsedFormatted = lastTaggedMsg
    ? `${lastTaggedMsg.timestamp} by ${lastTaggedMsg.senderName}`
    : tag.lastUsedAt
    ? new Date(tag.lastUsedAt).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : 'No tagged messages in stream yet';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{tag.icon || '🏷️'}</span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{tag.name}</span>
                <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full border', tag.color)}>
                  {tag.category || 'tag'}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Tag metadata exposed in #{thread.name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Metadata Grid */}
        <div className="space-y-3.5 text-xs text-slate-700 dark:text-slate-300">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Description & Guideline
            </p>
            <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
              {tag.description || 'General purpose thread tag.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Date Created
              </span>
              <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                <CalendarDays size={13} className="text-indigo-500" />
                <span>{createdFormatted}</span>
              </span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Tagged Messages
              </span>
              <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Hash size={13} className="text-emerald-500" />
                <span>
                  {taggedMessages.length || tag.usageCount || 0} messages
                </span>
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Date & Time of Last Message
            </span>
            <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Clock size={13} className="text-amber-500" />
              <span>{lastUsedFormatted}</span>
            </span>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-600 dark:text-slate-400">
              Unique Constraint (Single tag per thread)
            </span>
            <span
              className={cn(
                'text-[10px] font-bold px-2 py-0.5 rounded-full',
                tag.isUnique
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
              )}
            >
              {tag.isUnique ? 'Unique (Exclusive)' : 'Multiple Allowed'}
            </span>
          </div>
        </div>

        <div className="flex justify-end pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------
// Helper Icon for Column Type
// ----------------------------------------------------
function ColumnTypeIcon({ type }: { type: ProjectColumnType }) {
  switch (type) {
    case 'title':
      return <Type size={12} className="text-slate-400" />;
    case 'date':
    case 'created_at':
      return <CalendarDays size={12} className="text-slate-400" />;
    case 'number':
    case 'progress':
      return <Binary size={12} className="text-slate-400" />;
    case 'select':
    case 'status':
    case 'priority':
      return <ListFilter size={12} className="text-slate-400" />;
    case 'checkbox':
      return <CheckSquare size={12} className="text-slate-400" />;
    case 'url':
      return <Link2 size={12} className="text-slate-400" />;
    case 'person':
    case 'members':
      return <UserIcon size={12} className="text-slate-400" />;
    case 'thread_tags':
    case 'tag_defs':
      return <TagIcon size={12} className="text-slate-400" />;
    case 'last_message':
      return <Clock size={12} className="text-slate-400" />;
    default:
      return <Type size={12} className="text-slate-400" />;
  }
}
