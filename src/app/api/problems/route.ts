import { NextResponse } from "next/server";
import { fetchProblems } from "@/lib/mock-1c";

export async function GET() {
  return NextResponse.json(fetchProblems());
}
