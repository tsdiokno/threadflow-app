// types/plugins.ts
// Core data types and security models for ThreadFlow Plugins & Extensions API

export type PluginPermission =
  | 'threads:read'          // Read threads metadata, members, and tags
  | 'threads:write'         // Create or modify thread attributes & custom metadata
  | 'messages:read'         // Read messages in accessible threads
  | 'messages:send'         // Send automated messages, bot responses, and webhooks
  | 'views:custom'          // Mount custom workspace views (Table, Kanban, Gantt)
  | 'ui:theme-override'     // Apply per-thread cosmetic skins, styles, and badges
  | 'integrations:webhooks' // Inbound & outbound webhook simulation and dispatching
  | 'storage:sandboxed';    // Isolated local storage per plugin and thread

export type PermissionSecurityLevel = 'low' | 'medium' | 'high' | 'admin';

export interface PermissionDefinition {
  permission: PluginPermission;
  label: string;
  description: string;
  securityLevel: PermissionSecurityLevel;
  requiresAdminGrant?: boolean;
}

export const PERMISSION_DEFINITIONS: Record<PluginPermission, PermissionDefinition> = {
  'threads:read': {
    permission: 'threads:read',
    label: 'Read Threads',
    description: 'Inspect thread names, member lists, and tag associations',
    securityLevel: 'low',
  },
  'threads:write': {
    permission: 'threads:write',
    label: 'Modify Threads',
    description: 'Update thread tags, custom metadata, and project dates',
    securityLevel: 'medium',
  },
  'messages:read': {
    permission: 'messages:read',
    label: 'Read Messages',
    description: 'Access message history in user-accessible rooms for summaries or indexing',
    securityLevel: 'medium',
  },
  'messages:send': {
    permission: 'messages:send',
    label: 'Send Messages',
    description: 'Post automated notifications, bot responses, or webhooks on behalf of the plugin',
    securityLevel: 'high',
    requiresAdminGrant: true,
  },
  'views:custom': {
    permission: 'views:custom',
    label: 'Custom Project Views',
    description: 'Render decoupled workspace views (Table, Kanban, Gantt timelines)',
    securityLevel: 'low',
  },
  'ui:theme-override': {
    permission: 'ui:theme-override',
    label: 'Cosmetic Themes & Skins',
    description: 'Apply per-thread accent tints, animated badges, and avatar effects',
    securityLevel: 'low',
  },
  'integrations:webhooks': {
    permission: 'integrations:webhooks',
    label: 'Webhook Dispatcher',
    description: 'Trigger inbound notifications and simulate external services (GitHub, Linear, CI/CD)',
    securityLevel: 'medium',
  },
  'storage:sandboxed': {
    permission: 'storage:sandboxed',
    label: 'Sandboxed Storage',
    description: 'Persist isolated settings and thread custom fields in local storage',
    securityLevel: 'low',
  },
};

export type PluginCategory = 'views' | 'cosmetics' | 'integrations' | 'productivity' | 'developer';

export interface PluginSettingField {
  key: string;
  label: string;
  description?: string;
  type: 'boolean' | 'string' | 'select' | 'number';
  defaultValue: any;
  options?: { label: string; value: any }[];
}

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  author: string;
  description: string;
  category: PluginCategory;
  iconName: string; // Lucide icon name, e.g., 'Table', 'Palette', 'Webhook', 'CheckSquare'
  requiredPermissions: PluginPermission[];
  isFirstParty?: boolean;
  enabledByDefault?: boolean;
  settingsSchema?: PluginSettingField[];
  docUrl?: string;
}

export interface PluginState {
  id: string;
  isEnabled: boolean;
  grantedPermissions: PluginPermission[];
  settings: Record<string, any>;
  lastError?: string;
  installedAt?: string;
  isCustom?: boolean;
}

export type WorkspaceViewMode = 'chat' | 'table' | 'kanban' | 'gantt' | 'revamp';

// Schema for sandboxed custom fields on threads (used by Classic Project Views)
export interface ThreadCustomFields {
  status?: 'backlog' | 'in_progress' | 'review' | 'done' | 'blocked';
  priority?: 'p0' | 'p1' | 'p2' | 'p3';
  startDate?: string;
  dueDate?: string;
  progressPercent?: number;
  customNotes?: string;
  externalLink?: string;
  ownerId?: string;
  // Sandboxed dynamic fields defined by user:
  [customKey: string]: any;
}

// Notion-like Column / Property Types for Classic Project Views
export type ProjectColumnType =
  | 'title'        // Thread Room Name & Description (Built-in)
  | 'text'         // Arbitrary string / text
  | 'number'       // Numeric value, score, points
  | 'date'         // Date (YYYY-MM-DD)
  | 'select'       // Single select option
  | 'multi_select' // Multi select options
  | 'checkbox'     // Boolean checkbox
  | 'url'          // Web link / URL
  | 'person'       // Assignee / Member (User reference)
  | 'status'       // Built-in status (or thread tag status)
  | 'priority'     // Built-in priority
  | 'thread_tags'  // Built-in thread tags (can act as status or multi-select)
  | 'tag_defs'     // Built-in message tags defined in thread with metadata
  | 'created_at'   // Built-in thread creation date
  | 'last_message' // Built-in last message time & snippet
  | 'members'      // Built-in members list
  | 'progress';    // Progress percentage slider

export interface ProjectColumnSelectOption {
  id: string;
  label: string;
  color: string; // Tailwind color classes
}

export interface ProjectColumnDef {
  id: string;
  title: string;
  type: ProjectColumnType;
  isBuiltIn?: boolean;
  isCustom?: boolean;
  width?: number;
  visible?: boolean;
  options?: ProjectColumnSelectOption[];
  description?: string;
}


// Schema for per-thread cosmetic skins (used by Revamp Custom Skins)
export interface ThreadSkinConfig {
  skinPresetId?: 'cyberpunk' | 'solar' | 'emerald' | 'rose' | 'velvet' | 'monochrome' | 'default';
  accentHex?: string;
  animatedBadges?: boolean;
  chatWallpaper?: 'none' | 'dots' | 'grid' | 'gradient' | 'subtle-noise';
  avatarFrameGlow?: boolean;
}
