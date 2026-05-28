import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { computeHotScore } from "@/lib/hot-score";

export async function GET() {
  const projects = await prisma.project.findMany({
    where: { status: "PUBLISHED" },
  });

  for (const p of projects) {
    const hotScore = computeHotScore(
      p.likeCount,
      p.commentCount,
      p.favoriteCount,
      p.viewCount
    );
    await prisma.project.update({
      where: { id: p.id },
      data: { hotScore },
    });
  }

  const top50 = await prisma.project.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { hotScore: "desc" },
    take: 50,
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < top50.length; i++) {
    await prisma.leaderboardSnapshot.create({
      data: {
        period: "daily",
        date: today,
        rank: i + 1,
        projectId: top50[i].id,
        hotScore: top50[i].hotScore,
      },
    });
  }

  if (today.getDay() === 1) {
    for (let i = 0; i < top50.length; i++) {
      await prisma.leaderboardSnapshot.create({
        data: {
          period: "weekly",
          date: today,
          rank: i + 1,
          projectId: top50[i].id,
          hotScore: top50[i].hotScore,
        },
      });
    }
  }

  return NextResponse.json({ updated: projects.length });
}
