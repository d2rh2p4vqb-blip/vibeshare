import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") || "all";
  const type = searchParams.get("type") || "all";

  const where: Record<string, unknown> = { status: "PUBLISHED" };
  if (type !== "all") where.type = type.toUpperCase();

  if (period !== "all") {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const snapshots = await prisma.leaderboardSnapshot.findMany({
      where: { period, date: { gte: today } },
      orderBy: { rank: "asc" },
      take: 50,
    });
    if (snapshots.length > 0) {
      const projectIds = snapshots.map((s) => s.projectId);
      const projects = await prisma.project.findMany({
        where: { id: { in: projectIds } },
        include: { author: { select: { username: true, displayName: true, avatarUrl: true } } },
      });
      const map = Object.fromEntries(projects.map((p) => [p.id, p]));
      const ranked = snapshots
        .map((s) => ({ ...map[s.projectId], rank: s.rank, hotScore: s.hotScore }))
        .filter(Boolean);
      return NextResponse.json(ranked);
    }
  }

  const projects = await prisma.project.findMany({
    where,
    orderBy: { hotScore: "desc" },
    take: 50,
    include: { author: { select: { username: true, displayName: true, avatarUrl: true } } },
  });

  return NextResponse.json(projects.map((p, i) => ({ ...p, rank: i + 1 })));
}
