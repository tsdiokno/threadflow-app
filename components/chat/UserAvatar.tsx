/* eslint-disable @next/next/no-img-element */
'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { User } from '@/types/chat';

interface UserAvatarProps {
  user?: User | null;
  name?: string;
  avatarBg?: string;
  avatarUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showStatus?: boolean;
  status?: 'online' | 'offline' | 'busy' | 'away';
  className?: string;
}

export function UserAvatar({
  user,
  name,
  avatarBg,
  avatarUrl,
  size = 'md',
  showStatus = false,
  status,
  className,
}: UserAvatarProps) {
  const effectiveName = user?.name || name || 'User';
  const effectiveBg = user?.avatarBg || avatarBg || 'bg-indigo-600';
  const effectiveUrl = user?.avatar || avatarUrl;
  const effectiveStatus = user?.status || status || 'online';

  const sizeClasses = {
    xs: 'w-5 h-5 text-[10px]',
    sm: 'w-7 h-7 text-xs',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
  }[size];

  const statusDotSizes = {
    xs: 'w-1.5 h-1.5 -bottom-0.5 -right-0.5',
    sm: 'w-2 h-2 -bottom-0.5 -right-0.5',
    md: 'w-2.5 h-2.5 -bottom-0.5 -right-0.5',
    lg: 'w-3 h-3 bottom-0 right-0',
  }[size];

  const statusColors = {
    online: 'bg-emerald-500',
    busy: 'bg-rose-500',
    away: 'bg-amber-500',
    offline: 'bg-slate-400',
  }[effectiveStatus];

  return (
    <div className={cn('relative shrink-0 select-none inline-flex items-center justify-center', className)}>
      {effectiveUrl ? (
        <img
          src={effectiveUrl}
          alt={effectiveName}
          className={cn('rounded-full object-cover shadow-2xs', sizeClasses)}
        />
      ) : (
        <div
          className={cn(
            'rounded-full flex items-center justify-center text-white font-bold shadow-2xs shrink-0',
            sizeClasses,
            effectiveBg
          )}
        >
          {effectiveName.charAt(0).toUpperCase()}
        </div>
      )}

      {showStatus && (
        <span
          className={cn(
            'absolute rounded-full ring-2 ring-white dark:ring-slate-900',
            statusDotSizes,
            statusColors
          )}
          title={`Status: ${effectiveStatus}`}
        />
      )}
    </div>
  );
}
