// lib/chat-utils.ts
import { Thread, User } from '@/types/chat';
import { MOCK_USERS } from '@/lib/mock-data';

let globalIdCounter = 1000;

export function createId(prefix: string = 'id'): string {
  globalIdCounter += 1;
  return `${prefix}-${Date.now()}-${globalIdCounter}`;
}

export function getNowTime(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function isUserAdminOrLead(userId: string, users: User[] = MOCK_USERS): boolean {
  const user = users.find((u) => u.id === userId);
  if (!user) return false;
  const role = user.role.toLowerCase();
  return (
    role.includes('lead') ||
    role.includes('vp') ||
    role.includes('admin') ||
    role.includes('operations') ||
    role.includes('manager')
  );
}

export function canUserManageThreadTags(thread: Thread, userId: string, users: User[] = MOCK_USERS): boolean {
  if (!thread.memberIds.includes(userId)) return false;
  const perm = thread.tagPermission || 'all';
  if (perm === 'all') return true;
  const effectiveCreator = thread.creatorId || thread.memberIds[0];
  if (perm === 'creator') return effectiveCreator === userId;
  if (perm === 'admins') return isUserAdminOrLead(userId, users) || effectiveCreator === userId;
  if (perm === 'custom') return (thread.allowedTaggerIds || []).includes(userId) || effectiveCreator === userId;
  return true;
}

export function getThreadTagColor(tagName: string): string {
  const lower = tagName.toLowerCase().trim();
  if (lower === 'urgent' || lower.includes('p0') || lower.includes('crit') || lower.includes('block')) {
    return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/80';
  }
  if (lower === 'to-review' || lower.includes('review') || lower.includes('approval') || lower.includes('audit')) {
    return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/80';
  }
  if (lower.includes('confidential') || lower.includes('secret') || lower.includes('private') || lower.includes('legal')) {
    return 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/80';
  }
  if (lower.includes('roadmap') || lower.includes('feature') || lower.includes('launch') || lower.includes('sprint')) {
    return 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/80';
  }
  if (lower.includes('done') || lower.includes('qa-pass') || lower.includes('shipped') || lower.includes('ready')) {
    return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80';
  }
  if (lower.includes('hr') || lower.includes('people') || lower.includes('hiring')) {
    return 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800/80';
  }
  return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/80';
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
