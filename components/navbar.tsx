"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useEffect, useState } from "react";

export default function NavBar() {
  const [mostRecentResult, setMostRecentResult] = useState<any>(null);

  const loggedInUser = useQuery(api.auth.loggedInUser);
  const userResults = useQuery(
    api.tests.getAllTestResults,
    loggedInUser && !loggedInUser.isAnonymous
      ? { userId: loggedInUser._id?.toString?.() }
      : "skip"
  );

  useEffect(() => {
    const items: any[] = [];

    // Get results from database
    if (Array.isArray(userResults) && userResults.length) {
      for (const r of userResults) items.push(r);
    }

    // Get results from localStorage
    try {
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("resultsHistory");
        if (raw) {
          const localHistory = JSON.parse(raw);
          if (Array.isArray(localHistory) && localHistory.length) {
            for (const r of localHistory) items.push(r);
          }
        }
      }
    } catch (e) {}

    // Sort by completion date and get most recent
    if (items.length > 0) {
      items.sort((a, b) => {
        const dateA = a.completedAt || 0;
        const dateB = b.completedAt || 0;
        return dateB - dateA;
      });
      setMostRecentResult(items[0]);
    }
  }, [userResults]);

  function titleFromType(type: string | undefined | null) {
    if (!type) return "Your Result";
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

  const getDisplayInfo = () => {
    if (!mostRecentResult) return { text: "History", emoji: "" };

    const rawType = mostRecentResult.dominantType || null;
    const title = titleFromType(rawType);

    let emoji = "📊";
    if (rawType) {
      if (rawType === "all four") {
        emoji = "⚖️";
      } else if (rawType.includes("+")) {
        // For combinations, show all archetype emojis
        emoji = rawType
          .split("+")
          .map((type: string) => archetypeEmojis[type.toLowerCase()] || "📊")
          .join("");
      } else {
        // Single archetype
        emoji = archetypeEmojis[rawType.toLowerCase()] || "⚖️";
      }
    }

    return { text: title, emoji };
  };

  const { text, emoji } = getDisplayInfo();
  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm h-16 flex justify-between items-center shadow-sm px-4">
      <Link
        href="/"
        className="text-xl font-semibold text-purple-600 hover:text-purple-700 transition-colors"
      >
        The Archetype Compass
      </Link>
      <div className="flex items-center gap-4">
        {mostRecentResult ? (
          <Link
            href="/history"
            className="hover:scale-110 transition-transform duration-200"
            title={text}
          >
            <span className="text-3xl">{emoji}</span>
          </Link>
        ) : (
          <Link
            href="/history"
            className="hover:scale-110 transition-transform duration-200"
            title="History"
          >
            <span className="text-3xl">📊</span>
          </Link>
        )}
      </div>
    </header>
  );
}
