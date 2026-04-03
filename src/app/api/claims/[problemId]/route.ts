import { NextRequest, NextResponse } from "next/server";
import { getProblemById, updateProblemStatus } from "@/lib/mock-1c";
import { generateClaim } from "@/lib/claim-generator";
import { getClaim, setClaim, addTimelineEvent } from "@/lib/claims-store";
import { ProblemStatus } from "@/lib/models";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ problemId: string }> },
) {
  const { problemId } = await params;
  const claim = getClaim(problemId);
  if (!claim) return NextResponse.json(null);
  return NextResponse.json(claim);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ problemId: string }> },
) {
  const { problemId } = await params;
  const problem = getProblemById(problemId);
  if (!problem) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Check if AI generation requested
  const body = await req.json().catch(() => ({}));
  const useAI = body.useAI === true;

  let claim;
  if (useAI) {
    // AI generation using Claude API
    const { generateClaimAI } = await import("@/lib/ai-generator");
    claim = await generateClaimAI(problem);
  } else {
    claim = generateClaim(problem);
  }

  setClaim(problemId, claim);
  updateProblemStatus(problemId, ProblemStatus.CLAIM_GENERATED);

  addTimelineEvent(problemId, {
    problemId,
    type: "claim_generated",
    description: useAI
      ? "Претензия сформирована с помощью AI"
      : "Претензия сформирована по шаблону",
    newStatus: ProblemStatus.CLAIM_GENERATED,
  });

  return NextResponse.json(claim);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ problemId: string }> },
) {
  const { problemId } = await params;
  const claim = getClaim(problemId);
  if (!claim) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { text } = await req.json();
  if (typeof text === "string") {
    claim.text = text;
    setClaim(problemId, claim);

    addTimelineEvent(problemId, {
      problemId,
      type: "claim_edited",
      description: "Текст претензии отредактирован",
    });
  }

  return NextResponse.json(claim);
}

export async function PUT(
  _req: NextRequest,
  { params }: { params: Promise<{ problemId: string }> },
) {
  const { problemId } = await params;
  const claim = getClaim(problemId);
  if (!claim) return NextResponse.json({ error: "Not found" }, { status: 404 });

  claim.sent = true;
  setClaim(problemId, claim);
  updateProblemStatus(problemId, ProblemStatus.SENT);

  addTimelineEvent(problemId, {
    problemId,
    type: "claim_sent",
    description: `Претензия отправлена на ${claim.recipient}`,
    newStatus: ProblemStatus.SENT,
  });

  return NextResponse.json(claim);
}
