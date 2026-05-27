# Vibecoding 作品分享平台 — 设计文档

## 概述

一个类 Product Hunt + GitHub 结合的 Vibecoding 作品分享社区。用户注册独立账号，提交 AI 辅助创作的作品（网站、应用、工具等），标注使用的 AI 工具和创作 Prompt。社区通过点赞、评论、收藏、排行榜形成热度驱动的内容发现机制，同时支持实时群聊讨论。

## 技术栈

| 层级 | 选型 |
|------|------|
| 框架 | Next.js 14+ App Router |
| 数据库 | PostgreSQL + Prisma ORM |
| 认证 | NextAuth.js (Credentials Provider + JWT) |
| 样式 | Tailwind CSS + shadcn/ui |
| 图片存储 | Cloudflare R2 |
| 实时通信 | Pusher (托管 WebSocket) |
| 搜索 | PostgreSQL 全文搜索 (tsvector) |
| 状态管理 | TanStack Query + React Context |
| 表单 | React Hook Form + Zod |
| 部署 | Vercel |

## 页面清单 (11页)

| 页面 | 路由 | 说明 |
|------|------|------|
| 首页 | `/` | 每日热门、最新作品瀑布流 |
| 发现 | `/discover` | 搜索、分类/工具筛选 |
| 排行榜 | `/leaderboard` | 总榜/月榜/周榜/日榜，按类型筛选 |
| 项目详情 | `/projects/[id]` | 完整展示、截图、Prompt、评论 |
| 提交作品 | `/submit` | 创建/编辑作品表单 |
| 个人主页 | `/[username]` | 作品集、收藏、Bio、关注 |
| 聊天列表 | `/chat` | 所有公开群聊 |
| 聊天室 | `/chat/[roomId]` | 实时群聊消息 |
| 通知 | `/notifications` | 点赞/评论/关注通知 |
| 登录注册 | `/login` `/register` | 独立邮箱账号体系 |
| 设置 | `/settings` | 个人资料和偏好修改 |

## 数据库 Schema

### User
| 字段 | 类型 | 说明 |
|------|------|------|
| id | String @id | CUID |
| username | String @unique | 个人主页路由 `/[username]` |
| email | String @unique | 登录邮箱 |
| passwordHash | String | bcrypt |
| displayName | String? | 昵称 |
| bio | String? | 个人简介 |
| avatarUrl | String? | 头像 |
| githubUrl | String? | 社交链接 |
| twitterUrl | String? | |
| websiteUrl | String? | |
| createdAt | DateTime | |
| updatedAt | DateTime | |

### Project
| 字段 | 类型 | 说明 |
|------|------|------|
| id | String @id | CUID |
| title | String | 作品名 |
| description | String | 详细介绍 |
| summary | String | 一句话简介 |
| type | Enum | WEBSITE / APP / TOOL / OTHER |
| category | String? | 分类标签 |
| websiteUrl | String? | 作品链接 |
| githubUrl | String? | |
| tools | String[] | AI 工具列表 |
| prompts | String? | 可选的 Prompt 分享 |
| thumbnailUrl | String? | |
| screenshots | String[] | 多张截图 URL |
| authorId | String | FK → User |
| hotScore | Float | 热度分(定时计算) |
| likeCount | Int | |
| commentCount | Int | |
| favoriteCount | Int | |
| viewCount | Int | |
| status | Enum | DRAFT / PUBLISHED / ARCHIVED |
| createdAt | DateTime | |
| updatedAt | DateTime | |

### Like / Favorite / Follow / Comment
标准关联表，Comment 支持 `parentId` 自引用实现嵌套回复。

### ChatRoom / ChatMessage
群聊房间和消息，消息通过 Pusher Presence Channel 实时广播。

### Notification
通知表，type: LIKE / COMMENT / FOLLOW / FAVORITE，含 `isRead` 和 `linkUrl`。

### LeaderboardSnapshot
定期快照表，缓存不同时间维度的排行榜数据，避免实时大查询。

## 热度分公式

```
hotScore = likeCount * 2 + commentCount * 3 + favoriteCount * 5 + viewCount * 0.1
```

通过 Cron Job (Vercel Cron) 每小时更新一次。

## API 路由

### 认证
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/session`
- `POST /api/auth/logout`

### 作品
- `GET /api/projects` — 分页列表(排序、筛选)
- `GET /api/projects/[id]` — 详情
- `POST /api/projects` — 创建(需登录)
- `PATCH /api/projects/[id]` — 编辑(作者)
- `DELETE /api/projects/[id]` — 删除(作者)

### 互动
- `POST /api/projects/[id]/like` — 点赞/取消
- `POST /api/projects/[id]/favorite` — 收藏/取消
- `GET /api/projects/[id]/comments` — 评论列表
- `POST /api/projects/[id]/comments` — 发表评论

### 用户
- `GET /api/users/[username]` — 个人主页
- `GET /api/users/[username]/projects` — 作品列表
- `POST /api/users/[username]/follow` — 关注/取消
- `PATCH /api/settings` — 更新资料

### 排行榜
- `GET /api/leaderboard?period=daily|weekly|monthly|all&type=all|website|app|tool`

### 搜索
- `GET /api/search?q=keyword&type=projects|users`

### 通知
- `GET /api/notifications`
- `PATCH /api/notifications/[id]/read`
- `PATCH /api/notifications/read-all`

### 聊天
- `GET /api/chat/rooms` — 群聊列表
- `POST /api/chat/rooms` — 创建
- `GET /api/chat/rooms/[id]/messages` — 历史消息
- `POST /api/chat/rooms/[id]/messages` — 发送(Pusher广播)
- `POST /api/chat/rooms/[id]/join` / `leave`

### 上传
- `POST /api/upload` — 上传到 Cloudflare R2

## 聊天系统

Pusher Presence Channel 实现实时消息：用户发送消息 → API 持久化到 PostgreSQL → Pusher 广播到房间所有成员。进入房间时拉取最近 50 条历史消息。Presence Channel 可获知在线人数。MVP 只做群聊，不做私聊。

## 认证流程

1. 注册：email + username + password → bcrypt → 写入 User 表 → 自动登录
2. 登录：NextAuth Credentials Provider → 验证 → 签发 JWT → HttpOnly Cookie
3. 中间件（middleware.ts）拦截 `/submit`、`/settings`、`/chat/*`、`/notifications` 等路由，未登录重定向到 `/login`
4. AuthContext 从 session API 获取当前用户状态

## 错误处理

- 服务端异常 → 标准格式 `{ error: string, code: string }`
- 敏感错误不泄露（DB 连接等统一为"服务器错误"）
- 前端 TanStack Query error + retry 机制
- 表单校验用 React Hook Form + Zod schema
- Next.js Error Boundary 兜底

## 测试策略

- **Vitest**: 热度计算、校验逻辑
- **Testing Library**: 关键组件渲染
- **API 测试**: 端点 + Auth 中间件
- **Playwright**: 注册→登录→提交→查看→评论 E2E 链路

## 文件结构

```
src/
├── app/                        # App Router 页面 (11个页面)
├── components/
│   ├── layout/                 # Header, Footer, Sidebar
│   ├── project/                # ProjectCard, ProjectGrid, ProjectRankItem, HotTabs, ProjectForm
│   ├── chat/                   # ChatRoomList, ChatWindow, MessageBubble, CreateRoomModal
│   ├── user/                   # UserCard, UserAvatar, FollowButton
│   └── ui/                     # shadcn/ui 基础组件
├── lib/                        # prisma, auth, pusher, hot-score, utils
└── hooks/                      # useChat, useNotifications, useInfiniteScroll
```
