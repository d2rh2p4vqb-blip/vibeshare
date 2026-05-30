# VibeShare UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform VibeShare from purple-themed to modern minimalist — Slate grayscale, pill components, dark-first.

**Architecture:** CSS-variable-driven redesign. Change design tokens in globals.css → everything transforms globally. Then polish individual components for pill buttons, hairline borders, and clean spacing.

**Tech Stack:** Tailwind CSS 3.4, shadcn/ui (base-ui), next-themes, no new dependencies.

---

### Task 1: Design Tokens — CSS Variables

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Replace CSS variables with Slate grayscale tokens**

Replace the entire `@layer base { :root { ... } .dark { ... } }` block in `src/app/globals.css`:

```css
@layer base {
  :root {
    --background: 0 0% 98%;
    --foreground: 0 0% 3.5%;
    --card: 0 0% 100%;
    --card-foreground: 0 0% 3.5%;
    --primary: 0 0% 3.5%;
    --primary-foreground: 0 0% 98%;
    --secondary: 0 0% 96%;
    --secondary-foreground: 0 0% 3.5%;
    --muted: 0 0% 96%;
    --muted-foreground: 0 0% 45%;
    --accent: 0 0% 96%;
    --accent-foreground: 0 0% 3.5%;
    --border: 0 0% 89.8%;
    --input: 0 0% 89.8%;
    --ring: 0 0% 3.5%;
    --radius: 0.75rem;
  }

  .dark {
    --background: 0 0% 3.5%;
    --foreground: 0 0% 98%;
    --card: 0 0% 6%;
    --card-foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 0 0% 3.5%;
    --secondary: 0 0% 15.3%;
    --secondary-foreground: 0 0% 98%;
    --muted: 0 0% 15.3%;
    --muted-foreground: 0 0% 63%;
    --accent: 0 0% 15.3%;
    --accent-foreground: 0 0% 98%;
    --border: 0 0% 15.3%;
    --input: 0 0% 15.3%;
    --ring: 0 0% 98%;
  }
}
```

Current file state (lines 1-29):
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --primary: 262 83% 58%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 262 83% 58%;
    --radius: 0.75rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --primary: 262 83% 58%;
    --primary-foreground: 210 40% 98%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 262 83% 58%;
  }
}
```

- [ ] **Step 2: Run TypeScript check**

```bash
npx tsc --noEmit
```
Expected: No output (clean)

- [ ] **Step 3: Run tests to confirm nothing broke**

```bash
npx vitest run
```
Expected: 5 passed, 30 tests passed

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: replace purple theme with Slate grayscale design tokens"
```

---

### Task 2: Homepage — Dark Hero + Grayscale

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/layout.tsx` (remove hardcoded bg-white if any)

- [ ] **Step 1: Update homepage hero to dark background**

In `src/app/page.tsx`, replace the hero section:

Old:
```tsx
<section className="text-center py-8 md:py-12 mb-6 md:mb-8">
  <h1 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4">发现 Vibecoding 佳作</h1>
  <p className="text-muted-foreground text-base md:text-lg">看看大家都用 AI 创造了什么</p>
</section>
```

New:
```tsx
<section className="text-center py-16 md:py-24 mb-6 md:mb-8 bg-foreground text-background -mx-4 px-4">
  <div className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-white/60 text-xs tracking-widest uppercase mb-6">
    AI Creation Showcase
  </div>
  <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">
    发现 Vibecoding 佳作
  </h1>
  <p className="text-white/50 text-base md:text-lg max-w-md mx-auto mb-8">
    AI 创造的灵感在这里汇聚，发现最棒的作品
  </p>
  <SegmentedControl value={sort} onChange={setSort} />
</section>
```

- [ ] **Step 2: Add SegmentedControl inline component at top of the file**

Add right after imports:

```tsx
function SegmentedControl({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: "hot" | "newest") => void;
}) {
  return (
    <div className="inline-flex gap-0.5 bg-white/10 p-1 rounded-xl">
      <button
        onClick={() => onChange("hot")}
        className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
          value === "hot"
            ? "bg-background text-foreground"
            : "text-white/50 hover:text-white/80"
        }`}
      >
        热门
      </button>
      <button
        onClick={() => onChange("newest")}
        className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
          value === "newest"
            ? "bg-background text-foreground"
            : "text-white/50 hover:text-white/80"
        }`}
      >
        最新
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Remove the old sort buttons from the JSX**

