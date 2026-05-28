import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const type = searchParams.get("type") || "projects";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 20;

  if (!q.trim()) return NextResponse.json({ results: [], total: 0 });

  if (type === "users") {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: q, mode: "insensitive" } },
          { displayName: { contains: q, mode: "insensitive" } },
        ],
      },
      select: { id: true, username: true, displayName: true, avatarUrl: true, bio: true },
      take: limit,
      skip: (page - 1) * limit,
    });
    return NextResponse.json({ results: users, total: users.length });
  }

  const projects = await prisma.project.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { summary: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    },
    orderBy: { hotScore: "desc" },
    take: limit,
    skip: (page - 1) * limit,
    include: { author: { select: { username: true, displayName: true, avatarUrl: true } } },
  });

  const total = await prisma.project.count({
    where: {
      status: "PUBLISHED",
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { summary: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    },
  });

  return NextResponse.json({ results: projects, total });
}
