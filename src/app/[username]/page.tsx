"use client";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
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
    enabled: !!user && !user.error,
  });

  if (isLoading) return <div className="text-center py-20">加载中...</div>;
  if (user?.error) return <div className="text-center py-20">用户不存在</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-start gap-6 mb-8">
        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold shrink-0">
          {(user.displayName || user.username).slice(0, 2).toUpperCase()}
        </div>
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
            {user.githubUrl && <Link href={user.githubUrl} target="_blank"><Badge variant="outline">GitHub</Badge></Link>}
            {user.twitterUrl && <Link href={user.twitterUrl} target="_blank"><Badge variant="outline">Twitter</Badge></Link>}
            {user.websiteUrl && <Link href={user.websiteUrl} target="_blank"><Badge variant="outline">Website</Badge></Link>}
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">作品</h2>
      <ProjectGrid projects={projects ?? []} />
    </div>
  );
}