Remove this block:
```tsx
<div className="flex justify-center gap-4 mb-8">
  <Button variant={sort === "hot" ? "default" : "outline"} onClick={() => setSort("hot")}>热门</Button>
  <Button variant={sort === "newest" ? "default" : "outline"} onClick={() => setSort("newest")}>最新</Button>
</div>
```

Also remove the unused `Button` import and add `SegmentedControl` usage.

- [ ] **Step 4: TypeCheck and run tests**

```bash
npx tsc --noEmit && npx vitest run
```
Expected: Clean types, 30 passed

- [ ] **Step 5: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: dark hero section with segmented control on homepage"
```

---

### Task 3: Header — Clean Top Bar

**Files:**
- Modify: `src/components/layout/Header.tsx`

- [ ] **Step 1: Change logo from purple to foreground**

In `src/components/layout/Header.tsx`, change the logo link:

Old:
```tsx
<Link href="/" className="text-xl font-bold text-primary">
  VibeShare
</Link>
```

New:
```tsx
<Link href="/" className="text-lg font-semibold tracking-tight text-foreground">
  VibeShare
</Link>
```

- [ ] **Step 2: Change submit button from outline to solid black**

Old:
```tsx
<Button variant="outline" size="sm" onClick={() => router.push("/submit")}>
  提交作品
</Button>
```

New:
```tsx
<Button
  size="sm"
  className="rounded-full px-5 bg-foreground text-background hover:bg-foreground/90"
  onClick={() => router.push("/submit")}
>
  提交作品
</Button>
```

- [ ] **Step 3: Ensure header uses bg-background (already done)**

Verify the header has `bg-background border-b` (already set from dark mode work). If header still has `bg-white`, replace with `bg-background`.

- [ ] **Step 4: TypeCheck**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/Header.tsx
git commit -m "feat: clean header — no purple, pill submit button"
```

---

### Task 4: ProjectCard — Hairline Border + Lift Hover

**Files:**
- Modify: `src/components/project/ProjectCard.tsx`
- Modify: `src/components/project/ProjectCardSkeleton.tsx`

- [ ] **Step 1: Update ProjectCard styling**

Replace the Card wrapper in `ProjectCard.tsx`:

Old:
```tsx
<Link href={`/projects/${project.id}`}>
  <Card className="hover:shadow-md transition-shadow h-full">
```

New:
```tsx
<Link href={`/projects/${project.id}`}>
  <Card className="border border-border shadow-none hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:border-border/80 transition-all duration-200 h-full">
```

- [ ] **Step 2: Remove purple badge, use muted foreground**

Old:
```tsx
<Badge variant="secondary" className="text-xs shrink-0 ml-2">{project.type}</Badge>
```

New:
```tsx
<span className="text-xs text-muted-foreground shrink-0 ml-2">{project.type}</span>
```

Similarly, replace tool Badge tags:

Old:
```tsx
<Badge key={tool} variant="outline" className="text-xs">{tool}</Badge>
```

New:
```tsx
<span key={tool} className="px-2 py-0.5 bg-muted text-muted-foreground rounded-md text-xs">{tool}</span>
```

- [ ] **Step 3: Update ProjectCardSkeleton to match**

Replace the Skeleton wrapper in `ProjectCardSkeleton.tsx`:

Old:
```tsx
<Card className="h-full">
  <Skeleton className="w-full h-40 rounded-t-xl" />
```

New:
```tsx
<Card className="h-full border border-border shadow-none">
  <Skeleton className="w-full h-40 rounded-t-xl bg-muted" />
```

Also add `bg-muted` to all Skeleton components in the file.

- [ ] **Step 4: TypeCheck**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add src/components/project/ProjectCard.tsx src/components/project/ProjectCardSkeleton.tsx
git commit -m "feat: hairline border cards with lift hover, remove purple badges"
```

---

### Task 5: Project Detail — Pill Actions + Clean Layout

**Files:**
- Modify: `src/app/projects/[id]/page.tsx`

- [ ] **Step 1: Update action buttons to pill style**

Old:
```tsx
<Button variant="outline" size="sm" onClick={handleLike}>❤️ {formatNumber(project.likeCount)}</Button>
<Button variant="outline" size="sm" onClick={handleFavorite}>⭐ {formatNumber(project.favoriteCount)}</Button>
```

New:
```tsx
<button
  onClick={handleLike}
  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border text-sm text-muted-foreground hover:border-foreground hover:text-foreground transition-all"
>
  ▲ {formatNumber(project.likeCount)} <span className="hidden sm:inline">点赞</span>
