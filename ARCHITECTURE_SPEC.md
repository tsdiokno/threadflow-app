# Software Architecture Specification (System Blueprint)
**Project Name:** ThreadFlow (TagChat)  
**System Class:** Chat-Native Project Management Single Source of Truth (SSOT) Workspace  
**Intended Readers:** Software Architects (MVC/Clean Architecture), Full-Stack Engineers, AI Coding Agents & Large Language Models (LLMs)  
**Status:** Living Architectural Specification  

---

## 1. Executive Summary & Core Philosophy

### 1.1 What the Application Is
**ThreadFlow** is an enterprise-grade, chat-native project management system engineered around a single foundational thesis:  
> **The conversational thread itself IS the project management Single Source of Truth (SSOT).**

Traditional knowledge teams suffer severe cognitive bifurcation by toggling between chat streams (Slack, Discord, Teams) and external, heavyweight issue trackers or wikis (Jira, Linear, Asana, Notion). Discussions, trade-offs, and organic decisions remain locked inside ephemeral chat histories, while detached issue tickets become dry, outdated artifacts requiring high-friction manual maintenance.

ThreadFlow converges communication, living documentation, task management, consensus building, and visual asset review into a single, unified, thread-centric interface.

### 1.2 Core Architectural Invariants
1. **Chat as the Primary Execution Surface:** Work happens inside threads. Threads are not mere ephemeral chat rooms—they are stateful project records featuring dedicated missions, member access control, living metadata, and custom fields.
2. **First-Class Tagging as a Documentation Instrument:** Tags (`#decision`, `#spec`, `#blocker`, `#action-item`, `#feedback`) are structured, queryable knowledge objects attached to individual messages. They transform natural conversations into an indexed audit trail without leaving the flow.
3. **The 1-Pinned-Message "North Star" Constraint:** Unlike noisy chat platforms where channels accumulate dozens of forgotten pinned items, each thread in ThreadFlow permits **strictly one active pinned message** representing its current focal objective. Pinning an alternative message triggers an atomic comparison and replacement workflow.
4. **In-Stream Consensus Mechanics:** Decisions are codified via real-time interactive polls embedded directly into the stream and reflected in a dedicated metadata review tab.
5. **Deep Visual Pinpoint Annotations:** Feedback on visual, audio, or video deliverables occurs via coordinate-pinned or timeline-pinned subthreads attached directly to media assets.
6. **Decoupled View Model (Notion-Style Extension Architecture):** Thread data is decoupled from presentation. Through first-party plugins, the entire thread workspace can be projected into full-bleed Table, Kanban, or Gantt views, as well as cosmetic personalization spaces.

---

## 2. Architectural Paradigm: Clean MVC / Component-Driven React

The application implements a decoupled, unidirectional **Model-View-Controller (MVC)** topology adapted for Modern React 19 / Next.js 15 App Router:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             CONTROLLER LAYER                                │
│  components/chat-app.tsx  (Orchestrator, Event Router, State Machine)        │
│  - useSyncExternalStore (Hydration-safe Browser Storage Sync)                │
│  - Reactive Plugin Event Bus (lib/plugins/plugin-registry.ts)               │
│  - Modal Routing & Deep-Link Resolution                                      │
└──────────────────────┬───────────────────────────────▲──────────────────────┘
                       │ (State & Handlers)            │ (User Actions)
