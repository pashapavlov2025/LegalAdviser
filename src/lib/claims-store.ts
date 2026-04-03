import { Claim, TimelineEvent } from "./models";

const claims = new Map<string, Claim>();
const timelines = new Map<string, TimelineEvent[]>();

let eventCounter = 0;

// Claims
export function getClaim(problemId: string): Claim | null {
  return claims.get(problemId) ?? null;
}

export function setClaim(problemId: string, claim: Claim): void {
  claims.set(problemId, claim);
}

// Timeline
export function getTimeline(problemId: string): TimelineEvent[] {
  return timelines.get(problemId) ?? [];
}

export function addTimelineEvent(
  problemId: string,
  event: Omit<TimelineEvent, "id" | "timestamp">,
): TimelineEvent {
  const full: TimelineEvent = {
    ...event,
    id: `EVT-${++eventCounter}`,
    timestamp: new Date().toISOString(),
  };
  const list = timelines.get(problemId) ?? [];
  list.push(full);
  timelines.set(problemId, list);
  return full;
}
