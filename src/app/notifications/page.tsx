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
      {(!notifications || notifications.length === 0) ? (
        <div className="text-center py-20 text-muted-foreground">暂无通知</div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n: any) => (
            <Link key={n.id} href={n.linkUrl || "#"}>
              <Card className={`hover:shadow-sm transition-shadow ${!n.isRead ? "border-primary bg-primary/5" : ""}`}>
                <CardContent className="p-4 flex items-center gap-3">
                  <span className="text-xl">{TYPE_ICONS[n.type] || "📢"}</span>
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
