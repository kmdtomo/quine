import type { Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { githubError } from "../../lib/githubErrors";
import { assertVerifiedPersonalAccount } from "./accountVerification";
import { MAX_INSTALLATIONS_PER_USER } from "./installationLimit";

type ActivateVerifiedArgs = {
  accountId: number;
  accountLogin: string;
  accountType: "Organization" | "User";
  installationId: Id<"githubInstallations">;
  repositorySelection: "all" | "selected";
  userId: Id<"users">;
  verifiedGithubUserId: number;
};

export async function activateVerified(
  ctx: MutationCtx,
  args: ActivateVerifiedArgs,
): Promise<Id<"githubInstallations">> {
  const [pending, user] = await Promise.all([
    ctx.db.get("githubInstallations", args.installationId),
    ctx.db.get("users", args.userId),
  ]);
  if (
    !pending ||
    pending.userId !== args.userId ||
    pending.status !== "pending"
  ) {
    throw githubError("GITHUB_AUTHORIZATION_MISMATCH");
  }
  if (pending.verificationExpiresAt <= Date.now()) {
    throw githubError("GITHUB_AUTHORIZATION_EXPIRED");
  }
  assertVerifiedPersonalAccount(
    args.accountId,
    args.accountType,
    user?.githubId,
    args.verifiedGithubUserId,
  );

  const now = Date.now();
  const userInstallations = await ctx.db
    .query("githubInstallations")
    .withIndex("by_user", (q) => q.eq("userId", args.userId))
    .order("desc")
    .take(MAX_INSTALLATIONS_PER_USER);
  for (const installation of userInstallations) {
    if (
      installation._id !== pending._id &&
      installation.installationId === pending.installationId &&
      installation.status === "active"
    ) {
      await ctx.db.patch("githubInstallations", installation._id, {
        revokedAt: now,
        status: "revoked",
        updatedAt: now,
      });
    }
  }

  await ctx.db.patch("githubInstallations", pending._id, {
    accountId: args.accountId,
    accountLogin: args.accountLogin,
    accountType: args.accountType,
    repositorySelection: args.repositorySelection,
    status: "active",
    updatedAt: now,
    verifiedAt: now,
    verifiedByGithubId: args.verifiedGithubUserId,
    verificationExpiresAt: now,
    verificationStateHash: "",
  });
  return pending._id;
}
