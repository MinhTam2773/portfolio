# CLAUDE.md

## Behavioral guidelines (baseline)

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

### 1. Think Before Coding
**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First
**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

### 3. Surgical Changes
**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution
**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

## Repository-specific instructions (this project)

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

### Commands
```bash
npm run dev       # Start Next.js dev server (localhost:3000)
npm run build     # Production build
npm run lint      # ESLint check
npx convex dev    # Start Convex backend dev server (run alongside Next.js)
npx convex deploy # Deploy Convex functions to production
```

### Environment Variables
Requires a `.env.local` file with:
```
NEXT_PUBLIC_CONVEX_URL=<your-convex-deployment-url>
```

### Architecture
**Next.js 16 App Router** portfolio site with a **Convex** real-time backend.

#### Routing
- `app/page.tsx` — single-page home with all portfolio sections rendered in order
- `app/[slug]/page.tsx` — dynamic project detail pages, resolved from `lib/projectsData.ts`
- `app/layout.tsx` — wraps everything in `ConvexClientProvider`

#### Data Flow
- **Project data** is static: defined in `lib/projectsData.ts` as a `Project[]` array using the `types/project.ts` interface. Adding a project means adding an entry here.
- **Portfolio stats** (views + likes) are stored in Convex. `convex/schema.ts` defines a single `stats` table keyed by string. `convex/stats.ts` has `get`, `incrementView`, and `incrementLike` functions used in the frontend via `useQuery`/`useMutation`.

#### Key Conventions
- `@/` path alias maps to project root (configured in `tsconfig.json`)
- Animations use **Framer Motion** (`framer-motion`)
- Styling is **Tailwind CSS v4** (PostCSS-based config via `postcss.config.mjs`)
- Icons from both **Lucide React** and **React Icons**
- `components/` holds shared UI: `Navigation`, `Footer`, `PageTransition`, `ScrollReveal`, `ProjectHeroCarousel`, `KeepExploringCarousel`
- `app/sections/` holds the home page sections: `Hero`, `Projects`, `TechArsenal`, `ProfessionalJourney`, `Education`

#### Project Detail Pages
The `[slug]/page.tsx` page looks up the project from `projectsData`, then scans `public/projects/<slug>/` for gallery images at build/request time using `fs.readdir`. Gallery images must be placed in that directory and named numerically for correct sort order.

The `isProtected` flag on a project hides the GitHub link and shows a shield icon instead.