import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toJSONSafe } from "@/lib/serialize";
import { deleteFile } from "@/lib/pixeldrain";

export async function GET(request: NextRequest) {
  const folderId = request.nextUrl.searchParams.get("folderId");
  const files = await prisma.file.findMany({
    where: folderId ? { folderId } : {},
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(toJSONSafe(files));
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const file = await prisma.file.findUnique({ where: { id } });
  if (!file) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await deleteFile(file.pixeldrainId).catch(() => false);
  await prisma.file.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
