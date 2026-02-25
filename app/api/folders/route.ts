import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const folders = await prisma.folder.findMany({
    include: { _count: { select: { files: true } } },
    orderBy: { updatedAt: "desc" }
  });
  return NextResponse.json(folders);
}

export async function POST(request: NextRequest) {
  const { name, description } = await request.json();
  if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });
  const folder = await prisma.folder.create({ data: { name: name.trim(), description: description?.trim() || null } });
  return NextResponse.json(folder, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await prisma.folder.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
