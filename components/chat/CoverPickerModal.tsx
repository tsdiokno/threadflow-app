/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useRef } from 'react';
import { X, Image as ImageIcon, Sparkles, Upload, Link as LinkIcon, Trash2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export const CURATED_COVER_PHOTOS = [
  {
    id: 'abstract-flow',
    name: 'Abstract Fluid',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'modern-texture',
    name: 'Modern Texture',
    url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'mountain-mist',
    name: 'Mountain Mist',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'cosmic-nebula',
    name: 'Cosmic Nebula',
    url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'sunlit-arch',
    name: 'Sunlit Architecture',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'calm-ocean',
    name: 'Calm Ocean',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'neon-cyber',
    name: 'Cyberpunk Neon',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'warm-foliage',
    name: 'Warm Foliage',
    url: 'https://images.unsplash.com/photo-1476820865390-c52aeebb9891?auto=format&fit=crop&w=800&q=80',
  },
];

export const CURATED_COVER_GRADIENTS = [
  {
    id: 'indigo-horizon',
    name: 'Indigo Twilight',
    css: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)',
  },
  {
    id: 'sunset-glow',
    name: 'Sunset Glow',
    css: 'linear-gradient(135deg, #f97316 0%, #ec4899 100%)',
  },
  {
    id: 'emerald-aurora',
    name: 'Emerald Aurora',
    css: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #06b6d4 100%)',
  },
  {
    id: 'midnight-obsidian',
    name: 'Midnight Obsidian',
    css: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
  },
  {
    id: 'cyan-breeze',
    name: 'Cyan Breeze',
    css: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #6366f1 100%)',
  },
  {
    id: 'warm-amber',
    name: 'Warm Amber',
    css: 'linear-gradient(135deg, #d97706 0%, #f59e0b 50%, #fbbf24 100%)',
  },
];

interface CoverPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCover?: string;
  onSelectCover: (coverUrl: string | null) => void;
}

export function CoverPickerModal({
  isOpen,
  onClose,
  currentCover,
  onSelectCover,
}: CoverPickerModalProps) {
  const [tab, setTab] = useState<'photos' | 'gradients' | 'custom'>('photos');
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    onSelectCover(urlInput.trim());
    setUrlInput('');
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result as string;
      if (dataUrl) {
        onSelectCover(dataUrl);
        onClose();
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      id="cover-picker-modal"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <ImageIcon size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Personalize Cover Photo
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Customize the cover banner for this conversation
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-4 bg-white dark:bg-slate-900 shrink-0 gap-1 text-xs">
          <button
            type="button"
            onClick={() => setTab('photos')}
            className={cn(
              'px-3 py-2.5 font-semibold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer',
              tab === 'photos'
                ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            )}
          >
            <ImageIcon size={13} />
            <span>Curated Photos</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('gradients')}
            className={cn(
              'px-3 py-2.5 font-semibold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer',
              tab === 'gradients'
                ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            )}
          >
            <Sparkles size={13} />
            <span>Gradients</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('custom')}
            className={cn(
              'px-3 py-2.5 font-semibold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer',
              tab === 'custom'
                ? 'border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            )}
          >
            <Upload size={13} />
            <span>Custom / Upload</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {tab === 'photos' && (
            <div className="grid grid-cols-2 gap-2.5">
              {CURATED_COVER_PHOTOS.map((photo) => {
                const isSelected = currentCover === photo.url;
                return (
                  <button
                    key={photo.id}
                    type="button"
                    onClick={() => {
                      onSelectCover(photo.url);
                      onClose();
                    }}
                    className={cn(
                      'group relative rounded-xl overflow-hidden h-24 border text-left transition-all cursor-pointer shadow-2xs hover:scale-[1.02]',
                      isSelected
                        ? 'ring-2 ring-indigo-600 dark:ring-indigo-400 border-indigo-600'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    )}
                  >
                    <img
                      src={photo.url}
                      alt={photo.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-2">
                      <span className="text-[11px] font-semibold text-white truncate drop-shadow-xs">
                        {photo.name}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                        <Check size={12} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {tab === 'gradients' && (
            <div className="grid grid-cols-2 gap-2.5">
              {CURATED_COVER_GRADIENTS.map((grad) => {
                const isSelected = currentCover === grad.css;
                return (
                  <button
                    key={grad.id}
                    type="button"
                    onClick={() => {
                      onSelectCover(grad.css);
                      onClose();
                    }}
                    className={cn(
                      'group relative rounded-xl overflow-hidden h-24 border text-left transition-all cursor-pointer shadow-2xs hover:scale-[1.02]',
                      isSelected
                        ? 'ring-2 ring-indigo-600 dark:ring-indigo-400 border-indigo-600'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    )}
                    style={{ background: grad.css }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent flex items-end p-2">
                      <span className="text-[11px] font-semibold text-white truncate drop-shadow-xs">
                        {grad.name}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-xs">
                        <Check size={12} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {tab === 'custom' && (
            <div className="space-y-4">
              {/* File upload option */}
              <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 text-center bg-slate-50/50 dark:bg-slate-800/40">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Upload size={24} className="mx-auto text-slate-400 dark:text-slate-500 mb-2" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Upload image from your device
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5 mb-3">
                  PNG, JPG, WebP, or SVG up to 5MB
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 rounded-lg border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer shadow-2xs"
                >
                  Choose File
                </button>
              </div>

              {/* URL paste option */}
              <form onSubmit={handleApplyUrl} className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
                  Or paste direct image URL
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon
                      size={13}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:bg-white dark:focus:bg-slate-850 focus:border-indigo-500 text-slate-800 dark:text-slate-100 transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!urlInput.trim()}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition-colors shadow-2xs cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer with Remove option if a cover is currently active */}
        {currentCover && (
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Current cover active
            </span>
            <button
              type="button"
              onClick={() => {
                onSelectCover(null);
                onClose();
              }}
              className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/60 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Trash2 size={13} />
              <span>Remove Cover</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
