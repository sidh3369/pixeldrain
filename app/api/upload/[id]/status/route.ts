import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toJSONSafe } from "@/lib/serialize";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const job = await prisma.uploadJob.findUnique({
    where: { id: params.id },
  });

  if (!job) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(
    toJSONSafe({
      status: job.status,
      progress: job.progress,
      error: job.error,
    })
  );
}
