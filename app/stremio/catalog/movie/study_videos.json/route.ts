import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const folders = await prisma.folder.findMany({ include: { _count: { select: { files: true } } }, orderBy: { updatedAt: "desc" } });
  return NextResponse.json({
    metas: folders.map((folder) => ({
      id: `studymaterial_folder_${folder.id}`,
      type: "movie",
      name: folder.name,
      description: `${folder._count.files} video(s)`
    }))
  });
}
