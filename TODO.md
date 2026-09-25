# TODO

## Messages
[ ] Multiple editors.
  * Must be set by message author.
  * Attribution in message edit history.
[ ] Markdown formatting.
[ ] Feature: add support for emoji reactions based on conventional UX patterns.

## Threads
[x] Nothing should be directly editable in the Thread Meta Data Panel.
  * They should only be modifiable in the thread settings modal. For example, this means that thread tags should not have an "x" button for its removal. And no "manage" links or buttons upfront.
[x] Thread Meta Data Panel: Tab title for message tags can just be "Tags".
[x] Thread Meta Data Panel: remove the "Message Tags" heading. Just the tag cards remaining in that tab content is fine.
[x] Thread settings modal: should be streamilned and checked to remove redundancies.
[x] Thread settings modal: consider trimming down UX verbosity in favor of more rigorous UX patterns.
[x] Thread settings modal: should list down thread members and their thread permissions.

## Link Previews
[ ] NEW: Add link preview cards in messages wherein external links are shared.

## Tagging/Mentions
[ ] Mentions: no need to put these in badges. A standard text hyperlink formal will do.

## Chat Panel
[x] Message input: shorten the placeholder text, as it overflows in smaller displays.
[x] Message input: implement progressive disclosure UX for complementary features such as image sharing, poll creation, etc. The goal is to cut it down to just the placeholder, a disclosure icon, and the send icon.

## Conversations Panel
[ ] A dedicated, default, and unpinned "Me" chat thread that's private, and only the current user can see. This follows the convention of using a default private thread for multiple documentation purposes. This inherits all capabilities of a typical thread but with all permissions granted to the current user.

## Files/Media Annotation
[x] Bug: there are two "Pin #1" in the demo content. There should only be one.
[x] Feature: add support for timeline-based annotations for audio and video files. (I remember Soundcloud had this for community commenting on uploads.)

## Architecture
[ ] Permissions: infer and streamline workspace-level, and thread level permissions. 
  * Workspace-level permission settings should live under the Workspace Settings modal.
  * Thread-level permission settings should live under the Thread Settings modal.
[ ] Thread-level: threads themselves should have links, so they can also be shared.
  * Ideally progressively disclosed in Conversation Panel cards, and Thread Title headers.

## Performance
[ ] Consider further optimizing search for improved relevance and future proofing for battle-tested performance when this is deployed to production.

## Application GUI
[x] Dark mode should have a neutral slate base and accent, instead of purple.

## UX Architecture
[x] Conversations and Thread Metadata Panel: must be collapsible.
[x] Streamline: reduce UX redundancy for clearing message tag filters. 


# WISHLIST
[x] Basic User theming (core feature under settings). 
  * Each user can theme the workspace UI based on one preferred tint color, with the app dynamically uses that as a token and gives accessibility-compliant color scheme options to apply and save.
[x] Plugins/extensions API that respects permissions
  * Internally, for use as features-as-plugins development paradigm. Externally, to cover conventional integration opportunities for third parties.
  * Dedicated extensions/plugins management UI under workspace settings modal.
  * Hot-pluggable sandbox model. Nothing breaks when a plugin is deactivated; views and dependent features gracefully degrade.
  [x] First-Party Extension: Classic Project Views for Threads
    * Architecture and UX: Heavily inspired by Notion's view-based architecture where data is decoupled from view. With native sorting and filtering.
    * Table View: A table format list of all user viewable threads with sandboxed custom status, priority, due date, start date, and thread tags.
    * Gantt View: A gantt timeline of threads as progress bars, with start and end dates defined in sandboxed custom fields.
    * Kanban View: A kanban board with threads organized into status columns, with quick status updates and priority badges.
  [x] First-Party Extension: Revamp - Custom Skins for ThreadFlow
    * Implementation: Cosmetic customization perks inspired by Discord Nitro, with per-thread customization.
    * Customizable thread cosmetic skins, custom accent hex, wallpaper patterns (Blueprint Grid, Dot Matrix, Soft Halo), glowing tag animations, and avatar halo frames.
  [x] First-Party Extension: DevOps Webhook Dispatcher & Action Tracker
    * Simulates and tests inbound CI/CD notifications (GitHub PR, Linear Issues, Cloud Build, Sentry) respecting `messages:send` permission scopes.
  [x] Dev/Production Environment "Flipswitch Feature"
    * Implemented single boolean environment flag (`NEXT_PUBLIC_ENABLE_PRODUCTION_MODE` / `FLIPSWITCH_PRODUCTION_MODE` in `lib/config/environment.ts`) set explicitly by the developer at the code level with no extraneous UI controls.
    * Integrated automated WordPress-style 5-minute install & bootstrapper (`SupabaseChatAdapter.initialize()` and `/api/production/install`): on first run in production, automatically creates/verifies PostgreSQL tables and seeds foundational project rooms, initial messages, and tag definitions.
    * Activated live Supabase Realtime WebSocket subscriptions (`postgres_changes` on `messages` and `threads`) for instant multi-client synchronization and storage bucket integration.
    * Flipping the environment switch back to Dev (`FLIPSWITCH_PRODUCTION_MODE = false`) instantly reverts to self-contained JSON mock dummy data (`MOCK_THREADS`, `MOCK_MESSAGES`) and simulated WebSockets.
    * Created production schema script (`lib/adapters/supabase-schema.sql`) tailored for zero-cost Supabase + Vercel deployment with Row Level Security (RLS) and realtime publications.
  [x] Guided Intelligence Transparency Statement & Open Commercial License
    * Authored comprehensive `LEGAL.md`, `LICENSE`, and Section 9 of `ARCHITECTURE_SPEC.md` establishing 100% open and commercial-use friendly terms (MIT License for all code, schemas, and adapters; CC BY 4.0 for specifications and docs).
    * Transparently documented the Guided Intelligence authoring nature and the exact division of labor between the human directing architect (problem formulation, foundational thesis, core invariants, UX standards) and generative synthesis engine (scaffolding, formatting, type checking).
    * Included disclaimers of warranty, limitation of liability, and third-party inbound credits.













