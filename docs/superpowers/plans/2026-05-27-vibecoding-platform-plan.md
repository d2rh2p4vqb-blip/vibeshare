# Vibecoding 作品分享平台 — 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个类 Product Hunt + GitHub 的 Vibecoding 作品分享社区，含注册登录、作品 CRUD、社交互动、排行榜、实时群聊。

**Architecture:** Next.js App Router 全栈单体应用，Prisma ORM 连接 PostgreSQL，NextAuth Credentials 认证，Pusher 实时通信，Cloudflare R2 图片存储，Tailwind + shadcn/ui 样式。

**Tech Stack:** Next.js 14, TypeScript, PostgreSQL, Prisma, NextAuth.js, Tailwind CSS, shadcn/ui, Pusher, Cloudflare R2, TanStack Query, React Hook Form + Zod, Vitest, Playwright

---

## 文件结构总览

```
src/
├── app/
│   ├── layout.tsx                          # 根布局(Header + Providers)
│   ├── page.tsx                            # 首页热门/最新瀑布流
│   ├── globals.css                         # Tailwind + 自定义变量
│   ├── discover/page.tsx                   # 发现页(搜索+筛选)
│   ├── leaderboard/page.tsx                # 排行榜(日/周/月/总)
│   ├── submit/page.tsx                     # 提交/编辑作品
│   ├── projects/[id]/page.tsx              # 作品详情
│   ├── [username]/page.tsx                 # 个人主页
│   ├── chat/page.tsx                       # 群聊列表
│   ├── chat/[roomId]/page.tsx              # 聊天室
│   ├── notifications/page.tsx              # 通知中心
│   ├── login/page.tsx                      # 登录
│   ├── register/page.tsx                   # 注册
│   ├── settings/page.tsx                   # 设置
│   └── api/
│       ├── auth/register/route.ts
│       ├── auth/login/route.ts
│       ├── auth/logout/route.ts
│       ├── projects/route.ts
│       ├── projects/[id]/route.ts
│       ├── projects/[id]/like/route.ts
│       ├── projects/[id]/favorite/route.ts
│       ├── projects/[id]/comments/route.ts
│       ├── users/[username]/route.ts
│       ├── users/[username]/projects/route.ts
│       ├── users/[username]/follow/route.ts
│       ├── settings/route.ts
│       ├── leaderboard/route.ts
│       ├── search/route.ts
│       ├── notifications/route.ts
│       ├── notifications/[id]/read/route.ts
│       ├── notifications/read-all/route.ts
│       ├── chat/rooms/route.ts
│       ├── chat/rooms/[id]/route.ts
│       ├── chat/rooms/[id]/messages/route.ts
│       ├── chat/rooms/[id]/join/route.ts
│       ├── chat/rooms/[id]/leave/route.ts
│       └── upload/route.ts
├── components/
│   ├── layout/Header.tsx, Footer.tsx, Providers.tsx
│   ├── project/ProjectCard.tsx, ProjectGrid.tsx, ProjectRankItem.tsx, HotTabs.tsx, ProjectForm.tsx
│   ├── chat/ChatRoomList.tsx, ChatWindow.tsx, MessageBubble.tsx, CreateRoomModal.tsx
│   ├── user/UserCard.tsx, UserAvatar.tsx, FollowButton.tsx
│   └── ui/ (shadcn/ui 自动生成)
├── lib/
│   ├── prisma.ts, auth.ts, pusher.ts, hot-score.ts, validations.ts, utils.ts
└── hooks/
    ├── useChat.ts, useNotifications.ts, useInfiniteScroll.ts
```

---

### Task 1: 项目初始化与依赖安装

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.js`, `tailwind.config.ts`, `postcss.config.js`
- Create: `src/app/globals.css`, `src/app/layout.tsx` (minimal)
- Create: `.env`, `.env.example`

- [ ] **Step 1: 创建 Next.js 项目**

```bash
cd C:/Users/Administrator/Desktop/cc
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack --use-npm
```

- [ ] **Step 2: 安装核心依赖**

```bash
npm install prisma @prisma/client next-auth@beta @auth/prisma-adapter bcryptjs pusher pusher-js @tanstack/react-query react-hook-form @hookform/resolvers zod date-fns @aws-sdk/client-s3 @aws-sdk/lib-storage
```

- [ ] **Step 3: 安装开发依赖**

```bash
npm install -D @types/bcryptjs vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom eslint-plugin-jest-dom
```

- [ ] **Step 4: 初始化 shadcn/ui**

```bash
npx shadcn-ui@latest init -d
npx shadcn-ui@latest add button input textarea dialog dropdown-menu avatar badge card tabs select separator sheet skeleton toast tooltip scroll-area
```

- [ ] **Step 5: 初始化 Prisma**

```bash
npx prisma init --datasource-provider postgresql
```

- [ ] **Step 6: 创建 .env.example**

```
DATABASE_URL="postgresql://user:password@localhost:5432/vibecoding"
AUTH_SECRET="generate-with: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
PUSHER_APP_ID=""
PUSHER_KEY=""
PUSHER_SECRET=""
PUSHER_CLUSTER=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET_NAME=""
R2_ENDPOINT=""
```

- [ ] **Step 7: 提交**

```bash
git add -A && git commit -m "chore: scaffold next.js project with dependencies"
```

---

### Task 2: 数据库 Schema 与 Prisma 迁移

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `src/lib/prisma.ts`

- [ ] **Step 1: 编写完整 Prisma Schema**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String   @id @default(cuid())
  username     String   @unique
  email        String   @unique
  passwordHash String
  displayName  String?
  bio          String?
  avatarUrl    String?
  githubUrl    String?
  twitterUrl   String?
  websiteUrl   String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  projects      Project[]
  likes         Like[]
  favorites     Favorite[]
  comments      Comment[]
  followers     Follow[]  @relation("Following")
  following     Follow[]  @relation("Follower")
  notifications Notification[]
  chatMessages  ChatMessage[]
  chatRooms     ChatRoom[]  @relation("RoomCreator")
}

model Project {
  id            String     @id @default(cuid())
  title         String
  description   String
  summary       String
  type          ProjectType
  category      String?
  websiteUrl    String?
  githubUrl     String?
  tools         String[]
  prompts       String?
  thumbnailUrl  String?
  screenshots   String[]
  authorId      String
  hotScore      Float      @default(0)
  likeCount     Int        @default(0)
  commentCount  Int        @default(0)
  favoriteCount Int        @default(0)
  viewCount     Int        @default(0)
  status        ProjectStatus @default(PUBLISHED)
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  author    User       @relation(fields: [authorId], references: [id])
  likes     Like[]
  favorites Favorite[]
  comments  Comment[]

  @@index([hotScore])
  @@index([authorId])
  @@index([status])
}

enum ProjectType {
  WEBSITE
  APP
  TOOL
  OTHER
}

enum ProjectStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

model Like {
  id        String   @id @default(cuid())
  userId    String
  projectId String
  createdAt DateTime @default(now())

  user    User    @relation(fields: [userId], references: [id])
  project Project @relation(fields: [projectId], references: [id])

  @@unique([userId, projectId])
}

model Favorite {
  id        String   @id @default(cuid())
  userId    String
  projectId String
  createdAt DateTime @default(now())

  user    User    @relation(fields: [userId], references: [id])
  project Project @relation(fields: [projectId], references: [id])

  @@unique([userId, projectId])
}

model Follow {
  id          String   @id @default(cuid())
  followerId  String
  followingId String
  createdAt   DateTime @default(now())

  follower  User @relation("Follower", fields: [followerId], references: [id])
  following User @relation("Following", fields: [followingId], references: [id])

  @@unique([followerId, followingId])
}

model Comment {
  id        String    @id @default(cuid())
  content   String
  userId    String
  projectId String
  parentId  String?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  user     User      @relation(fields: [userId], references: [id])
  project  Project   @relation(fields: [projectId], references: [id])
  parent   Comment?  @relation("CommentReplies", fields: [parentId], references: [id])
  replies  Comment[] @relation("CommentReplies")
}

model Notification {
  id        String   @id @default(cuid())
  userId    String
  type      NotifType
  message   String
  isRead    Boolean  @default(false)
  linkUrl   String?
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id])
}

enum NotifType {
  LIKE
  COMMENT
  FOLLOW
  FAVORITE
}

model ChatRoom {
  id          String   @id @default(cuid())
  name        String
  description String?
  creatorId   String
  isPublic    Boolean  @default(true)
  memberCount Int      @default(1)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  creator  User          @relation("RoomCreator", fields: [creatorId], references: [id])
  messages ChatMessage[]
}

model ChatMessage {
  id        String   @id @default(cuid())
  roomId    String
  userId    String
  content   String
  createdAt DateTime @default(now())

  room ChatRoom @relation(fields: [roomId], references: [id])
  user User     @relation(fields: [userId], references: [id])

  @@index([roomId, createdAt])
}

model LeaderboardSnapshot {
  id        String   @id @default(cuid())
  period    String
  date      DateTime
  rank      Int
  projectId String
  hotScore  Float

  @@index([period, date])
}
```

