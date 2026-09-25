'use client';

import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getThreadTagColor } from '@/lib/chat-utils';

interface ThreadTagBadgeProps {
  tagName: string;
  size?: 'xs' | 'sm';
  isSelected?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  className?: string;
  title?: string;
  id?: string;
}

export function ThreadTagBadge({
  tagName,
  size = 'sm',
  isSelected = false,
  onClick,
  onRemove,
  className,
  title,
  id,
}: ThreadTagBadgeProps) {
  const colorClass = getThreadTagColor(tagName);

  const sizeClass = size === 'xs' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5';

  return (
    <span
      id={id}
      title={title}
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 rounded-md font-semibold border transition-all whitespace-nowrap select-none',
        sizeClass,
        colorClass,
        onClick && 'cursor-pointer hover:opacity-90 active:scale-95',
        isSelected && 'ring-2 ring-indigo-500/50 shadow-xs',
        className
      )}
    >
      <span className="truncate">#{tagName}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="hover:bg-black/15 dark:hover:bg-white/20 rounded p-0.5 transition-colors cursor-pointer text-current"
          title={`Remove #${tagName}`}
        >
          <X size={10} />
        </button>
      )}
    </span>
  );
}