┌──────────────────────▼───────────────────────────────┴──────────────────────┐
│                                VIEW LAYER                                   │
│  ┌───────────────────────┬───────────────────────┬────────────────────────┐ │
│  │   Navigation Pane     │     Main Canvas       │   Metadata Inspector   │ │
│  │ ConversationsSidebar  │ - ChatStream / Input  │ - Tag Index & Filtering│ │
│  │ - Room/DM Directory   │ - ProjectViews Plugin │ - Active Polls Ledger  │ │
│  │ - Workspace ViewMode  │   (Table/Kanban/Gantt)│ - Thread File Assets   │ │
│  │ - User Persona Switch │ - Revamp Plugin View  │ - Member Permissions   │ │
│  └───────────────────────┴───────────────────────┴────────────────────────┘ │
│  Modal Overlays: ThreadSettings, Search (⌘K), PollBuilder, AssetAnnotator   │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ (Reads Model Contracts)
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                               MODEL LAYER                                   │
│  types/chat.ts & types/plugins.ts                                           │
│  - Entity Contracts: User, Thread, Message, TagDef, Poll, FileAsset         │
│  - Sandboxed Plugin Storage: Custom Fields, Skins, Column Definitions       │
│  - In-Memory Mock Store / Future Production Database Adapters                │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.1 The Model Layer (`types/chat.ts`, `types/plugins.ts`)
The Model defines strict TypeScript contracts governing domain entities:

- **`User`**: Identity model containing credentials, roles (`admin`, `tech-lead`, `developer`, `designer`), statuses, and avatar styling.
- **`Thread`**: The core workspace aggregate root. Encapsulates title, description, cover image, type (`group` vs `dm`), member access list (`memberIds`), tag definitions (`tagDefs`), custom fields, and the ID of the strictly unique pinned message (`pinnedMessageId`).
- **`Message`**: Conversational atomic unit. Supports rich text, sender metadata, edit history (`MessageEditRecord[]`), inline tag associations (`tagIds`), embedded polls, coordinate/timeline asset annotations (`annotationPoint`), and parent-child reply hierarchies.
- **`TagDef`**: Documentation taxonomy schema. Defines name, color palette, semantic category (`decision`, `action`, `inspiration`, `resource`, `general`), usage counts, and a uniqueness flag (`isUnique`) enforcing single-message existence across a thread.
- **`Poll`**: Consensus entity with multiple choice options, real-time voter arrays, and state locks (`isClosed`).
- **`FileAsset` & `AnnotationPoint`**: Media attachment schema supporting pinpoint $(x, y)$ coordinate pins and audio/video timeline seconds for threaded design feedback.
- **`PluginManifest` & `PluginState`**: Sandboxed extension metadata defining required permissions, lifecycle hooks, and configurable setting schemas.

### 2.2 The View Layer (`components/`)
The View is structured as a responsive, three-pane workspace featuring edge-to-edge viewport utilization:

1. **Conversations Pane (`components/chat/ConversationsSidebar.tsx`)**:
   - Room and direct-message navigation.
   - Persona switcher (instantly test authorization as different team members).
   - Global Workspace View Mode Dropdown: Switch seamlessly between **Chat**, **Project Views** (Table/Kanban/Gantt), and **Revamp Customizer**.
   - Collapsible panel behavior with state persistence.
2. **Main Canvas (`components/chat-app.tsx`)**:
   - **Chat Mode**: Displays `ChatHeader`, sticky North Star pinned message banner, virtualized/scrolling message list (`MessageItem`), in-stream poll widgets (`PollCard`), and progressive-disclosure composer (`MessageInput`).
   - **Classic Project Views Mode (`components/plugins/ProjectViews.tsx`)**: Decouples thread data into full-bleed Table (Notion-like inline property editing), Kanban (drag/move columns by status or tags), and Gantt timeline progress.
   - **Revamp Custom Skins Mode (`components/plugins/RevampPluginView.tsx`)**: Live visual customizer for per-thread skins, accent tokens, and pattern wallpapers.
3. **Metadata Inspector (`components/chat/MetadataSidebar.tsx`)**:
   - Contextual inspector displaying thread mission, active tag taxonomy filters, active polls with voting progress, and uploaded file libraries.
   - Preserves user toggle state (collapsed vs open) consistently across thread switches and plugin transitions.

### 2.3 The Controller Layer (`components/chat-app.tsx` & `lib/`)
`ChatApp` acts as the root orchestrator and state coordinator:
- Manages optimistic state updates for messages, tag assignments, thread mutations, and polls.
- Enforces security and authorization invariants (e.g. blocking access to private DMs, restricting thread settings to authorized roles).
- Intercepts deep links (`#msg-...`) and scrolls/highlights the target message with access validation.
- Routes plugin events through safe boundary wrappers (`PluginErrorBoundary`).

