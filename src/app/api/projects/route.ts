import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sort = searchParams.get("sort") || "hot";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
  const type = searchParams.get("type") || undefined;
  const category = searchParams.get("category") || undefined;
  const tool = searchParams.get("tool") || undefined;

  const where: Record<string, unknown> = { status: "PUBLISHED" };
  if (type && type !== "all") where.type = type.toUpperCase();
  if (category) where.category = category;
  if (tool) where.tools = { has: tool };

  const orderBy = sort === "newest"
    ? { createdAt: "desc" as const }
    : { hotScore: "desc" as const };

  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        author: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
      },
    }),
    prisma.project.count({ where }),
  ]);

  return NextResponse.json({
    projects,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "请先登录", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const body = await req.json();
  const project = await prisma.project.create({
    data: {
      title: body.title,
      description: body.description,
      summary: body.summary,
      type: body.type,
      category: body.category || null,
      websiteUrl: body.websiteUrl || null,
      githubUrl: body.githubUrl || null,
      tools: body.tools || [],
      prompts: body.prompts || null,
      authorId: session.user.id!,
    },
    include: {
      author: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
    },
  });

  return NextResponse.json(project, { status: 201 });
}
