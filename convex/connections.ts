import { v } from "convex/values";

import { getTechnologyByKey } from "../data/tech-stack";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import { getCurrentUser, requireUser } from "./lib/auth";
import { getUserByUsername } from "./lib/users";

const MAX_CONNECTIONS = 100;
const MAX_CONNECTION_TECHNOLOGIES = 6;

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return null;
    }

    return await listConnectionsFrom(ctx, user._id);
  },
});

export const listByDeveloper = query({
  args: {
    developerId: v.optional(v.id("users")),
    username: v.optional(v.string()),
  },
  handler: async (ctx, { developerId, username }) => {
    const developer =
      developerId === undefined
        ? username === undefined
          ? null
          : await getUserByUsername(ctx, username)
        : await ctx.db.get(developerId);
    if (!developer || developer.isPublic === false) {
      return null;
    }

    return await listConnectionsFrom(ctx, developer._id);
  },
});

export const add = mutation({
  args: {
    toDeveloperId: v.optional(v.id("users")),
    username: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    return await addConnection(ctx, user, args);
  },
});

export const follow = add;

export const approve = mutation({
  args: {
    fromDeveloperId: v.optional(v.id("users")),
    username: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const source = await resolveDeveloper(ctx, {
      developerId: args.fromDeveloperId,
      username: args.username,
    });
    if (!source) {
      throw new Error("Connection user not found.");
    }

    const incoming = await ctx.db
      .query("connections")
      .withIndex("by_pair", (q) =>
        q.eq("fromDeveloperId", source._id).eq("toDeveloperId", user._id),
      )
      .first();
    if (!incoming) {
      throw new Error("Connection request not found.");
    }

    return await addConnection(ctx, user, { toDeveloperId: source._id });
  },
});

export const remove = mutation({
  args: {
    toDeveloperId: v.optional(v.id("users")),
    username: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const target = await resolveDeveloper(ctx, {
      developerId: args.toDeveloperId,
      username: args.username,
    });
    if (!target) {
      return;
    }

    const current = await ctx.db
      .query("connections")
      .withIndex("by_pair", (q) =>
        q.eq("fromDeveloperId", user._id).eq("toDeveloperId", target._id),
      )
      .first();
    if (!current) {
      return;
    }

    await ctx.db.delete(current._id);
  },
});

export const unfollow = remove;

async function addConnection(
  ctx: MutationCtx,
  user: Doc<"users">,
  args: {
    toDeveloperId?: Id<"users">;
    username?: string;
  },
) {
  const target = await resolveDeveloper(ctx, {
    developerId: args.toDeveloperId,
    username: args.username,
  });
  if (!target) {
    throw new Error("Connection user not found.");
  }
  if (target._id === user._id) {
    throw new Error("You cannot connect to yourself.");
  }

  const current = await ctx.db
    .query("connections")
    .withIndex("by_pair", (q) =>
      q.eq("fromDeveloperId", user._id).eq("toDeveloperId", target._id),
    )
    .first();
  if (current) {
    return current._id;
  }

  return await ctx.db.insert("connections", {
    fromDeveloperId: user._id,
    toDeveloperId: target._id,
  });
}

async function resolveDeveloper(
  ctx: Parameters<typeof requireUser>[0],
  {
    developerId,
    username,
  }: {
    developerId?: Id<"users">;
    username?: string;
  },
) {
  if (developerId !== undefined) {
    return await ctx.db.get(developerId);
  }
  if (username !== undefined) {
    return await getUserByUsername(ctx, username);
  }
  return null;
}

async function listConnectionsFrom(
  ctx: Parameters<typeof getCurrentUser>[0],
  developerId: Id<"users">,
) {
  const rows = await ctx.db
    .query("connections")
    .withIndex("by_from", (q) => q.eq("fromDeveloperId", developerId))
    .take(MAX_CONNECTIONS);
  const connections = [];

  for (const row of rows) {
    const connectedUser = await ctx.db.get(row.toDeveloperId);
    if (!connectedUser || connectedUser.isPublic === false) {
      continue;
    }

    connections.push({
      _id: row._id,
      company: connectedUser.company,
      image: connectedUser.image,
      name: connectedUser.name,
      role: connectedUser.role,
      technologies: await getDeveloperTechnologies(ctx, connectedUser._id),
      username: connectedUser.username,
    });
  }

  return connections;
}

async function getDeveloperTechnologies(
  ctx: Parameters<typeof getCurrentUser>[0],
  developerId: Id<"users">,
) {
  const rows = await ctx.db
    .query("developerTechnologies")
    .withIndex("by_developer_order", (q) => q.eq("developerId", developerId))
    .take(MAX_CONNECTION_TECHNOLOGIES);

  return rows.flatMap((row) => {
    const technology = getTechnologyByKey(row.technologyKey);
    if (!technology) {
      return [];
    }

    return [
      {
        name: technology.name,
        technologyKey: row.technologyKey,
      },
    ];
  });
}
