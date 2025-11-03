"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import NavBar from "../../../components/navbar";

export default function History() {
  const router = useRouter();

  const handleView = (result: any) => {
    // Navigate to results page with the result data
    const searchParams = new URLSearchParams();
    if (result.sessionId) {
      searchParams.set("sessionId", result.sessionId);
    }
    router.push(`/results?${searchParams.toString()}`);
  };
  const loggedInUser = useQuery(api.auth.loggedInUser);

  const userResults = useQuery(
    api.tests.getAllTestResults,
    loggedInUser && !loggedInUser.isAnonymous
      ? { userId: loggedInUser._id?.toString?.() }
      : "skip"
  );

  let localHistory: any[] = [];
  try {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("resultsHistory");
      if (raw) localHistory = JSON.parse(raw);
    }
  } catch (e) {}

  const items: any[] = [];
  if (Array.isArray(userResults) && userResults.length) {
    for (const r of userResults) items.push(r);
  }
  if (Array.isArray(localHistory) && localHistory.length) {
    for (const r of localHistory) items.push(r);
  }

  if (!items.length) {
    return (
      <div>
        <NavBar />
        <div className="max-w-4xl mx-auto p-6 text-center">
          <h3 className="text-xl font-semibold mb-2">No saved results</h3>
          <p className="text-gray-600 mb-6">
            You don't have any saved results yet.
          </p>
          <button
            onClick={() => router.push("/questionnaire")}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Take Your First Test
          </button>
        </div>
      </div>
    );
  }

  function titleFromType(type: string | undefined | null) {
    if (!type) return "Result";
    if (type === "all four") return "All Four";
    return type
      .split("+")
      .map((t) => t.charAt(0).toUpperCase() + t.slice(1))
      .join(" + ");
  }

  const archetypeEmojis: Record<string, string> = {
    cowboy: "🤠",
    pirate: "☠️",
    werewolf: "🐺",
    vampire: "🦇",
  };

  return (
    <div>
      <NavBar />
      <div className="max-w-4xl mx-auto p-6">
        <h3 className="text-2xl font-bold mb-4">Test History</h3>
        <ul className="space-y-4">
          {items.map((r, idx) => {
            const when = r.completedAt ? new Date(r.completedAt) : null;
            const rawType = r.dominantType || null;
            const title = rawType
              ? titleFromType(rawType)
              : r.scores
                ? titleFromType(Object.keys(r.scores || {})[0])
                : "Result";
            const emoji = rawType
              ? archetypeEmojis[(rawType.split("+")[0] || "").toLowerCase()]
              : r.scores
                ? archetypeEmojis[Object.keys(r.scores || {})[0]]
                : undefined;
            const percentages = r.scores
              ? (() => {
                  const scoreObj = r.scores || {
                    cowboy: 0,
                    pirate: 0,
                    werewolf: 0,
                    vampire: 0,
                  };
                  const total =
                    (scoreObj.cowboy || 0) +
                    (scoreObj.pirate || 0) +
                    (scoreObj.werewolf || 0) +
                    (scoreObj.vampire || 0);
                  if (total === 0) {
                    return { cowboy: 0, pirate: 0, werewolf: 0, vampire: 0 };
                  }
                  return {
                    cowboy: Math.round(((scoreObj.cowboy || 0) / total) * 100),
                    pirate: Math.round(((scoreObj.pirate || 0) / total) * 100),
                    werewolf: Math.round(
                      ((scoreObj.werewolf || 0) / total) * 100
                    ),
                    vampire: Math.round(
                      ((scoreObj.vampire || 0) / total) * 100
                    ),
                  };
                })()
              : null;
            const subtitle = when ? when.toLocaleString() : "Unknown date";
            return (
              <li
                key={idx}
                className="bg-white p-4 rounded shadow-sm flex justify-between items-center"
              >
                <div>
                  <div className="font-semibold flex items-center gap-2">
                    {emoji && <span className="text-xl">{emoji}</span>}
                    <span>{title}</span>
                  </div>
                  <div className="text-sm text-gray-500">{subtitle}</div>
                  {percentages && (
                    <div className="text-sm text-gray-600 mt-1">
                      <span className="mr-3">
                        Cowboy: {percentages.cowboy}%
                      </span>
                      <span className="mr-3">
                        Pirate: {percentages.pirate}%
                      </span>
                      <span className="mr-3">
                        Werewolf: {percentages.werewolf}%
                      </span>
                      <span>Vampire: {percentages.vampire}%</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                    onClick={() => handleView(r)}
                  >
                    View
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
