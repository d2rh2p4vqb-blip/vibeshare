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
  if (!room || room.error) return <div className="text-center py-20">房间不存在</div>;

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
