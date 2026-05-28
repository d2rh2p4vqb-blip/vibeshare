import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "请先登录", code: "UNAUTHORIZED" }, { status: 401 });

  await prisma.notification.updateMany({
    where: { userId: session.user.id, isRead: false },
    data: { isRead: true },
  });
  return NextResponse.json({ success: true });
}
