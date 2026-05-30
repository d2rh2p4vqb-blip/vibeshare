# VibeShare UI Redesign — Design Spec

> **Goal:** Transform VibeShare from purple-themed to modern minimalist (Linear/Vercel style) using a Slate/grayscale base with single white accent.

## Visual Identity

- **Style:** Modern minimalist — black/white/gray base, single accent, abundant whitespace
- **Reference:** Linear, Vercel, GitHub Dark Mode
- **Mood:** Calm, professional, content-first. No purple gradients, no glow effects.
- **Personality:** "The tool gets out of the way so the content shines."

## Color System

### Dark Mode (default)

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `0 0% 3.5%` (#09090b) | Page background |
| `--foreground` | `0 0% 98%` (#fafafa) | Primary text |
| `--card` | `0 0% 9.4%` (#18181b) | Card/surface background |
| `--border` | `0 0% 15.3%` (#27272a) | Borders, dividers |
| `--muted` | `0 0% 44.5%` (#71717a) | Secondary text |
| `--muted-foreground` | `0 0% 63%` (#a1a1aa) | Caption text |
| `--primary` | `0 0% 98%` (#fafafa) | Accent / active state |
| `--primary-foreground` | `0 0% 3.5%` (#09090b) | Text on accent |
| `--secondary` | `0 0% 15.3%` (#27272a) | Secondary surface |
| `--accent` | `0 0% 15.3%` (#27272a) | Hover state |

### Light Mode (secondary)

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `0 0% 98%` (#fafafa) | Page background |
| `--foreground` | `0 0% 3.5%` (#09090b) | Primary text |
| `--card` | `0 0% 100%` (#ffffff) | Card background |
| `--border` | `0 0% 89.8%` (#e5e5e5) | Borders |
| `--muted` | `0 0% 96%` (#f4f4f5) | Subtle surface |
| `--muted-foreground` | `0 0% 45%` (#71717a) | Secondary text |

## Typography

- **Font:** Inter (system default on most platforms; explicit import for next/font)
- **Scale:** Geometric progression — 12/14/16/18/24/32/48px
- **Weights:** 400 body, 500 medium, 600 headings
- **Tracking:** -0.03em H1, -0.02em H2, -0.01em H3, 0 body
- **Leading:** 1.15 H1, 1.3 body, 1.5 long-form

## Component Style

### Buttons
- **Shape:** Fully rounded (pill) — `rounded-full` / `border-radius: 999px`
- **Primary:** `bg-foreground text-background` — high contrast, solid
- **Secondary:** `bg-transparent border border-border text-foreground`
- **Size:** 14px font, 10px 24px padding (base)

### Cards
- **Border:** `border border-border` — hairline gray, no shadow
- **Hover:** `translateY(-2px)` + subtle shadow `0 4px 12px rgba(0,0,0,0.06)` + border darkens
- **Radius:** `rounded-xl` (12px)

### Inputs / Textareas
- **Border:** `border border-border` — same as cards
- **Radius:** `rounded-lg` (10px) — slightly less round than buttons
- **Focus:** `border-foreground` — border turns black on focus, no ring

### Segmented Controls (Tabs)
- **Container:** `bg-muted rounded-xl p-1` — subtle gray pill container
- **Active:** `bg-foreground text-background rounded-lg` — inverted pill
- **Inactive:** transparent text-muted

### Navigation
- **Header:** `bg-background border-b border-border` — clean top bar
- **Links:** `text-muted-foreground hover:text-foreground` — subtle ↔ visible
- **Mobile:** Sheet drawer, same styling

## Page-by-Page Changes

### Homepage (`/`)
- Hero: dark background (#09090b), large title, subtle tag badge, segmented control
- Content: #fafafa background, 3-column grid, no purple anywhere
- Loading: skeleton cards match new card style

### Project Detail (`/projects/[id]`)
- Max-width content column (720px), larger title (32px)
- Pill-shaped action buttons (like, favorite, visit)
- Prompt section: subtle card with label, monospace code
- Comments: minimal cards, username + timestamp + content

### Submit / Edit (`/submit`, `/projects/[id]/edit`)
- Centered single-column form, max-width 580px
- Clean labels, generous spacing between fields
- Submit button: full-width pill, black background

### Leaderboard (`/leaderboard`)
- Rank items: medal emoji (🥇🥈🥉) + content + score
- Segmented control for time period
- Hairline border cards, clean numbers

### Discover (`/discover`)
- Search bar: full-width, pill shape, subtle border
- Results: same card grid as homepage

### Chat, Login, Register, Settings, Notifications
- Same component system applies — borders, pills, grayscale

## Implementation Strategy

### Files to Modify

**Design tokens (2 files):**
1. `src/app/globals.css` — Replace all CSS variables (both :root and .dark)
2. `tailwind.config.ts` — Sync with new color tokens if needed

**Layout (3 files):**
3. `src/components/layout/Header.tsx` — Remove purple, use foreground/background classes
4. `src/components/layout/Footer.tsx` — Minimalist restyle
5. `src/app/layout.tsx` — Update metadata colors if any

**Project components (5 files):**
6. `src/components/project/ProjectCard.tsx` — Hairline border, lift hover, grayscale
7. `src/components/project/ProjectGrid.tsx` — No changes needed (just CSS)
8. `src/components/project/ProjectForm.tsx` — Grayscale inputs, pill button
9. `src/components/project/HotTabs.tsx` — Segmented control style
10. `src/components/project/ProjectRankItem.tsx` — Medal emojis, clean numbers
11. `src/components/project/ProjectCardSkeleton.tsx` — Match new card style

**Pages (9 files):**
12. `src/app/page.tsx` — Dark hero, grayscale
13. `src/app/projects/[id]/page.tsx` — Pill actions, clean layout
14. `src/app/projects/[id]/edit/page.tsx` — Form style (via ProjectForm)
15. `src/app/leaderboard/page.tsx` — Segmented control, ranked cards
16. `src/app/discover/page.tsx` — Grayscale inputs
17. `src/app/submit/page.tsx` — Form style (via ProjectForm)
18. `src/app/login/page.tsx` — Centered card, grayscale
19. `src/app/register/page.tsx` — Centered card, grayscale
20. `src/app/chat/page.tsx` — Grayscale styling

**UI components (1 file):**
21. `src/components/ui/button.tsx` — May need pill radius by default

### What Does NOT Change
- No new npm packages
- All routes and file names unchanged
- All API routes unchanged
- All data models unchanged
- All business logic unchanged
- Dark/light mode toggle functions as before (just new colors)

## Testing

- **Unit tests:** All 30 existing tests should pass without changes
- **E2E tests:** Update selectors if class names change
- **Visual test:** Navigate all 11 pages, verify no purple remains, check dark/light toggle
- **Mobile:** Verify hamburger menu and responsive grid work with new styles

## Rollout

1. Modify CSS variables → everything transforms globally
2. Polish individual components for new aesthetics
3. Build and test locally
4. Deploy via webhook or deploy script
5. No data migration needed — purely visual change
