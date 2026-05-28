import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const comments = await prisma.comment.findMany({
    where: { projectId: id, parentId: null },
    include: {
      user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
      replies: {
        include: {
          user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(comments);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "请先登录", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const { id } = await params;
  const { content, parentId } = await req.json();
  if (!content || content.trim().length === 0) {
    return NextResponse.json({ error: "评论不能为空", code: "VALIDATION_ERROR" }, { status: 400 });
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      userId: session.user.id!,
      projectId: id,
      parentId: parentId || null,
    },
    include: {
      user: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
    },
  });

  await prisma.project.update({
    where: { id },
    data: { commentCount: { increment: 1 } },
  });

  const project = await prisma.project.findUnique({ where: { id }, select: { authorId: true } });
  if (project && project.authorId !== session.user.id) {
    await prisma.notification.create({
      data: {
        userId: project.authorId,
        type: "COMMENT",
        message: "有人评论了你的作品",
        linkUrl: `/projects/${id}`,
      },
    });
  }

  return NextResponse.json(comment, { status: 201 });
}