---

## 3. Detailed Data Flow & State Synchronization

### 3.1 Hydration-Safe State Persistence Pattern
To guarantee zero hydration mismatch between Next.js SSR and client-side browser storage (e.g. `localStorage`), the application utilizes React's **`useSyncExternalStore`** API:

```ts
// Architectural Pattern for Persistent Client State (e.g. sidebar open/close)
const sidebarListeners = new Set<() => void>();

export function subscribeSidebar(callback: () => void) {
  sidebarListeners.add(callback);
  window.addEventListener('storage', callback);
  return () => {
    sidebarListeners.delete(callback);
    window.removeEventListener('storage', callback);
  };
}

// Server Snapshot returns stable deterministic default for SSR
export function getSidebarServerSnapshot(): boolean {
  return true;
}

// Client Snapshot reads actual persistent storage
export function getRightSidebarSnapshot(): boolean {
  if (typeof window === 'undefined') return true;
  const saved = localStorage.getItem('stride_metadata_sidebar_open');
  return saved === null ? true : saved === 'true';
}
```

**Why this matters for LLMs & Engineers:** Never use `useState(() => localStorage.getItem(...))` in client components. It creates immediate React hydration errors because the server render cannot know client local storage before mount. `useSyncExternalStore` ensures clean SSR and flawless client reconciliation.

### 3.2 Thread Selection & View Preservation Invariant
When a user selects a thread from the conversation panel:
1. `workspaceViewMode` programmatically restores to `'chat'`.
2. The active thread changes to `threadId`.
3. **The Metadata Sidebar visibility state is preserved** (it is *never* forced open if the user previously collapsed it).
4. Message stream scrolls automatically to the bottom or focuses on a targeted anchor.

---

## 4. The First-Class Tagging Architecture

Tagging in ThreadFlow is not decorative; it is an active documentation engine:

```
[ Natural Chat Stream ]
         │
         ▼
[ User tags message with #decision ]
         │
         ├──► Is tag marked isUnique: true?
         │         ├── YES ──► Check if another message has this tag
         │         │               └── CONFLICT: Present Atomic Replacement Modal
         │         └── NO  ──► Attach tag to message metadata
         │
         ├──► Update Tag Usage Statistics (lastUsedAt, usageCount)
         ├──► Index message in Thread Metadata Inspector
         └──► Make queryable via Global ⌘K Omni-Search
```

### 4.1 Tag Attributes
- **Thread Scoping:** Each thread possesses its own curated tag definitions (`tagDefs`) in addition to system defaults.
- **Uniqueness Constraint (`isUnique`):** Specific tags (e.g., `sprint-goal`, `architecture-decision`) can be flagged as unique. Applying an existing unique tag to a second message prompts an atomic conflict resolution modal allowing the user to either move the tag or cancel.
- **Governance:** Thread creators and workspace admins can restrict who is allowed to create, edit, or delete tag definitions (`ThreadTagPermission`).

---

## 5. Plugin & Extension Architecture

ThreadFlow incorporates a hot-pluggable micro-kernel architecture for first- and third-party extensions:

### 5.1 Extension Lifecycle & Sandboxing
- Plugins register via a declarative manifest:
  ```ts
  export interface PluginManifest {
    id: string;
    name: string;
    version: string;
    description: string;
    author: string;
    requiredPermissions: PluginPermission[];
    settingsSchema?: PluginSettingField[];
    enabledByDefault?: boolean;
    category: 'productivity' | 'cosmetics' | 'developer' | 'analytics';
  }
  ```
- **Permission Scopes:**
  - `threads:read` / `threads:write`: Access and mutate thread models.
  - `messages:read` / `messages:send`: Stream inspection and automated bot/webhook dispatch.
  - `ui:custom_views`: Right to inject full workspace view modes into the navigation switcher.
  - `custom_fields:write`: Storing arbitrary key-value metadata on thread entities.
