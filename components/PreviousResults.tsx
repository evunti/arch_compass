"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface TestResult {
  sessionId?: string;
  dominantType?: string;
  completedAt?: string;
  scores?: {
    cowboy: number;
    pirate: number;
    werewolf: number;
    vampire: number;
  };
}

interface PreviousResultsProps {
  previousResults: TestResult[];
  archetypeEmojis: Record<string, string>;
}

interface PreviousResultsButtonProps {
  previousResults: TestResult[];
  showPreviousResults: boolean;
  setShowPreviousResults: (show: boolean) => void;
}

export function PreviousResultsButton({
  previousResults,
  showPreviousResults,
  setShowPreviousResults,
}: PreviousResultsButtonProps) {
  if (previousResults.length === 0) {
    return null;
  }

  return (
    <button
      onClick={() => setShowPreviousResults(!showPreviousResults)}
      className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
    >
      {showPreviousResults ? "Hide Previous Results" : "View Previous Results"}
    </button>
  );
}

export default function PreviousResults({
  previousResults,
  archetypeEmojis,
  showPreviousResults,
}: PreviousResultsProps & { showPreviousResults: boolean }) {
  const router = useRouter();

  if (!showPreviousResults || previousResults.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
      <h4 className="text-xl font-bold mb-4 text-center">
        Previous Test Results
      </h4>
      <div className="space-y-4">
        {previousResults.map((prevResult, idx) => {
          const when = prevResult.completedAt
            ? new Date(prevResult.completedAt)
            : null;
          const rawType = prevResult.dominantType || null;
          const title = rawType
            ? rawType === "all four"
              ? "All Four"
              : rawType
                  .split("+")
                  .map((t: string) => t.charAt(0).toUpperCase() + t.slice(1))
                  .join(" + ")
            : "Result";
          const emoji = rawType
            ? rawType === "all four"
              ? "⚖️"
              : rawType.includes("+")
                ? rawType
                    .split("+")
                    .map(
                      (type: string) =>
                        (archetypeEmojis as any)[type.toLowerCase()] || "📊"
                    )
                    .join("")
                : (archetypeEmojis as any)[rawType.toLowerCase()] || "📊"
            : "📊";
          const subtitle = when ? when.toLocaleString() : "Unknown date";

          return (
            <div
              key={idx}
              className="rounded-lg p-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
            >
              <div>
                <div className="font-semibold flex items-center gap-2">
                  <span className="text-xl">{emoji}</span>
                  <span>{title}</span>
                </div>
                <div className="text-sm text-gray-500">{subtitle}</div>
                {prevResult.scores && (
                  <div className="text-sm text-gray-600 mt-1">
                    <span className="mr-3">
                      Cowboy:{" "}
                      {Math.round(
                        (prevResult.scores.cowboy /
                          (prevResult.scores.cowboy +
                            prevResult.scores.pirate +
                            prevResult.scores.werewolf +
                            prevResult.scores.vampire)) *
                          100
                      )}
                      %
                    </span>
                    <span className="mr-3">
                      Pirate:{" "}
                      {Math.round(
                        (prevResult.scores.pirate /
                          (prevResult.scores.cowboy +
                            prevResult.scores.pirate +
                            prevResult.scores.werewolf +
                            prevResult.scores.vampire)) *
                          100
                      )}
                      %
                    </span>
                    <span className="mr-3">
                      Werewolf:{" "}
                      {Math.round(
                        (prevResult.scores.werewolf /
                          (prevResult.scores.cowboy +
                            prevResult.scores.pirate +
                            prevResult.scores.werewolf +
                            prevResult.scores.vampire)) *
                          100
                      )}
                      %
                    </span>
                    <span>
                      Vampire:{" "}
                      {Math.round(
                        (prevResult.scores.vampire /
                          (prevResult.scores.cowboy +
                            prevResult.scores.pirate +
                            prevResult.scores.werewolf +
                            prevResult.scores.vampire)) *
                          100
                      )}
                      %
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  const searchParams = new URLSearchParams();
                  if (prevResult.sessionId) {
                    searchParams.set("sessionId", prevResult.sessionId);
                  }
                  router.push(`/results?${searchParams.toString()}`);
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded font-semibold hover:bg-purple-700 transition-colors"
              >
                View
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
