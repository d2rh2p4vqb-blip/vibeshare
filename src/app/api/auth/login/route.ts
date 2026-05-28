import { signIn } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    await signIn("credentials", { email, password, redirect: false });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: "邮箱或密码错误", code: "INVALID_CREDENTIALS" },
      { status: 401 }
    );
  }
}
