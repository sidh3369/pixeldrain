import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    id: "org.studymaterial.stream",
    version: "1.0.0",
    name: "Study Material Stream",
    description: "Stream study material videos from Pixeldrain",
    resources: ["catalog", "stream"],
    types: ["movie"],
    catalogs: [
      {
        type: "movie",
        id: "study_videos",
        name: "Study Video Folders"
      }
    ]
  });
}
