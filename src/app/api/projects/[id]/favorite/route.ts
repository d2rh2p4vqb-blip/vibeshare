import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "请先登录", code: "UNAUTHORIZED" }, { status: 401 });

  const { id } = await params;
  const userId = session.user.id!;
  const existing = await prisma.favorite.findUnique({
    where: { userId_projectId: { userId, projectId: id } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    await prisma.project.update({ where: { id }, data: { favoriteCount: { decrement: 1 } } });
    return NextResponse.json({ favorited: false });
  }

  await prisma.favorite.create({ data: { userId, projectId: id } });
  await prisma.project.update({ where: { id }, data: { favoriteCount: { increment: 1 } } });

  const project = await prisma.project.findUnique({ where: { id }, select: { authorId: true } });
  if (project && project.authorId !== userId) {
    await prisma.notification.create({
      data: { userId: project.authorId, type: "FAVORITE", message: "有人收藏了你的作品", linkUrl: `/projects/${id}` },
    });
  }

  return NextResponse.json({ favorited: true }, { status: 201 });
}
