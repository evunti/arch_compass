import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";

// ✅ Query to fetch all test results for a user
export const getAllTestResults = query({
  args: { userId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    // If userId is provided, filter by userId, else return all
    let results;
    if (args.userId) {
      results = await ctx.db
        .query("testResults")
        .withIndex("by_session")
        .order("desc")
        .collect();
      // Filter by user and exclude expired results
      const now = Date.now();
      results = results
        .filter((result) => result.userId === args.userId)
        .filter((result) => !result.expiresAt || result.expiresAt > now)
        .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));
    } else {
      const now = Date.now();
      results = (
        await ctx.db.query("testResults").order("desc").collect()
      ).filter((r) => !r.expiresAt || r.expiresAt > now);
    }
    return results;
  },
});

// ✅ Save test result mutation
export const saveTestResult = mutation({
  args: {
    sessionId: v.string(),
    answers: v.array(v.number()),
    scores: v.optional(
      v.object({
        cowboy: v.number(),
        pirate: v.number(),
        werewolf: v.number(),
        vampire: v.number(),
      })
    ),
    dominantType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);

    // Use scores/dominantType provided by the client when available. The
    // frontend computes this using the question score matrix to ensure the
    // same logic as the UI. If not provided, fall back to a simple slice-based
    // approximation.
    let scores = args.scores;
    let dominantType = args.dominantType;

    if (!scores) {
      const cowboy = args.answers.slice(0, 7).reduce((sum, val) => sum + val, 0);
      const pirate = args.answers.slice(7, 14).reduce((sum, val) => sum + val, 0);
      const werewolf = args.answers
        .slice(14, 21)
        .reduce((sum, val) => sum + val, 0);
      const vampire = args.answers
        .slice(21, 28)
        .reduce((sum, val) => sum + val, 0);

      scores = {
        cowboy,
        pirate,
        werewolf,
        vampire,
      };
    }

    if (!dominantType) {
      const maxScore = Math.max(scores.cowboy, scores.pirate, scores.werewolf, scores.vampire);
      const topTypes = Object.entries(scores)
        .filter(([_, score]) => score >= maxScore - 3)
        .map(([type]) => type.toLowerCase())
        .sort();

      if (topTypes.length === 4) {
        dominantType = "all four";
      } else if (topTypes.length > 1) {
        dominantType = topTypes.join("+");
      } else {
        dominantType = topTypes[0];
      }
    }

    // Save to DB with an expiry 1 day from now. If a result for this session
    // already exists, replace it so we keep one record per session (upsert).
    const completedAt = Date.now();
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;
    const expiresAt = completedAt + ONE_DAY_MS;

    // Always insert a new record so users can retain a history of attempts.
    const record = {
      userId: userId || undefined,
      sessionId: args.sessionId,
      answers: args.answers,
      scores,
      dominantType,
      completedAt,
      expiresAt,
    } as any;

    const resultId = await ctx.db.insert("testResults", record);

    return { resultId, scores, dominantType };
  },
});

export const getTestResult = query({
  args: { sessionId: v.string() },
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query("testResults")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .order("desc")
      .first();
    if (!result) return null;

    // If expired, treat as not found
    if (result.expiresAt && result.expiresAt <= Date.now()) return null;
    // Only return the fields needed for the frontend
    return {
      scores: result.scores,
      dominantType: result.dominantType,
      answers: result.answers,
      sessionId: result.sessionId,
      completedAt: result.completedAt,
    };
  },
});

