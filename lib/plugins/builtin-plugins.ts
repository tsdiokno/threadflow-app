// lib/plugins/builtin-plugins.ts
// Standard first-party extensions bundled with ThreadFlow

import { PluginManifest } from '@/types/plugins';

export const BUILTIN_PLUGINS: PluginManifest[] = [
  {
    id: 'thread-project-views',
    name: 'Classic Project Views',
    version: '1.2.0',
    author: 'ThreadFlow Core',
    description:
      'Decouple thread discussions into Notion-inspired views: interactive Table with custom columns, Kanban boards grouped by thread tags, and visual Gantt timelines.',
    category: 'views',
    iconName: 'Table',
    isFirstParty: true,
    enabledByDefault: true,
    requiredPermissions: ['threads:read', 'threads:write', 'views:custom', 'storage:sandboxed'],
    settingsSchema: [
      {
        key: 'defaultView',
        label: 'Default View Mode',
        description: 'Initial layout when clicking Project Views in the header',
        type: 'select',
        defaultValue: 'table',
        options: [
          { label: 'Table View', value: 'table' },
          { label: 'Kanban Board', value: 'kanban' },
          { label: 'Gantt Timeline', value: 'gantt' },
        ],
      },
      {
        key: 'showCompletedInKanban',
        label: 'Show Done Column in Kanban',
        description: 'Include completed threads in the rightmost board column',
        type: 'boolean',
        defaultValue: true,
      },
      {
        key: 'denseTableRows',
        label: 'Compact Table Spacing',
        description: 'Display more threads per screen in Table View',
        type: 'boolean',
        defaultValue: false,
      },
    ],
  },
  {
    id: 'thread-custom-skins',
    name: 'Revamp: Custom Skins & Cosmetics',
    version: '1.0.4',
    author: 'ThreadFlow Core',
    description:
      'Discord Nitro-inspired cosmetic perks: customize per-thread accent tints, wallpaper backgrounds, glowing animated tag badges, and persona avatar frames.',
    category: 'cosmetics',
    iconName: 'Palette',
    isFirstParty: true,
    enabledByDefault: true,
    requiredPermissions: ['ui:theme-override', 'storage:sandboxed'],
    settingsSchema: [
      {
        key: 'enableAnimations',
        label: 'Enable Badge Micro-Animations',
        description: 'Show subtle glowing pulses and shimmer effects on active tags',
        type: 'boolean',
        defaultValue: true,
      },
      {
        key: 'enableAvatarFrames',
        label: 'Avatar Profile Halo Frames',
        description: 'Show glowing halo rims around author avatars in messages',
        type: 'boolean',
        defaultValue: true,
      },
      {
        key: 'enableChatWallpaper',
        label: 'Subtle Canvas Patterns',
        description: 'Render delicate dot matrix or blueprint grid backdrops in chat view',
        type: 'boolean',
        defaultValue: true,
      },
    ],
  },
  {
    id: 'webhook-dispatcher',
    name: 'DevOps & Webhook Dispatcher',
    version: '1.1.0',
    author: 'ThreadFlow Integrations',
    description:
      'Simulate and route external notifications from GitHub, Linear, and CI/CD pipelines into dedicated channels with structured message cards.',
    category: 'integrations',
    iconName: 'Webhook',
    isFirstParty: true,
    enabledByDefault: true,
    requiredPermissions: ['threads:read', 'messages:send', 'integrations:webhooks', 'storage:sandboxed'],
    settingsSchema: [
      {
        key: 'autoNotifyBuildFailures',
        label: 'Highlight Failure Alerts',
        description: 'Format CI/CD failure dispatches with high-contrast alert tags',
        type: 'boolean',
        defaultValue: true,
      },
      {
        key: 'botDisplayName',
        label: 'Webhook Bot Name',
        description: 'Display name for automated integration posts',
        type: 'string',
        defaultValue: 'DevOps Bridge',
      },
    ],
  },
  {
    id: 'action-tracker',
    name: 'Action Items & Decision Tracker',
    version: '1.0.2',
    author: 'ThreadFlow Labs',
    description:
      'Automatically aggregates task checklists, action items, and consensus poll decisions into a consolidated summary checklist.',
    category: 'productivity',
    iconName: 'CheckSquare',
    isFirstParty: true,
    enabledByDefault: true,
    requiredPermissions: ['threads:read', 'messages:read'],
    settingsSchema: [
      {
        key: 'autoScanChecklists',
        label: 'Auto-detect markdown [ ] checkboxes',
        description: 'Index bullet points starting with [ ] or [x] as action items',
        type: 'boolean',
        defaultValue: true,
      },
    ],
  },
];
