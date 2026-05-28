import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { generateUserSig } from "@/lib/tencent-im";

async function sendTIMGroupMsg(roomId: string, message: any) {
  const sdkAppId = process.env.TENCENT_IM_SDKAPPID!;
  const secretKey = process.env.TENCENT_IM_SECRET!;
  const adminId = process.env.TENCENT_IM_ADMIN || 'admin';
  const userSig = generateUserSig(sdkAppId, secretKey, adminId);

  const random = Math.floor(Math.random() * 4294967295);
  const url = `https://console.tim.qq.com/v4/group_open_http_svc/send_group_msg?sdkappid=${sdkAppId}&identifier=${adminId}&usersig=${userSig}&random=${random}&contenttype=json`;

  const body = {
    GroupId: roomId,
    Random: random,
    MsgBody: [
      {
        MsgType: "TIMTextElem",
        MsgContent: {
          Text: `${message.user.displayName || message.user.username}: ${message.content}`,
        },
      },
    ],
    From_Account: message.userId,
  };

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.error('TIM send failed:', err);
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const messages = await prisma.chatMessage.findMany({
    where: { roomId: id },
    include: { user: { select: { id: true, username: true, displayName: true, avatarUrl: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json(messages.reverse());
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "请先登录", code: "UNAUTHORIZED" }, { status: 401 });

  const { id } = await params;
  const { content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: "消息不能为空", code: "VALIDATION_ERROR" }, { status: 400 });

  const message = await prisma.chatMessage.create({
    data: { content, userId: session.user.id!, roomId: id },
    include: { user: { select: { id: true, username: true, displayName: true, avatarUrl: true } } },
  });

  await sendTIMGroupMsg(id, {
    userId: session.user.id!,
    user: { displayName: (session.user as any)?.name, username: (session.user as any)?.name },
    content,
  });
  await prisma.chatRoom.update({ where: { id }, data: { updatedAt: new Date() } });

  return NextResponse.json(message, { status: 201 });
}
