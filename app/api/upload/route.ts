import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toJSONSafe } from "@/lib/serialize";
import { uploadFile } from "@/lib/pixeldrain";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (id) {
    const job = await prisma.uploadJob.findUnique({ where: { id }, include: { files: true } });
    if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(toJSONSafe(job));
  }

  const jobs = await prisma.uploadJob.findMany({ include: { files: true }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(toJSONSafe(jobs));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { magnetLink, folderId, folderName, files } = body as {
    magnetLink: string;
    folderId?: string;
    folderName?: string;
    files?: { name: string; mimeType?: string; size: number; base64: string }[];
  };

  if (!magnetLink?.startsWith("magnet:")) {
    return NextResponse.json({ error: "Valid magnet link required" }, { status: 400 });
  }

  let resolvedFolderId = folderId;
  if (!resolvedFolderId && folderName?.trim()) {
    const folder = await prisma.folder.create({ data: { name: folderName.trim() } });
    resolvedFolderId = folder.id;
  }

  const job = await prisma.uploadJob.create({
    data: {
      magnetLink,
      folderId: resolvedFolderId,
      folderName: folderName?.trim() || null,
      status: files?.length ? "processing" : "pending",
      progress: 0
    }
  });

  if (!files?.length) return NextResponse.json(toJSONSafe(job), { status: 201 });

  try {
    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      const uploaded = await uploadFile(Buffer.from(file.base64, "base64"), file.name);
      await prisma.file.create({
        data: {
          name: file.name,
          size: BigInt(uploaded.size || file.size || 0),
          mimeType: file.mimeType || "video/mp4",
          pixeldrainId: uploaded.id,
          folderId: resolvedFolderId || null,
          magnetSource: magnetLink,
          uploadStatus: "completed"
        }
      });
      await prisma.uploadJobFile.create({
        data: {
          uploadJobId: job.id,
          fileName: file.name,
          fileSize: BigInt(file.size || uploaded.size || 0),
          status: "completed",
          pixeldrainId: uploaded.id
        }
      });

      await prisma.uploadJob.update({ where: { id: job.id }, data: { progress: Math.round(((index + 1) / files.length) * 100) } });
    }

    const completed = await prisma.uploadJob.update({ where: { id: job.id }, data: { status: "completed", progress: 100 } });
    return NextResponse.json(toJSONSafe(completed), { status: 201 });
  } catch (error) {
    await prisma.uploadJob.update({ where: { id: job.id }, data: { status: "failed", error: (error as Error).message } });
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
