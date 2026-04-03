import { NextRequest, NextResponse } from "next/server";
import { getProblemById, updateProblemStatus } from "@/lib/mock-1c";
import { generateClaim } from "@/lib/claim-generator";
import { getClaim, setClaim } from "@/lib/claims-store";
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
  _req: NextRequest,
  { params }: { params: Promise<{ problemId: string }> },
) {
  const { problemId } = await params;
  const problem = getProblemById(problemId);
  if (!problem) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const claim = generateClaim(problem);
  setClaim(problemId, claim);
  updateProblemStatus(problemId, ProblemStatus.CLAIM_GENERATED);
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
  return NextResponse.json(claim);
}
