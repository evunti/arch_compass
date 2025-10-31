import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  testResults: defineTable({
    userId: v.optional(v.id("users")),
    sessionId: v.string(),
    answers: v.array(v.number()),
    scores: v.object({
      cowboy: v.number(),
      pirate: v.number(),
      werewolf: v.number(),
      vampire: v.number(),
    }),
    dominantType: v.string(),
    completedAt: v.number(),
    // Optional expiry timestamp (ms since epoch). If set, results older than this
    // should be considered expired and omitted from queries.
    expiresAt: v.optional(v.number()),
  }).index("by_session", ["sessionId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
