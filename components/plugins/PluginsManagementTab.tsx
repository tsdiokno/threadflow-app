// components/plugins/PluginsManagementTab.tsx
// Dedicated workspace plugins and extensions management UI for SettingsModal

'use client';

import React, { useState } from 'react';
import {
  Puzzle,
  Boxes,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Search,
  Filter,
  Check,
  Plus,
  Trash2,
  Settings,
  ExternalLink,
  Code,
  RotateCcw,
  Sparkles,
  Layers,
  Table,
  Palette,
  Webhook,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Info,
  Sliders,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  PluginManifest,
  PluginState,
  PluginPermission,
  PluginCategory,
  PERMISSION_DEFINITIONS,
} from '@/types/plugins';
import {
  getAllPlugins,
  getPluginStates,
  togglePlugin,
  updatePluginSettings,
  installCustomPlugin,
  uninstallCustomPlugin,
  resetPluginsToDefaults,
} from '@/lib/plugins/plugin-registry';

interface PluginsManagementTabProps {
  onPluginToggled?: (pluginId: string, isEnabled: boolean) => void;
  onOpenSkinsModal?: () => void;
  onOpenWebhookModal?: () => void;
  isAdmin?: boolean;
}

const CATEGORY_TABS: { id: PluginCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'views', label: 'Project Views' },
  { id: 'cosmetics', label: 'Cosmetics' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'productivity', label: 'Productivity' },
  { id: 'developer', label: 'Developer' },
];

