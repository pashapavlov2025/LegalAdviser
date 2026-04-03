import { NextRequest, NextResponse } from "next/server";
import { getTimeline, addTimelineEvent } from "@/lib/claims-store";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ problemId: string }> },
) {
  const { problemId } = await params;
  return NextResponse.json(getTimeline(problemId));
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ problemId: string }> },
) {
  const { problemId } = await params;
  const { description } = await req.json();
  if (!description) return NextResponse.json({ error: "description required" }, { status: 400 });

  const event = addTimelineEvent(problemId, {
    problemId,
    type: "comment",
    description,
  });

  return NextResponse.json(event, { status: 201 });
}
