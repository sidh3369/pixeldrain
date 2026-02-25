import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toJSONSafe } from "@/lib/serialize";

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  const job = await prisma.uploadJob.findUnique({
    where: { id },
    include: { files: true }
  });

  if (!job) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(toJSONSafe(job));
}
