import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "请先登录", code: "UNAUTHORIZED" }, { status: 401 });

  const { username } = await params;
  const followerId = session.user.id!;
  const target = await prisma.user.findUnique({ where: { username }, select: { id: true } });
  if (!target) return NextResponse.json({ error: "用户不存在", code: "NOT_FOUND" }, { status: 404 });
  if (target.id === followerId) return NextResponse.json({ error: "不能关注自己", code: "INVALID" }, { status: 400 });

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId: target.id } },
  });

  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
    return NextResponse.json({ following: false });
  }

  await prisma.follow.create({ data: { followerId, followingId: target.id } });
  await prisma.notification.create({
    data: { userId: target.id, type: "FOLLOW", message: "有人关注了你", linkUrl: `/${username}` },
  });

  return NextResponse.json({ following: true }, { status: 201 });
}