- [ ] **Step 2: 创建 Prisma 客户端单例**

File: `src/lib/prisma.ts`
```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

- [ ] **Step 3: 运行迁移**

```bash
npx prisma migrate dev --name init
```

- [ ] **Step 4: 提交**

```bash
git add prisma src/lib/prisma.ts && git commit -m "feat: add database schema and prisma client"
```

---

### Task 3: 认证系统

**Files:**
- Create: `src/lib/auth.ts`, `src/app/api/auth/register/route.ts`, `src/app/api/auth/login/route.ts`, `src/app/api/auth/logout/route.ts`
- Create: `src/middleware.ts`, `src/hooks/useAuth.ts`, `src/components/layout/Providers.tsx`

- [ ] **Step 1: 编写认证核心库**

File: `src/lib/auth.ts`
```typescript
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = credentials.email as string;
        const password = credentials.password as string;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.username,
          image: user.avatarUrl,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        (session.user as any).username = token.name;
      }
      return session;
    },
  },
});
```

- [ ] **Step 2: 创建注册 API**

File: `src/app/api/auth/register/route.ts`
```typescript
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const registerSchema = z.object({
  username: z.string().min(3).max(20).regex(/^[a-zA-Z0-9_]+$/),
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(1).max(50).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "输入数据不合法", code: "VALIDATION_ERROR", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { username, email, password, displayName } = parsed.data;

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) {
      return NextResponse.json(
        { error: existing.email === email ? "邮箱已被注册" : "用户名已被占用", code: "DUPLICATE" },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.create({
      data: { username, email, passwordHash, displayName },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "服务器错误", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 3: 创建登录 API**

File: `src/app/api/auth/login/route.ts`
```typescript
import { signIn } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    const result = await signIn("credentials", { email, password, redirect: false });

    if (result?.error) {
      return NextResponse.json(
        { error: "邮箱或密码错误", code: "INVALID_CREDENTIALS" },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "服务器错误", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
```

Note: For NextAuth v5 (beta), use `signIn` from `@/lib/auth`. For v4 stable, use the `/api/auth/[...nextauth]` catch-all pattern instead. Adjust based on installed version.

- [ ] **Step 4: 创建登出 API**

File: `src/app/api/auth/logout/route.ts`
```typescript
import { signOut } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST() {
  await signOut({ redirect: false });
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 5: 创建认证中间件**

File: `src/middleware.ts`
```typescript
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const protectedPaths = ["/submit", "/settings", "/chat", "/notifications"];

export default auth((req) => {
  const path = req.nextUrl.pathname;
  const isProtected = protectedPaths.some((p) => path.startsWith(p));
  if (isProtected && !req.auth) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next|static|favicon.ico).*)"],
};
```

- [ ] **Step 6: 创建 Providers 组件 (TanStack Query + Auth)**

File: `src/components/layout/Providers.tsx`
```typescript
"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </SessionProvider>
  );
}
```

- [ ] **Step 7: 创建 useAuth Hook**

File: `src/hooks/useAuth.ts`
```typescript
"use client";
import { useSession } from "next-auth/react";

export function useAuth() {
  const { data: session, status } = useSession();
  return {
    user: session?.user ?? null,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
  };
}
```

- [ ] **Step 8: 注册与登录页面**

File: `src/app/login/page.tsx`
```typescript
"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", { email, password, redirect: false });
    if (result?.error) {
      setError("邮箱或密码错误");
      setLoading(false);
    } else {
      router.push("/");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">登录</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input type="email" placeholder="邮箱" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input type="password" placeholder="密码" value={password} onChange={(e) => setPassword(e.target.value)} required />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "登录中..." : "登录"}
            </Button>
          </form>
          <p className="text-center text-sm mt-4">
            还没有账号？<Link href="/register" className="text-blue-600 hover:underline">注册</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
```

File: `src/app/register/page.tsx`
```typescript
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", email: "", password: "", displayName: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "注册失败");
      setLoading(false);
      return;
    }
    router.push("/login");
  }

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">注册</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input placeholder="用户名 (3-20位字母数字)" value={form.username} onChange={(e) => update("username", e.target.value)} required />
            <Input placeholder="昵称 (可选)" value={form.displayName} onChange={(e) => update("displayName", e.target.value)} />
            <Input type="email" placeholder="邮箱" value={form.email} onChange={(e) => update("email", e.target.value)} required />
            <Input type="password" placeholder="密码 (至少8位)" value={form.password} onChange={(e) => update("password", e.target.value)} required />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "注册中..." : "注册"}
            </Button>
          </form>
          <p className="text-center text-sm mt-4">
            已有账号？<Link href="/login" className="text-blue-600 hover:underline">登录</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 9: 更新根布局包装 Providers**

Modify: `src/app/layout.tsx`
```typescript
import type { Metadata } from "next";
import { Providers } from "@/components/layout/Providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "VibeShare - Vibecoding 作品分享社区",
  description: "分享你用 AI 创造的作品，发现更多灵感",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-background antialiased">
        <Providers>
          <Header />
          <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 10: 提交**

```bash
git add src/lib/auth.ts src/app/api/auth/ src/middleware.ts src/components/layout/Providers.tsx src/hooks/useAuth.ts src/app/login/ src/app/register/ src/app/layout.tsx
git commit -m "feat: add authentication system with register/login"
```

---

### Task 4: 布局组件 (Header + Footer + 全局样式)

**Files:**
- Create: `src/components/layout/Header.tsx`, `src/components/layout/Footer.tsx`
- Create: `src/components/user/UserAvatar.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: 全局样式变量**

Ensure `src/app/globals.css`:
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
}

@layer base {
  * { @apply border-border; }
  body { @apply bg-background text-foreground; }
}
```

- [ ] **Step 2: Header 组件**

File: `src/components/layout/Header.tsx`
```typescript
"use client";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { UserAvatar } from "@/components/user/UserAvatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export function Header() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  return (
    <header className="border-b sticky top-0 bg-white z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold text-primary">
            VibeShare
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/discover" className="hover:text-primary transition-colors">发现</Link>
            <Link href="/leaderboard" className="hover:text-primary transition-colors">排行榜</Link>
            <Link href="/chat" className="hover:text-primary transition-colors">聊天</Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => router.push("/submit")}>
            提交作品
          </Button>
          {isLoading ? null : isAuthenticated ? (
            <>
              <Link href="/notifications">
                <Button variant="ghost" size="icon">🔔</Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <UserAvatar user={user!} size="sm" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push(`/${(user as any)?.username}`)}>
                    个人主页
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/settings")}>
                    设置
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut()}>登出</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => router.push("/login")}>登录</Button>
              <Button size="sm" onClick={() => router.push("/register")}>注册</Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 3: Footer 组件**

File: `src/components/layout/Footer.tsx`
```typescript
export function Footer() {
  return (
    <footer className="border-t mt-16 py-8 text-center text-sm text-muted-foreground">
      <p>VibeShare — 分享 Vibecoding 创造的每一份灵感</p>
      <p className="mt-1">&copy; {new Date().getFullYear()} VibeShare. Built with AI.</p>
    </footer>
  );
}
```

- [ ] **Step 4: UserAvatar 组件**

File: `src/components/user/UserAvatar.tsx`
```typescript
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface UserAvatarProps {
  user: { name?: string | null; email?: string | null; image?: string | null };
  size?: "sm" | "md" | "lg";
}

const sizeMap = { sm: "h-8 w-8", md: "h-10 w-10", lg: "h-16 w-16" };

export function UserAvatar({ user, size = "md" }: UserAvatarProps) {
  const initials = (user.name || user.email || "U").slice(0, 2).toUpperCase();
  return (
    <Avatar className={sizeMap[size]}>
      <AvatarImage src={user.image || undefined} />
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
}
```

- [ ] **Step 5: 提交**

```bash
git add src/app/globals.css src/components/layout/Header.tsx src/components/layout/Footer.tsx src/components/user/UserAvatar.tsx
git commit -m "feat: add layout components and global styles"
```

---

### Task 5: 作品列表 API 与首页

**Files:**
- Create: `src/app/api/projects/route.ts`, `src/app/page.tsx`
- Create: `src/components/project/ProjectCard.tsx`, `src/components/project/ProjectGrid.tsx`
- Create: `src/lib/utils.ts`

- [ ] **Step 1: 工具函数**