</button>
<button
  onClick={handleFavorite}
  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border text-sm text-muted-foreground hover:border-foreground hover:text-foreground transition-all"
>
  ★ <span className="hidden sm:inline">收藏</span>
</button>
```

- [ ] **Step 2: Update Edit and Visit buttons similarly**

Old:
```tsx
<Button variant="ghost" size="sm" onClick={() => router.push(`/projects/${project.id}/edit`)}>
  <Pencil className="size-4 mr-1" /> 编辑
</Button>
```

New:
```tsx
<button
  onClick={() => router.push(`/projects/${project.id}/edit`)}
  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border text-sm text-muted-foreground hover:border-foreground hover:text-foreground transition-all"
>
  <Pencil className="size-4" /> 编辑
</button>
```

- [ ] **Step 3: Remove unused Button imports if no longer needed**

Check that `Button` from `@/components/ui/button` is still used. If all buttons were replaced with `<button>`, remove the import.

- [ ] **Step 4: TypeCheck**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add src/app/projects/\[id\]/page.tsx
git commit -m "feat: pill-shaped action buttons on project detail page"
```

---

### Task 6: Leaderboard — Medal Emoji + Segmented Control

**Files:**
- Modify: `src/app/leaderboard/page.tsx`
- Modify: `src/components/project/ProjectRankItem.tsx`
- Modify: `src/components/project/HotTabs.tsx`

- [ ] **Step 1: Rewrite HotTabs as segmented control**

Replace `src/components/project/HotTabs.tsx` entirely:

```tsx
"use client";

interface HotTabsProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

export function HotTabs({ value, onChange, options }: HotTabsProps) {
  return (
    <div className="inline-flex gap-0.5 bg-muted p-1 rounded-xl">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            value === opt.value
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Update ProjectRankItem to use clean layout**

Replace the component in `ProjectRankItem.tsx`:

```tsx
import Link from "next/link";
import { formatNumber } from "@/lib/utils";

const MEDALS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

