import type { Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";

export async function findActiveRun(
  ctx: MutationCtx,
  threadId: Id<"productAiThreads">,
) {
  const [running, queued] = await Promise.all([
    ctx.db
      .query("productAiRuns")
      .withIndex("by_thread_status", (q) =>
        q.eq("threadId", threadId).eq("status", "running"),
      )
      .first(),
    ctx.db
      .query("productAiRuns")
      .withIndex("by_thread_status", (q) =>
        q.eq("threadId", threadId).eq("status", "queued"),
      )
      .first(),
  ]);
  return running ?? queued;
}
