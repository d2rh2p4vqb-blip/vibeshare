import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateUserSig } from "@/lib/tencent-im";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "请先登录", code: "UNAUTHORIZED" }, { status: 401 });
  }

  const userId = session.user.id!;
  const userSig = generateUserSig(
    process.env.TENCENT_IM_SDKAPPID!,
    process.env.TENCENT_IM_SECRET!,
    userId
  );

  return NextResponse.json({ userId, userSig, sdkAppId: process.env.TENCENT_IM_SDKAPPID });
}