export function PluginsManagementTab({
  onPluginToggled,
  onOpenSkinsModal,
  onOpenWebhookModal,
  isAdmin = true,
}: PluginsManagementTabProps) {
  const [plugins, setPlugins] = useState<PluginManifest[]>(() => getAllPlugins());
  const [states, setStates] = useState<Record<string, PluginState>>(() => getPluginStates());
  const [activeCategory, setActiveCategory] = useState<PluginCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSettingsId, setExpandedSettingsId] = useState<string | null>(null);
  const [inspectedPlugin, setInspectedPlugin] = useState<PluginManifest | null>(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  // Custom Manifest Form State
  const [manifestJson, setManifestJson] = useState(
    JSON.stringify(
      {
        id: 'sample-standup-bot',
        name: 'Daily Standup Assistant',
        version: '1.0.0',
        author: 'Community Dev',
        description:
          'Automates daily asynchronous team standup prompts and collects blocker notes into a thread.',
        category: 'productivity',
        iconName: 'CheckSquare',
        requiredPermissions: ['threads:read', 'messages:send', 'storage:sandboxed'],
        settingsSchema: [
          {
            key: 'standupHour',
            label: 'Standup Trigger Hour (24h)',
            type: 'number',
            defaultValue: 9,
          },
        ],
      },
      null,
      2
    )
  );
  const [installError, setInstallError] = useState<string | null>(null);

  const refreshData = () => {
    setPlugins(getAllPlugins());
    setStates(getPluginStates());
  };

  const handleToggle = (pluginId: string) => {
    const currentState = states[pluginId]?.isEnabled ?? false;
    const next = !currentState;
    togglePlugin(pluginId, next);
    refreshData();
    onPluginToggled?.(pluginId, next);
  };

  const handleSettingChange = (pluginId: string, key: string, value: any) => {
    updatePluginSettings(pluginId, { [key]: value });
    refreshData();
  };

  const handleUninstall = (pluginId: string) => {
    if (confirm('Uninstall this custom plugin? Its sandboxed data will be cleared.')) {
      uninstallCustomPlugin(pluginId);
      refreshData();
    }
  };

  const handleResetDefaults = () => {
    if (confirm('Reset all extensions to default ThreadFlow settings?')) {
      resetPluginsToDefaults();
      refreshData();
    }
  };

  const handleInstallSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInstallError(null);
    try {
      const parsed = JSON.parse(manifestJson);
      const res = installCustomPlugin(parsed);
      if (!res.success) {
        setInstallError(res.error || 'Failed to install plugin manifest');
        return;
      }
      setIsInstallModalOpen(false);
      refreshData();
    } catch (err: any) {
      setInstallError(`Invalid JSON syntax: ${err?.message}`);
    }
  };

  // Filter plugins
  const filteredPlugins = plugins.filter((p) => {
    if (activeCategory !== 'all' && p.category !== activeCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesName = p.name.toLowerCase().includes(q);
      const matchesDesc = p.description.toLowerCase().includes(q);
      const matchesAuthor = p.author.toLowerCase().includes(q);
      if (!matchesName && !matchesDesc && !matchesAuthor) return false;
    }
    return true;
  });

  const activeCount = Object.values(states).filter((s) => s.isEnabled).length;

  const renderIcon = (name: string) => {
    switch (name) {
      case 'Table':
        return <Table size={18} />;
      case 'Palette':
        return <Palette size={18} />;
      case 'Webhook':
        return <Webhook size={18} />;
      case 'CheckSquare':
        return <CheckSquare size={18} />;
      default:
        return <Puzzle size={18} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner / Overview */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50/90 via-purple-50/70 to-blue-50/90 dark:from-indigo-950/40 dark:via-purple-950/30 dark:to-blue-950/40 border border-indigo-100 dark:border-indigo-900/60 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Boxes size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                ThreadFlow Plugins & Extensions Engine
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white shadow-2xs">
                Hot-Pluggable Sandbox
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed max-w-lg">
              First-party features and third-party tools run inside a strictly permission-governed
              execution sandbox. Deactivating an extension leaves all your messages and thread state
              gracefully intact.
            </p>
            <div className="flex items-center gap-4 mt-2.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                <Check size={13} /> {activeCount} Active Extensions
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck size={13} /> Granular Permission Scopes
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsInstallModalOpen(true)}
          className="px-3 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5 shrink-0"
        >
          <Plus size={14} />
          <span>Install Manifest</span>
        </button>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {CATEGORY_TABS.map((tab) => {
            const isSelected = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer',
                  isSelected
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-56">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search extensions..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Plugins List */}
      <div className="space-y-3.5">
        {filteredPlugins.map((plugin) => {
          const isEnabled = states[plugin.id]?.isEnabled ?? false;
          const isExpanded = expandedSettingsId === plugin.id;
          const hasSettings = (plugin.settingsSchema || []).length > 0;
          const pluginSettings = states[plugin.id]?.settings || {};

          return (
            <div
              key={plugin.id}
              className={cn(
                'p-4 rounded-2xl border transition-all shadow-2xs flex flex-col gap-3',
                isEnabled
                  ? 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-750'
                  : 'bg-slate-50/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-80'
              )}
            >
              {/* Top Row: Icon, Title, Author, Toggle */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs',
                      isEnabled
                        ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                    )}
                  >
                    {renderIcon(plugin.iconName)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {plugin.name}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-400">v{plugin.version}</span>
                      {plugin.isFirstParty ? (
                        <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          First-Party
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          Community
                        </span>
                      )}
                      <span className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                        {plugin.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {plugin.description}
                    </p>
                  </div>
                </div>

                {/* Hot-Plug Toggle Switch */}
                <div className="flex items-center gap-2 shrink-0">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={() => handleToggle(plugin.id)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600" />
                  </label>
                </div>
              </div>

              {/* Middle Row: Permissions badges & Controls */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                {/* Requested Permissions Badges */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-slate-400 font-medium">Scopes:</span>
                  {plugin.requiredPermissions.map((perm) => {
                    const def = PERMISSION_DEFINITIONS[perm];
                    const isHigh = def?.securityLevel === 'high';
                    return (
                      <button
                        key={perm}
                        type="button"
                        onClick={() => setInspectedPlugin(plugin)}
                        className={cn(
                          'text-[10px] font-mono px-2 py-0.5 rounded-md border flex items-center gap-1 cursor-pointer transition-colors',
                          isHigh
                            ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                        )}
                        title={def?.description}
                      >
                        <Shield size={10} />
                        <span>{perm}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Actions & Settings expander */}
                <div className="flex items-center gap-1.5">
                  {plugin.id === 'thread-custom-skins' && onOpenSkinsModal && isEnabled && (
                    <button
                      type="button"
                      onClick={onOpenSkinsModal}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Palette size={12} />
                      <span>Skins Studio</span>
                    </button>
                  )}

                  {plugin.id === 'webhook-dispatcher' && onOpenWebhookModal && isEnabled && (
                    <button
                      type="button"
                      onClick={onOpenWebhookModal}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900 border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Webhook size={12} />
                      <span>Dispatch Webhook</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setInspectedPlugin(plugin)}
                    className="px-2 py-1 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Audit sandbox and security permissions"
                  >
                    Inspect
                  </button>

                  {hasSettings && (
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedSettingsId(isExpanded ? null : plugin.id)
                      }
                      className="px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Sliders size={12} />
                      <span>Config</span>
                      {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                  )}

                  {!plugin.isFirstParty && (
                    <button
                      type="button"
                      onClick={() => handleUninstall(plugin.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Uninstall custom plugin"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Expandable Settings Panel */}
              {isExpanded && hasSettings && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 space-y-2.5 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {plugin.name} Settings
                  </div>
                  {plugin.settingsSchema?.map((field) => {
                    const currentVal =
                      pluginSettings[field.key] !== undefined
                        ? pluginSettings[field.key]
                        : field.defaultValue;

                    return (
                      <div
                        key={field.key}
                        className="flex items-center justify-between gap-4 py-1 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {field.label}
                          </div>
                          {field.description && (
                            <div className="text-[11px] text-slate-400">
                              {field.description}
                            </div>
                          )}
                        </div>

                        {field.type === 'boolean' && (
                          <input
                            type="checkbox"
                            checked={Boolean(currentVal)}
                            onChange={(e) =>
                              handleSettingChange(plugin.id, field.key, e.target.checked)
                            }
                            className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                          />
                        )}

                        {field.type === 'select' && (
                          <select
                            value={currentVal}
                            onChange={(e) =>
                              handleSettingChange(plugin.id, field.key, e.target.value)
                            }
                            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 outline-none"
                          >
                            {field.options?.map((opt) => (
                              <option key={opt.value} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                        )}

                        {field.type === 'string' && (
                          <input
                            type="text"
                            value={currentVal || ''}
                            onChange={(e) =>
                              handleSettingChange(plugin.id, field.key, e.target.value)
                            }
                            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 outline-none w-40"
                          />
                        )}

                        {field.type === 'number' && (
                          <input
                            type="number"
                            value={currentVal ?? 0}
                            onChange={(e) =>
                              handleSettingChange(
                                plugin.id,
                                field.key,
                                parseInt(e.target.value, 10)
                              )
                            }
                            className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 outline-none w-20"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {filteredPlugins.length === 0 && (
          <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-xs text-slate-400">
            No extensions found matching &ldquo;{searchQuery}&rdquo;.
          </div>
        )}
      </div>

      {/* Footer Controls */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <button
          type="button"
          onClick={handleResetDefaults}
          className="hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RotateCcw size={12} />
          <span>Restore Default Extensions</span>
        </button>
        <span className="text-[11px]">ThreadFlow Plugin Sandbox Runtime v1.0.0</span>
      </div>

      {/* Permission Inspector Modal */}
      {inspectedPlugin && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {inspectedPlugin.name}
                  </h4>
                  <p className="text-xs text-slate-400">Security & Sandboxed Scopes</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectedPlugin(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto">
              {inspectedPlugin.requiredPermissions.map((perm) => {
                const def = PERMISSION_DEFINITIONS[perm];
                return (
                  <div
                    key={perm}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                      <span>{def?.label || perm}</span>
                      <span
                        className={cn(
                          'text-[10px] uppercase tracking-wider px-2 py-0.2 rounded',
                          def?.securityLevel === 'high'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-300'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                        )}
                      >
                        {def?.securityLevel || 'Scope'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      {def?.description}
                    </p>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setInspectedPlugin(null)}
              className="w-full py-2 text-xs font-semibold rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 cursor-pointer shadow-2xs"
            >
              Close Audit
            </button>
          </div>
        </div>
      )}

      {/* Install Custom Manifest Modal */}
      {isInstallModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Install Third-Party Extension Manifest
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Paste an external or custom plugin JSON manifest into the runtime sandbox.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsInstallModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleInstallSubmit} className="space-y-3">
              <textarea
                value={manifestJson}
                onChange={(e) => setManifestJson(e.target.value)}
                rows={10}
                className="w-full p-3 font-mono text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500"
              />

              {installError && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300">
                  {installError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsInstallModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer shadow-2xs"
                >
                  Install & SandBox
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
