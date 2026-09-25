// lib/plugins/plugin-registry.ts
// Central management, sandboxed storage, and permission authorization for ThreadFlow plugins

import {
  PluginManifest,
  PluginPermission,
  PluginState,
  ThreadCustomFields,
  ThreadSkinConfig,
  ProjectColumnDef,
} from '@/types/plugins';
import { BUILTIN_PLUGINS } from './builtin-plugins';

const STORAGE_KEY_STATES = 'threadflow_plugins_state_v1';
const STORAGE_KEY_CUSTOM_MANIFESTS = 'threadflow_custom_plugins_v1';
const STORAGE_KEY_THREAD_CUSTOM_FIELDS = 'threadflow_thread_custom_fields_v1';
const STORAGE_KEY_THREAD_SKINS = 'threadflow_thread_skins_v1';
const STORAGE_KEY_PROJECT_COLUMNS = 'threadflow_project_views_columns_v1';

// In-memory fallback for SSR
let customManifestsCache: PluginManifest[] = [];
let statesCache: Record<string, PluginState> | null = null;
let defaultStatesCache: Record<string, PluginState> | null = null;

const pluginListeners = new Set<() => void>();

export function subscribePlugins(callback: () => void): () => void {
  pluginListeners.add(callback);
  return () => pluginListeners.delete(callback);
}

export function notifyPluginListeners(): void {
  pluginListeners.forEach((cb) => {
    try {
      cb();
    } catch (e) {
      console.error('Plugin listener error:', e);
    }
  });
}

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function getDefaultPluginStates(): Record<string, PluginState> {
  if (defaultStatesCache) return defaultStatesCache;
  const states: Record<string, PluginState> = {};
  BUILTIN_PLUGINS.forEach((manifest) => {
    const defaultSettings: Record<string, any> = {};
    manifest.settingsSchema?.forEach((field) => {
      defaultSettings[field.key] = field.defaultValue;
    });

    states[manifest.id] = {
      id: manifest.id,
      isEnabled: manifest.enabledByDefault ?? false,
      grantedPermissions: [...manifest.requiredPermissions],
      settings: defaultSettings,
      installedAt: '2026-09-01T00:00:00.000Z',
      isCustom: !manifest.isFirstParty,
    };
  });
  defaultStatesCache = states;
  return defaultStatesCache;
}

export function getCustomPluginManifests(): PluginManifest[] {
  if (!isBrowser()) return customManifestsCache;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_MANIFESTS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to load custom plugins:', err);
    return [];
  }
}

export function getAllPlugins(): PluginManifest[] {
  const custom = getCustomPluginManifests();
  return [...BUILTIN_PLUGINS, ...custom];
}

export function getPluginStates(): Record<string, PluginState> {
  if (!isBrowser()) {
    return getDefaultPluginStates();
  }
  if (statesCache) {
    return statesCache;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY_STATES);
    let states: Record<string, PluginState> = {};
    if (raw) {
      states = JSON.parse(raw);
    }

    // Ensure all registered plugins have an initialized state
    const all = getAllPlugins();
    let mutated = false;

    all.forEach((manifest) => {
      if (!states[manifest.id]) {
        // Defaults: enable built-ins marked enabledByDefault, grant their required permissions
        const defaultSettings: Record<string, any> = {};
        manifest.settingsSchema?.forEach((field) => {
          defaultSettings[field.key] = field.defaultValue;
        });

        states[manifest.id] = {
          id: manifest.id,
          isEnabled: manifest.enabledByDefault ?? false,
          grantedPermissions: [...manifest.requiredPermissions],
          settings: defaultSettings,
          installedAt: new Date().toISOString(),
          isCustom: !manifest.isFirstParty,
        };
        mutated = true;
      }
    });

    if (mutated) {
      localStorage.setItem(STORAGE_KEY_STATES, JSON.stringify(states));
    }
    statesCache = states;
    return states;
  } catch (err) {
    console.error('Failed to parse plugin states:', err);
    return getDefaultPluginStates();
  }
}

export function isPluginEnabled(pluginId: string): boolean {
  const states = getPluginStates();
  return Boolean(states[pluginId]?.isEnabled);
}

export function hasPluginPermission(pluginId: string, permission: PluginPermission): boolean {
  const states = getPluginStates();
  const state = states[pluginId];
  if (!state || !state.isEnabled) return false;
  return state.grantedPermissions.includes(permission);
}

