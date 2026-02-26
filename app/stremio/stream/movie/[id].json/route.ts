import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDirectUrl } from "@/lib/pixeldrain";

function toStream(name: string, pixeldrainId: string) {
  return {
    name: `Pixeldrain • ${name}`,
    url: getDirectUrl(pixeldrainId),
    behaviorHints: {
      notWebReady: true,
      bingeGroup: "study-videos"
    }
  };
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  if (id.startsWith("studymaterial_folder_")) {
    const folderId = id.replace("studymaterial_folder_", "");
    const files = await prisma.file.findMany({ where: { folderId } });

    return NextResponse.json({
      streams: files.map((f) => toStream(f.name, f.pixeldrainId))
    });
  }

  if (id.startsWith("studymaterial_file_")) {
    const fileId = id.replace("studymaterial_file_", "");
    const file = await prisma.file.findUnique({ where: { id: fileId } });

    return NextResponse.json({
      streams: file ? [toStream(file.name, file.pixeldrainId)] : []
    });
  }

  return NextResponse.json({ streams: [] });
}
