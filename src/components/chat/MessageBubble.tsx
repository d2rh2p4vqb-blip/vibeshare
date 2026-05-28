"use client";
import { timeAgo } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

export function MessageBubble({ message }: { message: any }) {
  const { user } = useAuth();
  const isMine = (user as any)?.id === message.user?.id;

  return (
    <div className={`flex gap-3 ${isMine ? "flex-row-reverse" : ""} mb-4`}>
      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium shrink-0">
        {(message.user?.displayName || message.user?.username || "U").slice(0, 2).toUpperCase()}
      </div>
      <div className={`max-w-[70%] ${isMine ? "items-end" : ""}`}>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-medium text-sm">{message.user?.displayName || message.user?.username}</span>
          <span className="text-xs text-muted-foreground">{timeAgo(new Date(message.createdAt))}</span>
        </div>
        <div className={`rounded-lg px-4 py-2 text-sm ${isMine ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
          {message.content}
        </div>
      </div>
    </div>
  );
}