export function togglePlugin(pluginId: string, isEnabled: boolean): boolean {
  if (!isBrowser()) return false;
  try {
    const states = getPluginStates();
    const manifest = getAllPlugins().find((p) => p.id === pluginId);
    if (!manifest) return false;

    if (!states[pluginId]) {
      states[pluginId] = {
        id: pluginId,
        isEnabled,
        grantedPermissions: [...manifest.requiredPermissions],
        settings: {},
      };
    } else {
      states[pluginId].isEnabled = isEnabled;
    }

    localStorage.setItem(STORAGE_KEY_STATES, JSON.stringify(states));
    statesCache = { ...states };
    notifyPluginListeners();
    return true;
  } catch (err) {
    console.error('Failed to toggle plugin:', err);
    return false;
  }
}

export function updatePluginSettings(pluginId: string, patch: Record<string, any>): boolean {
  if (!isBrowser()) return false;
  try {
    const states = getPluginStates();
    if (!states[pluginId]) return false;

    states[pluginId].settings = {
      ...(states[pluginId].settings || {}),
      ...patch,
    };

    localStorage.setItem(STORAGE_KEY_STATES, JSON.stringify(states));
    statesCache = { ...states };
    notifyPluginListeners();
    return true;
  } catch (err) {
    console.error('Failed to update plugin settings:', err);
    return false;
  }
}

export function installCustomPlugin(manifest: PluginManifest): { success: boolean; error?: string } {
  if (!isBrowser()) return { success: false, error: 'Browser environment required' };
  try {
    if (!manifest.id || !manifest.name) {
      return { success: false, error: 'Manifest must include an id and name' };
    }

    const custom = getCustomPluginManifests();
    if (BUILTIN_PLUGINS.some((p) => p.id === manifest.id) || custom.some((p) => p.id === manifest.id)) {
      return { success: false, error: 'A plugin with this ID is already installed' };
    }

    const sanitizedManifest: PluginManifest = {
      ...manifest,
      isFirstParty: false,
      category: manifest.category || 'developer',
      requiredPermissions: manifest.requiredPermissions || ['storage:sandboxed'],
      settingsSchema: manifest.settingsSchema || [],
      iconName: manifest.iconName || 'Puzzle',
    };

    custom.push(sanitizedManifest);
    localStorage.setItem(STORAGE_KEY_CUSTOM_MANIFESTS, JSON.stringify(custom));

    // Initialize state
    const states = getPluginStates();
    states[sanitizedManifest.id] = {
      id: sanitizedManifest.id,
      isEnabled: true,
      grantedPermissions: [...sanitizedManifest.requiredPermissions],
      settings: {},
      installedAt: new Date().toISOString(),
      isCustom: true,
    };
    localStorage.setItem(STORAGE_KEY_STATES, JSON.stringify(states));
    statesCache = { ...states };
    notifyPluginListeners();

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Unknown error during installation' };
  }
}

export function uninstallCustomPlugin(pluginId: string): boolean {
  if (!isBrowser()) return false;
  try {
    let custom = getCustomPluginManifests();
    custom = custom.filter((p) => p.id !== pluginId);
    localStorage.setItem(STORAGE_KEY_CUSTOM_MANIFESTS, JSON.stringify(custom));

    const states = getPluginStates();
    delete states[pluginId];
    localStorage.setItem(STORAGE_KEY_STATES, JSON.stringify(states));
    statesCache = { ...states };
    notifyPluginListeners();

    return true;
  } catch (err) {
    console.error('Failed to uninstall plugin:', err);
    return false;
  }
}

export function resetPluginsToDefaults(): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(STORAGE_KEY_STATES);
    localStorage.removeItem(STORAGE_KEY_CUSTOM_MANIFESTS);
    statesCache = null;
    customManifestsCache = [];
    getPluginStates(); // reinitialize
    notifyPluginListeners();
  } catch (err) {
    console.error('Failed to reset plugins:', err);
  }
}

// ----------------------------------------------------
// Sandboxed Custom Fields for Threads (Used by Project Views)
// ----------------------------------------------------
const DEFAULT_THREAD_FIELDS: Record<string, ThreadCustomFields> = {
  t1: {
    status: 'in_progress',
    priority: 'p1',
    startDate: '2026-09-15',
    dueDate: '2026-09-30',
    progressPercent: 65,
    customNotes: 'Finalizing interactive prototype animations before design sprint review.',
    targetMilestone: '2026-10-01',
    qaSignoff: true,
    releaseCycle: 'v2.4',
  },
  t2: {
    status: 'review',
    priority: 'p0',
    startDate: '2026-09-10',
    dueDate: '2026-09-25',
    progressPercent: 85,
    customNotes: 'Audio & video timeline annotations in QA testing.',
    targetMilestone: '2026-09-28',
    qaSignoff: false,
    releaseCycle: 'v2.4',
  },
  t3: {
    status: 'in_progress',
    priority: 'p2',
    startDate: '2026-09-18',
    dueDate: '2026-10-05',
    progressPercent: 40,
    customNotes: 'Synchronizing multi-tenant tenant roles and security rules.',
    targetMilestone: '2026-10-10',
    qaSignoff: false,
    releaseCycle: 'v2.5',
  },
  t4: {
    status: 'backlog',
    priority: 'p2',
    startDate: '2026-09-22',
    dueDate: '2026-10-15',
    progressPercent: 20,
    customNotes: 'Team celebration and sprint retrospective planning.',
    targetMilestone: '2026-10-20',
    qaSignoff: false,
    releaseCycle: 'v2.5',
  },
};

