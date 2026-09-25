// components/plugins/CustomSkinsCustomizer.tsx
// First-party extension: Discord Nitro-inspired skin customizer for threads

'use client';

import React, { useState } from 'react';
import {
  Palette,
  Sparkles,
  Check,
  RotateCcw,
  X,
  Eye,
  Sliders,
  Shield,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThreadSkinConfig } from '@/types/plugins';
import { getThreadSkin, updateThreadSkin } from '@/lib/plugins/plugin-registry';

interface CustomSkinsModalProps {
  isOpen: boolean;
  onClose: () => void;
  threadId: string;
  threadName: string;
  onSkinApplied?: () => void;
}

const SKIN_PRESETS = [
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
];

export function CustomSkinsCustomizer({
  isOpen,
  onClose,
  threadId,
  threadName,
  onSkinApplied,
}: CustomSkinsModalProps) {
  const initial = getThreadSkin(threadId);
  const [skin, setSkin] = useState<ThreadSkinConfig>(initial);

  if (!isOpen) return null;

  const handleSave = () => {
    updateThreadSkin(threadId, skin);
    onSkinApplied?.();
    onClose();
  };

  const handleReset = () => {
    const resetConfig: ThreadSkinConfig = {
      skinPresetId: 'default',
      accentHex: undefined,
      animatedBadges: false,
      chatWallpaper: 'none',
      avatarFrameGlow: false,
    };
    updateThreadSkin(threadId, resetConfig);
    setSkin(resetConfig);
    onSkinApplied?.();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 select-none">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3 bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-2xs"
              style={{ backgroundColor: skin.accentHex || 'var(--theme-primary-light, #6366f1)' }}
            >
              <Palette size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Thread Skin & Cosmetics
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Revamp Plugin
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Customizing aesthetic skin for <strong className="text-slate-700 dark:text-slate-200">#{threadName}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Preset Selection */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2.5">
              Preset Themes
            </label>
            <div className="grid grid-cols-2 gap-2.5">
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
                      'p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 shadow-2xs group',
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-850'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: p.accent }}
                        />
                        {p.name}
                      </span>
                      {isSelected && <Check size={13} className="text-indigo-600 dark:text-indigo-400" />}
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
                      {p.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chat Canvas Wallpaper */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2.5">
              Chat Wallpaper Pattern
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'none', label: 'Plain' },
                { id: 'grid', label: 'Blueprint Grid' },
                { id: 'dots', label: 'Dot Matrix' },
                { id: 'gradient', label: 'Soft Halo' },
              ].map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setSkin((prev) => ({ ...prev, chatWallpaper: w.id as any }))}
                  className={cn(
                    'py-2 px-2.5 rounded-xl border text-center text-xs font-semibold transition-all cursor-pointer shadow-2xs',
                    skin.chatWallpaper === w.id
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  )}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cosmetic Effects */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
              Cosmetic Effects
            </label>

            {/* Glowing Tag Micro-animations */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <Sparkles size={16} className="text-amber-500" />
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Glowing Tag Animations
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Pulse subtle luminescence along tag badges
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

            {/* Avatar Halo Frames */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <Layers size={16} className="text-indigo-500" />
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Avatar Halo Frames
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Surround author avatars with thread-tinted neon rings
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
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-850 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw size={13} />
            <span>Reset to Default</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5"
            >
              <Check size={14} />
              <span>Apply Skin</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