export function ProjectRankItem({ project }: { project: any }) {
  const medal = MEDALS[project.rank] || `#${project.rank}`;

  return (
    <Link href={`/projects/${project.id}`}>
      <div className="flex items-center gap-4 p-4 border border-border rounded-xl hover:border-foreground/20 hover:-translate-y-0.5 transition-all duration-200 bg-card">
        <span className="text-2xl w-10 text-center shrink-0">{medal}</span>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{project.title}</h3>
          <p className="text-sm text-muted-foreground truncate">{project.summary}</p>
        </div>
        <div className="text-right shrink-0">
          <div className="font-semibold text-foreground tabular-nums">
            {formatNumber(Math.floor(project.hotScore))}
          </div>
          <div className="text-xs text-muted-foreground">热度分</div>
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 3: TypeCheck**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/components/project/HotTabs.tsx src/components/project/ProjectRankItem.tsx
git commit -m "feat: segmented control tabs and medal emoji rank items"
```

---

### Task 7: Forms — Grayscale Inputs + Pill Buttons

**Files:**
- Modify: `src/components/project/ProjectForm.tsx`
- Modify: `src/app/login/page.tsx`
- Modify: `src/app/register/page.tsx`

- [ ] **Step 1: Update ProjectForm submit button**

In `ProjectForm.tsx`, find the submit button and replace:

Old:
```tsx
<Button type="submit" disabled={isSubmitting} className="w-full">
  {isSubmitting ? "保存中..." : isEdit ? "保存修改" : "发布作品"}
</Button>
```

New:
```tsx
<button
  type="submit"
  disabled={isSubmitting}
  className="w-full py-3 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
>
  {isSubmitting ? "保存中..." : isEdit ? "保存修改" : "发布作品"}
</button>
```

- [ ] **Step 2: Update Login page button**

In `login/page.tsx`, find the submit Button:

Old:
```tsx
<Button type="submit" className="w-full" disabled={loading}>
  {loading ? "登录中..." : "登录"}
</Button>
```

New:
```tsx
<button
  type="submit"
  disabled={loading}
  className="w-full py-3 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
>
  {loading ? "登录中..." : "登录"}
</button>
```

- [ ] **Step 3: Update Register page button similarly**

Same change as login page — replace `<Button type="submit" ...>` with pill `<button>`.

- [ ] **Step 4: TypeCheck**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add src/components/project/ProjectForm.tsx src/app/login/page.tsx src/app/register/page.tsx
git commit -m "feat: pill submit buttons on forms, grayscale inputs"
```

---

### Task 8: Discover, Chat, Footer — Polish

**Files:**
- Modify: `src/app/discover/page.tsx`
- Modify: `src/components/layout/Footer.tsx`
- Modify: `src/app/chat/page.tsx`

- [ ] **Step 1: Discover page — pill search input**

In `discover/page.tsx`, update the search input and button:

Old:
```tsx
<Input placeholder="搜索作品..." value={q} onChange={(e) => setQ(e.target.value)}
  onKeyDown={(e) => e.key === "Enter" && setSearchQuery(q)} />
<Button onClick={() => setSearchQuery(q)}>搜索</Button>
```

New:
```tsx
<div className="flex gap-3">
  <input
    placeholder="搜索作品..."
    value={q}
    onChange={(e) => setQ(e.target.value)}
    onKeyDown={(e) => e.key === "Enter" && setSearchQuery(q)}
    className="flex-1 px-5 py-3 rounded-full border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground transition-colors"
  />
  <button
    onClick={() => setSearchQuery(q)}
    className="px-6 py-3 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity"
  >
    搜索
  </button>
</div>
```

Remove unused `Input` and `Button` imports if no longer needed elsewhere in the file.

- [ ] **Step 2: Footer — clean typography**

In `Footer.tsx`, ensure it uses `text-muted-foreground` and `border-border`:

```tsx
export function Footer() {
  const icpNumber = process.env.NEXT_PUBLIC_ICP_NUMBER;

  return (
    <footer className="border-t border-border mt-16 py-8 text-center text-sm text-muted-foreground">
      <p>VibeShare — 分享 Vibecoding 创造的每一份灵感</p>
      <p className="mt-1">&copy; {new Date().getFullYear()} VibeShare. Built with AI.</p>
      {icpNumber && (
        <p className="mt-2">
          <a href="https://beian.miit.gov.cn" target="_blank" rel="noopener noreferrer" className="hover:underline">
            {icpNumber}
          </a>
        </p>
      )}
    </footer>
  );
}
```

(Already correct from earlier work — verify and add `border-border` if missing.)

- [ ] **Step 3: TypeCheck**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/app/discover/page.tsx src/components/layout/Footer.tsx
git commit -m "feat: pill search input on discover, clean footer"
```

---

### Task 9: Final Polish — Verify All Pages

**Files:**
- Verify all 11 pages

- [ ] **Step 1: Run full test suite**

```bash
npx vitest run
```
Expected: 5 passed, 30 tests passed

- [ ] **Step 2: TypeCheck entire project**

```bash
npx tsc --noEmit
```
Expected: No output

- [ ] **Step 3: Search for remaining purple references**

```bash
grep -rn "primary" src/app/globals.css src/components/ src/app/ --include="*.tsx" --include="*.css" 2>/dev/null | grep -v "primary-foreground" | grep -v "node_modules"
grep -rn "#7c3aed\|262 83%\|text-primary" src/ --include="*.tsx" --include="*.css" 2>/dev/null | grep -v node_modules
```
Expected: No `text-primary` or `#7c3aed` or `262 83%` references in source files (globals.css defines `--primary` as grayscale now, which is fine).

- [ ] **Step 4: Commit any remaining fixes**

```bash
git add -A && git commit -m "chore: final purple cleanup and grayscale polish"
```

---

### Task 10: Deploy

**Files:**
- Deploy to server

- [ ] **Step 1: Sync all changes to server**

```bash
tar czf - src/ tests/ package.json \
    --exclude='node_modules' --exclude='.next' --exclude='.git' \
    | ssh -i "$HOME/.ssh/id_ed25519_vibeshare" -o StrictHostKeyChecking=no root@124.221.163.150 \
    "cd /opt/vibeshare && tar xzf - && echo 'Synced'"
```

- [ ] **Step 2: Build and restart on server**

```bash
ssh -i "$HOME/.ssh/id_ed25519_vibeshare" -o StrictHostKeyChecking=no root@124.221.163.150 \
  "cd /opt/vibeshare && rm -rf .next && npm run build 2>&1 | tail -5 && pm2 restart vibeshare 2>&1 | tail -5"
```

- [ ] **Step 3: Verify deployment**

```bash
ssh -i "$HOME/.ssh/id_ed25519_vibeshare" -o StrictHostKeyChecking=no root@124.221.163.150 \
  "sleep 3 && curl -s -o /dev/null -w '%{http_code}' http://localhost:3000 && echo ' - OK'"
```
Expected: `200 - OK`

- [ ] **Step 4: Commit deploy log**

```bash
git add -A && git commit -m "chore: deploy UI redesign to production"
```
