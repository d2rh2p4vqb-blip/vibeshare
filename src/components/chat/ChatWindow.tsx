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
