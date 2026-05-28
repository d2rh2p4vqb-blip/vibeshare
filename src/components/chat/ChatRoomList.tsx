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
