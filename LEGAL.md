# Guided Intelligence Transparency Statement & Open License Declaration

**Project Name:** ThreadFlow (TagChat)  
**Document Purpose:** Public Disclosure of Guided Intelligence Authoring & Open Commercial Licensing Declaration  
**Effective Date:** September 2026  
**License Status:** 100% Fully Open & Commercial-Use Friendly (MIT License & CC BY 4.0)  

---

## 1. Executive Statement: Full Openness & Commercial-Use Freedom

**ThreadFlow is completely open source and unconditionally commercial-use friendly.**

There are no commercial paywalls, proprietary locks, dual-license restrictions, or usage limitations on this codebase. Any individual, startup, non-profit, enterprise, or automated agent is free to:
- Inspect, clone, and fork the repository;
- Modify, re-architect, and extend any file, schema, or component;
- Deploy, self-host, or package ThreadFlow into commercial SaaS products, internal corporate tools, or paid client deliverables;
- Sublicense, distribute, or bundle the software into commercial offerings without royalties, licensing fees, or prior permission.

This document exists solely to provide **honest, transparent public disclosure** regarding the exact nature and extent by which this application was authored through the **Guided Intelligence Paradigm**.

---

## 2. Guided Intelligence: Authorship Nature & Transparency Disclosure

### 2.1 The Concept of Guided Intelligence
This project was authored via **Guided Intelligence**—a symbiotic engineering method where human vision, domain experience, and rigorous architectural direction are coupled with advanced generative machine synthesis.

This disclosure transparently delineates how this work came into existence, clarifying that software creation in modern eras can be both human-steered and machine-synthesized.

### 2.2 Factor Attribution: To What Extent Each Element Was Involved

The table below provides a candid, granular accounting of the division of labor and creative causality across each layer of the project:

| Subsystem / Dimension | Human Directing Architect (Principal) | Generative Synthesis Engine (AI Agent) | Resulting Factor Distribution |
|---|---|---|---|
| **Core Product Thesis & Philosophy** | • Conceived the central premise: *"The thread IS the Single Source of Truth (SSOT)"*<br>• Identified key failure modes in existing tools (cognitive bifurcation, wiki rot, pinboard noise)<br>• Defined the 6 core problem-solution pairs | • Formatted and structured the thesis arguments into standardized markdown documentation | **95% Human / 5% AI**<br>*(Conception & problem formulation strictly human-driven)* |
| **System Invariants & Business Logic** | • Mandated the strict 1-pinned-message North Star rule and atomic conflict flow<br>• Designed living thread metadata and first-class message tagging taxonomy<br>• Architected the Notion-style view model (Table, Kanban, Gantt decoupled from data)<br>• Formulated the WordPress-style 5-minute production flipswitch | • Synthesized state machines, event handlers, and data transformations enforcing the rules<br>• Implemented conflict modal logic (`ReplacePinModal`)<br>• Drafted adapter method signatures | **75% Human / 25% AI**<br>*(Axioms and invariants human-stewarded; code execution machine-assisted)* |
| **UI/UX Architecture & Layout Design** | • Mandated 3-pane layout, collapsible sidebars, progressive disclosure input UX, and eye-safe neutral dark mode<br>• Directed zero-pill discipline and visual restraint<br>• Supervised coordinate-based and timeline-based media annotation UX | • Generated Tailwind utility classes and flex/grid layouts<br>• Positioned Lucide icons and hover/focus interaction states<br>• Generated responsive UI components | **60% Human / 40% AI**<br>*(Interaction patterns and aesthetic critique human; CSS & markup synthesis AI)* |
| **Code Scaffolding & Component Assembly** | • Dictated file organization, Next.js App Router topology, and component boundaries<br>• Selected technology stack (Next.js, React, Tailwind CSS, Supabase, Lucide) | • Drafted component boilerplates, React hooks, and TypeScript type declarations<br>• Assembled JSX structures and helper utilities (`lib/chat-utils.ts`, `lib/utils.ts`) | **30% Human / 70% AI**<br>*(Structural layout human-directed; boilerplate typing machine-synthesized)* |
| **Database Schemas & Production Adapters** | • Defined entity relational models (Threads, Messages, Pins, Tags, Polls, Files)<br>• Mandated Supabase + Vercel zero-cost MVP target<br>• Specified automated idempotent database installer (`initialize()`) | • Wrote PostgreSQL DDL statements (`supabase-schema.sql`)<br>• Implemented `@supabase/supabase-js` realtime subscriptions and mock adapters | **50% Human / 50% AI**<br>*(Data contracts human-modeled; SQL and API plumbing machine-written)* |
| **Testing, Debugging & Hydration Verification** | • Identified edge-case failures (hydration mismatches, layout state persistence across routes)<br>• Demanded rigorous root-cause fixes (e.g. `useSyncExternalStore` over naive effects) | • Executed automated linter runs, TypeScript builds, and code patching passes | **50% Human / 50% AI**<br>*(Diagnosis & quality bar human-guided; compilation iteration AI-executed)* |

---

## 3. Licensing Terms: Everything Open & Commercial-Friendly

To ensure complete clarity and legal certainty, every component of ThreadFlow is released under globally recognized, maximally permissive open licenses:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          PERMISSIVE LICENSING MAP                           │
├──────────────────────────────────────┬──────────────────────────────────────┤
│               LAYER                  │          APPLICABLE LICENSE          │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ ALL Source Code (React, Next.js,     │                                      │
│ TypeScript, Tailwind CSS)            │ MIT License (Permissive, Commercial) │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ Database Schemas (PostgreSQL DDL)    │                                      │
│ & Adapter Plumbing                   │ MIT License / The Unlicense          │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ Architectural Specifications, Specs, │ Creative Commons Attribution 4.0     │
│ Documentation & System Whitepapers   │ International (CC BY 4.0)            │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ Commercial SaaS & Product Rights     │ UNRESTRICTED: 100% Free to Monetize, │
│                                      │ Host, Sell, or Embed                 │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

### 3.1 The MIT License (Applied to All Code, Schemas & Scripts)

```text
MIT License

Copyright (c) 2026 ThreadFlow Authors & Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### 3.2 Creative Commons Attribution 4.0 (Applied to Documentation & Specifications)
The architectural documents (`ARCHITECTURE_SPEC.md`, `README.md`, `TODO.md`, and design notes) are licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). You are free to share, adapt, and build upon them commercially, provided you give appropriate attribution to ThreadFlow's architectural foundation.

---

## 4. Third-Party Inbound Credits

ThreadFlow builds upon exceptional open-source ecosystems:
- **Next.js & React:** MIT License (Vercel, Inc. & Meta Platforms, Inc.)
- **Tailwind CSS:** MIT License (Tailwind Labs, Inc.)
- **Lucide Icons:** ISC License (Lucide Contributors)
- **Supabase Client (`@supabase/supabase-js`):** MIT License (Supabase, Inc.)
- **Motion (`motion/react`):** MIT License (Framer B.V.)

All third-party open-source licenses remain preserved and respected.

---

## 5. Summary

- **Everything is Open:** Zero proprietary locks.
- **Commercial-Use Friendly:** Build products, offer services, launch SaaS, or embed anywhere.
- **Transparent Authorship:** Full disclosure on the nature of Guided Intelligence and the interplay between human direction and machine synthesis.