File: `src/lib/utils.ts`
```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number): string {
  if (n >= 10000) return (n / 10000).toFixed(1) + "万";
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return n.toString();
}

export function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "刚刚";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}天前`;
  return date.toLocaleDateString("zh-CN");
}
```

- [ ] **Step 2: 作品列表 API**

File: `src/app/api/projects/route.ts`
```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sort = searchParams.get("sort") || "hot";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
  const type = searchParams.get("type") || undefined;
  const category = searchParams.get("category") || undefined;
  const tool = searchParams.get("tool") || undefined;

  const where: any = { status: "PUBLISHED" };
  if (type && type !== "all") where.type = type.toUpperCase();
  if (category) where.category = category;
  if (tool) where.tools = { has: tool };

  const orderBy: any = sort === "newest"
    ? { createdAt: "desc" }
    : { hotScore: "desc" };

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        author: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
      },
    }),
    prisma.project.count({ where }),
  ]);

  return NextResponse.json({
    projects,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}
```

- [ ] **Step 3: ProjectCard 组件**

File: `src/components/project/ProjectCard.tsx`
```typescript
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/user/UserAvatar";
import { formatNumber, timeAgo } from "@/lib/utils";

interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    summary: string;
    type: string;
    tools: string[];
    thumbnailUrl: string | null;
    likeCount: number;
    commentCount: number;
    hotScore: number;
    createdAt: string;
    author: { username: string; displayName: string | null; avatarUrl: string | null };
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="hover:shadow-md transition-shadow h-full">
        {project.thumbnailUrl && (
          <img src={project.thumbnailUrl} alt={project.title} className="w-full h-40 object-cover rounded-t-xl" />
        )}
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg leading-tight">{project.title}</h3>
            <Badge variant="secondary" className="text-xs shrink-0 ml-2">{project.type}</Badge>
          </div>
          <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{project.summary}</p>
          <div className="flex flex-wrap gap-1 mb-3">
            {project.tools.slice(0, 4).map((tool) => (
              <Badge key={tool} variant="outline" className="text-xs">{tool}</Badge>
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <UserAvatar user={{ name: project.author.displayName || project.author.username, image: project.author.avatarUrl }} size="sm" />
              <span>{project.author.displayName || project.author.username}</span>
            </div>
            <div className="flex items-center gap-3">
              <span>❤️ {formatNumber(project.likeCount)}</span>
              <span>💬 {formatNumber(project.commentCount)}</span>
              <span>{timeAgo(new Date(project.createdAt))}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
```

- [ ] **Step 4: ProjectGrid 组件**

File: `src/components/project/ProjectGrid.tsx`
```typescript
import { ProjectCard } from "./ProjectCard";

interface ProjectGridProps {
  projects: any[];
}

export function ProjectGrid({ projects }: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        <p className="text-lg">还没有作品，快来提交第一个吧！</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((p) => (
        <ProjectCard key={p.id} project={p} />
      ))}
    </div>
  );
}
```

- [ ] **Step 5: 首页**

File: `src/app/page.tsx`
```typescript
"use client";
import { useInfiniteQuery } from "@tanstack/react-query";
import { ProjectGrid } from "@/components/project/ProjectGrid";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function HomePage() {
  const [sort, setSort] = useState<"hot" | "newest">("hot");

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ["projects", sort],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await fetch(`/api/projects?sort=${sort}&page=${pageParam}&limit=12`);
      return res.json();
    },
    getNextPageParam: (lastPage) => (lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined),
    initialPageParam: 1,
  });

  const projects = data?.pages.flatMap((p) => p.projects) ?? [];

  return (
    <div>
      <section className="text-center py-12 mb-8">
        <h1 className="text-4xl font-bold mb-4">发现 Vibecoding 佳作</h1>
        <p className="text-muted-foreground text-lg">看看大家都用 AI 创造了什么</p>
      </section>

      <div className="flex justify-center gap-4 mb-8">
        <Button variant={sort === "hot" ? "default" : "outline"} onClick={() => setSort("hot")}>热门</Button>
        <Button variant={sort === "newest" ? "default" : "outline"} onClick={() => setSort("newest")}>最新</Button>
      </div>

      {isLoading ? (
        <div className="text-center py-20">加载中...</div>
      ) : (
        <>
          <ProjectGrid projects={projects} />
          {hasNextPage && (
            <div className="text-center mt-8">
              <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                {isFetchingNextPage ? "加载中..." : "加载更多"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 6: 提交**

```bash
git add src/app/api/projects/route.ts src/app/page.tsx src/components/project/ProjectCard.tsx src/components/project/ProjectGrid.tsx src/lib/utils.ts
git commit -m "feat: add project list API and homepage with infinite scroll"
```

---

### Task 6: 作品提交与详情页

**Files:**
- Create: `src/app/submit/page.tsx`, `src/app/projects/[id]/page.tsx`
- Create: `src/components/project/ProjectForm.tsx`
- Create: `src/app/api/projects/[id]/route.ts`

- [ ] **Step 1: 作品详情 API**

File: `src/app/api/projects/[id]/route.ts`
```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      author: { select: { id: true, username: true, displayName: true, avatarUrl: true, bio: true } },
    },
  });
  if (!project) return NextResponse.json({ error: "作品不存在", code: "NOT_FOUND" }, { status: 404 });

  // 浏览数+1
  await prisma.project.update({ where: { id: params.id }, data: { viewCount: { increment: 1 } } });

  return NextResponse.json(project);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "请先登录", code: "UNAUTHORIZED" }, { status: 401 });

  const project = await prisma.project.findUnique({ where: { id: params.id } });
  if (!project) return NextResponse.json({ error: "作品不存在", code: "NOT_FOUND" }, { status: 404 });
  if (project.authorId !== session.user.id) return NextResponse.json({ error: "无权编辑", code: "FORBIDDEN" }, { status: 403 });

  const body = await req.json();
  const updated = await prisma.project.update({ where: { id: params.id }, data: body });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "请先登录", code: "UNAUTHORIZED" }, { status: 401 });

  const project = await prisma.project.findUnique({ where: { id: params.id } });
  if (!project) return NextResponse.json({ error: "作品不存在", code: "NOT_FOUND" }, { status: 404 });
  if (project.authorId !== session.user.id) return NextResponse.json({ error: "无权删除", code: "FORBIDDEN" }, { status: 403 });

  await prisma.project.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 2: ProjectForm 组件**

File: `src/components/project/ProjectForm.tsx`
```typescript
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from "next/navigation";

const projectSchema = z.object({
  title: z.string().min(1, "必填").max(100),
  summary: z.string().min(1, "必填").max(200),
  description: z.string().min(1, "必填").max(5000),
  type: z.enum(["WEBSITE", "APP", "TOOL", "OTHER"]),
  category: z.string().optional(),
  websiteUrl: z.string().url("请输入有效URL").optional().or(z.literal("")),
  githubUrl: z.string().url("请输入有效URL").optional().or(z.literal("")),
  tools: z.string().min(1, "至少选一个工具"),
  prompts: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

const TOOL_OPTIONS = ["Claude", "Cursor", "v0", "Bolt", "Replit", "GitHub Copilot", "ChatGPT", "Windsurf", "Lovable", "其他"];
const CATEGORY_OPTIONS = ["效率工具", "AI应用", "游戏", "设计", "网站", "小程序", "开源项目", "其他"];

export function ProjectForm() {
  const router = useRouter();
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: { type: "WEBSITE", tools: "", category: "" },
  });

  async function onSubmit(data: ProjectFormData) {
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, tools: data.tools.split(",").map((t) => t.trim()).filter(Boolean) }),
    });
    if (res.ok) {
      const project = await res.json();
      router.push(`/projects/${project.id}`);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">提交作品</h1>

      <div>
        <Input placeholder="作品名称" {...register("title")} />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
      </div>

      <div>
        <Textarea placeholder="一句话简介 (展示在列表中)" {...register("summary")} rows={2} />
        {errors.summary && <p className="text-red-500 text-sm mt-1">{errors.summary.message}</p>}
      </div>

      <div>
        <Textarea placeholder="详细介绍 (支持描述创作灵感、功能特点等)" {...register("description")} rows={6} />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Select onValueChange={(v) => setValue("type", v as any)} defaultValue="WEBSITE">
            <SelectTrigger><SelectValue placeholder="作品类型" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="WEBSITE">网站</SelectItem>
              <SelectItem value="APP">应用</SelectItem>
              <SelectItem value="TOOL">工具</SelectItem>
              <SelectItem value="OTHER">其他</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select onValueChange={(v) => setValue("category", v)}>
            <SelectTrigger><SelectValue placeholder="分类 (可选)" /></SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Input placeholder="作品链接 (可选)" {...register("websiteUrl")} />
      </div>
      <div>
        <Input placeholder="GitHub 链接 (可选)" {...register("githubUrl")} />
      </div>

      <div>
        <Input placeholder="使用的 AI 工具，用逗号分隔，如: Claude,Cursor,v0" {...register("tools")} />
        <p className="text-xs text-muted-foreground mt-1">可选: {TOOL_OPTIONS.join(", ")}</p>
        {errors.tools && <p className="text-red-500 text-sm mt-1">{errors.tools.message}</p>}
      </div>

      <div>
        <Textarea placeholder="分享你的创作 Prompt (可选)" {...register("prompts")} rows={4} />
        <p className="text-xs text-muted-foreground mt-1">分享 Prompt 可以帮助其他人学习你的创作思路</p>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "提交中..." : "发布作品"}
      </Button>
    </form>
  );
}
```

- [ ] **Step 3: 提交页面**

File: `src/app/submit/page.tsx`
```typescript
import { ProjectForm } from "@/components/project/ProjectForm";

export default function SubmitPage() {
  return <ProjectForm />;
}
```

- [ ] **Step 4: 作品详情页**

File: `src/app/projects/[id]/page.tsx`
```typescript
"use client";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user/UserAvatar";
import { formatNumber, timeAgo } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const [comment, setComment] = useState("");

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", params.id],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${params.id}`);
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
  });

  const { data: comments, refetch: refetchComments } = useQuery({
    queryKey: ["comments", params.id],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${params.id}/comments`);
      return res.json();
    },
  });

  async function handleLike() {
    await fetch(`/api/projects/${params.id}/like`, { method: "POST" });
  }

  async function handleFavorite() {
    await fetch(`/api/projects/${params.id}/favorite`, { method: "POST" });
  }

  async function handleComment() {
    if (!comment.trim()) return;
    await fetch(`/api/projects/${params.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: comment }),
    });
    setComment("");
    refetchComments();
  }

  if (isLoading) return <div className="text-center py-20">加载中...</div>;
  if (!project) return <div className="text-center py-20">作品不存在</div>;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Badge>{project.type}</Badge>
          {project.category && <Badge variant="outline">{project.category}</Badge>}
        </div>
        <h1 className="text-3xl font-bold mb-4">{project.title}</h1>
        <p className="text-lg text-muted-foreground mb-4">{project.summary}</p>
        <div className="flex items-center gap-4 mb-4">
          <Link href={`/${project.author.username}`} className="flex items-center gap-2 hover:underline">
            <UserAvatar user={{ name: project.author.displayName || project.author.username, image: project.author.avatarUrl }} size="sm" />
            <span>{project.author.displayName || project.author.username}</span>
          </Link>
          <span className="text-sm text-muted-foreground">{timeAgo(new Date(project.createdAt))}</span>
        </div>
        <div className="flex items-center gap-2 mb-4">
          {project.tools.map((tool: string) => <Badge key={tool} variant="secondary">{tool}</Badge>)}
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={handleLike}>❤️ {formatNumber(project.likeCount)}</Button>
          <Button variant="outline" size="sm" onClick={handleFavorite}>⭐ {formatNumber(project.favoriteCount)}</Button>
          <span className="text-sm text-muted-foreground flex items-center">👁️ {formatNumber(project.viewCount)} 次浏览</span>
        </div>
      </div>

      {/* Content */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="prose max-w-none whitespace-pre-wrap">{project.description}</div>
        </CardContent>
      </Card>

      {/* Links */}
      <div className="flex gap-3 mb-8">
        {project.websiteUrl && (
          <Button variant="outline" onClick={() => window.open(project.websiteUrl)}>🔗 访问作品</Button>
        )}
        {project.githubUrl && (
          <Button variant="outline" onClick={() => window.open(project.githubUrl)}>📦 查看源码</Button>
        )}
      </div>

      {/* Prompts */}
      {project.prompts && (
        <Card className="mb-8">
          <CardHeader><CardTitle className="text-lg">创作 Prompt</CardTitle></CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg text-sm whitespace-pre-wrap">{project.prompts}</pre>
          </CardContent>
        </Card>
      )}

      {/* Comments */}
      <Card>
        <CardHeader><CardTitle className="text-lg">评论 ({project.commentCount})</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-3 mb-6">
            <textarea
              className="flex-1 border rounded-lg p-3 text-sm resize-none"
              rows={3}
              placeholder="发表评论..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <Button onClick={handleComment} disabled={!comment.trim()} className="self-end">发送</Button>
          </div>
          {(comments ?? []).map((c: any) => (
            <div key={c.id} className="border-b last:border-0 py-4 flex gap-3">
              <UserAvatar user={{ name: c.user.displayName || c.user.username, image: c.user.avatarUrl }} size="sm" />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Link href={`/${c.user.username}`} className="font-medium text-sm hover:underline">
                    {c.user.displayName || c.user.username}
                  </Link>
                  <span className="text-xs text-muted-foreground">{timeAgo(new Date(c.createdAt))}</span>
                </div>
                <p className="text-sm">{c.content}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 5: 提交**

```bash
git add src/app/submit/ src/app/projects/ src/components/project/ProjectForm.tsx src/app/api/projects/
git commit -m "feat: add project submission form and detail page"
```

---

### Task 7: 评论 API

**Files:**
- Create: `src/app/api/projects/[id]/comments/route.ts`

- [ ] **Step 1: 评论 API**

File: `src/app/api/projects/[id]/comments/route.ts`
```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const comments = await prisma.comment.findMany({
    where: { projectId: params.id, parentId: null },
    include: {
      user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
      replies: {
        include: {
          user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(comments);
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "请先登录", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const { content, parentId } = await req.json();
  if (!content || content.trim().length === 0) {
    return NextResponse.json({ error: "评论不能为空", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      userId: session.user.id!,
      projectId: params.id,
      parentId: parentId || null,
    },
    include: {
      user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
    },
  });

  // 更新评论数
  await prisma.project.update({
    where: { id: params.id },
    data: { commentCount: { increment: 1 } },
  });

  // 发送通知(非自己的评论)
  const project = await prisma.project.findUnique({ where: { id: params.id }, select: { authorId: true } });
  if (project && project.authorId !== session.user.id) {
    await prisma.notification.create({
      data: {
        userId: project.authorId,
        type: "COMMENT",
        message: `有人评论了你的作品`,
        linkUrl: `/projects/${params.id}`,
      },
    });
  }

  return NextResponse.json(comment, { status: 201 });
}
```

- [ ] **Step 2: 提交**

```bash
git add src/app/api/projects/\[id\]/comments/ && git commit -m "feat: add comment API with nested replies"
```

---

### Task 8: 点赞、收藏、关注 API

**Files:**
- Create: `src/app/api/projects/[id]/like/route.ts`, `src/app/api/projects/[id]/favorite/route.ts`
- Create: `src/app/api/users/[username]/follow/route.ts`

- [ ] **Step 1: 点赞 API (toggle)**

File: `src/app/api/projects/[id]/like/route.ts`
```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "请先登录", code: "UNAUTHORIZED" }, { status: 401 });

  const userId = session.user.id!;
  const existing = await prisma.like.findUnique({
    where: { userId_projectId: { userId, projectId: params.id } },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    await prisma.project.update({ where: { id: params.id }, data: { likeCount: { decrement: 1 } } });
    return NextResponse.json({ liked: false });
  }

  await prisma.like.create({ data: { userId, projectId: params.id } });
  await prisma.project.update({ where: { id: params.id }, data: { likeCount: { increment: 1 } } });

  const project = await prisma.project.findUnique({ where: { id: params.id }, select: { authorId: true } });
  if (project && project.authorId !== userId) {
    await prisma.notification.create({
      data: { userId: project.authorId, type: "LIKE", message: "有人点赞了你的作品", linkUrl: `/projects/${params.id}` },
    });
  }

  return NextResponse.json({ liked: true }, { status: 201 });
}
```

- [ ] **Step 2: 收藏 API (toggle)**

File: `src/app/api/projects/[id]/favorite/route.ts`
```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "请先登录", code: "UNAUTHORIZED" }, { status: 401 });

  const userId = session.user.id!;
  const existing = await prisma.favorite.findUnique({
    where: { userId_projectId: { userId, projectId: params.id } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    await prisma.project.update({ where: { id: params.id }, data: { favoriteCount: { decrement: 1 } } });
    return NextResponse.json({ favorited: false });
  }

  await prisma.favorite.create({ data: { userId, projectId: params.id } });
  await prisma.project.update({ where: { id: params.id }, data: { favoriteCount: { increment: 1 } } });

  const project = await prisma.project.findUnique({ where: { id: params.id }, select: { authorId: true } });
  if (project && project.authorId !== userId) {
    await prisma.notification.create({
      data: { userId: project.authorId, type: "FAVORITE", message: "有人收藏了你的作品", linkUrl: `/projects/${params.id}` },
    });
  }

  return NextResponse.json({ favorited: true }, { status: 201 });
}
```

- [ ] **Step 3: 关注 API (toggle)**

File: `src/app/api/users/[username]/follow/route.ts`
```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: { username: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "请先登录", code: "UNAUTHORIZED" }, { status: 401 });

  const followerId = session.user.id!;
  const target = await prisma.user.findUnique({ where: { username: params.username }, select: { id: true } });
  if (!target) return NextResponse.json({ error: "用户不存在", code: "NOT_FOUND" }, { status: 404 });
  if (target.id === followerId) return NextResponse.json({ error: "不能关注自己", code: "INVALID" }, { status: 400 });

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId: target.id } },
  });

  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
    return NextResponse.json({ following: false });
  }

  await prisma.follow.create({ data: { followerId, followingId: target.id } });
  await prisma.notification.create({
    data: { userId: target.id, type: "FOLLOW", message: "有人关注了你", linkUrl: `/${params.username}` },
  });

  return NextResponse.json({ following: true }, { status: 201 });
}
```

- [ ] **Step 4: 提交**

```bash
git add src/app/api/projects/\[id\]/like/ src/app/api/projects/\[id\]/favorite/ src/app/api/users/
git commit -m "feat: add like, favorite, and follow toggle APIs"
```

---

### Task 9: 个人主页与设置

**Files:**
- Create: `src/app/[username]/page.tsx`, `src/app/settings/page.tsx`
- Create: `src/app/api/users/[username]/route.ts`, `src/app/api/users/[username]/projects/route.ts`, `src/app/api/settings/route.ts`
- Create: `src/components/user/FollowButton.tsx`

- [ ] **Step 1: 用户个人主页 API**

File: `src/app/api/users/[username]/route.ts`
```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { username: string } }) {
  const user = await prisma.user.findUnique({
    where: { username: params.username },
    select: {
      id: true, username: true, displayName: true, bio: true, avatarUrl: true,
      githubUrl: true, twitterUrl: true, websiteUrl: true,
      createdAt: true,
      _count: { select: { projects: true, followers: true, following: true } },
    },
  });
  if (!user) return NextResponse.json({ error: "用户不存在", code: "NOT_FOUND" }, { status: 404 });
  return NextResponse.json(user);
}
```

- [ ] **Step 2: 用户作品列表 API**

File: `src/app/api/users/[username]/projects/route.ts`
```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { username: string } }) {
  const user = await prisma.user.findUnique({ where: { username: params.username }, select: { id: true } });
  if (!user) return NextResponse.json({ error: "用户不存在", code: "NOT_FOUND" }, { status: 404 });

  const projects = await prisma.project.findMany({
    where: { authorId: user.id, status: "PUBLISHED" },
    orderBy: { hotScore: "desc" },
    include: { author: { select: { username: true, displayName: true, avatarUrl: true } } },
  });
  return NextResponse.json(projects);
}
```

- [ ] **Step 3: 设置 API**

File: `src/app/api/settings/route.ts`
```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const settingsSchema = z.object({
  displayName: z.string().min(1).max(50).optional(),
  bio: z.string().max(200).optional(),
  githubUrl: z.string().url().optional().or(z.literal("")),
  twitterUrl: z.string().url().optional().or(z.literal("")),
  websiteUrl: z.string().url().optional().or(z.literal("")),
});

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "请先登录", code: "UNAUTHORIZED" }, { status: 401 });

  const body = await req.json();
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "数据不合法", code: "VALIDATION_ERROR" }, { status: 400 });

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: parsed.data,
    select: { id: true, username: true, displayName: true, bio: true, avatarUrl: true, githubUrl: true, twitterUrl: true, websiteUrl: true },
  });

  return NextResponse.json(user);
}
```

- [ ] **Step 4: FollowButton 组件**

File: `src/components/user/FollowButton.tsx`
```typescript
"use client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export function FollowButton({ username }: { username: string }) {
  const { isAuthenticated } = useAuth();
  const [following, setFollowing] = useState(false);

  if (!isAuthenticated) return null;

  async function handleFollow() {
    const res = await fetch(`/api/users/${username}/follow`, { method: "POST" });
    const data = await res.json();
    setFollowing(data.following);
  }

  return (
    <Button variant={following ? "outline" : "default"} onClick={handleFollow}>
      {following ? "已关注" : "关注"}
    </Button>
  );
}
```

- [ ] **Step 5: 个人主页页面**

File: `src/app/[username]/page.tsx`
```typescript
"use client";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { UserAvatar } from "@/components/user/UserAvatar";
import { FollowButton } from "@/components/user/FollowButton";
import { ProjectGrid } from "@/components/project/ProjectGrid";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function ProfilePage() {
  const params = useParams<{ username: string }>();

  const { data: user, isLoading } = useQuery({
    queryKey: ["user", params.username],
    queryFn: () => fetch(`/api/users/${params.username}`).then((r) => r.json()),
  });

  const { data: projects } = useQuery({
    queryKey: ["user-projects", params.username],
    queryFn: () => fetch(`/api/users/${params.username}/projects`).then((r) => r.json()),
    enabled: !!user,
  });

  if (isLoading) return <div className="text-center py-20">加载中...</div>;
  if (user?.error) return <div className="text-center py-20">用户不存在</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-start gap-6 mb-8">
        <UserAvatar user={{ name: user.displayName || user.username, image: user.avatarUrl }} size="lg" />
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-2xl font-bold">{user.displayName || user.username}</h1>
            <FollowButton username={user.username} />
          </div>
          <p className="text-muted-foreground">@{user.username}</p>
          {user.bio && <p className="mt-3">{user.bio}</p>}
          <div className="flex gap-4 mt-3 text-sm">
            <span><strong>{user._count.projects}</strong> 作品</span>
            <span><strong>{user._count.followers}</strong> 关注者</span>
            <span><strong>{user._count.following}</strong> 正在关注</span>
          </div>
          <div className="flex gap-2 mt-3">
            {user.githubUrl && <Link href={user.githubUrl}><Badge variant="outline">GitHub</Badge></Link>}
            {user.twitterUrl && <Link href={user.twitterUrl}><Badge variant="outline">Twitter</Badge></Link>}
            {user.websiteUrl && <Link href={user.websiteUrl}><Badge variant="outline">Website</Badge></Link>}
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">作品</h2>
      <ProjectGrid projects={projects ?? []} />
    </div>
  );
}
```

- [ ] **Step 6: 设置页面**

File: `src/app/settings/page.tsx`
```typescript
"use client";
import { useAuth } from "@/hooks/useAuth";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { register, handleSubmit } = useForm();

  if (!isAuthenticated) { router.push("/login"); return null; }

  async function onSubmit(data: any) {
    await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const username = (user as any)?.username;
    if (username) router.push(`/${username}`);
  }

  return (
    <div className="max-w-xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>编辑个人资料</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium">昵称</label>
              <Input placeholder="昵称" {...register("displayName")} />
            </div>
            <div>
              <label className="text-sm font-medium">个人简介</label>
              <Textarea placeholder="介绍一下自己..." {...register("bio")} rows={3} />
            </div>
            <div>
              <label className="text-sm font-medium">GitHub URL</label>
              <Input placeholder="https://github.com/..." {...register("githubUrl")} />
            </div>
            <div>
              <label className="text-sm font-medium">Twitter URL</label>
              <Input placeholder="https://twitter.com/..." {...register("twitterUrl")} />
            </div>
            <div>
              <label className="text-sm font-medium">个人网站</label>
              <Input placeholder="https://..." {...register("websiteUrl")} />
            </div>
            <Button type="submit" className="w-full">保存</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 7: 提交**

```bash
git add src/app/\[username\]/ src/app/settings/ src/app/api/users/ src/app/api/settings/ src/components/user/FollowButton.tsx
git commit -m "feat: add user profile page, settings, and follow feature"
```

---

### Task 10: 排行榜与搜索

**Files:**
- Create: `src/app/leaderboard/page.tsx`, `src/app/discover/page.tsx`
- Create: `src/app/api/leaderboard/route.ts`, `src/app/api/search/route.ts`
- Create: `src/components/project/HotTabs.tsx`, `src/components/project/ProjectRankItem.tsx`
- Create: `src/lib/hot-score.ts`

- [ ] **Step 1: 热度计算函数**

File: `src/lib/hot-score.ts`
```typescript
export function computeHotScore(likeCount: number, commentCount: number, favoriteCount: number, viewCount: number): number {
  return likeCount * 2 + commentCount * 3 + favoriteCount * 5 + viewCount * 0.1;
}
```

- [ ] **Step 2: 排行榜 API**

File: `src/app/api/leaderboard/route.ts`
```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") || "all";
  const type = searchParams.get("type") || "all";

  const where: any = { status: "PUBLISHED" };
  if (type !== "all") where.type = type.toUpperCase();

  // 先尝试读快照
  if (period !== "all") {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const snapshots = await prisma.leaderboardSnapshot.findMany({
      where: { period, date: { gte: today } },
      orderBy: { rank: "asc" },
      take: 50,
    });
    if (snapshots.length > 0) {
      const projectIds = snapshots.map((s) => s.projectId);
      const projects = await prisma.project.findMany({
        where: { id: { in: projectIds } },
        include: { author: { select: { username: true, displayName: true, avatarUrl: true } } },
      });
      const map = Object.fromEntries(projects.map((p) => [p.id, p]));
      const ranked = snapshots
        .map((s) => ({ ...map[s.projectId], rank: s.rank, hotScore: s.hotScore }))
        .filter(Boolean);
      return NextResponse.json(ranked);
    }
  }

  // 实时查询
  const projects = await prisma.project.findMany({
    where,
    orderBy: { hotScore: "desc" },
    take: 50,
    include: { author: { select: { username: true, displayName: true, avatarUrl: true } } },
  });

  return NextResponse.json(projects.map((p, i) => ({ ...p, rank: i + 1 })));
}
```

- [ ] **Step 3: 搜索 API**

File: `src/app/api/search/route.ts`
```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const type = searchParams.get("type") || "projects";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 20;

  if (!q.trim()) return NextResponse.json({ results: [], total: 0 });

  if (type === "users") {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: q, mode: "insensitive" } },
          { displayName: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, username: true, displayName: true, avatarUrl: true, bio: true },
      take: limit,
      skip: (page - 1) * limit,
    });
    return NextResponse.json({ results: users, total: users.length });
  }

  const projects = await prisma.project.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { summary: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    },
    orderBy: { hotScore: "desc" },
    take: limit,
    skip: (page - 1) * limit,
    include: { author: { select: { username: true, displayName: true, avatarUrl: true } } },
  });

  const total = await prisma.project.count({
    where: {
      status: "PUBLISHED",
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { summary: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    },
  });

  return NextResponse.json({ results: projects, total });
}
```

- [ ] **Step 4: HotTabs 组件**

File: `src/components/project/HotTabs.tsx`
```typescript
"use client";
import { Button } from "@/components/ui/button";

