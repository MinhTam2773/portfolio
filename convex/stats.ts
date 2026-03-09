import { mutation, query } from "./_generated/server";

const STATS_KEY = "portfolio";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const stats = await ctx.db
      .query("stats")
      .withIndex("by_key", (q) => q.eq("key", STATS_KEY))
      .unique();

    return {
      views: stats?.views ?? 0,
      likes: stats?.likes ?? 0,
    };
  },
});

export const incrementView = mutation({
  args: {},
  handler: async (ctx) => {
    const stats = await ctx.db
      .query("stats")
      .withIndex("by_key", (q) => q.eq("key", STATS_KEY))
      .unique();

    if (!stats) {
      await ctx.db.insert("stats", {
        key: STATS_KEY,
        views: 1,
        likes: 0,
      });

      return {
        views: 1,
        likes: 0,
      };
    }

    const views = stats.views + 1;
    await ctx.db.patch(stats._id, { views });

    return {
      views,
      likes: stats.likes,
    };
  },
});

export const incrementLike = mutation({
  args: {},
  handler: async (ctx) => {
    const stats = await ctx.db
      .query("stats")
      .withIndex("by_key", (q) => q.eq("key", STATS_KEY))
      .unique();

    if (!stats) {
      await ctx.db.insert("stats", {
        key: STATS_KEY,
        views: 0,
        likes: 1,
      });

      return {
        views: 0,
        likes: 1,
      };
    }

    const likes = stats.likes + 1;
    await ctx.db.patch(stats._id, { likes });

    return {
      views: stats.views,
      likes,
    };
  },
});
