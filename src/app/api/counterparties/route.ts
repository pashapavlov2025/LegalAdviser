import { NextResponse } from "next/server";
import { getCounterparties } from "@/lib/mock-1c";

export async function GET() {
  return NextResponse.json(getCounterparties());
}