interface HotTabsProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

export function HotTabs({ value, onChange, options }: HotTabsProps) {
  return (
    <div className="flex gap-2">
      {options.map((opt) => (
        <Button key={opt.value} variant={value === opt.value ? "default" : "outline"} size="sm" onClick={() => onChange(opt.value)}>
          {opt.label}
        </Button>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: ProjectRankItem 组件**

File: `src/components/project/ProjectRankItem.tsx`
```typescript
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/user/UserAvatar";
import { formatNumber } from "@/lib/utils";

export function ProjectRankItem({ project }: { project: any }) {
  const medal = project.rank === 1 ? "🥇" : project.rank === 2 ? "🥈" : project.rank === 3 ? "🥉" : `#${project.rank}`;
  return (
    <Link href={`/projects/${project.id}`}>
      <div className="flex items-center gap-4 p-4 hover:bg-muted rounded-lg transition-colors">
        <span className="text-2xl font-bold w-12 text-center">{medal}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold truncate">{project.title}</h3>
            <Badge variant="secondary" className="text-xs">{project.type}</Badge>
          </div>
          <p className="text-sm text-muted-foreground truncate">{project.summary}</p>
        </div>
        <div className="flex items-center gap-2 text-sm shrink-0">
          <UserAvatar user={{ name: project.author.displayName || project.author.username, image: project.author.avatarUrl }} size="sm" />
          <span className="text-muted-foreground">{project.author.displayName || project.author.username}</span>
        </div>
        <div className="text-right shrink-0 w-20">
          <div className="font-bold">{formatNumber(Math.floor(project.hotScore))}</div>
          <div className="text-xs text-muted-foreground">热度分</div>
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 6: 排行榜页面**

File: `src/app/leaderboard/page.tsx`
```typescript
"use client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { HotTabs } from "@/components/project/HotTabs";
import { ProjectRankItem } from "@/components/project/ProjectRankItem";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PERIOD_OPTIONS = [
  { value: "daily", label: "日榜" },
  { value: "weekly", label: "周榜" },
  { value: "monthly", label: "月榜" },
  { value: "all", label: "总榜" },
];

const TYPE_OPTIONS = [
  { value: "all", label: "全部" },
  { value: "WEBSITE", label: "网站" },
  { value: "APP", label: "应用" },
  { value: "TOOL", label: "工具" },
  { value: "OTHER", label: "其他" },
];

export default function LeaderboardPage() {
  const [period, setPeriod] = useState("all");
  const [type, setType] = useState("all");

  const { data: projects, isLoading } = useQuery({
    queryKey: ["leaderboard", period, type],
    queryFn: () => fetch(`/api/leaderboard?period=${period}&type=${type}`).then((r) => r.json()),
  });

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">排行榜</h1>
      <div className="flex gap-4 mb-6">
        <HotTabs value={period} onChange={setPeriod} options={PERIOD_OPTIONS} />
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            {TYPE_OPTIONS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      {isLoading ? (
        <div className="text-center py-20">加载中...</div>
      ) : (
        <div className="space-y-1">
          {(projects ?? []).map((p: any) => <ProjectRankItem key={p.id} project={p} />)}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 7: 发现页**

File: `src/app/discover/page.tsx`
```typescript
"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProjectGrid } from "@/components/project/ProjectGrid";

export default function DiscoverPage() {
  const [q, setQ] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["search", searchQuery],
    queryFn: () => fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&type=projects`).then((r) => r.json()),
    enabled: searchQuery.length > 0,
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex gap-3 mb-8">
        <Input placeholder="搜索作品..." value={q} onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && setSearchQuery(q)} />
        <Button onClick={() => setSearchQuery(q)}>搜索</Button>
      </div>
      {isLoading ? (
        <div className="text-center py-20">搜索中...</div>
      ) : data ? (
        <>
          <p className="text-muted-foreground mb-4">找到 {data.total} 个结果</p>
          <ProjectGrid projects={data.results} />
        </>
      ) : (
        <div className="text-center py-20 text-muted-foreground">输入关键词搜索作品</div>
      )}
    </div>
  );
}
```

- [ ] **Step 8: 提交**

```bash
git add src/app/leaderboard/ src/app/discover/ src/app/api/leaderboard/ src/app/api/search/ src/components/project/HotTabs.tsx src/components/project/ProjectRankItem.tsx src/lib/hot-score.ts
git commit -m "feat: add leaderboard with period tabs and search functionality"
```

---

### Task 11: 实时群聊系统

**Files:**
- Create: `src/lib/pusher.ts`, `src/app/chat/page.tsx`, `src/app/chat/[roomId]/page.tsx`
- Create: `src/app/api/chat/rooms/route.ts`, `src/app/api/chat/rooms/[id]/route.ts`
- Create: `src/app/api/chat/rooms/[id]/messages/route.ts`
- Create: `src/app/api/chat/rooms/[id]/join/route.ts`, `src/app/api/chat/rooms/[id]/leave/route.ts`
- Create: `src/components/chat/ChatRoomList.tsx`, `src/components/chat/ChatWindow.tsx`
- Create: `src/components/chat/MessageBubble.tsx`, `src/components/chat/CreateRoomModal.tsx`
- Create: `src/hooks/useChat.ts`

- [ ] **Step 1: Pusher 服务端配置**

File: `src/lib/pusher.ts`
```typescript
import PusherServer from "pusher";

export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});
```

- [ ] **Step 2: 群聊列表 API**

File: `src/app/api/chat/rooms/route.ts`
```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const rooms = await prisma.chatRoom.findMany({
    where: { isPublic: true },
    orderBy: { updatedAt: "desc" },
    include: { creator: { select: { username: true, displayName: true, avatarUrl: true } } },
  });
  return NextResponse.json(rooms);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "请先登录", code: "UNAUTHORIZED" }, { status: 401 });

  const { name, description } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "名称不能为空", code: "VALIDATION_ERROR" }, { status: 400 });

  const room = await prisma.chatRoom.create({
    data: { name, description, creatorId: session.user.id!, memberCount: 1 },
    include: { creator: { select: { username: true, displayName: true, avatarUrl: true } } },
  });
  return NextResponse.json(room, { status: 201 });
}
```

- [ ] **Step 3: 消息 API**

File: `src/app/api/chat/rooms/[id]/messages/route.ts`
```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const messages = await prisma.chatMessage.findMany({
    where: { roomId: params.id },
    include: { user: { select: { id: true, username: true, displayName: true, avatarUrl: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json(messages.reverse());
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "请先登录", code: "UNAUTHORIZED" }, { status: 401 });

  const { content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: "消息不能为空", code: "VALIDATION_ERROR" }, { status: 400 });

  const message = await prisma.chatMessage.create({
    data: { content, userId: session.user.id!, roomId: params.id },
    include: { user: { select: { id: true, username: true, displayName: true, avatarUrl: true } } },
  });

  await pusherServer.trigger(`presence-room-${params.id}`, "new-message", message);
  await prisma.chatRoom.update({ where: { id: params.id }, data: { updatedAt: new Date() } });

  return NextResponse.json(message, { status: 201 });
}
```

- [ ] **Step 4: 加入/退出 API**

File: `src/app/api/chat/rooms/[id]/join/route.ts`
```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "请先登录", code: "UNAUTHORIZED" }, { status: 401 });

  await prisma.chatRoom.update({ where: { id: params.id }, data: { memberCount: { increment: 1 } } });
  await pusherServer.trigger(`presence-room-${params.id}`, "user-joined", {
    username: (session.user as any).username || session.user.name,
  });

  return NextResponse.json({ success: true });
}
```

File: `src/app/api/chat/rooms/[id]/leave/route.ts`
```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "请先登录", code: "UNAUTHORIZED" }, { status: 401 });

  await prisma.chatRoom.update({
    where: { id: params.id },
    data: { memberCount: { decrement: 1 } },
  });

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 5: useChat Hook**

File: `src/hooks/useChat.ts`
```typescript
"use client";
import { useEffect, useState, useRef } from "react";
import Pusher from "pusher-js";

export function useChat(roomId: string) {
  const [messages, setMessages] = useState<any[]>([]);
  const pusherRef = useRef<Pusher | null>(null);

  useEffect(() => {
    fetch(`/api/chat/rooms/${roomId}/messages`)
      .then((r) => r.json())
      .then(setMessages);

    fetch(`/api/chat/rooms/${roomId}/join`, { method: "POST" });

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      authEndpoint: "/api/pusher/auth",
    });

    const channel = pusher.subscribe(`presence-room-${roomId}`);
    channel.bind("new-message", (msg: any) => {
      setMessages((prev) => [...prev, msg]);
    });

    pusherRef.current = pusher;

    return () => {
      pusher.unsubscribe(`presence-room-${roomId}`);
      fetch(`/api/chat/rooms/${roomId}/leave`, { method: "POST" });
    };
  }, [roomId]);

  async function sendMessage(content: string) {
    await fetch(`/api/chat/rooms/${roomId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
  }

  return { messages, sendMessage };
}
```

- [ ] **Step 6: 聊天组件**

File: `src/components/chat/ChatRoomList.tsx`
```typescript
"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { formatNumber, timeAgo } from "@/lib/utils";

export function ChatRoomList() {
  const { data: rooms, isLoading } = useQuery({
    queryKey: ["chat-rooms"],
    queryFn: () => fetch("/api/chat/rooms").then((r) => r.json()),
    refetchInterval: 10000,
  });

  if (isLoading) return <div className="text-center py-10">加载中...</div>;
  if (!rooms?.length) return <div className="text-center py-10 text-muted-foreground">暂无群聊，创建一个吧</div>;

  return (
    <div className="space-y-3">
      {rooms.map((room: any) => (
        <Link key={room.id} href={`/chat/${room.id}`}>
          <Card className="hover:shadow-sm transition-shadow">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{room.name}</h3>
                {room.description && <p className="text-sm text-muted-foreground">{room.description}</p>}
              </div>
              <div className="text-xs text-muted-foreground text-right">
                <div>{formatNumber(room.memberCount)} 人</div>
                <div>{timeAgo(new Date(room.updatedAt))}活跃</div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
```

File: `src/components/chat/MessageBubble.tsx`
```typescript
import { UserAvatar } from "@/components/user/UserAvatar";
import { timeAgo } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

export function MessageBubble({ message }: { message: any }) {
  const { user } = useAuth();
  const isMine = (user as any)?.id === message.user.id;

  return (
    <div className={`flex gap-3 ${isMine ? "flex-row-reverse" : ""} mb-4`}>
      <UserAvatar user={{ name: message.user.displayName || message.user.username, image: message.user.avatarUrl }} size="sm" />
      <div className={`max-w-[70%] ${isMine ? "items-end" : ""}`}>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-medium text-sm">{message.user.displayName || message.user.username}</span>
          <span className="text-xs text-muted-foreground">{timeAgo(new Date(message.createdAt))}</span>
        </div>
        <div className={`rounded-lg px-4 py-2 text-sm ${isMine ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
          {message.content}
        </div>
      </div>
    </div>
  );
}
```

File: `src/components/chat/ChatWindow.tsx`
```typescript
"use client";
import { useState, useRef, useEffect } from "react";
import { useChat } from "@/hooks/useChat";
import { MessageBubble } from "./MessageBubble";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ChatWindow({ roomId }: { roomId: string }) {
  const { messages, sendMessage } = useChat(roomId);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    await sendMessage(input);
    setInput("");
  }

  return (
    <div className="flex flex-col h-[70vh]">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg: any) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSend} className="border-t p-4 flex gap-3">
        <Input placeholder="输入消息..." value={input} onChange={(e) => setInput(e.target.value)} />
        <Button type="submit" disabled={!input.trim()}>发送</Button>
      </form>
    </div>
  );
}
```

File: `src/components/chat/CreateRoomModal.tsx`
```typescript
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

export function CreateRoomModal() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const router = useRouter();

  async function handleCreate() {
    const res = await fetch("/api/chat/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description }),
    });
    if (res.ok) {
      const room = await res.json();
      setOpen(false);
      router.push(`/chat/${room.id}`);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>创建群聊</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>创建群聊房间</DialogTitle></DialogHeader>
        <div className="space-y-4 mt-4">
          <Input placeholder="群聊名称" value={name} onChange={(e) => setName(e.target.value)} />
          <Textarea placeholder="群聊简介 (可选)" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Button onClick={handleCreate} disabled={!name.trim()} className="w-full">创建</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 7: 聊天页面**

File: `src/app/chat/page.tsx`
```typescript
import { ChatRoomList } from "@/components/chat/ChatRoomList";
import { CreateRoomModal } from "@/components/chat/CreateRoomModal";

export default function ChatListPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">群聊</h1>
        <CreateRoomModal />
      </div>
      <ChatRoomList />
    </div>
  );
}
```

File: `src/app/chat/[roomId]/page.tsx`
```typescript
"use client";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { ChatWindow } from "@/components/chat/ChatWindow";

export default function ChatRoomPage() {
  const params = useParams<{ roomId: string }>();

  const { data: room, isLoading } = useQuery({
    queryKey: ["chat-room", params.roomId],
    queryFn: () => fetch(`/api/chat/rooms/${params.roomId}`).then((r) => r.json()),
  });

  if (isLoading) return <div className="text-center py-20">加载中...</div>;
  if (!room) return <div className="text-center py-20">房间不存在</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">{room.name}</h1>
        {room.description && <p className="text-muted-foreground">{room.description}</p>}
      </div>
      <div className="border rounded-lg overflow-hidden">
        <ChatWindow roomId={params.roomId} />
      </div>
    </div>
  );
}
```

- [ ] **Step 8: 房间详情 API**

File: `src/app/api/chat/rooms/[id]/route.ts`
```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const room = await prisma.chatRoom.findUnique({
    where: { id: params.id },
    include: { creator: { select: { username: true, displayName: true, avatarUrl: true } } },
  });
  if (!room) return NextResponse.json({ error: "房间不存在", code: "NOT_FOUND" }, { status: 404 });
  return NextResponse.json(room);
}
```

- [ ] **Step 9: 添加 NEXT_PUBLIC 环境变量到 .env.example**

```
NEXT_PUBLIC_PUSHER_KEY=""
NEXT_PUBLIC_PUSHER_CLUSTER=""
```

- [ ] **Step 10: 提交**

```bash
git add src/lib/pusher.ts src/app/chat/ src/app/api/chat/ src/components/chat/ src/hooks/useChat.ts .env.example
git commit -m "feat: add real-time group chat with Pusher"
```

---

### Task 12: 通知系统

**Files:**
- Create: `src/app/notifications/page.tsx`, `src/app/api/notifications/route.ts`
- Create: `src/app/api/notifications/[id]/read/route.ts`, `src/app/api/notifications/read-all/route.ts`
- Create: `src/hooks/useNotifications.ts`

- [ ] **Step 1: 通知 API**

File: `src/app/api/notifications/route.ts`
```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "请先登录", code: "UNAUTHORIZED" }, { status: 401 });

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json(notifications);
}
```

- [ ] **Step 2: 标记已读 API**

File: `src/app/api/notifications/[id]/read/route.ts`
```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "请先登录", code: "UNAUTHORIZED" }, { status: 401 });

  await prisma.notification.update({
    where: { id: params.id, userId: session.user.id },
    data: { isRead: true },
  });
  return NextResponse.json({ success: true });
}
```

File: `src/app/api/notifications/read-all/route.ts`
```typescript
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "请先登录", code: "UNAUTHORIZED" }, { status: 401 });

  await prisma.notification.updateMany({
    where: { userId: session.user.id, isRead: false },
    data: { isRead: true },
  });
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 3: useNotifications Hook**

File: `src/hooks/useNotifications.ts`
```typescript
"use client";
import { useQuery } from "@tanstack/react-query";

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => fetch("/api/notifications").then((r) => r.json()),
    refetchInterval: 30000,
  });
}
```

- [ ] **Step 4: 通知页面**

File: `src/app/notifications/page.tsx`
```typescript
"use client";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { timeAgo } from "@/lib/utils";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";

const TYPE_ICONS: Record<string, string> = { LIKE: "❤️", COMMENT: "💬", FOLLOW: "👋", FAVORITE: "⭐" };

export default function NotificationsPage() {
  const { data: notifications, isLoading } = useNotifications();
  const queryClient = useQueryClient();

  async function markAllRead() {
    await fetch("/api/notifications/read-all", { method: "PATCH" });
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  }

  if (isLoading) return <div className="text-center py-20">加载中...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">通知</h1>
        <Button variant="outline" size="sm" onClick={markAllRead}>全部已读</Button>
      </div>
      {notifications?.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">暂无通知</div>
      ) : (
        <div className="space-y-2">
          {notifications?.map((n: any) => (
            <Link key={n.id} href={n.linkUrl || "#"}>
              <Card className={`hover:shadow-sm transition-shadow ${!n.isRead ? "border-primary bg-primary/5" : ""}`}>
                <CardContent className="p-4 flex items-center gap-3">
                  <span className="text-xl">{TYPE_ICONS[n.type]}</span>
                  <span className="flex-1">{n.message}</span>
                  <span className="text-xs text-muted-foreground">{timeAgo(new Date(n.createdAt))}</span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: 提交**

```bash
git add src/app/notifications/ src/app/api/notifications/ src/hooks/useNotifications.ts
git commit -m "feat: add notification system with read/unread support"
```

---

### Task 13: 图片上传到 Cloudflare R2

**Files:**
- Create: `src/app/api/upload/route.ts`

- [ ] **Step 1: 上传 API**

File: `src/app/api/upload/route.ts`
```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "请先登录", code: "UNAUTHORIZED" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) return NextResponse.json({ error: "未选择文件", code: "VALIDATION_ERROR" }, { status: 400 });

  // 限制 5MB 和图片类型
  if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "文件不能超过5MB", code: "FILE_TOO_LARGE" }, { status: 400 });
  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "仅支持图片", code: "INVALID_TYPE" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const key = `uploads/${Date.now()}-${file.name.replace(/\s/g, "_")}`;

  await r2.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    Body: buffer,
    ContentType: file.type,
  }));

  const url = `${process.env.R2_PUBLIC_URL || process.env.R2_ENDPOINT}/${key}`;
  return NextResponse.json({ url });
}
```

- [ ] **Step 2: 提交**

```bash
git add src/app/api/upload/ && git commit -m "feat: add image upload to Cloudflare R2"
```

---

### Task 14: 热度定时更新 (Vercel Cron)

**Files:**
- Create: `src/app/api/cron/update-scores/route.ts`
- Modify: `vercel.json` (create if not exists)

- [ ] **Step 1: 创建 Cron Job API**

File: `src/app/api/cron/update-scores/route.ts`
```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeHotScore } from "@/lib/hot-score";

export async function GET() {
  const projects = await prisma.project.findMany({ where: { status: "PUBLISHED" } });

  for (const p of projects) {
    const hotScore = computeHotScore(p.likeCount, p.commentCount, p.favoriteCount, p.viewCount);
    await prisma.project.update({ where: { id: p.id }, data: { hotScore } });
  }

  // 生成每日排行榜快照
  const top50 = await prisma.project.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { hotScore: "desc" },
    take: 50,
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < top50.length; i++) {
    await prisma.leaderboardSnapshot.create({
      data: {
        period: "daily",
        date: today,
        rank: i + 1,
        projectId: top50[i].id,
        hotScore: top50[i].hotScore,
      },
    });
  }

  // 每周一生成周榜快照
  if (today.getDay() === 1) {
    for (let i = 0; i < top50.length; i++) {
      await prisma.leaderboardSnapshot.create({
        data: {
          period: "weekly",
          date: today,
          rank: i + 1,
          projectId: top50[i].id,
          hotScore: top50[i].hotScore,
        },
      });
    }
  }

  return NextResponse.json({ updated: projects.length });
}
```

- [ ] **Step 2: 配置 vercel.json**

File: `vercel.json`
```json
{
  "crons": [
    {
      "path": "/api/cron/update-scores",
      "schedule": "0 * * * *"
    }
  ]
}
```

- [ ] **Step 3: 提交**

```bash
git add src/app/api/cron/ vercel.json && git commit -m "feat: add hourly hot score update cron job"
```

---

### Task 15: E2E 测试

**Files:**
- Create: `tests/e2e/smoke.spec.ts`, `playwright.config.ts`

- [ ] **Step 1: 安装 Playwright**

```bash
npm install -D @playwright/test && npx playwright install
```

- [ ] **Step 2: Playwright 配置**

File: `playwright.config.ts`
```typescript
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: "http://localhost:3000",
    headless: true,
  },
});
```

- [ ] **Step 3: 核心链路测试**

File: `tests/e2e/smoke.spec.ts`
```typescript
import { test, expect } from "@playwright/test";

test.describe("核心用户链路", () => {
  const unique = Date.now().toString(36);
  const email = `test-${unique}@test.com`;
  const username = `testuser_${unique}`;

  test("注册 → 登录 → 提交作品 → 查看详情 → 评论", async ({ page }) => {
    // 注册
    await page.goto("/register");
    await page.getByPlaceholder("用户名").fill(username);
    await page.getByPlaceholder("昵称").fill("Test User");
    await page.getByPlaceholder("邮箱").fill(email);
    await page.getByPlaceholder("密码").fill("password123");
    await page.getByRole("button", { name: "注册" }).click();
    await page.waitForURL("/login");

    // 登录
    await page.getByPlaceholder("邮箱").fill(email);
    await page.getByPlaceholder("密码").fill("password123");
    await page.getByRole("button", { name: "登录" }).click();
    await page.waitForURL("/");

    // 提交作品
    await page.goto("/submit");
    await page.getByPlaceholder("作品名称").fill(`E2E Test Project ${unique}`);
    await page.getByPlaceholder("一句话简介").fill("This is an automated test project");
    await page.getByPlaceholder("详细介绍").fill("Detailed description for testing purposes");
    await page.getByPlaceholder("使用的 AI 工具").fill("Claude,Playwright");
    await page.getByRole("button", { name: "发布作品" }).click();
    await page.waitForURL(/\/projects\//);

    // 评论
    const commentBox = page.locator("textarea").last();
    await commentBox.fill("Great work!");
    await page.getByRole("button", { name: "发送" }).click();
    await expect(page.getByText("Great work!")).toBeVisible();
  });

  test("首页加载作品列表", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("VibeShare")).toBeVisible();
  });

  test("排行榜页面正常显示", async ({ page }) => {
    await page.goto("/leaderboard");
    await expect(page.locator("h1")).toContainText("排行榜");
  });
});
```

- [ ] **Step 4: 提交**

```bash
git add tests/ playwright.config.ts && git commit -m "test: add E2E smoke tests for core user flow"
```

---

## 开发顺序

按依赖关系，建议严格按 Task 1→15 顺序执行。每个 Task 完成后验证功能可用再继续。

## 启动前准备

1. 启动 PostgreSQL 本地实例
2. 填写 `.env` 中的必需变量 (DATABASE_URL, AUTH_SECRET, Pusher key 等)
3. 运行 `npx prisma migrate dev`
4. `npm run dev`

---

## Self-Review 结果

1. **Spec coverage**: 对照设计文档逐项检查: 11页全部覆盖 ✓, 数据库表全部覆盖 ✓, 所有 API 路由覆盖 ✓, 热度分/Cron ✓, 聊天/Pusher ✓, 通知 ✓, 上传 ✓, 测试 ✓
2. **Placeholder scan**: 无 TBD/TODO/占位符 ✓
3. **Type consistency**: 各 Task 间类型一致，ProjectCard/ProjectRankItem props 匹配 API 返回结构 ✓
