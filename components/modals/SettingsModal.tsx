'use client';

import React, { useState } from 'react';
import {
  Settings,
  X,
  Sliders,
  Users,
  Info,
  ExternalLink,
  Sparkles,
  Check,
  Bell,
  Volume2,
  Shield,
  Moon,
  Sun,
  Palette,
  Eye,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Puzzle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { User } from '@/types/chat';
import {
  PRESET_TINTS,
  DynamicThemeScheme,
  generateThemeScheme,
  getContrastRatio,
  hexToRgb,
} from '@/lib/theme-utils';
import { PluginsManagementTab } from '@/components/plugins/PluginsManagementTab';

export type SettingsTabType = 'general' | 'theme' | 'plugins' | 'personas' | 'about';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: SettingsTabType;
  setActiveTab: (tab: SettingsTabType) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  enterToSend: boolean;
  setEnterToSend: (val: boolean) => void;
  currentUserId: string;
  onSwitchUser: (userId: string) => void;
  users: User[];
  onOpenReadme: () => void;
  themeScheme: DynamicThemeScheme;
  onSelectTint: (hex: string, name?: string) => void;
  onResetTint: () => void;
  onPluginToggled?: (pluginId: string, isEnabled: boolean) => void;
  onOpenSkinsModal?: () => void;
  onOpenWebhookModal?: () => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  darkMode,
  setDarkMode,
  soundEnabled,
  setSoundEnabled,
  enterToSend,
  setEnterToSend,
  currentUserId,
  onSwitchUser,
  users,
  onOpenReadme,
  themeScheme,
  onSelectTint,
  onResetTint,
  onPluginToggled,
  onOpenSkinsModal,
  onOpenWebhookModal,
}: SettingsModalProps) {
  const [customHexInput, setCustomHexInput] = useState(themeScheme.tintHex);
  const [hexInputError, setHexInputError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCustomHexSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let formatted = customHexInput.trim();
    if (!formatted.startsWith('#')) formatted = `#${formatted}`;

    const rgb = hexToRgb(formatted);
    if (!rgb) {
      setHexInputError('Please enter a valid 3 or 6 digit hex code (e.g. #4f46e5)');
      return;
    }
    setHexInputError(null);
    onSelectTint(formatted, 'Custom Accent');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className={cn(
          'bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[88vh]',
          activeTab === 'plugins' ? 'max-w-3xl' : 'max-w-xl'
        )}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-start gap-3 bg-gradient-to-r from-slate-50/80 via-white to-slate-50/80 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs text-white"
            style={{ backgroundColor: 'var(--theme-primary-light)' }}
          >
            <Settings size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Workspace Settings</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                Preferences
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Customize workspace tint, extensions, accessibility themes, team personas, and keyboard preferences.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1 overflow-x-auto">
          {[
            { id: 'general' as SettingsTabType, label: 'General', icon: Sliders },
            { id: 'theme' as SettingsTabType, label: 'Appearance & Tint', icon: Palette },
            { id: 'plugins' as SettingsTabType, label: 'Extensions & Plugins', icon: Puzzle },
            { id: 'personas' as SettingsTabType, label: 'Team Personas', icon: Users },
            { id: 'about' as SettingsTabType, label: 'About & Vision', icon: Info },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0',
                  active
                    ? 'text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                )}
                style={active ? { backgroundColor: 'var(--theme-primary-light)' } : undefined}
              >
                <Icon size={13} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-700 dark:text-slate-300 text-xs flex-1">
          {/* TAB 1: GENERAL */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              {/* Dark Mode Toggle */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-100 text-xs flex items-center gap-1.5">
                    {darkMode ? (
                      <Moon size={14} style={{ color: 'var(--theme-primary-dark)' }} />
                    ) : (
                      <Sun size={14} className="text-amber-500" />
                    )}
                    Dark Mode
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Switch between sleek dark interface and crisp light theme
                  </div>
                </div>
                <button
                  type="button"
                  id="settings-dark-mode-toggle"
                  onClick={() => setDarkMode(!darkMode)}
                  className={cn(
                    'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors focus:outline-none',
                    darkMode ? 'bg-slate-800' : 'bg-slate-200 dark:bg-slate-700'
                  )}
                  style={darkMode ? { backgroundColor: 'var(--theme-primary-light)' } : undefined}
                  title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  <span
                    className={cn(
                      'inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform mt-0.5 ml-0.5 shadow-xs',
                      darkMode ? 'translate-x-4' : 'translate-x-0'
                    )}
                  />
                </button>
              </div>

              {/* Audio Notifications */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-100 text-xs flex items-center gap-1.5">
                    <Volume2 size={14} style={{ color: 'var(--theme-primary-light)' }} />
                    Audio Notifications
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Play a gentle chime when receiving new messages or mentions
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={cn(
                    'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors focus:outline-none',
                    soundEnabled ? 'bg-slate-800' : 'bg-slate-200 dark:bg-slate-700'
                  )}
                  style={soundEnabled ? { backgroundColor: 'var(--theme-primary-light)' } : undefined}
                >
                  <span
                    className={cn(
                      'inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform mt-0.5 ml-0.5 shadow-xs',
                      soundEnabled ? 'translate-x-4' : 'translate-x-0'
                    )}
                  />
                </button>
              </div>

              {/* Enter to Send */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-100 text-xs flex items-center gap-1.5">
                    <Bell size={14} style={{ color: 'var(--theme-primary-light)' }} />
                    Enter to Send
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Press Enter to send message, Shift+Enter for new line
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEnterToSend(!enterToSend)}
                  className={cn(
                    'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors focus:outline-none',
                    enterToSend ? 'bg-slate-800' : 'bg-slate-200 dark:bg-slate-700'
                  )}
                  style={enterToSend ? { backgroundColor: 'var(--theme-primary-light)' } : undefined}
                >
                  <span
                    className={cn(
                      'inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform mt-0.5 ml-0.5 shadow-xs',
                      enterToSend ? 'translate-x-4' : 'translate-x-0'
                    )}
                  />
                </button>
              </div>

              {/* Strict 1-Pin SSOT Rule */}
              <div className="p-4 rounded-xl border flex items-center justify-between"
                   style={{
                     backgroundColor: 'var(--theme-surface-subtle-light)',
                     borderColor: 'var(--theme-border-tint-light)',
                   }}
              >
                <div>
                  <div className="font-semibold text-xs flex items-center gap-1.5"
                       style={{ color: 'var(--theme-primary-light)' }}
                  >
                    <Shield size={14} />
                    Strict 1-Pin SSOT Rule
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                    Enforce exactly 1 pinned message per thread to maintain a true North Star
                  </div>
                </div>
                <span
                  className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: 'var(--theme-primary-light)' }}
                >
                  Active
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: APPEARANCE & USER THEMING */}
          {activeTab === 'theme' && (
            <div className="space-y-5">
              {/* Header explanation */}
              <div>
                <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Palette size={14} style={{ color: 'var(--theme-primary-light)' }} />
                  Dynamic Accent & Workspace Tint
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Pick a preferred accent tint. ThreadFlow dynamically generates a tokenized, accessibility-compliant color scheme calibrated for both light and dark backgrounds per WCAG standards.
                </p>
              </div>

              {/* Active Color Scheme & Contrast Verification Card */}
              <div
                className="p-4 rounded-xl border shadow-2xs space-y-3"
                style={{
                  backgroundColor: darkMode ? 'var(--theme-surface-subtle-dark)' : 'var(--theme-surface-subtle-light)',
                  borderColor: darkMode ? 'var(--theme-border-tint-dark)' : 'var(--theme-border-tint-light)',
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-6 h-6 rounded-full border border-white/40 shadow-xs flex items-center justify-center text-white"
                      style={{ backgroundColor: themeScheme.tintHex }}
                    >
                      <Check size={12} />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100 text-xs">
                        {themeScheme.tintName}
                      </div>
                      <div className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                        {themeScheme.tintHex.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  {themeScheme.isCustom && (
                    <button
                      type="button"
                      onClick={onResetTint}
                      className="text-[11px] font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                      title="Reset to default brand indigo"
                    >
                      <RotateCcw size={11} />
                      <span>Reset Default</span>
                    </button>
                  )}
                </div>

                {/* WCAG Accessibility Metrics Breakdown */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                  <div className="p-2.5 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Light Mode Text</div>
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <span>{themeScheme.contrastOnLight}:1</span>
                        {themeScheme.contrastOnLight >= 4.5 ? (
                          <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">AA Pass</span>
                        ) : (
                          <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400">Calibrated</span>
                        )}
                      </div>
                    </div>
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs"
                      style={{ backgroundColor: themeScheme.primaryLightHex, color: '#ffffff' }}
                    >
                      Aa
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">Dark Mode Text</div>
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <span>{themeScheme.contrastOnDark}:1</span>
                        {themeScheme.contrastOnDark >= 4.5 ? (
                          <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">AA Pass</span>
                        ) : (
                          <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">Calibrated</span>
                        )}
                      </div>
                    </div>
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs"
                      style={{ backgroundColor: '#0f172a', color: themeScheme.primaryDarkHex }}
                    >
                      Aa
                    </div>
                  </div>
                </div>

                {/* Micro-preview: Interactive Controls Preview */}
                <div className="pt-2 flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 font-medium">Preview button:</span>
                  <button
                    type="button"
                    className="px-3 py-1 rounded-lg text-xs font-medium text-white shadow-2xs"
                    style={{ backgroundColor: 'var(--theme-primary-light)' }}
                  >
                    Send Action
                  </button>
                  <span
                    className="px-2 py-0.5 rounded-md text-[10px] font-medium border"
                    style={{
                      backgroundColor: 'var(--theme-surface-subtle-light)',
                      borderColor: 'var(--theme-border-tint-light)',
                      color: 'var(--theme-primary-light)',
                    }}
                  >
                    Active Tag
                  </span>
                </div>
              </div>

              {/* Preset Tint Palettes */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Curated Accessibility Presets
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {PRESET_TINTS.map((preset) => {
                    const isSelected = themeScheme.tintHex.toLowerCase() === preset.hex.toLowerCase();
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => onSelectTint(preset.hex, preset.name)}
                        className={cn(
                          'p-2.5 rounded-xl border flex flex-col items-center text-center gap-1.5 transition-all cursor-pointer group',
                          isSelected
                            ? 'bg-slate-100 dark:bg-slate-800 ring-2'
                            : 'bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700'
                        )}
                        style={
                          isSelected
                            ? {
                                borderColor: preset.hex,
                                boxShadow: `0 0 0 2px ${preset.hex}40`,
                              }
                            : undefined
                        }
                      >
                        <div
                          className="w-7 h-7 rounded-full shadow-xs flex items-center justify-center text-white transition-transform group-hover:scale-105"
                          style={{ backgroundColor: preset.hex }}
                        >
                          {isSelected && <Check size={14} />}
                        </div>
                        <span className="text-[11px] font-medium text-slate-800 dark:text-slate-200 leading-tight">
                          {preset.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Hex Input Form */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Custom Brand or Preferred Hex Color
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                  Enter any hex color. ThreadFlow will automatically calculate the lightness delta and adjust the token palette to guarantee WCAG AA readability.
                </p>
                <form onSubmit={handleCustomHexSubmit} className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={customHexInput}
                      onChange={(e) => {
                        setCustomHexInput(e.target.value);
                        setHexInputError(null);
                      }}
                      placeholder="#4f46e5"
                      className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:bg-white dark:focus:bg-slate-850 focus:border-indigo-500 text-slate-800 dark:text-slate-100 uppercase"
                    />
                    <div
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded border border-slate-300 dark:border-slate-600 shadow-2xs"
                      style={{ backgroundColor: customHexInput }}
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-medium text-white rounded-xl shadow-xs cursor-pointer shrink-0 transition-opacity hover:opacity-90"
                    style={{ backgroundColor: 'var(--theme-primary-light)' }}
                  >
                    Apply Tint
                  </button>
                </form>
                {hexInputError && (
                  <p className="text-[11px] text-rose-500 dark:text-rose-400 mt-1 font-medium">
                    {hexInputError}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB: EXTENSIONS & PLUGINS */}
          {activeTab === 'plugins' && (
            <PluginsManagementTab
              onPluginToggled={onPluginToggled}
              onOpenSkinsModal={onOpenSkinsModal}
              onOpenWebhookModal={onOpenWebhookModal}
            />
          )}

          {/* TAB 3: TEAM PERSONAS */}
          {activeTab === 'personas' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                    Switch Active Persona
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Test the workspace as different team members with different roles and permissions.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {users.map((user) => {
                  const isCurrent = user.id === currentUserId;
                  return (
                    <div
                      key={user.id}
                      onClick={() => onSwitchUser(user.id)}
                      className={cn(
                        'p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all',
                        isCurrent
                          ? 'bg-slate-100 dark:bg-slate-800 border-indigo-300 dark:border-indigo-700 ring-1 ring-indigo-500/20'
                          : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700/80 hover:border-slate-300'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs shrink-0',
                            user.avatarBg || 'bg-indigo-600'
                          )}
                        >
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1.5">
                            {user.name}
                            {isCurrent && (
                              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                                (Active)
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">
                            {user.role}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isCurrent ? (
                          <span
                            className="px-2.5 py-1 rounded-full text-[10px] font-bold text-white shadow-2xs flex items-center gap-1"
                            style={{ backgroundColor: 'var(--theme-primary-light)' }}
                          >
                            <Check size={11} /> Current
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg text-[10px] font-medium border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 bg-slate-50 dark:bg-slate-800">
                            Switch
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: ABOUT & VISION */}
          {activeTab === 'about' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-2">
                <div className="font-semibold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1.5">
                  <Sparkles size={14} style={{ color: 'var(--theme-primary-light)' }} />
                  ThreadFlow Architecture
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                  ThreadFlow is designed to bridge the gap between chaotic real-time team messaging and structured project management. Every thread has explicit tag taxonomy, file-level multimedia annotation, strict single-pin single source of truth, and dynamic user theming.
                </p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={onOpenReadme}
                  className="px-3.5 py-2 text-xs font-semibold text-white rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: 'var(--theme-primary-light)' }}
                >
                  <ExternalLink size={13} />
                  <span>Explore Product Documentation</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50/80 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-400">
            Current Tint:{' '}
            <span className="font-semibold text-slate-600 dark:text-slate-300">
              {themeScheme.tintName}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white rounded-xl shadow-xs cursor-pointer hover:opacity-90 transition-opacity"
            style={{ backgroundColor: 'var(--theme-primary-light)' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
