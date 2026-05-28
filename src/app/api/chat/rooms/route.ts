import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateUserSig } from "@/lib/tencent-im";

async function createTIMGroup(roomId: string, name: string, ownerId: string) {
  const sdkAppId = process.env.TENCENT_IM_SDKAPPID!;
  const secretKey = process.env.TENCENT_IM_SECRET!;
  const adminId = process.env.TENCENT_IM_ADMIN || 'admin';
  const userSig = generateUserSig(sdkAppId, secretKey, adminId);
  const random = Math.floor(Math.random() * 4294967295);

  const url = `https://console.tim.qq.com/v4/group_open_http_svc/create_group?sdkappid=${sdkAppId}&identifier=${adminId}&usersig=${userSig}&random=${random}&contenttype=json`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Owner_Account: ownerId,
        Type: 'AVChatRoom',
        GroupId: roomId,
        Name: name,
      }),
    });
    const data = await res.json();
    // ErrorCode 0 = success, 10021 = groupId already exists (idempotent)
    if (data.ErrorCode !== 0 && data.ErrorCode !== 10021) {
      console.error('TIM create group failed:', data);
    }
  } catch (err) {
    console.error('TIM create group error:', err);
  }
}

export async function GET() {
  const rooms = await prisma.chatRoom.findMany({
    where: { isPublic: true },
    orderBy: { updatedAt: "desc" },
    include: { creator: { select: { username: true, displayName: true, avatarUrl: true } } },
  });
  return NextResponse.json(rooms);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "请先登录", code: "UNAUTHORIZED" }, { status: 401 });

  const { name, description } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "名称不能为空", code: "VALIDATION_ERROR" }, { status: 400 });

  const room = await prisma.chatRoom.create({
    data: { name, description, creatorId: session.user.id!, memberCount: 1 },
    include: { creator: { select: { username: true, displayName: true, avatarUrl: true } } },
  });

  createTIMGroup(room.id, name, session.user.id!);

  return NextResponse.json(room, { status: 201 });
}
