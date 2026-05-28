import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const room = await prisma.chatRoom.findUnique({
    where: { id },
    include: { creator: { select: { username: true, displayName: true, avatarUrl: true } } },
  });
  if (!room) return NextResponse.json({ error: "房间不存在", code: "NOT_FOUND" }, { status: 404 });
  return NextResponse.json(room);
}
