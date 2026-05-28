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
