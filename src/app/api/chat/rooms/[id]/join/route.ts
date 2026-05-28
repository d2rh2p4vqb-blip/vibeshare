import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "请先登录", code: "UNAUTHORIZED" }, { status: 401 });

  const { id } = await params;
  await prisma.chatRoom.update({ where: { id }, data: { memberCount: { increment: 1 } } });
  await pusherServer.trigger(`presence-room-${id}`, "user-joined", {
    username: (session.user as any)?.name || session.user.email,
  });

  return NextResponse.json({ success: true });
}
