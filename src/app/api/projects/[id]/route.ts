import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, username: true, displayName: true, avatarUrl: true, bio: true } },
    },
  });
  if (!project) return NextResponse.json({ error: "作品不存在", code: "NOT_FOUND" }, { status: 404 });

  // Increment view count
  await prisma.project.update({ where: { id }, data: { viewCount: { increment: 1 } } });

  return NextResponse.json(project);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "请先登录", code: "UNAUTHORIZED" }, { status: 401 });

  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) return NextResponse.json({ error: "作品不存在", code: "NOT_FOUND" }, { status: 404 });
  if (project.authorId !== session.user.id) return NextResponse.json({ error: "无权编辑", code: "FORBIDDEN" }, { status: 403 });

  const body = await req.json();
  const updated = await prisma.project.update({ where: { id }, data: body });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "请先登录", code: "UNAUTHORIZED" }, { status: 401 });

  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id } });
  if (!project) return NextResponse.json({ error: "作品不存在", code: "NOT_FOUND" }, { status: 404 });
  if (project.authorId !== session.user.id) return NextResponse.json({ error: "无权删除", code: "FORBIDDEN" }, { status: 403 });

  await prisma.project.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
