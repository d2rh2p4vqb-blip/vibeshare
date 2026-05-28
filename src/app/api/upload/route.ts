import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user)
    return NextResponse.json(
      { error: "请先登录", code: "UNAUTHORIZED" },
      { status: 401 }
    );

  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file)
    return NextResponse.json(
      { error: "未选择文件", code: "VALIDATION_ERROR" },
      { status: 400 }
    );

  if (file.size > 5 * 1024 * 1024)
    return NextResponse.json(
      { error: "文件不能超过5MB", code: "FILE_TOO_LARGE" },
      { status: 400 }
    );

  if (!file.type.startsWith("image/"))
    return NextResponse.json(
      { error: "仅支持图片", code: "INVALID_TYPE" },
      { status: 400 }
    );

  const buffer = Buffer.from(await file.arrayBuffer());
  const key = `uploads/${Date.now()}-${file.name.replace(/\s/g, "_")}`;

  await r2.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    })
  );

  const url = `${process.env.R2_PUBLIC_URL || process.env.R2_ENDPOINT}/${key}`;
  return NextResponse.json({ url });
}
