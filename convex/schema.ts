import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  stats: defineTable({
    key: v.string(),
    views: v.number(),
    likes: v.number(),
  }).index("by_key", ["key"]),
});
