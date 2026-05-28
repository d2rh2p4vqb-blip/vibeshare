import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const user = await prisma.user.findUnique({ where: { username }, select: { id: true } });
  if (!user) return NextResponse.json({ error: "用户不存在", code: "NOT_FOUND" }, { status: 404 });

  const projects = await prisma.project.findMany({
    where: { authorId: user.id, status: "PUBLISHED" },
    orderBy: { hotScore: "desc" },
    include: { author: { select: { username: true, displayName: true, avatarUrl: true } } },
  });
  return NextResponse.json(projects);
}
