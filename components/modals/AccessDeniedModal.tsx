'use client';

import React from 'react';
import { ShieldAlert, X, Lock } from 'lucide-react';
import { User } from '@/types/chat';

export type AccessDeniedModalData = {
  isOpen: boolean;
  threadName: string;
  threadType: 'dm' | 'group';
  reason: string;
  authorizedMembers: string[];
  referencedMsgSnippet?: string;
} | null;

interface AccessDeniedModalProps {
  accessDeniedInfo: AccessDeniedModalData;
  onClose: () => void;
  currentUserId: string;
  onSwitchUser: (userId: string) => void;
  users: User[];
}

export function AccessDeniedModal({
  accessDeniedInfo,
  onClose,
  currentUserId,
  onSwitchUser,
  users,
}: AccessDeniedModalProps) {
  if (!accessDeniedInfo?.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 border-b border-slate-100 flex items-start gap-3 bg-rose-50/60">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <ShieldAlert size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">Access Restricted</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                {accessDeniedInfo.threadType === 'dm' ? 'Private DM' : 'Restricted Channel'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              {accessDeniedInfo.threadName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-white/80 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-xs text-slate-700 leading-relaxed">
            {accessDeniedInfo.reason}
          </p>

          {accessDeniedInfo.referencedMsgSnippet && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                <Lock size={11} /> Referenced Message Preview
              </div>
              <div className="text-xs text-slate-600 italic line-clamp-2">
                {accessDeniedInfo.referencedMsgSnippet}
              </div>
            </div>
          )}

          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 text-xs space-y-2">
            <div className="flex items-center justify-between text-amber-900 font-semibold text-[11px]">
              <span>Authorized Participants:</span>
              <span className="text-[10px] text-amber-700 font-normal">
                {accessDeniedInfo.authorizedMembers.length} members
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {accessDeniedInfo.authorizedMembers.map((name) => (
                <span
                  key={name}
                  className="px-2 py-0.5 rounded-md bg-white border border-amber-200 text-amber-900 text-[11px] font-medium"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <div className="text-[11px] text-slate-500 mb-2">
              Want to test access with another account?
            </div>
            <div className="flex items-center gap-2">
              <select
                value={currentUserId}
                onChange={(e) => onSwitchUser(e.target.value)}
                className="flex-1 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none text-slate-800 focus:border-indigo-500 cursor-pointer"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    Switch to {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/70 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
