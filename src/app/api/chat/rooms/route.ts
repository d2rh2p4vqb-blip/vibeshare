import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const rooms = await prisma.chatRoom.findMany({
    where: { isPublic: true },
    orderBy: { updatedAt: "desc" },
    include: { creator: { select: { username: true, displayName: true, avatarUrl: true } } },
  });
  return NextResponse.json(rooms);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "请先登录", code: "UNAUTHORIZED" }, { status: 401 });

  const { name, description } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "名称不能为空", code: "VALIDATION_ERROR" }, { status: 400 });

  const room = await prisma.chatRoom.create({
    data: { name, description, creatorId: session.user.id!, memberCount: 1 },
    include: { creator: { select: { username: true, displayName: true, avatarUrl: true } } },
  });
  return NextResponse.json(room, { status: 201 });
}