- **Fault Isolation (`PluginErrorBoundary`):** If a plugin crashes during execution, the error boundary catches the exception, offers a single-click disable action, and cleanly falls back to core chat without corrupting user data or unmounting the application.
- **Dynamic Feature Visibility Rule:** When a plugin providing a custom view mode (such as Project Views or Revamp) is toggled off in the Extension Center (Settings > Plugins), its option in the view switcher is automatically hidden. If all custom views are disabled, the switcher dropdown collapses entirely.

### 5.2 First-Party Plugins Breakdown
1. **Classic Project Views (`thread-project-views`)**:
   - **Table View:** Notion-style spreadsheet canvas spanning full width/height with sticky column headers, custom property management (dates, select, numbers), and sorting.
   - **Kanban View:** Dynamic board organizing threads by status, priority, or thread tags with column-to-column moves.
   - **Gantt View:** Horizontal timeline rendering thread duration and progress bars across active calendar spans.
2. **Revamp Custom Skins (`thread-custom-skins`)**:
   - Cosmetic theme engine providing per-thread customizations: custom hex accents, SVG wallpaper patterns (Blueprint Grid, Dot Matrix, Soft Halo), glowing tag animations, and avatar halo frames.
3. **DevOps Webhook Dispatcher (`thread-devops-webhooks`)**:
   - Testing harness for inbound webhooks from GitHub, Linear, Cloud Build, and Sentry, posting structured alert cards into the active stream.

---

## 6. Directory Layout & Source Code Map

```
/
├── app/
│   ├── layout.tsx             # Root layout, theme script, fonts, metadata
│   ├── page.tsx               # Entry page mounting ChatApp
│   └── globals.css            # Tailwind v4 directives, custom scrollbars, animations
├── components/
│   ├── chat-app.tsx           # Central Controller & Application Orchestrator
│   ├── chat/                  # Core Chat View Components
│   │   ├── ChatHeader.tsx            # Thread title, mission snippet, member badges, toggles
│   │   ├── ConversationsSidebar.tsx  # Thread & DM lists, view mode switcher, persona drawer
│   │   ├── CoverPickerModal.tsx      # Unsplash/gradient cover image selector for threads
│   │   ├── MessageContentRenderer.tsx# Markdown, mention hyperlinks, inline tag chips
│   │   ├── MessageInput.tsx          # Progressive-disclosure message composer
│   │   ├── MessageItem.tsx           # Message bubble, actions (pin, edit, tag, reply)
│   │   ├── MetadataSidebar.tsx       # Living metadata inspector (Tags, Polls, Files, Access)
│   │   ├── PollCard.tsx              # Interactive poll voting progress bars
│   │   ├── TagBadge.tsx              # Interactive tag chip with popover inspection
│   │   ├── ThreadTagBadge.tsx        # High-level room tags
│   │   ├── ToastNotification.tsx     # Toast feedback system
│   │   └── UserAvatar.tsx            # Avatar renderer with status dots & halo frames
│   ├── modals/                # Contextual Dialogs & Workflow Overlays
│   │   ├── AccessDeniedModal.tsx     # Permission boundary guard for private deep links
│   │   ├── CreatePollModal.tsx       # Poll builder with multiple options and validation
│   │   ├── EditHistoryModal.tsx      # Audit trail comparing past revisions of messages
│   │   ├── ImageAnnotationModal.tsx  # Media asset viewer with coordinate/timeline pins
│   │   ├── ReadmeModal.tsx           # In-app manifesto and feature documentation
│   │   ├── ReplacePinModal.tsx       # Atomic 1-pinned-message replacement modal
│   │   ├── SearchModal.tsx           # ⌘K Omni-attribute fuzzy search dialog
│   │   ├── SettingsModal.tsx         # Workspace settings, themes, and Extension Center
│   │   ├── TagConflictModal.tsx      # Atomic conflict resolver for unique tags
│   │   └── ThreadSettingsModal.tsx   # Room metadata, members, and tag permission editor
│   └── plugins/               # Pluggable Feature Views
│       ├── CustomSkinsCustomizer.tsx # Per-thread skin and cosmetic editor
│       ├── PluginErrorBoundary.tsx   # Isolation boundary for extensions
│       ├── PluginsManagementTab.tsx  # Extension Center UI for toggling plugins
│       ├── ProjectViews.tsx          # Notion-style Table, Kanban, and Gantt canvas
│       ├── RevampPluginView.tsx      # Standalone Revamp view wrapper
│       └── WebhookDispatcherModal.tsx# CI/CD simulated webhook injector
├── lib/
│   ├── chat-utils.ts          # Pure domain utilities (id generation, permissions, time)
│   ├── mock-data.ts           # Rich development mock seed data
│   ├── theme-utils.ts         # User tint and dark mode token computations
│   ├── utils.ts               # Tailwind cn() merger
│   └── plugins/
│       ├── builtin-plugins.ts # Manifests and schemas for first-party extensions
│       └── plugin-registry.ts # Storage, subscriptions, and permission verifications
└── types/
    ├── chat.ts                # Primary domain types & data contracts
    └── plugins.ts             # Plugin architecture schemas & custom field definitions
```

