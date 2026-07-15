export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { generatePresignedUploadUrl } from "@/lib/s3";
import { requireAdmin } from "@/lib/admin-guard";

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.response;
  try {
    const body = await req.json();
    const { fileName, contentType, isPublic } = body ?? {};
    if (!fileName || !contentType) {
      return NextResponse.json({ error: "fileName and contentType required" }, { status: 400 });
    }
    const result = await generatePresignedUploadUrl(fileName, contentType, isPublic ?? true);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 });
  }
}