// ----------------------------------------------------
// Notion-Style Dynamic Columns for Project Views
// ----------------------------------------------------
export const DEFAULT_PROJECT_COLUMNS: ProjectColumnDef[] = [
  {
    id: 'title',
    title: 'Thread Room',
    type: 'title',
    isBuiltIn: true,
    width: 250,
    visible: true,
    description: 'Thread name, description, and room icon',
  },
  {
    id: 'thread_tags',
    title: 'Thread Tags',
    type: 'thread_tags',
    isBuiltIn: true,
    width: 170,
    visible: true,
    description: 'Tags assigned to the thread room (used as filter or Kanban grouping)',
  },
  {
    id: 'status',
    title: 'Status',
    type: 'status',
    isBuiltIn: false,
    isCustom: false,
    width: 130,
    visible: true,
    options: [
      { id: 'backlog', label: 'Backlog', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
      { id: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' },
      { id: 'review', label: 'In Review', color: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
      { id: 'done', label: 'Completed', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' },
      { id: 'blocked', label: 'Blocked', color: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' },
    ],
  },
  {
    id: 'priority',
    title: 'Priority',
    type: 'priority',
    isBuiltIn: false,
    isCustom: false,
    width: 110,
    visible: true,
    options: [
      { id: 'p0', label: 'P0 Urgent', color: 'bg-rose-600 text-white' },
      { id: 'p1', label: 'P1 High', color: 'bg-amber-500 text-white' },
      { id: 'p2', label: 'P2 Normal', color: 'bg-blue-500 text-white' },
      { id: 'p3', label: 'P3 Low', color: 'bg-slate-400 text-white' },
    ],
  },
  {
    id: 'timeline',
    title: 'Timeline (Dates)',
    type: 'date',
    isBuiltIn: false,
    isCustom: false,
    width: 190,
    visible: true,
    description: 'Start date and target due date',
  },
  {
    id: 'created_at',
    title: 'Date Created',
    type: 'created_at',
    isBuiltIn: true,
    width: 130,
    visible: true,
    description: 'Creation timestamp of the thread room',
  },
  {
    id: 'last_message',
    title: 'Last Message',
    type: 'last_message',
    isBuiltIn: true,
    width: 170,
    visible: true,
    description: 'Timestamp and preview of the most recent message',
  },
  {
    id: 'tag_defs',
    title: 'Message Tags',
    type: 'tag_defs',
    isBuiltIn: true,
    width: 180,
    visible: true,
    description: 'Catalog of message tags defined in this thread room and their usage statistics',
  },
  {
    id: 'progress',
    title: 'Progress',
    type: 'progress',
    isBuiltIn: false,
    isCustom: false,
    width: 130,
    visible: true,
    description: 'Completion percentage slider (0-100%)',
  },
  {
    id: 'members',
    title: 'Assignees / Members',
    type: 'members',
    isBuiltIn: true,
    width: 140,
    visible: true,
    description: 'Thread room participants and assignees',
  },
  {
    id: 'customNotes',
    title: 'Sandboxed Notes',
    type: 'text',
    isBuiltIn: false,
    isCustom: true,
    width: 220,
    visible: true,
    description: 'Freeform notes stored sandboxed in the extension',
  },
  {
    id: 'targetMilestone',
    title: 'Target Milestone',
    type: 'date',
    isBuiltIn: false,
    isCustom: true,
    width: 140,
    visible: true,
    description: 'Target release or milestone date',
  },
];

let projectColumnsCache: ProjectColumnDef[] | null = null;

export function getProjectColumns(): ProjectColumnDef[] {
  if (!isBrowser()) return DEFAULT_PROJECT_COLUMNS;
  if (projectColumnsCache) return projectColumnsCache;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROJECT_COLUMNS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_PROJECT_COLUMNS, JSON.stringify(DEFAULT_PROJECT_COLUMNS));
      projectColumnsCache = DEFAULT_PROJECT_COLUMNS;
      return DEFAULT_PROJECT_COLUMNS;
    }
    const parsed = JSON.parse(raw);
    projectColumnsCache = parsed;
    return parsed;
  } catch (err) {
    return DEFAULT_PROJECT_COLUMNS;
  }
}

export function saveProjectColumns(columns: ProjectColumnDef[]): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY_PROJECT_COLUMNS, JSON.stringify(columns));
    projectColumnsCache = columns;
  } catch (err) {
    console.error('Failed to save project columns:', err);
  }
}