---

## 7. Developer & LLM Operating Instructions

When extending, refactoring, or generating code within ThreadFlow, adhere strictly to these principles:

1. **Do Not Break the 1-Pinned-Message Rule:** Never allow an array of pinned messages per thread. Any pinning action on a thread that already contains a pinned message must go through `ReplacePinModal` or explicit user confirmation.
2. **Respect the Living Metadata Invariant:** Do not add editable text inputs directly to the `MetadataSidebar` surface. Per UX standards, editing thread titles, descriptions, and tag permissions must be performed inside `ThreadSettingsModal`.
3. **Preserve Sidebar Layout States:** When thread switches or view mode changes occur, do not hardcode `setIsRightSidebarOpen(true)`. Preserve whatever state the user has established.
4. **Use Tailwind Utility Classes Directly:** All styling must follow Tailwind CSS v4. No CSS Modules, no styled-components, and no inline styles unless strictly computing dynamic coordinates (such as annotation pin offsets or Gantt bar percentages).
5. **Strict Lucide Icon Imports:** All icons must be imported from `lucide-react`. Never generate inline SVGs for standard UI actions.
6. **Hydration Integrity:** When reading browser-specific state (like `localStorage` or viewport dimensions), use React's `useSyncExternalStore` or read inside `useEffect`. Never branch in the initial render based on `typeof window !== 'undefined'`.

---

## 8. Dev/Production "Flipswitch" Architecture Specification

As specified in `TODO.md`, ThreadFlow implements an instant transition between a self-contained local development sandbox and a live production multi-client environment:

### 8.1 The Flipswitch Mechanism
- Controlled by a single boolean constant/environment variable: `FLIPSWITCH_PRODUCTION_MODE` (`NEXT_PUBLIC_ENABLE_PRODUCTION_MODE="true"` / `"false"` in `.env.example` or code-level override in `lib/config/environment.ts`).
- **Zero UI Footprint**: The flipswitch is strictly configured by the developer at the code/environment level without cluttering end-user interfaces.
- **When `false` (Dev Mode)**:
  - Operates via `MockChatAdapter` (`lib/adapters/mock-adapter.ts`).
  - Powered by in-memory JSON dummy seed data (`MOCK_THREADS`, `MOCK_MESSAGES`, `MOCK_USERS`, `MOCK_FILES`).
  - Realtime events are simulated locally with zero external network dependencies.
