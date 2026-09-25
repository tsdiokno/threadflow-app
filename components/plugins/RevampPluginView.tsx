// components/plugins/RevampPluginView.tsx
// First-party extension view: Revamp Custom Skins & Cosmetics
// Full-canvas workspace extension view replacing Thread Chat & Metadata Sidebar

'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Palette,
  Sparkles,
  Check,
  RotateCcw,
  Sliders,
  Layers,
  ArrowLeft,
  PanelLeftOpen,
  Eye,
  CheckCircle2,
  Brush,
  Zap,
  Info,
  Hash,
  ShieldCheck,
  Settings2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Thread, User } from '@/types/chat';
import { ThreadSkinConfig } from '@/types/plugins';
import {
  getThreadSkin,
  updateThreadSkin,
  getAllThreadSkins,
  getPluginStates,
  updatePluginSettings,
} from '@/lib/plugins/plugin-registry';

interface RevampPluginViewProps {
  threads: Thread[];
  activeThreadId: string;
  currentUserId: string;
  onSelectThread: (threadId: string) => void;
  onBackToChat: () => void;
  onSkinApplied?: () => void;
  isLeftSidebarOpen?: boolean;
  onToggleLeftSidebar?: () => void;
}

export const SKIN_PRESETS = [
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    accent: '#6366f1',
    wallpaper: 'grid' as const,
    description: 'Electric indigo with high-tech blueprint grid and glowing tags',
  },
  {
    id: 'emerald',
    name: 'Emerald Forest',
    accent: '#059669',
    wallpaper: 'dots' as const,
    description: 'Calm organic sage with soothing dot matrix backdrop',
  },
  {
    id: 'solar',
    name: 'Solar Flare',
    accent: '#d97706',
    wallpaper: 'gradient' as const,
    description: 'Warm energetic amber with subtle sunrise gradient',
  },
  {
    id: 'rose',
    name: 'Sunset Rose',
    accent: '#e11d48',
    wallpaper: 'dots' as const,
    description: 'Punchy vibrant rose tone with animated tag glow',
  },
  {
    id: 'velvet',
    name: 'Midnight Velvet',
    accent: '#7c3aed',
    wallpaper: 'grid' as const,
    description: 'Regal deep violet with illuminated profile rims',
  },
  {
    id: 'monochrome',
    name: 'Minimal Slate',
    accent: '#475569',
    wallpaper: 'none' as const,
    description: 'Subdued minimalist monochrome with crisp editorial lines',
  },
  {
    id: 'oceanic',
    name: 'Oceanic Abyssal',
    accent: '#0284c7',
    wallpaper: 'grid' as const,
    description: 'Deep maritime azure with luminous aquamarine contrast',
  },
  {
    id: 'amethyst',
    name: 'Amethyst Shimmer',
    accent: '#9333ea',
    wallpaper: 'gradient' as const,
    description: 'Ethereal purple aura with radiant badge highlights',
  },
];

