import { Claim } from "./models";

const claims = new Map<string, Claim>();

export function getClaim(problemId: string): Claim | null {
  return claims.get(problemId) ?? null;
}

export function setClaim(problemId: string, claim: Claim): void {
  claims.set(problemId, claim);
}
