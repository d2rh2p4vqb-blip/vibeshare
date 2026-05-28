import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true, username: true, displayName: true, bio: true, avatarUrl: true,
      githubUrl: true, twitterUrl: true, websiteUrl: true,
      createdAt: true,
      _count: { select: { projects: { where: { status: "PUBLISHED" } }, followers: true, following: true } },
    },
  });
  if (!user) return NextResponse.json({ error: "用户不存在", code: "NOT_FOUND" }, { status: 404 });
  return NextResponse.json(user);
}
