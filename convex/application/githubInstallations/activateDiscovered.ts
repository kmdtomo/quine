import type { Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import { assertVerifiedPersonalAccount } from "./accountVerification";
import { MAX_INSTALLATIONS_PER_USER } from "./installationLimit";

type ActivateDiscoveredArgs = {
  accountId: number;
  accountLogin: string;
  accountType: "Organization" | "User";
  githubInstallationId: number;
  repositorySelection: "all" | "selected";
  userId: Id<"users">;
  verifiedGithubUserId: number;
};

export async function activateDiscovered(
  ctx: MutationCtx,
  args: ActivateDiscoveredArgs,
): Promise<Id<"githubInstallations">> {
  const user = await ctx.db.get("users", args.userId);
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
  const existing = userInstallations.find(
    (installation) =>
      installation.installationId === args.githubInstallationId,
  );
  const installationId =
    existing?._id ??
    (await ctx.db.insert("githubInstallations", {
      accountId: args.accountId,
      accountLogin: args.accountLogin,
      accountType: args.accountType,
      createdAt: now,
      installationId: args.githubInstallationId,
      repositorySelection: args.repositorySelection,
      status: "active",
      updatedAt: now,
      userId: args.userId,
      verifiedAt: now,
      verifiedByGithubId: args.verifiedGithubUserId,
      verificationExpiresAt: now,
      verificationStateHash: "",
    }));

  if (existing) {
    await ctx.db.patch("githubInstallations", existing._id, {
      accountId: args.accountId,
      accountLogin: args.accountLogin,
      accountType: args.accountType,
      repositorySelection: args.repositorySelection,
      revokedAt: undefined,
      status: "active",
      updatedAt: now,
      verifiedAt: now,
      verifiedByGithubId: args.verifiedGithubUserId,
      verificationExpiresAt: now,
      verificationStateHash: "",
    });
  }

  for (const installation of userInstallations) {
    if (
      installation._id !== installationId &&
      installation.installationId === args.githubInstallationId &&
      installation.status === "active"
    ) {
      await ctx.db.patch("githubInstallations", installation._id, {
        revokedAt: now,
        status: "revoked",
        updatedAt: now,
      });
    }
  }

  return installationId;
}
