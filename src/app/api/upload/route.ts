import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cos } from "@/lib/cos";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "请先登录", code: "UNAUTHORIZED" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) return NextResponse.json({ error: "未选择文件", code: "VALIDATION_ERROR" }, { status: 400 });

  if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "文件不能超过5MB", code: "FILE_TOO_LARGE" }, { status: 400 });
  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "仅支持图片", code: "INVALID_TYPE" }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const key = `uploads/${Date.now()}-${file.name.replace(/\s/g, "_")}`;

  try {
    await new Promise<void>((resolve, reject) => {
      cos.putObject({
        Bucket: process.env.COS_BUCKET!,
        Region: process.env.COS_REGION!,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      }, (err: any, _data: any) => {
        if (err) reject(err);
        else resolve();
      });
    });
    const url = `${process.env.COS_DOMAIN}/${key}`;
    return NextResponse.json({ url });
  } catch {
    return NextResponse.json({ error: "上传失败", code: "UPLOAD_ERROR" }, { status: 500 });
  }
}
