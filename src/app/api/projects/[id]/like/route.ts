import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "请先登录", code: "UNAUTHORIZED" }, { status: 401 });

  const { id } = await params;
  const userId = session.user.id!;
  const existing = await prisma.like.findUnique({
    where: { userId_projectId: { userId, projectId: id } },
  });

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
    await prisma.project.update({ where: { id }, data: { likeCount: { decrement: 1 } } });
    return NextResponse.json({ liked: false });
  }

  await prisma.like.create({ data: { userId, projectId: id } });
  await prisma.project.update({ where: { id }, data: { likeCount: { increment: 1 } } });

  const project = await prisma.project.findUnique({ where: { id }, select: { authorId: true } });
  if (project && project.authorId !== userId) {
    await prisma.notification.create({
      data: { userId: project.authorId, type: "LIKE", message: "有人点赞了你的作品", linkUrl: `/projects/${id}` },
    });
  }

  return NextResponse.json({ liked: true }, { status: 201 });
}