export function addProjectColumn(column: ProjectColumnDef): ProjectColumnDef[] {
  const current = getProjectColumns();
  // Ensure unique ID
  const newCols = [...current, column];
  saveProjectColumns(newCols);
  return newCols;
}

export function updateProjectColumn(columnId: string, patch: Partial<ProjectColumnDef>): ProjectColumnDef[] {
  const current = getProjectColumns();
  const newCols = current.map((c) => (c.id === columnId ? { ...c, ...patch } : c));
  saveProjectColumns(newCols);
  return newCols;
}

export function deleteProjectColumn(columnId: string): ProjectColumnDef[] {
  const current = getProjectColumns();
  const newCols = current.filter((c) => c.id !== columnId || c.isBuiltIn);
  saveProjectColumns(newCols);
  return newCols;
}

export function resetProjectColumns(): ProjectColumnDef[] {
  saveProjectColumns(DEFAULT_PROJECT_COLUMNS);
  return DEFAULT_PROJECT_COLUMNS;
}

export function getAllThreadCustomFields(): Record<string, ThreadCustomFields> {
  if (!isBrowser()) return DEFAULT_THREAD_FIELDS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_THREAD_CUSTOM_FIELDS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_THREAD_CUSTOM_FIELDS, JSON.stringify(DEFAULT_THREAD_FIELDS));
      return DEFAULT_THREAD_FIELDS;
    }
    return { ...DEFAULT_THREAD_FIELDS, ...JSON.parse(raw) };
  } catch (err) {
    return DEFAULT_THREAD_FIELDS;
  }
}

export function getThreadCustomFields(threadId: string): ThreadCustomFields {
  const all = getAllThreadCustomFields();
  return all[threadId] || {
    status: 'in_progress',
    priority: 'p2',
    progressPercent: 30,
  };
}

export function updateThreadCustomFields(threadId: string, patch: Partial<ThreadCustomFields>): void {
  if (!isBrowser()) return;
  try {
    const all = getAllThreadCustomFields();
    all[threadId] = {
      ...(all[threadId] || {}),
      ...patch,
    };
    localStorage.setItem(STORAGE_KEY_THREAD_CUSTOM_FIELDS, JSON.stringify(all));
  } catch (err) {
    console.error('Failed to update thread custom fields:', err);
  }
}

// ----------------------------------------------------
// Sandboxed Thread Skins (Used by Revamp Custom Skins)
// ----------------------------------------------------
const DEFAULT_THREAD_SKINS: Record<string, ThreadSkinConfig> = {
  t1: {
    skinPresetId: 'default',
    accentHex: '#6366f1',
    animatedBadges: false,
    chatWallpaper: 'none',
    avatarFrameGlow: false,
  },
  t2: {
    skinPresetId: 'default',
    accentHex: '#059669',
    animatedBadges: false,
    chatWallpaper: 'none',
    avatarFrameGlow: false,
  },
};

export function getAllThreadSkins(): Record<string, ThreadSkinConfig> {
  if (!isBrowser()) return DEFAULT_THREAD_SKINS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_THREAD_SKINS);
    if (!raw) return DEFAULT_THREAD_SKINS;
    return { ...DEFAULT_THREAD_SKINS, ...JSON.parse(raw) };
  } catch (err) {
    return DEFAULT_THREAD_SKINS;
  }
}

export function getThreadSkin(threadId: string): ThreadSkinConfig {
  const all = getAllThreadSkins();
  return all[threadId] || {
    skinPresetId: 'default',
    chatWallpaper: 'none',
    animatedBadges: false,
    avatarFrameGlow: false,
  };
}

export function updateThreadSkin(threadId: string, patch: Partial<ThreadSkinConfig>): void {
  if (!isBrowser()) return;
  try {
    const all = getAllThreadSkins();
    all[threadId] = {
      ...(all[threadId] || {}),
      ...patch,
    };
    localStorage.setItem(STORAGE_KEY_THREAD_SKINS, JSON.stringify(all));
  } catch (err) {
    console.error('Failed to update thread skin:', err);
  }
}
