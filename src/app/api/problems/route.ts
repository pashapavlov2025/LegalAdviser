import { NextRequest, NextResponse } from "next/server";
import { fetchProblems, addProblem, nextProblemId, getCounterparties, addCounterparty } from "@/lib/mock-1c";
import { ProblemStatus } from "@/lib/models";

export async function GET() {
  return NextResponse.json(fetchProblems());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { counterparty, problemType, description, amount, contractNumber, contractDate } = body;

  let cp = counterparty;
  if (cp.id === "__new__") {
    const counterparties = getCounterparties();
    cp = { ...cp, id: `CP-${(counterparties.length + 1).toString().padStart(3, "0")}` };
    addCounterparty(cp);
  }

  const problem = {
    id: nextProblemId(),
    date: new Date().toISOString().split("T")[0],
    counterparty: cp,
    problemType,
    description,
    amount: Number(amount) || 0,
    contractNumber,
    contractDate,
    status: ProblemStatus.NEW,
  };

  addProblem(problem);
  return NextResponse.json(problem, { status: 201 });
}
