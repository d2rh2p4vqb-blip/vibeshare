"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatNumber, timeAgo } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { Pencil } from "lucide-react";

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [comment, setComment] = useState("");
  const queryClient = useQueryClient();

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", params.id],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${params.id}`);
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
  });

  const { data: comments = [], refetch: refetchComments } = useQuery({
    queryKey: ["comments", params.id],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${params.id}/comments`);
      return res.json();
    },
  });

  async function handleLike() {
    const res = await fetch(`/api/projects/${params.id}/like`, { method: "POST" });
    const data = await res.json();
    queryClient.invalidateQueries({ queryKey: ["project", params.id] });
    toast(data.liked ? "已点赞" : "已取消点赞");
  }

  async function handleFavorite() {
    const res = await fetch(`/api/projects/${params.id}/favorite`, { method: "POST" });
    const data = await res.json();
    queryClient.invalidateQueries({ queryKey: ["project", params.id] });
    toast(data.favorited ? "已收藏" : "已取消收藏");
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
    queryClient.invalidateQueries({ queryKey: ["project", params.id] });
    toast.success("评论已发布");
  }

  if (isLoading) return <div className="text-center py-20">加载中...</div>;
  if (!project) return <div className="text-center py-20">作品不存在</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Badge>{project.type}</Badge>
          {project.category && <Badge variant="outline">{project.category}</Badge>}
        </div>
        <h1 className="text-3xl font-bold mb-4">{project.title}</h1>
        <p className="text-lg text-muted-foreground mb-4">{project.summary}</p>
        <div className="flex items-center gap-4 mb-4">
          <Link href={`/${project.author.username}`} className="flex items-center gap-2 hover:underline">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
              {(project.author.displayName || project.author.username).slice(0, 2).toUpperCase()}
            </div>
            <span>{project.author.displayName || project.author.username}</span>
          </Link>
          <span className="text-sm text-muted-foreground">{timeAgo(new Date(project.createdAt))}</span>
        </div>
        <div className="flex items-center gap-2 mb-4">
          {project.tools.map((tool: string) => <Badge key={tool} variant="secondary">{tool}</Badge>)}
        </div>
        <div className="flex gap-3 flex-wrap">
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
          <span className="text-sm text-muted-foreground flex items-center">👁️ {formatNumber(project.viewCount)} 次浏览</span>
          {isAuthenticated && user?.id === project.authorId && (
            <button
              onClick={() => router.push(`/projects/${project.id}/edit`)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border text-sm text-muted-foreground hover:border-foreground hover:text-foreground transition-all"
            >
              <Pencil className="size-4" /> 编辑
            </button>
          )}
        </div>
      </div>

      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="prose max-w-none whitespace-pre-wrap">{project.description}</div>
        </CardContent>
      </Card>

      <div className="flex gap-3 mb-8">
        {project.websiteUrl && (
          <a href={project.websiteUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border text-sm text-muted-foreground hover:border-foreground hover:text-foreground transition-all">
            ↗ 访问作品
          </a>
        )}
        {project.githubUrl && (
          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-border text-sm text-muted-foreground hover:border-foreground hover:text-foreground transition-all">
            ⌘ 查看源码
          </a>
        )}
      </div>

      {project.prompts && (
        <Card className="mb-8">
          <CardHeader><CardTitle className="text-lg">创作 Prompt</CardTitle></CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg text-sm whitespace-pre-wrap">{project.prompts}</pre>
          </CardContent>
        </Card>
      )}

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
          {comments.map((c: any) => (
            <div key={c.id} className="border-b last:border-0 py-4 flex gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium shrink-0">
                {(c.user.displayName || c.user.username).slice(0, 2).toUpperCase()}
              </div>
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