// Internal one-time migration: recompute the canonical `scores` and
// `dominantType` for existing `testResults` rows using the same per-question
// scoring matrix the frontend uses. This will PATCH each non-expired record
// with `{ scores, dominantType }` so old records match current scoring logic.
export const recomputeSavedScores = internalMutation({
  args: {},
  returns: v.number(),
  handler: async (ctx, _args) => {
    // NOTE: keep this mapping in sync with `src/components/Questionnaire.tsx`.
    // We only need the `scores` mapping for each question here.
    const questions: Array<{ scores: any }> = [
      { scores: {
        stronglyDisagree: { Cowboy: 0, Pirate: 0, Werewolf: 0, Vampire: 5 },
        disagree: { Cowboy: 0, Pirate: 0, Werewolf: 3, Vampire: 3 },
        neutral: { Cowboy: 3, Pirate: 0, Werewolf: 2, Vampire: 1 },
        agree: { Cowboy: 4, Pirate: 0, Werewolf: 0, Vampire: 0 },
        stronglyAgree: { Cowboy: 5, Pirate: 0, Werewolf: 0, Vampire: 0 },
      }},
      { scores: {
        stronglyDisagree: { Cowboy: 0, Pirate: 0, Werewolf: 0, Vampire: 5 },
        disagree: { Cowboy: 1, Pirate: 0, Werewolf: 3, Vampire: 4 },
        neutral: { Cowboy: 3, Pirate: 2, Werewolf: 3, Vampire: 3 },
        agree: { Cowboy: 4, Pirate: 2, Werewolf: 1, Vampire: 1 },
        stronglyAgree: { Cowboy: 5, Pirate: 0, Werewolf: 0, Vampire: 0 },
      }},
      { scores: {
        stronglyDisagree: { Cowboy: 0, Pirate: 0, Werewolf: 0, Vampire: 5 },
        disagree: { Cowboy: 1, Pirate: 2, Werewolf: 3, Vampire: 4 },
        neutral: { Cowboy: 3, Pirate: 2, Werewolf: 3, Vampire: 3 },
        agree: { Cowboy: 4, Pirate: 2, Werewolf: 1, Vampire: 1 },
        stronglyAgree: { Cowboy: 5, Pirate: 0, Werewolf: 0, Vampire: 0 },
      }},
      { scores: {
        stronglyDisagree: { Cowboy: 0, Pirate: 0, Werewolf: 0, Vampire: 5 },
        disagree: { Cowboy: 1, Pirate: 3, Werewolf: 2, Vampire: 4 },
        neutral: { Cowboy: 3, Pirate: 1, Werewolf: 2, Vampire: 3 },
        agree: { Cowboy: 4, Pirate: 0, Werewolf: 3, Vampire: 1 },
        stronglyAgree: { Cowboy: 5, Pirate: 0, Werewolf: 0, Vampire: 0 },
      }},
      { scores: {
        stronglyDisagree: { Cowboy: 0, Pirate: 0, Werewolf: 0, Vampire: 5 },
        disagree: { Cowboy: 1, Pirate: 2, Werewolf: 2, Vampire: 4 },
        neutral: { Cowboy: 3, Pirate: 1, Werewolf: 2, Vampire: 3 },
        agree: { Cowboy: 4, Pirate: 1, Werewolf: 3, Vampire: 1 },
        stronglyAgree: { Cowboy: 5, Pirate: 0, Werewolf: 0, Vampire: 0 },
      }},
      { scores: {
        stronglyDisagree: { Cowboy: 0, Pirate: 0, Werewolf: 0, Vampire: 5 },
        disagree: { Cowboy: 1, Pirate: 1, Werewolf: 3, Vampire: 4 },
        neutral: { Cowboy: 3, Pirate: 2, Werewolf: 3, Vampire: 3 },
        agree: { Cowboy: 4, Pirate: 3, Werewolf: 2, Vampire: 1 },
        stronglyAgree: { Cowboy: 5, Pirate: 0, Werewolf: 0, Vampire: 0 },
      }},
      { scores: {
        stronglyDisagree: { Cowboy: 0, Pirate: 0, Werewolf: 0, Vampire: 5 },
        disagree: { Cowboy: 1, Pirate: 3, Werewolf: 2, Vampire: 4 },
        neutral: { Cowboy: 3, Pirate: 2, Werewolf: 2, Vampire: 2 },
        agree: { Cowboy: 4, Pirate: 0, Werewolf: 3, Vampire: 1 },
        stronglyAgree: { Cowboy: 5, Pirate: 0, Werewolf: 0, Vampire: 0 },
      }},

      // Pirate block (questions 8-14)
      { scores: {
        stronglyDisagree: { Cowboy: 0, Pirate: 0, Werewolf: 0, Vampire: 4 },
        disagree: { Cowboy: 0, Pirate: 1, Werewolf: 0, Vampire: 3 },
        neutral: { Cowboy: 0, Pirate: 3, Werewolf: 0, Vampire: 0 },
        agree: { Cowboy: 0, Pirate: 4, Werewolf: 0, Vampire: 2 },
        stronglyAgree: { Cowboy: 0, Pirate: 5, Werewolf: 0, Vampire: 0 },
      }},
      { scores: {
        stronglyDisagree: { Cowboy: 0, Pirate: 0, Werewolf: 4, Vampire: 0 },
        disagree: { Cowboy: 0, Pirate: 1, Werewolf: 3, Vampire: 0 },
        neutral: { Cowboy: 0, Pirate: 3, Werewolf: 2, Vampire: 1 },
        agree: { Cowboy: 0, Pirate: 4, Werewolf: 0, Vampire: 2 },
        stronglyAgree: { Cowboy: 0, Pirate: 5, Werewolf: 0, Vampire: 3 },
      }},
      { scores: {
        stronglyDisagree: { Cowboy: 0, Pirate: 0, Werewolf: 4, Vampire: 3 },
        disagree: { Cowboy: 0, Pirate: 1, Werewolf: 3, Vampire: 2 },
        neutral: { Cowboy: 0, Pirate: 3, Werewolf: 1, Vampire: 2 },
        agree: { Cowboy: 2, Pirate: 4, Werewolf: 0, Vampire: 1 },
        stronglyAgree: { Cowboy: 1, Pirate: 5, Werewolf: 0, Vampire: 0 },
      }},
      { scores: {
        stronglyDisagree: { Cowboy: 0, Pirate: 0, Werewolf: 4, Vampire: 3 },
        disagree: { Cowboy: 0, Pirate: 1, Werewolf: 3, Vampire: 2 },
        neutral: { Cowboy: 1, Pirate: 3, Werewolf: 2, Vampire: 2 },
        agree: { Cowboy: 2, Pirate: 4, Werewolf: 1, Vampire: 1 },
        stronglyAgree: { Cowboy: 1, Pirate: 5, Werewolf: 0, Vampire: 0 },
      }},
      { scores: {
        stronglyDisagree: { Cowboy: 0, Pirate: 0, Werewolf: 4, Vampire: 3 },
        disagree: { Cowboy: 0, Pirate: 1, Werewolf: 3, Vampire: 2 },
        neutral: { Cowboy: 0, Pirate: 3, Werewolf: 1, Vampire: 2 },
        agree: { Cowboy: 2, Pirate: 4, Werewolf: 0, Vampire: 1 },
        stronglyAgree: { Cowboy: 1, Pirate: 5, Werewolf: 0, Vampire: 0 },
      }},
      { scores: {
        stronglyDisagree: { Cowboy: 0, Pirate: 0, Werewolf: 0, Vampire: 5 },
        disagree: { Cowboy: 0, Pirate: 1, Werewolf: 2, Vampire: 4 },
        neutral: { Cowboy: 0, Pirate: 3, Werewolf: 1, Vampire: 3 },
        agree: { Cowboy: 2, Pirate: 4, Werewolf: 0, Vampire: 1 },
        stronglyAgree: { Cowboy: 1, Pirate: 5, Werewolf: 0, Vampire: 0 },
      }},

      // Werewolf block (15-21)
      { scores: {
        stronglyDisagree: { Cowboy: 0, Pirate: 5, Werewolf: 0, Vampire: 0 },
        disagree: { Cowboy: 0, Pirate: 4, Werewolf: 1, Vampire: 4 },
        neutral: { Cowboy: 0, Pirate: 3, Werewolf: 3, Vampire: 0 },
        agree: { Cowboy: 0, Pirate: 1, Werewolf: 4, Vampire: 2 },
        stronglyAgree: { Cowboy: 0, Pirate: 0, Werewolf: 5, Vampire: 0 },
      }},
      { scores: {
        stronglyDisagree: { Cowboy: 0, Pirate: 5, Werewolf: 0, Vampire: 0 },
        disagree: { Cowboy: 0, Pirate: 4, Werewolf: 1, Vampire: 4 },
        neutral: { Cowboy: 0, Pirate: 3, Werewolf: 3, Vampire: 0 },
        agree: { Cowboy: 0, Pirate: 1, Werewolf: 4, Vampire: 2 },
        stronglyAgree: { Cowboy: 0, Pirate: 0, Werewolf: 5, Vampire: 0 },
      }},
      { scores: {
        stronglyDisagree: { Cowboy: 0, Pirate: 5, Werewolf: 0, Vampire: 0 },
        disagree: { Cowboy: 0, Pirate: 4, Werewolf: 1, Vampire: 4 },
        neutral: { Cowboy: 0, Pirate: 3, Werewolf: 3, Vampire: 0 },
        agree: { Cowboy: 0, Pirate: 1, Werewolf: 4, Vampire: 2 },
        stronglyAgree: { Cowboy: 0, Pirate: 0, Werewolf: 5, Vampire: 0 },
      }},
      { scores: {
        stronglyDisagree: { Cowboy: 0, Pirate: 5, Werewolf: 0, Vampire: 0 },
        disagree: { Cowboy: 0, Pirate: 4, Werewolf: 1, Vampire: 3 },
        neutral: { Cowboy: 2, Pirate: 3, Werewolf: 3, Vampire: 1 },
        agree: { Cowboy: 3, Pirate: 1, Werewolf: 4, Vampire: 2 },
        stronglyAgree: { Cowboy: 0, Pirate: 0, Werewolf: 5, Vampire: 0 },
      }},
      { scores: {
        stronglyDisagree: { Cowboy: 0, Pirate: 5, Werewolf: 0, Vampire: 0 },
        disagree: { Cowboy: 0, Pirate: 4, Werewolf: 1, Vampire: 3 },
        neutral: { Cowboy: 2, Pirate: 3, Werewolf: 3, Vampire: 1 },
        agree: { Cowboy: 3, Pirate: 1, Werewolf: 4, Vampire: 2 },
        stronglyAgree: { Cowboy: 0, Pirate: 0, Werewolf: 5, Vampire: 0 },
      }},
      { scores: {
        stronglyDisagree: { Cowboy: 0, Pirate: 5, Werewolf: 0, Vampire: 0 },
        disagree: { Cowboy: 0, Pirate: 4, Werewolf: 1, Vampire: 1 },
        neutral: { Cowboy: 2, Pirate: 3, Werewolf: 3, Vampire: 1 },
        agree: { Cowboy: 2, Pirate: 1, Werewolf: 4, Vampire: 3 },
        stronglyAgree: { Cowboy: 0, Pirate: 0, Werewolf: 5, Vampire: 2 },
      }},

      // Vampire block (22-28)
      { scores: {
        stronglyDisagree: { Cowboy: 0, Pirate: 5, Werewolf: 2, Vampire: 0 },
        disagree: { Cowboy: 3, Pirate: 4, Werewolf: 3, Vampire: 1 },
        neutral: { Cowboy: 2, Pirate: 1, Werewolf: 2, Vampire: 3 },
        agree: { Cowboy: 1, Pirate: 1, Werewolf: 2, Vampire: 4 },
        stronglyAgree: { Cowboy: 0, Pirate: 0, Werewolf: 1, Vampire: 5 },
      }},
      { scores: {
        stronglyDisagree: { Cowboy: 5, Pirate: 2, Werewolf: 2, Vampire: 0 },
        disagree: { Cowboy: 4, Pirate: 3, Werewolf: 3, Vampire: 1 },
        neutral: { Cowboy: 0, Pirate: 0, Werewolf: 0, Vampire: 3 },
        agree: { Cowboy: 2, Pirate: 2, Werewolf: 2, Vampire: 4 },
        stronglyAgree: { Cowboy: 1, Pirate: 1, Werewolf: 1, Vampire: 5 },
      }},
      { scores: {
        stronglyDisagree: { Cowboy: 0, Pirate: 0, Werewolf: 5, Vampire: 0 },
        disagree: { Cowboy: 3, Pirate: 1, Werewolf: 4, Vampire: 1 },
        neutral: { Cowboy: 2, Pirate: 2, Werewolf: 3, Vampire: 3 },
        agree: { Cowboy: 2, Pirate: 2, Werewolf: 1, Vampire: 4 },
        stronglyAgree: { Cowboy: 0, Pirate: 0, Werewolf: 0, Vampire: 5 },
      }},
      { scores: {
        stronglyDisagree: { Cowboy: 0, Pirate: 5, Werewolf: 0, Vampire: 0 },
        disagree: { Cowboy: 3, Pirate: 4, Werewolf: 2, Vampire: 1 },
        neutral: { Cowboy: 2, Pirate: 2, Werewolf: 3, Vampire: 3 },
        agree: { Cowboy: 1, Pirate: 1, Werewolf: 3, Vampire: 4 },
        stronglyAgree: { Cowboy: 0, Pirate: 0, Werewolf: 0, Vampire: 5 },
      }},
      { scores: {
        stronglyDisagree: { Cowboy: 0, Pirate: 5, Werewolf: 0, Vampire: 0 },
        disagree: { Cowboy: 3, Pirate: 4, Werewolf: 2, Vampire: 1 },
        neutral: { Cowboy: 2, Pirate: 2, Werewolf: 3, Vampire: 3 },
        agree: { Cowboy: 1, Pirate: 1, Werewolf: 3, Vampire: 4 },
        stronglyAgree: { Cowboy: 0, Pirate: 0, Werewolf: 0, Vampire: 5 },
      }},
    ];

    const choiceMap: Record<number, keyof typeof questions[0]["scores"]> = {
      1: "stronglyDisagree",
      2: "disagree",
      3: "neutral",
      4: "agree",
      5: "stronglyAgree",
    };

    const now = Date.now();
    const rows = await ctx.db.query("testResults").order("asc").collect();
    let count = 0;

    for (const row of rows) {
      // skip expired
      if (row.expiresAt && row.expiresAt <= now) continue;
      const answers: number[] = row.answers || [];

      const totals: Record<string, number> = { Cowboy: 0, Pirate: 0, Werewolf: 0, Vampire: 0 };

      for (let idx = 0; idx < Math.min(answers.length, questions.length); idx++) {
        const val = answers[idx];
        if (!val) continue;
        const q = questions[idx];
        const key = choiceMap[val];
        const set = q.scores[key];
        totals.Cowboy += set.Cowboy || 0;
        totals.Pirate += set.Pirate || 0;
        totals.Werewolf += set.Werewolf || 0;
        totals.Vampire += set.Vampire || 0;
      }

      const scores = {
        cowboy: totals.Cowboy,
        pirate: totals.Pirate,
        werewolf: totals.Werewolf,
        vampire: totals.Vampire,
      };

      const maxScore = Math.max(scores.cowboy, scores.pirate, scores.werewolf, scores.vampire);
      const topTypes = Object.entries(scores)
        .filter(([_, score]) => score >= maxScore - 3)
        .map(([type]) => type)
        .sort();

      let dominantType: string;
      if (topTypes.length === 4) {
        dominantType = "all four";
      } else if (topTypes.length > 1) {
        dominantType = topTypes.join("+");
      } else {
        dominantType = topTypes[0] || "unknown";
      }

      // Patch the existing document with the canonical scores/dominantType
      await ctx.db.patch(row._id, { scores, dominantType });
      count++;
    }

    return count;
  },
});

// Public wrapper to trigger the internal migration from a client/dev console.
export const runRecomputeSavedScores = mutation({
  args: {},
  returns: v.number(),
  handler: async (ctx, _args) => {
    const count: number = await ctx.runMutation(internal.tests.recomputeSavedScores, {});
    return count;
  },
});
