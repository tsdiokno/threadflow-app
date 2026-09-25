'use client';

import React, { useState } from 'react';
import {
  FileText,
  X,
  Sparkles,
  BookOpen,
  ListOrdered,
  Users,
  AlertTriangle,
  Check,
  Tag as TagIcon,
  Pin,
  BarChart2,
  Search,
  Link2,
  AtSign,
  MapPin,
  Copy,
  Layers,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  Cpu,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReadmeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReadmeModal({ isOpen, onClose }: ReadmeModalProps) {
  const [readmeTab, setReadmeTab] = useState<'overview' | 'solutions' | 'audience' | 'features' | 'markdown'>('overview');
  const [readmeCopied, setReadmeCopied] = useState(false);

  if (!isOpen) return null;

  const manifestoMarkdown = `# ThreadFlow — Threads as a Project Management Single Source of Truth (SSOT)

> **A Proof-of-Concept exploring how conversations, decisions, files, and tasks converge into a single unified workspace where threads serve as the ultimate Single Source of Truth (SSOT).**

---

## 💡 The Core Thesis & Foundational Premise

Modern teams spend their most productive hours communicating in chat, yet are constantly forced to context-switch into external, heavyweight project management tools (trackers, issue boards, isolated wikis, disconnected ticketing suites). This divide creates:
- **Cognitive & Context Fragmentation:** Decisions made in chat rarely migrate to trackers; tickets lack the organic back-and-forth reasoning that formed them.
- **Documentation Drift & Wiki Decay:** Static documentation becomes outdated the instant work accelerates.
- **Friction for High-Velocity Teams:** Developers, designers, and organizers waste momentum translating organic conversations into rigid database rows.

**ThreadFlow tests a fundamental hypothesis:**  
> **What if the thread itself IS the project management Single Source of Truth (SSOT)?**

Instead of treating chat as an ephemeral communication layer and project management as a remote destination, ThreadFlow makes each thread an autonomous, rich project workspace. Every conversation is simultaneously a real-time discussion, a living decision registry, a visual asset review board, and a trackable workflow.

---

## ⚖️ The 6 Core Theses & How ThreadFlow Solves Them

### 1. Cognitive Bifurcation & Context Shattering
- **The Premise:** Forcing teams to bifurcate focus between chat (talking) and external issue trackers (tracking) causes cognitive friction and lost context.
- **ThreadFlow Solution:** Autonomous Thread Workspaces with Living Metadata. Each thread possesses an editable title, description, and membership scope. The discussion, spec evolution, and decisions happen in one living stream.

### 2. Documentation Drift & Wiki Decay
- **The Premise:** Wikis and static documentation rot because writing docs is disconnected from the natural conversational flow of work.
- **ThreadFlow Solution:** First-Class Tagging as an Integrated Documentation Instrument. Applying tags (#decision, #spec, #blocker, #action-item) instantly turns organic conversations into a structured, searchable, and auditable knowledge base without breaking conversational flow.

### 3. Goal Ambiguity & The Cluttered Pinboard Anti-Pattern
- **The Premise:** Channels accumulate dozens of forgotten pinned items, destroying focus and obscuring the actual immediate objective.
- **ThreadFlow Solution:** Strict 1-Pinned-Message North Star Rule. Threads permit exactly one active pinned message. Pinning a new message triggers an atomic replacement confirmation dialog, forcing team alignment on a single unambiguous North Star.

### 4. Ambiguous Consensus & Protracted Debates
- **The Premise:** "What did we decide?" discussions stretch across dozens of messages without explicit resolution or recorded consensus.
- **ThreadFlow Solution:** Integrated In-Stream Polls with Real-Time Consensus. Squads can launch interactive polls directly from the composer. Real-time percentage bars, voter transparency, and a dedicated thread-wide Polls tab turn open-ended debates into recorded team verdicts.

### 5. Detached Feedback on Visual Assets
- **The Premise:** Reviewing design mockups, wireframes, or specs via abstract text comments leads to misinterpretation and costly iteration loops.
- **ThreadFlow Solution:** Visual Pinpoint File Annotations. Users upload image assets and drop numbered coordinate pins directly onto visual elements, anchoring focused, in-context subthreads directly on the file.

### 6. Information Silos & Retrieval Friction
- **The Premise:** Ephemeral chat makes critical information impossible to cite, reference, or retrieve across team silos.
- **ThreadFlow Solution:** Permanent Deep Linking + Access Control & Omni-Attribute Fuzzy Search (Cmd+K). Every message is individually addressable with permission enforcement for private DMs and confidential rooms, backed by fuzzy search indexing across rooms, authors, tags, polls, pins, and files.

---

## 🎯 Who It's Built For

1. **High-Velocity & Dynamic Squads:** Product teams, design sprints, engineering incident war-rooms, and startup founders who move too fast for bureaucratic overhead.
2. **Chat-Native Workforce:** Digital natives who live in messaging environments and expect keyboard-first ergonomics (\`@mentions\`, \`Cmd+K\`, markdown).
3. **Beyond Work — Personal, Friends & Communities:**
   - **Personal GTD:** Private solo threads for scratchpads, daily logs, and milestones.
   - **Friends & Social Groups:** Trip planning, group purchases, and event coordination with in-stream polls and pinned logistics.
   - **Communities & DAOs:** Open-source coordination, volunteer initiatives, and transparent group governance.`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-start gap-3 bg-gradient-to-r from-indigo-50/70 via-white to-purple-50/50 dark:from-indigo-950/40 dark:via-slate-900 dark:to-purple-950/30">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0 shadow-2xs">
            <FileText size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                ThreadFlow Architecture &amp; Vision Manifesto
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/70 text-indigo-700 dark:text-indigo-300">
                PoC Blueprint
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Testing threads as an authoritative Project Management Single Source of Truth (SSOT).
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1 overflow-x-auto">
          {[
            { id: 'overview', label: 'Core Thesis', icon: Sparkles },
            { id: 'solutions', label: 'Problem & Solution Matrix', icon: Layers },
            { id: 'audience', label: 'Target Culture & Audience', icon: Users },
            { id: 'features', label: 'MVP Capabilities', icon: ListOrdered },
            { id: 'markdown', label: 'Markdown Spec', icon: BookOpen },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = readmeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setReadmeTab(tab.id as any)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap',
                  active
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                )}
              >
                <Icon size={13} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-700 dark:text-slate-300 text-xs leading-relaxed flex-1">
          {/* TAB 1: OVERVIEW */}
          {readmeTab === 'overview' && (
            <div className="space-y-4">
              <div className="bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 rounded-2xl p-4.5">
                <h4 className="font-bold text-indigo-950 dark:text-indigo-200 text-sm mb-2 flex items-center gap-2">
                  <Sparkles size={17} className="text-indigo-600 dark:text-indigo-400" />
                  The Central Hypothesis
                </h4>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs">
                  What if modern work didn&apos;t require bifurcating focus between a chat app for talking and external ticketing software for tracking?
                  <strong className="text-indigo-900 dark:text-indigo-300"> ThreadFlow tests the hypothesis that the thread itself IS the project management Single Source of Truth (SSOT).</strong>
                </p>
                <div className="mt-3 pt-3 border-t border-indigo-100/80 dark:border-indigo-900/60 text-[11px] text-slate-600 dark:text-slate-400">
                  Instead of treating chat as an ephemeral water-cooler and project management as a detached database, each thread becomes an autonomous, fully contextual workspace uniting real-time discussion, documentation, and execution.
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3.5 pt-1">
                <div className="bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 rounded-2xl p-4">
                  <div className="font-bold text-rose-900 dark:text-rose-300 text-xs mb-2 flex items-center gap-1.5">
                    <AlertTriangle size={15} className="text-rose-600 dark:text-rose-400" />
                    The Friction of Legacy Tools
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                    <li className="flex items-start gap-1.5">
                      <span className="text-rose-500 font-bold">•</span>
                      <span><strong>Cognitive Bifurcation:</strong> Mental exhaustion from toggling between messaging and ticketing suites.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-rose-500 font-bold">•</span>
                      <span><strong>Documentation Drift:</strong> Wikis and tickets rot the moment high-velocity work picks up speed.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-rose-500 font-bold">•</span>
                      <span><strong>Context Severance:</strong> Critical technical debates and nuance are lost before reaching tickets.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-rose-500 font-bold">•</span>
                      <span><strong>Cluttered Channels:</strong> Dozens of uncurated pinned items create noise rather than focus.</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl p-4">
                  <div className="font-bold text-emerald-900 dark:text-emerald-300 text-xs mb-2 flex items-center gap-1.5">
                    <Check size={15} className="text-emerald-600 dark:text-emerald-400" />
                    The Thread-as-SSOT Architecture
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span><strong>Autonomous Project Rooms:</strong> Thread titles, mission descriptions, and membership scope in one view.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span><strong>First-Class Tagging:</strong> Living documentation instrument embedded directly in the stream.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span><strong>Strict 1-Pin North Star:</strong> Exactly one active pinned message per thread to enforce unwavering clarity.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span><strong>In-Stream Consensus:</strong> Native voting polls that capture definitive team alignment in seconds.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Tagging Documentation Instrument Banner */}
              <div className="bg-gradient-to-r from-indigo-50/90 via-purple-50/60 to-indigo-50/80 dark:from-indigo-950/50 dark:via-purple-950/40 dark:to-indigo-950/50 border border-indigo-200/90 dark:border-indigo-800/80 rounded-2xl p-4.5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1 rounded-lg bg-indigo-100 dark:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300">
                    <TagIcon size={14} />
                  </div>
                  <h4 className="font-bold text-indigo-950 dark:text-indigo-200 text-xs tracking-tight">
                    Architectural Tenet: Tagging as a Living Documentation Instrument
                  </h4>
                </div>
                <p className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
                  In ThreadFlow, tagging is <strong className="text-indigo-900 dark:text-indigo-200 font-semibold">first-class, not an afterthought</strong>. Rather than superficial decorative chips, tags function as an integrated documentation instrument. Tagging conversational moments with taxonomy like <code className="bg-indigo-100/70 dark:bg-indigo-900/80 text-indigo-800 dark:text-indigo-300 px-1 py-0.5 rounded font-mono text-[10px]">#decision</code>, <code className="bg-indigo-100/70 dark:bg-indigo-900/80 text-indigo-800 dark:text-indigo-300 px-1 py-0.5 rounded font-mono text-[10px]">#spec</code>, <code className="bg-indigo-100/70 dark:bg-indigo-900/80 text-indigo-800 dark:text-indigo-300 px-1 py-0.5 rounded font-mono text-[10px]">#blocker</code>, or <code className="bg-indigo-100/70 dark:bg-indigo-900/80 text-indigo-800 dark:text-indigo-300 px-1 py-0.5 rounded font-mono text-[10px]">#action-item</code> immediately turns organic chat into an indexed, searchable, and auditable knowledge base without sacrificing momentum.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: PROBLEM & SOLUTION MATRIX */}
          {readmeTab === 'solutions' && (
            <div className="space-y-3.5">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80">
                <h4 className="font-bold text-slate-900 dark:text-white text-xs mb-1">
                  How ThreadFlow Systematically Solves the Core Theses
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Each premise of the proof of concept maps to an explicit architectural solution implemented in the application:
                </p>
              </div>

              <div className="space-y-3">
                {/* Thesis 1 */}
                <div className="p-4 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xs">
                  <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-slate-700/60">
                    <span className="font-bold text-indigo-700 dark:text-indigo-300 text-xs flex items-center gap-1.5">
                      <Cpu size={14} /> 1. Cognitive Bifurcation &amp; Fragmentation
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                      Living Thread Rooms
                    </span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3 text-[11px]">
                    <div className="text-slate-600 dark:text-slate-400">
                      <strong className="text-rose-700 dark:text-rose-400 block mb-0.5">The Problem Premise:</strong>
                      Workers spend 20-30% of their workday toggling between communication suites and external ticket boards, fracturing cognitive focus and losing the narrative arc of why decisions were made.
                    </div>
                    <div className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      <strong className="text-emerald-700 dark:text-emerald-400 block mb-0.5">ThreadFlow Solution:</strong>
                      Every thread is an autonomous project room with editable title, mission description, and membership permissions. Discussions, file specs, and decisions remain permanently unified in a single view.
                    </div>
                  </div>
                </div>

                {/* Thesis 2 */}
                <div className="p-4 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xs">
                  <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-slate-700/60">
                    <span className="font-bold text-indigo-700 dark:text-indigo-300 text-xs flex items-center gap-1.5">
                      <TagIcon size={14} /> 2. Documentation Drift &amp; Wiki Decay
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                      Documentation Instrument
                    </span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3 text-[11px]">
                    <div className="text-slate-600 dark:text-slate-400">
                      <strong className="text-rose-700 dark:text-rose-400 block mb-0.5">The Problem Premise:</strong>
                      Static documentation and wikis decay almost immediately because keeping them updated requires manual administrative work detached from real-time execution.
                    </div>
                    <div className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      <strong className="text-emerald-700 dark:text-emerald-400 block mb-0.5">ThreadFlow Solution:</strong>
                      First-Class Tagging. Messages tagged as #decision, #spec, or #action-item automatically populate an auditable metadata registry with one-click filtering, preserving original discussion context.
                    </div>
                  </div>
                </div>

                {/* Thesis 3 */}
                <div className="p-4 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xs">
                  <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-slate-700/60">
                    <span className="font-bold text-indigo-700 dark:text-indigo-300 text-xs flex items-center gap-1.5">
                      <Pin size={14} className="fill-indigo-600 text-indigo-600" /> 3. Goal Ambiguity &amp; Pinboard Noise
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                      1-Pin North Star
                    </span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3 text-[11px]">
                    <div className="text-slate-600 dark:text-slate-400">
                      <strong className="text-rose-700 dark:text-rose-400 block mb-0.5">The Problem Premise:</strong>
                      Chat platforms allow infinite pinned messages, degenerating into chaotic, neglected pinboards where teammates can no longer discern what the current priority is.
                    </div>
                    <div className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      <strong className="text-emerald-700 dark:text-emerald-400 block mb-0.5">ThreadFlow Solution:</strong>
                      Strict 1-Pinned-Message North Star rule. Enforces a single active objective per thread. Pinning a new item triggers an atomic replacement dialog comparing both messages, guaranteeing intentional focus.
                    </div>
                  </div>
                </div>

                {/* Thesis 4 */}
                <div className="p-4 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xs">
                  <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-slate-700/60">
                    <span className="font-bold text-indigo-700 dark:text-indigo-300 text-xs flex items-center gap-1.5">
                      <BarChart2 size={14} /> 4. Unresolved Debates &amp; Consensus Loss
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                      In-Stream Polls
                    </span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3 text-[11px]">
                    <div className="text-slate-600 dark:text-slate-400">
                      <strong className="text-rose-700 dark:text-rose-400 block mb-0.5">The Problem Premise:</strong>
                      Open-ended discussions meander for hundreds of messages without explicit closure, leading to differing interpretations of what was agreed upon.
                    </div>
                    <div className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      <strong className="text-emerald-700 dark:text-emerald-400 block mb-0.5">ThreadFlow Solution:</strong>
                      Interactive In-Stream Polls. Launchable with one click from the composer or sidebar. Live percentage bars and voter transparency convert lengthy debates into clear, recorded consensus.
                    </div>
                  </div>
                </div>

                {/* Thesis 5 */}
                <div className="p-4 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xs">
                  <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-slate-700/60">
                    <span className="font-bold text-indigo-700 dark:text-indigo-300 text-xs flex items-center gap-1.5">
                      <MapPin size={14} /> 5. Detached Feedback on Visual Assets
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                      Visual Annotations
                    </span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3 text-[11px]">
                    <div className="text-slate-600 dark:text-slate-400">
                      <strong className="text-rose-700 dark:text-rose-400 block mb-0.5">The Problem Premise:</strong>
                      Giving feedback on design comps or documents via text comments leads to ambiguity (&ldquo;change the header on page 2&rdquo;) and forces reliance on external design review tools.
                    </div>
                    <div className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      <strong className="text-emerald-700 dark:text-emerald-400 block mb-0.5">ThreadFlow Solution:</strong>
                      Visual Pinpoint File Annotations. Teammates drop numbered pins directly onto uploaded images/mockups. Each pin anchors an interactive subthread, resolving design feedback in place.
                    </div>
                  </div>
                </div>

                {/* Thesis 6 */}
                <div className="p-4 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xs">
                  <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100 dark:border-slate-700/60">
                    <span className="font-bold text-indigo-700 dark:text-indigo-300 text-xs flex items-center gap-1.5">
                      <Link2 size={14} /> 6. Information Silos &amp; Retrieval Friction
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                      Deep Linking &amp; Search
                    </span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3 text-[11px]">
                    <div className="text-slate-600 dark:text-slate-400">
                      <strong className="text-rose-700 dark:text-rose-400 block mb-0.5">The Problem Premise:</strong>
                      Chat messages feel ephemeral and impossible to cite across teams, while finding past decisions requires tedious, inaccurate scrolling through infinite chat logs.
                    </div>
                    <div className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      <strong className="text-emerald-700 dark:text-emerald-400 block mb-0.5">ThreadFlow Solution:</strong>
                      Permanent Deep Linking with Access Control + Omni-Attribute Fuzzy Search (Cmd+K). Every message has a permalink that respects permission scopes, while search instantly indexes messages, polls, pins, and files.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AUDIENCE & CULTURE */}
          {readmeTab === 'audience' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Designed for cultures that thrive on real-time collaboration, dynamic and high-velocity workflows, and for a chat-native workforce to feel right at home immediately.
              </p>

              <div className="space-y-3">
                <div className="p-4 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xs">
                  <div className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-2 mb-1.5">
                    <span className="text-base">🚀</span>
                    <span>High-Velocity &amp; Dynamic Squads</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    Engineering incident war-rooms, product squads running fast design sprints, venture-backed startups, and growth marketers who prioritize shipping velocity over clerical tracking.
                  </p>
                </div>

                <div className="p-4 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xs">
                  <div className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-2 mb-1.5">
                    <span className="text-base">💬</span>
                    <span>Chat-Native Workforce</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    Digital natives whose primary interaction paradigm is messaging (Slack, Discord, WhatsApp). Zero onboarding friction, muscle-memory keyboard shortcuts (<code className="bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded font-mono text-[10px]">Cmd+K</code>, <code className="bg-slate-100 dark:bg-slate-700 px-1 py-0.5 rounded font-mono text-[10px]">@mentions</code>), and rapid visual feedback.
                  </p>
                </div>

                <div className="p-4 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xs">
                  <div className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-2 mb-2">
                    <span className="text-base">✨</span>
                    <span>Beyond Work: Personal, Social &amp; Community Coordination</span>
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                    <li className="flex items-start gap-1.5">
                      <span className="text-indigo-500 font-bold">•</span>
                      <span><strong>Personal Getting Things Done (GTD):</strong> Private solo threads for daily journals, habit tracking, reading queues, and self-organization without heavy task apps.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-indigo-500 font-bold">•</span>
                      <span><strong>Friends &amp; Social Groups:</strong> Vacation itineraries, shared expenses, weekend dinner polls, and gift planning with pinned logistics.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-indigo-500 font-bold">•</span>
                      <span><strong>Communities &amp; DAOs:</strong> Open-source project governance, volunteer team assignments, and community consensus with transparent voting records.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FEATURES */}
          {readmeTab === 'features' && (
            <div className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3 text-[11px]">
                <div className="p-3.5 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xs">
                  <div className="font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5 mb-1.5">
                    <TagIcon size={14} className="text-indigo-600 dark:text-indigo-400" />
                    First-Class Tagging (Living Instrument)
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">
                    Tag messages inline (#decision, #spec, #action-item) to immediately transform conversational flow into a structured, audit-ready documentation registry.
                  </p>
                </div>

                <div className="p-3.5 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xs">
                  <div className="font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5 mb-1.5">
                    <Pin size={14} className="fill-indigo-600 text-indigo-600 dark:fill-indigo-400 dark:text-indigo-400" />
                    Strict 1-Pinned-Message Rule
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">
                    Enforces exactly one active pinned message per thread to establish an unambiguous North Star. Interactive replacement prompt prevents cluttered pinboards.
                  </p>
                </div>

                <div className="p-3.5 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xs">
                  <div className="font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5 mb-1.5">
                    <BarChart2 size={14} />
                    In-Stream Polls
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">
                    Capture team votes and consensus right in the chat stream with instant percentage progress bars and voter inspection.
                  </p>
                </div>

                <div className="p-3.5 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xs">
                  <div className="font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5 mb-1.5">
                    <Search size={14} />
                    Fuzzy Search (Cmd+K)
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">
                    Omnipresent search scored by relevance across rooms, teammates, polls, pinned messages, and file attachments.
                  </p>
                </div>

                <div className="p-3.5 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xs">
                  <div className="font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5 mb-1.5">
                    <Link2 size={14} />
                    Deep Linking &amp; Access Control
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">
                    Every message is addressable via permanent link with permission checks guarding private DMs and confidential rooms.
                  </p>
                </div>

                <div className="p-3.5 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xs">
                  <div className="font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5 mb-1.5">
                    <AtSign size={14} />
                    User @Mentions
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">
                    Trigger real-time autocomplete suggestions with keyboard navigation for personas and broadcast tags (@channel, @here).
                  </p>
                </div>

                <div className="p-3.5 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-2xs sm:col-span-2">
                  <div className="font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5 mb-1.5">
                    <MapPin size={14} />
                    Visual File Annotations
                  </div>
                  <p className="text-slate-600 dark:text-slate-400">
                    Pin numbered comment threads onto uploaded mockups, wireframes, and design specs to resolve feedback visually in-thread.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: MARKDOWN SPEC */}
          {readmeTab === 'markdown' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Root README.md Document Spec
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText?.(manifestoMarkdown);
                    setReadmeCopied(true);
                    setTimeout(() => setReadmeCopied(false), 2000);
                  }}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 px-3 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 border border-indigo-200 dark:border-indigo-800"
                >
                  {readmeCopied ? <Check size={13} className="text-emerald-600 dark:text-emerald-400" /> : <Copy size={13} />}
                  <span>{readmeCopied ? 'Copied to Clipboard!' : 'Copy Manifesto Spec'}</span>
                </button>
              </div>
              <pre className="p-4 bg-slate-900 dark:bg-slate-950 text-slate-100 rounded-2xl text-[11px] font-mono overflow-x-auto leading-relaxed max-h-80 border border-slate-800">
                {manifestoMarkdown}
              </pre>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="text-[11px]">
            File: <code className="text-slate-700 dark:text-slate-300 font-mono bg-slate-200/70 dark:bg-slate-800 px-1 py-0.5 rounded">/README.md</code> in project root
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
