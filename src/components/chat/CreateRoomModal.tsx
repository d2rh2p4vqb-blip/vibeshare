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
      <DialogTrigger>
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
