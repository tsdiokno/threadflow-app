'use client';

import React from 'react';
import { AtSign, Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { User } from '@/types/chat';

interface MessageContentRendererProps {
  content: string;
  isMe: boolean;
  currentUserId: string;
  currentUserName: string;
  allUsers: User[];
  onNavigateToMessageLink: (threadId: string, messageId: string) => void;
}

export function MessageContentRenderer({
  content,
  isMe,
  currentUserId,
  currentUserName,
  allUsers,
  onNavigateToMessageLink,
}: MessageContentRendererProps) {
  const renderTextWithMentions = (text: string) => {
    const mentionRegex = /@([a-zA-Z0-9_-]+)/g;
    const elements: React.ReactNode[] = [];
    let lastIdx = 0;
    let match: RegExpExecArray | null;

    while ((match = mentionRegex.exec(text)) !== null) {
      if (match.index > lastIdx) {
        elements.push(text.substring(lastIdx, match.index));
      }

      const candidate = match[1];
      const matchedUser = allUsers.find(
        (u) =>
          u.name.toLowerCase() === candidate.toLowerCase() ||
          u.name.toLowerCase().replace(/\s+/g, '_') === candidate.toLowerCase() ||
          u.name.toLowerCase().replace(/\s+/g, '') === candidate.toLowerCase()
      );

      const isBroadcast = ['channel', 'here', 'everyone'].includes(candidate.toLowerCase());

      if (!matchedUser && !isBroadcast) {
        elements.push(match[0]);
        lastIdx = match.index + match[0].length;
      } else {
        const isMentioningCurrentUser =
          matchedUser?.id === currentUserId ||
          matchedUser?.name === 'You' ||
          matchedUser?.name === currentUserName ||
          isBroadcast;

        elements.push(
          <span
            key={`mention-${match.index}`}
            className={cn(
              'inline-flex items-center gap-0.5 px-1.5 py-0.2 mx-0.5 rounded-md text-xs font-semibold border transition-all align-baseline',
              isMentioningCurrentUser
                ? isMe
                  ? 'bg-amber-400 text-amber-950 border-amber-300 font-bold shadow-2xs'
                  : 'bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700 font-bold shadow-2xs'
                : isMe
                ? 'bg-indigo-700 text-indigo-100 border-indigo-400 font-medium'
                : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 font-medium'
            )}
            title={matchedUser ? `${matchedUser.name} (${matchedUser.role})` : `@${candidate}`}
          >
            <AtSign size={11} className="shrink-0 inline -mt-0.5" />
            <span>{matchedUser ? matchedUser.name : candidate}</span>
          </span>
        );

        lastIdx = match.index + match[0].length;
      }
    }

    if (lastIdx < text.length) {
      elements.push(text.substring(lastIdx));
    }

    return elements.length > 0 ? elements : text;
  };

  const linkRegex =
    /\[([^\]]+)\]\((?:https?:\/\/[^\/]+)?\/?(?:chat)?\?threadId=([a-zA-Z0-9_-]+)&messageId=([a-zA-Z0-9_-]+)\)|(?:https?:\/\/[^\s]+)?\?threadId=([a-zA-Z0-9_-]+)&messageId=([a-zA-Z0-9_-]+)/g;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = linkRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(renderTextWithMentions(content.substring(lastIndex, match.index)));
    }

    const isMarkdown = Boolean(match[1]);
    const label = isMarkdown ? match[1] : 'Referenced Message';
    const threadId = isMarkdown ? match[2] : match[4];
    const messageId = isMarkdown ? match[3] : match[5];

    parts.push(
      <button
        key={`ref-link-${match.index}`}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onNavigateToMessageLink(threadId, messageId);
        }}
        className={cn(
          'inline-flex items-center gap-1.5 px-2 py-0.5 my-0.5 mx-0.5 rounded-lg font-medium text-xs border transition-all cursor-pointer shadow-2xs hover:scale-102 align-baseline',
          isMe
            ? 'bg-indigo-700 hover:bg-indigo-800 text-white border-indigo-400'
            : 'bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 dark:hover:bg-indigo-900/70 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
        )}
        title={`Click to navigate to referenced message (${messageId})`}
      >
        <Link2 size={11} className="shrink-0" />
        <span className="truncate max-w-[220px]">{label}</span>
      </button>
    );

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push(renderTextWithMentions(content.substring(lastIndex)));
  }

  return (
    <div className="break-words leading-relaxed whitespace-pre-wrap">
      {parts.length > 0 ? parts : renderTextWithMentions(content)}
    </div>
  );
}