- **When `true` (Production Mode - Supabase + Vercel Zero-Cost MVP)**:
  - Operates via `SupabaseChatAdapter` (`lib/adapters/supabase-adapter.ts`).
  - Connects to Supabase PostgreSQL database via `@supabase/supabase-js`.
  - Subscribes to live WebSocket channel events (`postgres_changes` on `messages` and `threads`) for instant multi-user messaging.
  - Media asset uploads route to Supabase Storage bucket (`workspace-assets`).

### 8.2 WordPress-Style 5-Minute Automated Installation
- On initial startup in production mode (`SupabaseChatAdapter.initialize()`), the system performs an automated health check:
  - If the database tables are fresh and empty, it automatically executes the initial bootstrapper, seeding foundational team rooms ("Product Core", "Engineering Sync", "Design Critiques"), initial messages, and tag definitions.
  - Automatically verifies Realtime publications so multi-client sync works out of the box with zero manual seeding required.
- Dedicated status endpoint: `GET /api/production/install` exposes environment diagnostic data and setup health.
- Database Schema Script: `lib/adapters/supabase-schema.sql` provides the DDL with Row Level Security (RLS) policies and realtime publication setup.

### 8.3 Reversibility Invariant
- Flipping `FLIPSWITCH_PRODUCTION_MODE` back to `false` instantly reverts the entire application back to JSON mock dummy data and local simulation, with zero residual state pollution.

---

## 9. Guided Intelligence Transparency & Open Commercial Licensing

### 9.1 Full Openness & Commercial-Use Freedom
ThreadFlow is **100% open source and unconditionally commercial-use friendly**:
- **All Code, Schemas & Adapters:** Licensed under the permissive **MIT License**.
- **Documentation & Architectural Specifications:** Licensed under **Creative Commons Attribution 4.0 (CC BY 4.0)**.
- **Commercial Rights:** Fully open. Anyone is free to fork, modify, self-host, embed, deploy, or package ThreadFlow into commercial SaaS offerings, corporate internal tools, or paid client deliverables without proprietary locks, royalties, or licensing barriers.

### 9.2 Guided Intelligence Authorship & Transparency Disclosure
The codebase and architecture were authored under the **Guided Intelligence Paradigm**—a symbiotic methodology pairing human architectural direction with generative machine synthesis. This transparency disclosure outlines to what extent each factor was involved:

1. **Foundational Thesis & Problem Definition (95% Human / 5% AI)**:
   - Conceived the core thesis ("The thread IS the SSOT").
   - Identified the 6 organizational failure modes (cognitive bifurcation, documentation drift, pinboard noise, consensus loss, detached asset feedback, retrieval friction).
2. **System Invariants & Business Logic (75% Human / 25% AI)**:
   - Formulated the strict 1-pinned-message North Star rule and atomic conflict modal.
   - Designed living thread metadata and first-class message tagging taxonomy.
   - Architected the Notion-style view model (Table, Kanban, Gantt decoupled from data).
   - Designed the WordPress-style 5-minute production flipswitch.
3. **UI/UX Patterns & Aesthetic Direction (60% Human / 40% AI)**:
   - Mandated collapsible 3-pane layout, progressive disclosure input UX, eye-safe neutral dark mode, and coordinate/timeline pinpoint media annotations.
4. **Code Scaffolding & Component Assembly (30% Human / 70% AI)**:
   - Machine synthesis of Next.js App Router boilerplate, TypeScript interfaces, Tailwind styling utilities, and adapter plumbing.
5. **Quality Verification & Edge-Case Debugging (50% Human / 50% AI)**:
   - Human identification of hydration mismatches, layout state persistence, and compilation verification paired with automated agent patching.

*Complete transparency breakdowns, legal covenants, and inbound credits are maintained in [`LEGAL.md`](/LEGAL.md) and [`LICENSE`](/LICENSE).*

---

## 10. Conclusion
ThreadFlow merges the rapid momentum of modern team chat with the rigor of structured project tracking. By treating the conversational thread as the ultimate Single Source of Truth, high-velocity teams eliminate documentation rot, eliminate context switching, and maintain transparent, auditable alignment across their entire organization.
