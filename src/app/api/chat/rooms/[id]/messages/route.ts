import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const messages = await prisma.chatMessage.findMany({
    where: { roomId: id },
    include: { user: { select: { id: true, username: true, displayName: true, avatarUrl: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json(messages.reverse());
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "请先登录", code: "UNAUTHORIZED" }, { status: 401 });

  const { id } = await params;
  const { content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: "消息不能为空", code: "VALIDATION_ERROR" }, { status: 400 });

  const message = await prisma.chatMessage.create({
    data: { content, userId: session.user.id!, roomId: id },
    include: { user: { select: { id: true, username: true, displayName: true, avatarUrl: true } } },
  });

  await pusherServer.trigger(`presence-room-${id}`, "new-message", message);
  await prisma.chatRoom.update({ where: { id }, data: { updatedAt: new Date() } });

  return NextResponse.json(message, { status: 201 });
}
