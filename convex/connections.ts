import {
  paginationOptsValidator,
  paginationResultValidator,
  type PaginationOptions,
} from "convex/server";
import { ConvexError, v } from "convex/values";

import { getTechnologyByKey } from "../data/tech-stack";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./lib/auth";
import { getUserByUsername } from "./lib/users";

const MAX_CONNECTIONS_PER_PAGE = 50;
const MAX_CONNECTION_TECHNOLOGIES = 6;

const connectionTechnologyValue = v.object({
  name: v.string(),
  technologyKey: v.string(),
});

const connectionValue = v.object({
  _id: v.id("connections"),
  company: v.optional(v.string()),
  image: v.optional(v.string()),
  name: v.optional(v.string()),
  role: v.optional(v.string()),
  technologies: v.array(connectionTechnologyValue),
  username: v.optional(v.string()),
});

export const listMine = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  returns: paginationResultValidator(connectionValue),
  handler: async (ctx, { paginationOpts }) => {
    const user = await getCurrentUser(ctx);
    if (!user) {
      return emptyConnectionPage(paginationOpts);
    }

    return await listConnectionsFrom(ctx, user._id, paginationOpts);
  },
});

export const listByDeveloper = query({
  args: {
    developerId: v.optional(v.id("users")),
    paginationOpts: paginationOptsValidator,
    username: v.optional(v.string()),
  },
  returns: paginationResultValidator(connectionValue),
  handler: async (ctx, { developerId, paginationOpts, username }) => {
    const developer =
      developerId === undefined
        ? username === undefined
          ? null
          : await getUserByUsername(ctx, username)
        : await ctx.db.get("users", developerId);
    if (!developer || developer.isPublic === false) {
      return emptyConnectionPage(paginationOpts);
    }

    return await listConnectionsFrom(ctx, developer._id, paginationOpts);
  },
});

export const add = mutation({
  args: {
    toDeveloperId: v.optional(v.id("users")),
    username: v.optional(v.string()),
  },
  returns: v.id("connections"),
  handler: async (ctx, args) => {
    const user = await requireConnectionUser(ctx);
    return await addConnection(ctx, user, args);
  },
});

export const approve = mutation({
  args: {
    fromDeveloperId: v.optional(v.id("users")),
    username: v.optional(v.string()),
  },
  returns: v.id("connections"),
  handler: async (ctx, args) => {
    const user = await requireConnectionUser(ctx);
    const source = await resolveDeveloper(ctx, {
      developerId: args.fromDeveloperId,
      username: args.username,
    });
    if (!source) {
      throw new ConvexError({
        code: "CONNECTION_USER_NOT_FOUND",
        message: "Connection user not found.",
      });
    }

    const incoming = await ctx.db
      .query("connections")
      .withIndex("by_pair", (q) =>
        q.eq("fromDeveloperId", source._id).eq("toDeveloperId", user._id),
      )
      .first();
    if (!incoming) {
      throw new ConvexError({
        code: "CONNECTION_REQUEST_NOT_FOUND",
        message: "Connection request not found.",
      });
    }

    return await addConnection(ctx, user, { toDeveloperId: source._id });
  },
});

export const remove = mutation({
  args: {
    toDeveloperId: v.optional(v.id("users")),
    username: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const user = await requireConnectionUser(ctx);
    const target = await resolveDeveloper(ctx, {
      developerId: args.toDeveloperId,
      username: args.username,
    });
    if (!target) {
      return null;
    }

    const current = await ctx.db
      .query("connections")
      .withIndex("by_pair", (q) =>
        q.eq("fromDeveloperId", user._id).eq("toDeveloperId", target._id),
      )
      .first();
    if (!current) {
      return null;
    }

    await ctx.db.delete("connections", current._id);
    return null;
  },
});

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
    throw new ConvexError({
      code: "CONNECTION_USER_NOT_FOUND",
      message: "Connection user not found.",
    });
  }
  if (target._id === user._id) {
    throw new ConvexError({
      code: "SELF_CONNECTION_NOT_ALLOWED",
      message: "You cannot connect to yourself.",
    });
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
  ctx: QueryCtx | MutationCtx,
  {
    developerId,
    username,
  }: {
    developerId?: Id<"users">;
    username?: string;
  },
) {
  if (developerId !== undefined) {
    return await ctx.db.get("users", developerId);
  }
  if (username !== undefined) {
    return await getUserByUsername(ctx, username);
  }
  return null;
}

async function listConnectionsFrom(
  ctx: Parameters<typeof getCurrentUser>[0],
  developerId: Id<"users">,
  paginationOpts: PaginationOptions,
) {
  const result = await ctx.db
    .query("connections")
    .withIndex("by_from", (q) => q.eq("fromDeveloperId", developerId))
    .paginate({
      ...paginationOpts,
      numItems: normalizePageSize(paginationOpts.numItems),
    });
  const connections = [];

  for (const row of result.page) {
    const connectedUser = await ctx.db.get("users", row.toDeveloperId);
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

  return {
    ...result,
    page: connections,
  };
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

async function requireConnectionUser(ctx: QueryCtx | MutationCtx) {
  const user = await getCurrentUser(ctx);
  if (user === null) {
    throw new ConvexError({
      code: "UNAUTHORIZED",
      message: "Authentication is required.",
    });
  }

  return user;
}

function emptyConnectionPage(paginationOpts: PaginationOptions) {
  return {
    continueCursor: paginationOpts.cursor ?? "",
    isDone: true,
    page: [],
  };
}

function normalizePageSize(numItems: number) {
  if (!Number.isFinite(numItems)) {
    return MAX_CONNECTIONS_PER_PAGE;
  }
  return Math.min(
    MAX_CONNECTIONS_PER_PAGE,
    Math.max(1, Math.floor(numItems)),
  );
}
