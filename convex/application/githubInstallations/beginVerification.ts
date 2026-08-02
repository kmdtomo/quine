import type { Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { MAX_INSTALLATIONS_PER_USER } from "./installationLimit";

const VERIFICATION_TTL_MS = 10 * 60 * 1000;

type BeginVerificationArgs = {
  codeChallenge: string;
  installationId: number;
  stateHash: string;
};

export async function beginVerification(
  ctx: MutationCtx,
  args: BeginVerificationArgs,
  userId: Id<"users">,
): Promise<void> {
  const now = Date.now();
  const rows = await ctx.db
    .query("githubInstallations")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .order("desc")
    .take(MAX_INSTALLATIONS_PER_USER);
  const pending = rows.find(
    (row) =>
      row.installationId === args.installationId &&
      row.status === "pending",
  );

  if (pending) {
    await ctx.db.patch("githubInstallations", pending._id, {
      verificationExpiresAt: now + VERIFICATION_TTL_MS,
      verificationStateHash: args.stateHash,
      updatedAt: now,
    });
  } else {
    await ctx.db.insert("githubInstallations", {
      createdAt: now,
      installationId: args.installationId,
      status: "pending",
      updatedAt: now,
      userId: userId,
      verificationExpiresAt: now + VERIFICATION_TTL_MS,
      verificationStateHash: args.stateHash,
    });
  }
}