export function RevampPluginView({
  threads,
  activeThreadId,
  currentUserId,
  onSelectThread,
  onBackToChat,
  onSkinApplied,
  isLeftSidebarOpen,
  onToggleLeftSidebar,
}: RevampPluginViewProps) {
  // Target thread selection (defaults to activeThreadId or first accessible thread)
  const accessibleThreads = useMemo(() => {
    return threads.filter((t) => !t.isPrivate || t.memberIds.includes(currentUserId));
  }, [threads, currentUserId]);

  const [selectedThreadId, setSelectedThreadId] = useState<string>(() => {
    const exists = accessibleThreads.some((t) => t.id === activeThreadId);
    return exists ? activeThreadId : accessibleThreads[0]?.id || 't1';
  });

  const currentThread = accessibleThreads.find((t) => t.id === selectedThreadId);

  // Active skin config for selected thread
  const [skin, setSkin] = useState<ThreadSkinConfig>(() => getThreadSkin(selectedThreadId));
  const [savedNotice, setSavedNotice] = useState(false);

  // Global Revamp Plugin Settings state
  const [globalSettings, setGlobalSettings] = useState(() => {
    const states = getPluginStates();
    return (
      states['thread-custom-skins']?.settings || {
        enableAnimations: true,
        enableAvatarFrames: true,
        enableChatWallpaper: true,
      }
    );
  });

  // Active view tab inside Revamp view
  const [activeTab, setActiveTab] = useState<'customize' | 'all-rooms' | 'settings'>('customize');

  const handleSwitchSelectedThread = (threadId: string) => {
    setSelectedThreadId(threadId);
    setSkin(getThreadSkin(threadId));
  };

  const handleApplySkin = () => {
    updateThreadSkin(selectedThreadId, skin);
    onSkinApplied?.();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleApplyToAll = () => {
    accessibleThreads.forEach((t) => {
      updateThreadSkin(t.id, skin);
    });
    onSkinApplied?.();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleReset = () => {
    const resetConfig: ThreadSkinConfig = {
      skinPresetId: 'default',
      accentHex: undefined,
      animatedBadges: false,
      chatWallpaper: 'none',
      avatarFrameGlow: false,
    };
    updateThreadSkin(selectedThreadId, resetConfig);
    setSkin(resetConfig);
    onSkinApplied?.();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleToggleGlobalSetting = (key: string, value: boolean) => {
    const updated = { ...globalSettings, [key]: value };
    setGlobalSettings(updated);
    updatePluginSettings('thread-custom-skins', updated);
    onSkinApplied?.();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden select-none transition-colors">
      {/* 1. View Header Bar */}
      <div className="px-5 py-3.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          {onToggleLeftSidebar && !isLeftSidebarOpen && (
            <button
              type="button"
              id="revamp-views-toggle-left-sidebar"
              onClick={onToggleLeftSidebar}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-200 dark:border-indigo-800 shadow-2xs"
              title="Expand conversations panel"
              aria-label="Expand conversations panel"
            >
              <PanelLeftOpen size={16} />
            </button>
          )}

          {/* Plugin Title & Badges */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-2xs transition-colors"
              style={{ backgroundColor: skin.accentHex || '#6366f1' }}
            >
              <Palette size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
                  Revamp: Custom Skins & Cosmetics
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Extension View
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                  <ShieldCheck size={12} className="text-emerald-500" />
                  Sandboxed
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Customizing thread theme, wallpaper patterns, badge luminescence, and avatar halo frames
              </p>
            </div>
          </div>
        </div>

        {/* View Navigation Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {savedNotice && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 animate-in fade-in duration-150">
              <CheckCircle2 size={13} />
              <span className="font-semibold">Changes Applied!</span>
            </div>
          )}

          <button
            type="button"
            id="revamp-back-to-chat-btn"
            onClick={onBackToChat}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
          >
            <ArrowLeft size={13} />
            <span>Back to Chat</span>
          </button>
        </div>
      </div>

      {/* 2. Sub-tabs / Sections Bar */}
      <div className="px-5 py-2 bg-slate-100/70 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab('customize')}
            className={cn(
              'px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer',
              activeTab === 'customize'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            )}
          >
            <Brush size={13} />
            <span>Customize Thread Skin</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('all-rooms')}
            className={cn(
              'px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer',
              activeTab === 'all-rooms'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            )}
          >
            <Hash size={13} />
            <span>Rooms Roster ({accessibleThreads.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={cn(
              'px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer',
              activeTab === 'settings'
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            )}
          >
            <Settings2 size={13} />
            <span>Plugin API Settings</span>
          </button>
        </div>

        {/* Selected Thread Indicator & Selector */}
        {activeTab === 'customize' && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Active Room:
            </span>
            <select
              value={selectedThreadId}
              onChange={(e) => handleSwitchSelectedThread(e.target.value)}
              className="text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500 cursor-pointer shadow-2xs"
            >
              {accessibleThreads.map((t) => (
                <option key={t.id} value={t.id}>
                  #{t.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* 3. Main Body Canvas */}
      <div className="flex-1 overflow-y-auto p-5 md:p-6 lg:p-8">
        {activeTab === 'customize' && (
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Controls Column (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Presets Grid */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs">
                <div className="flex items-center justify-between mb-3.5">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Preset Themes
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Instantly style #{currentThread?.name || 'room'} with curated aesthetic combinations
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400">
                    {SKIN_PRESETS.length} presets
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SKIN_PRESETS.map((p) => {
                    const isSelected = skin.skinPresetId === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() =>
                          setSkin((prev) => ({
                            ...prev,
                            skinPresetId: p.id as any,
                            accentHex: p.accent,
                            chatWallpaper: p.wallpaper,
                            animatedBadges: true,
                            avatarFrameGlow: true,
                          }))
                        }
                        className={cn(
                          'p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-2 shadow-2xs group',
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-850'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span
                              className="w-3 h-3 rounded-full shrink-0 shadow-2xs"
                              style={{ backgroundColor: p.accent }}
                            />
                            {p.name}
                          </span>
                          {isSelected ? (
                            <Check size={14} className="text-indigo-600 dark:text-indigo-400" />
                          ) : (
                            <span className="text-[10px] text-slate-400 uppercase font-medium">
                              {p.wallpaper}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          {p.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Accent & Wallpaper Controls */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-5">
                {/* Accent Color */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 block mb-2">
                    Custom Accent Tint
                  </label>
                  <div className="flex items-center gap-3 flex-wrap">
                    {[
                      '#6366f1',
                      '#059669',
                      '#d97706',
                      '#e11d48',
                      '#7c3aed',
                      '#0284c7',
                      '#475569',
                      '#ec4899',
                    ].map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSkin((prev) => ({ ...prev, accentHex: color }))}
                        className={cn(
                          'w-7 h-7 rounded-xl transition-transform cursor-pointer shadow-2xs flex items-center justify-center',
                          skin.accentHex === color ? 'scale-110 ring-2 ring-indigo-500 ring-offset-2' : 'hover:scale-105'
                        )}
                        style={{ backgroundColor: color }}
                      >
                        {skin.accentHex === color && <Check size={13} className="text-white" />}
                      </button>
                    ))}
                    <div className="flex items-center gap-1.5 ml-2 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 bg-slate-50 dark:bg-slate-800">
                      <span className="text-xs text-slate-400">#</span>
                      <input
                        type="text"
                        value={(skin.accentHex || '#6366f1').replace('#', '')}
                        onChange={(e) =>
                          setSkin((prev) => ({ ...prev, accentHex: `#${e.target.value.slice(0, 6)}` }))
                        }
                        placeholder="6366f1"
                        maxLength={6}
                        className="w-16 bg-transparent text-xs font-mono text-slate-800 dark:text-slate-200 outline-none uppercase"
                      />
                    </div>
                  </div>
                </div>

                {/* Wallpaper Pattern */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 block mb-2">
                    Chat Canvas Wallpaper Pattern
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { id: 'none', label: 'Plain Surface', desc: 'Clean standard' },
                      { id: 'grid', label: 'Blueprint Grid', desc: 'Tech matrix' },
                      { id: 'dots', label: 'Dot Array', desc: 'Subtle dots' },
                      { id: 'gradient', label: 'Sunrise Halo', desc: 'Gentle aura' },
                    ].map((w) => (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => setSkin((prev) => ({ ...prev, chatWallpaper: w.id as any }))}
                        className={cn(
                          'p-3 rounded-xl border text-left transition-all cursor-pointer shadow-2xs',
                          skin.chatWallpaper === w.id
                            ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500/20'
                            : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850'
                        )}
                      >
                        <div className="text-xs font-bold">{w.label}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{w.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cosmetic Feature Toggles */}
                <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <Sparkles size={18} className="text-amber-500 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Glowing Tag Badges
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          Pulse subtle luminescence along tag pills in conversation
                        </div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={skin.animatedBadges ?? true}
                      onChange={(e) => setSkin((prev) => ({ ...prev, animatedBadges: e.target.checked }))}
                      className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <Layers size={18} className="text-indigo-500 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          Avatar Profile Halo Frames
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          Encircle user profile avatars with tinted ambient neon rings
                        </div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={skin.avatarFrameGlow ?? true}
                      onChange={(e) => setSkin((prev) => ({ ...prev, avatarFrameGlow: e.target.checked }))}
                      className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex items-center justify-between gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw size={13} />
                    <span>Reset This Room</span>
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleApplyToAll}
                      className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                    >
                      Apply to All Rooms
                    </button>
                    <button
                      type="button"
                      id="revamp-apply-skin-btn"
                      onClick={handleApplySkin}
                      className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
                    >
                      <Check size={14} />
                      <span>Apply to #{currentThread?.name || 'Room'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Live Preview Column (5 cols) */}
            <div className="lg:col-span-5 sticky top-6 space-y-4">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Eye size={15} className="text-indigo-500" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      Live Chat Preview
                    </h3>
                  </div>
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: skin.accentHex || '#6366f1' }}
                  >
                    Active Accent
                  </span>
                </div>

                {/* Simulated Chat Feed with Applied Skin */}
                <div
                  className={cn(
                    'rounded-xl border border-slate-200 dark:border-slate-800 p-4 min-h-[360px] flex flex-col justify-between transition-all relative overflow-hidden',
                    skin.chatWallpaper === 'grid' &&
                      'bg-[radial-gradient(#6366f1_1px,transparent_1px)] dark:bg-[radial-gradient(#4338ca_1px,transparent_1px)] [background-size:16px_16px] bg-slate-50/80 dark:bg-slate-950/80',
                    skin.chatWallpaper === 'dots' &&
                      'bg-[radial-gradient(#94a3b8_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:12px_12px] bg-slate-50/60 dark:bg-slate-950/60',
                    skin.chatWallpaper === 'gradient' &&
                      'bg-gradient-to-b from-indigo-50/30 via-slate-50/60 to-white dark:from-indigo-950/30 dark:via-slate-950/70 dark:to-slate-900',
                    skin.chatWallpaper === 'none' && 'bg-slate-50/50 dark:bg-slate-950/50'
                  )}
                >
                  <div className="space-y-4 relative z-10">
                    {/* Simulated Room Header */}
                    <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 pb-2.5">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 dark:text-slate-200">
                        <Hash size={13} style={{ color: skin.accentHex || '#6366f1' }} />
                        <span>{currentThread?.name || 'general'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            'text-[10px] font-semibold px-2 py-0.5 rounded-full border',
                            skin.animatedBadges ? 'animate-pulse' : ''
                          )}
                          style={{
                            borderColor: skin.accentHex || '#6366f1',
                            color: skin.accentHex || '#6366f1',
                            backgroundColor: `${skin.accentHex || '#6366f1'}15`,
                          }}
                        >
                          #active-skin
                        </span>
                      </div>
                    </div>

                    {/* Simulated Message 1 */}
                    <div className="flex items-start gap-2.5">
                      <div
                        className={cn(
                          'w-7 h-7 rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-700 dark:text-slate-200 transition-all shrink-0',
                          skin.avatarFrameGlow && 'ring-2 ring-offset-1'
                        )}
                        style={{
                          boxShadow: skin.avatarFrameGlow
                            ? `0 0 8px ${skin.accentHex || '#6366f1'}`
                            : undefined,
                          borderColor: skin.accentHex || '#6366f1',
                        }}
                      >
                        JD
                      </div>
                      <div className="flex-1 bg-white/90 dark:bg-slate-850/90 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            Jordan Davis
                          </span>
                          <span className="text-[10px] text-slate-400">10:42 AM</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          Checking out the new Revamp cosmetics in #{currentThread?.name || 'this room'}!
                        </p>
                      </div>
                    </div>

                    {/* Simulated Message 2 with Tag */}
                    <div className="flex items-start gap-2.5">
                      <div
                        className={cn(
                          'w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-[10px] font-bold text-indigo-700 dark:text-indigo-300 transition-all shrink-0',
                          skin.avatarFrameGlow && 'ring-2 ring-offset-1'
                        )}
                        style={{
                          boxShadow: skin.avatarFrameGlow
                            ? `0 0 8px ${skin.accentHex || '#6366f1'}`
                            : undefined,
                          borderColor: skin.accentHex || '#6366f1',
                        }}
                      >
                        AK
                      </div>
                      <div className="flex-1 bg-white/90 dark:bg-slate-850/90 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            Alex Kim
                          </span>
                          <span className="text-[10px] text-slate-400">10:44 AM</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                          Badge luminescence and custom wallpaper pattern look stunning.
                        </p>
                        <div className="mt-2 flex items-center gap-1.5">
                          <span
                            className={cn(
                              'text-[10px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1',
                              skin.animatedBadges ? 'animate-pulse' : ''
                            )}
                            style={{
                              backgroundColor: `${skin.accentHex || '#6366f1'}20`,
                              color: skin.accentHex || '#6366f1',
                              border: `1px solid ${skin.accentHex || '#6366f1'}50`,
                            }}
                          >
                            <Sparkles size={10} />
                            <span>#feature-complete</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Simulated Composer Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800/80 relative z-10">
                    <div className="bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 flex items-center justify-between text-xs text-slate-400 shadow-2xs">
                      <span>Message #{currentThread?.name || 'room'}...</span>
                      <div
                        className="w-5 h-5 rounded-lg flex items-center justify-center text-white text-[10px] font-bold"
                        style={{ backgroundColor: skin.accentHex || '#6366f1' }}
                      >
                        ↑
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Plugin Spec Notice */}
              <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-start gap-3">
                <Info size={16} className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed">
                  <strong>First-Party Extension Model:</strong> Skins are sandboxed per room and persisted
                  via <code className="bg-white/60 dark:bg-slate-900/60 px-1 py-0.5 rounded font-mono text-[10px]">threadflow_thread_skins_v1</code>.
                  No thread metadata panel or chat composer is rendered in this view.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: All Rooms Roster */}
        {activeTab === 'all-rooms' && (
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-1">
                Workspace Rooms & Applied Skins
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                View and quickly reassign aesthetic themes across all accessible conversation threads
              </p>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden">
                {accessibleThreads.map((thread) => {
                  const tSkin = getThreadSkin(thread.id);
                  const isCurrent = thread.id === selectedThreadId;

                  return (
                    <div
                      key={thread.id}
                      className={cn(
                        'p-3.5 flex items-center justify-between gap-4 transition-colors',
                        isCurrent
                          ? 'bg-indigo-50/40 dark:bg-indigo-950/20'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-850'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs"
                          style={{ backgroundColor: tSkin.accentHex || '#6366f1' }}
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            <span>#{thread.name}</span>
                            {isCurrent && (
                              <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                                (Selected)
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Wallpaper: <span className="capitalize">{tSkin.chatWallpaper || 'none'}</span> • Badges:{' '}
                            {tSkin.animatedBadges ? 'Glowing' : 'Static'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            handleSwitchSelectedThread(thread.id);
                            setActiveTab('customize');
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          Customize
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            onSelectThread(thread.id);
                            onBackToChat();
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-colors cursor-pointer"
                        >
                          Open Chat
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Global Plugin API Settings */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs space-y-5">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-1">
                  Revamp Plugin Manifest & Global Configuration
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Configure global defaults and rendering flags defined in the Plugin API schema
                </p>
              </div>

              <div className="space-y-3.5">
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Enable Badge Micro-Animations
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Global master switch for glowing pulses and shimmer effects on active tags
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={globalSettings.enableAnimations ?? true}
                    onChange={(e) => handleToggleGlobalSetting('enableAnimations', e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Avatar Profile Halo Frames
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Global master switch for glowing halo rims around author avatars in messages
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={globalSettings.enableAvatarFrames ?? true}
                    onChange={(e) => handleToggleGlobalSetting('enableAvatarFrames', e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                  <div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Subtle Canvas Patterns
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Render delicate dot matrix or blueprint grid backdrops across the chat view
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={globalSettings.enableChatWallpaper ?? true}
                    onChange={(e) => handleToggleGlobalSetting('enableChatWallpaper', e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
