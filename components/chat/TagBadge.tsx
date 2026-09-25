'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { TagDef } from '@/types/chat';

interface TagBadgeProps {
  tag: TagDef;
  size?: 'xs' | 'sm' | 'md';
  showIcon?: boolean;
  showUnique?: boolean;
  count?: number;
  isSelected?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  className?: string;
  title?: string;
  id?: string;
}

export function TagBadge({
  tag,
  size = 'sm',
  showIcon = true,
  showUnique = false,
  count,
  isSelected = false,
  onClick,
  onRemove,
  className,
  title,
  id,
}: TagBadgeProps) {
  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5 gap-1',
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-sm px-2.5 py-1 gap-1.5',
  }[size];

  const content = (
    <span
      id={id}
      title={title}
      onClick={onClick}
      className={cn(
        'inline-flex items-center rounded-md font-semibold border transition-all select-none whitespace-nowrap',
        sizeClasses,
        tag.color,
        onClick && 'cursor-pointer hover:opacity-90 active:scale-95',
        isSelected && 'ring-2 ring-indigo-500/40 dark:ring-indigo-400/50 shadow-xs',
        className
      )}
    >
      {showIcon && tag.icon && <span className="shrink-0">{tag.icon}</span>}
      <span className="truncate">{tag.name}</span>

      {showUnique && tag.isUnique && (
        <span className="text-[10px] uppercase font-bold tracking-wider px-1 py-0.2 rounded bg-black/10 dark:bg-white/15 text-current">
          1x
        </span>
      )}

      {typeof count === 'number' && (
        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/15 text-current ml-0.5">
          {count}
        </span>
      )}

      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 hover:bg-black/15 dark:hover:bg-white/20 rounded p-0.5 text-current transition-colors cursor-pointer"
          title={`Remove tag ${tag.name}`}
        >
          ×
        </button>
      )}
    </span>
  );

  return content;
}
