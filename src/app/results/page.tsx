"use client";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { questions } from "../questionnaire/page";
import ScoreBreakdown from "../../../components/scoreBreakdown";
import { useSearchParams, useRouter } from "next/navigation";
import NavBar from "../../../components/navbar";
import PreviousResults, {
  PreviousResultsButton,
} from "../../../components/PreviousResults";

const archetypeColors = {
  cowboy: "emerald",
  pirate: "sky",
  werewolf: "orange",
  vampire: "purple",
};

const archetypeEmojis = {
  cowboy: "🤠",
  pirate: "☠️",
  werewolf: "🐺",
  vampire: "🦇",
};

const personalityBlurbs = {
  cowboy: {
    title: "The Pure Spirit",
    description:
      "You are optimistic, kind, sincere, and hopeful. Your genuine nature draws people to you, but you may need to work on setting better boundaries to protect your generous heart.",
  },
  pirate: {
    title: "The Balanced Rogue",
    description:
      "You are calm, adaptable, funny, and resilient. You navigate life's storms with grace and humor, though you should consider showing your deeper, more vulnerable side more often.",
  },
  werewolf: {
    title: "The Wild Heart",
    description:
      "You are intense, emotional, and fiercely loyal. Your passion is your strength, but learning to channel it constructively will help you achieve your goals without burning out.",
  },
  vampire: {
    title: "The Power Player",
    description:
      "You are confident, strategic, and naturally influential. Your ability to lead and persuade is remarkable, though showing vulnerability occasionally will deepen your connections.",
  },
  "cowboy+pirate": {
    title: "The Peaceful Drifter",
    description:
      "You blend optimism with adaptability, creating a harmonious approach to life. While you value peace and go with the flow, remember that asserting yourself when needed is equally important.",
  },
  "cowboy+werewolf": {
    title: "The Tender Wildling",
    description:
      "You combine warmth with intense emotion, making you deeply caring yet sometimes reactive. Finding grounding practices will help you channel your passionate nature more effectively.",
  },
  "cowboy+vampire": {
    title: "The Gentle Influencer",
    description:
      "You merge moral conviction with persuasive power, making you a natural leader who inspires through kindness. Leading with transparency will enhance your already strong influence.",
  },
  "pirate+werewolf": {
    title: "The Passionate Rebel",
    description:
      "You're adventurous, deeply feeling, and spontaneous. Your zest for life is infectious, but remember to build in time for rest and reflection to sustain your energetic approach.",
  },
  "pirate+vampire": {
    title: "The Smooth Operator",
    description:
      "You combine poise with charm, making you naturally magnetic. While your composed exterior serves you well, sharing your honest thoughts and feelings will create deeper connections.",
  },
  "werewolf+vampire": {
    title: "The Storm and the Shadow",
    description:
      "You blend emotional intensity with strategic thinking, creating a powerful combination. Balancing your compassionate heart with your desire for control will make you an exceptional leader.",
  },
  "cowboy+pirate+werewolf": {
    title: "The Golden-Hearted Hothead",
    description:
      "You're joyful, passionate, and full of life. Your enthusiasm is contagious, but learning to slow down and think before acting will help you avoid unnecessary conflicts and regrets.",
  },
  "pirate+werewolf+vampire": {
    title: "The Charismatic Wildcard",
    description:
      "You're a magnetic leader with emotional depth and strategic thinking. Your natural charisma draws people in, but creating more structure in your approach will help you achieve lasting success.",
  },
  "cowboy+pirate+vampire": {
    title: "The Gentle Strategist",
    description:
      "You combine kindness with effectiveness, making you both approachable and capable. Your balanced nature is a strength—just remember to maintain firm boundaries when necessary.",
  },
  "cowboy+werewolf+vampire": {
    title: "The Devoted Manipulator",
    description:
      "You blend emotional depth with moral conviction and influence. Your ability to lead with both heart and strategy is powerful—ensure you're always leading with empathy at the forefront.",
  },
  "all four": {
    title: "Balanced Soul",
    description:
      "You embody all four archetypes, making you versatile, adaptable, passionate, and wise. Your ability to draw from different aspects of your personality is remarkable—just remember to stay grounded in your core values.",
  },
};

export default function Results() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("sessionId");

  const handleRetakeTest = () => {
    router.push("/questionnaire");
  };
  const [showAnswers, setShowAnswers] = useState(false);
  const [showPreviousResults, setShowPreviousResults] = useState(false);
  const sessionResult = useQuery(
    api.tests.getTestResult,
    sessionId ? { sessionId } : "skip"
  );

  const loggedInUser = useQuery(api.auth.loggedInUser);
  const userResults = useQuery(
    api.tests.getAllTestResults,
    loggedInUser && !loggedInUser.isAnonymous
      ? { userId: loggedInUser._id?.toString?.() }
      : "skip"
  );

  let result = sessionResult || null;
  if (!result && Array.isArray(userResults) && userResults.length > 0) {
    result = userResults[0];
  }

  // Get all results including localStorage for previous results view
  const allResults: any[] = [];
  if (Array.isArray(userResults) && userResults.length) {
    for (const r of userResults) allResults.push(r);
  }

  // Add localStorage results
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("resultsHistory");
      if (raw) {
        const localHistory = JSON.parse(raw);
        if (Array.isArray(localHistory) && localHistory.length) {
          for (const r of localHistory) {
            // Avoid duplicates by checking sessionId
            const isDuplicate = allResults.some(
              (existing) => existing.sessionId === r.sessionId
            );
            if (!isDuplicate) {
              allResults.push(r);
            }
          }
        }
      }
    } catch (e) {}
  }

  // Sort all results by completion date (most recent first)
  allResults.sort((a, b) => {
    const dateA = a.completedAt || 0;
    const dateB = b.completedAt || 0;
    return dateB - dateA;
  });

  // Get previous results (excluding the current/most recent one)
  const previousResults = allResults.slice(1);

  if (!sessionId) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          No Results Found
        </h2>
        <p className="text-gray-600 mb-6">
          Please take the test first to see your results.
        </p>
        <button
          onClick={handleRetakeTest}
          className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
        >
          Take Test
        </button>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const { scores, dominantType, answers } = result as any;

  function normalizeTypeKey(type: string): string {
    if (type === "all four") return "all four";
    const parts = type.split("+");
    if (parts.length === 1) return type;
    return parts.sort().join("+");
  }

  const normalizedType = normalizeTypeKey(dominantType);

  function lookupPersonality(type: string | undefined) {
    if (!type) {
      return null;
    }
    const nk = normalizeTypeKey(type);
    if (personalityBlurbs[nk as keyof typeof personalityBlurbs]) {
      return personalityBlurbs[nk as keyof typeof personalityBlurbs];
    }
    for (const k of Object.keys(personalityBlurbs)) {
      if (normalizeTypeKey(k) === nk) {
        return personalityBlurbs[k as keyof typeof personalityBlurbs];
      }
    }
    return null;
  }

  const personality = lookupPersonality(dominantType) || {
    title: "Unknown Result",
    description:
      "Your result is unique! (Or there was a technical issue.) Please retake the test or contact support if this keeps happening.",
  };

  const handleShare = () => {
    const shareText = `I just discovered I'm ${personality.title} on The Archetype Compass! 🧭`;
    if (navigator.share) {
      navigator.share({
        title: "My Archetype Result",
        text: shareText,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success("Result copied to clipboard!");
    }
  };

  const _scoreLabels = [
    "stronglyDisagree",
    "disagree",
    "neutral",
    "agree",
    "stronglyAgree",
  ] as const;

  function computeMaxPerArchetype(qs: any[]) {
    const maxBy: Record<string, number> = {
      cowboy: 0,
      pirate: 0,
      werewolf: 0,
      vampire: 0,
    };

    const canonicalNames: Record<string, string> = {
      cowboy: "Cowboy",
      pirate: "Pirate",
      werewolf: "Werewolf",
      vampire: "Vampire",
    };

    for (const q of qs) {
      for (const archetypeKey of Object.keys(maxBy)) {
        const canon = canonicalNames[archetypeKey];
        let best = 0;
        for (const label of _scoreLabels) {
          const val = q?.scores?.[label]?.[canon] ?? 0;
          if (typeof val === "number" && val > best) best = val;
        }
        maxBy[archetypeKey] += best;
      }
    }

    return maxBy;
  }

  const maxima = computeMaxPerArchetype(questions);

  const percentages = {
    cowboy: Math.round((scores.cowboy / (maxima.cowboy || 1)) * 100),
    pirate: Math.round((scores.pirate / (maxima.pirate || 1)) * 100),
    werewolf: Math.round((scores.werewolf / (maxima.werewolf || 1)) * 100),
    vampire: Math.round((scores.vampire / (maxima.vampire || 1)) * 100),
  };

  // Quadrant chart positioning (X = Emotion, Y = Control)
  const emotionScore =
    scores.werewolf + scores.cowboy - (scores.vampire + scores.pirate);
  const controlScore =
    scores.vampire + scores.cowboy - (scores.werewolf + scores.pirate);

  // Normalize to 0-100 range for positioning
  const xPos = 50 + (emotionScore / 28) * 40; // emotion axis
  const yPos = 50 - (controlScore / 28) * 40; // control axis (inverted for screen coordinates)

  return (
    <div>
      {" "}
      <NavBar />
      <div className="max-w-4xl mx-auto space-y-8 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-2">
            Your Results
          </h2>
          <p className="text-gray-600">Discover your unique archetype blend</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4 flex flex-col items-center gap-1">
            {dominantType.includes("+") || dominantType === "all four" ? (
              <>
                <span className="text-2xl font-semibold text-gray-700">
                  {dominantType === "all four"
                    ? "All Four"
                    : dominantType
                        .split("+")
                        .map(
                          (type: string) =>
                            type.charAt(0).toUpperCase() + type.slice(1)
                        )
                        .join(" + ")}
                </span>
                <span>
                  {dominantType === "all four"
                    ? "⚖️"
                    : dominantType
                        .split("+")
                        .map(
                          (type: string) =>
                            archetypeEmojis[
                              type.toLowerCase() as keyof typeof archetypeEmojis
                            ] || "📊"
                        )
                        .join("")}
                </span>
              </>
            ) : (
              <>
                <span className="text-2xl font-semibold text-gray-700">
                  {dominantType.charAt(0).toUpperCase() + dominantType.slice(1)}
                </span>
                <span>
                  {
                    archetypeEmojis[
                      dominantType as keyof typeof archetypeEmojis
                    ]
                  }
                </span>
              </>
            )}
          </div>
          <h3 className="text-3xl font-bold text-gray-800 mb-4">
            {personality.title}
          </h3>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {personality.description}
          </p>
        </div>

        <div className="flex justify-center mb-4">
          <button
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-gray-800 font-semibold"
            onClick={() => setShowAnswers((v) => !v)}
          >
            {showAnswers ? "Hide Test Answers" : "View Test Answers"}
          </button>
        </div>

        {showAnswers && answers && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h4 className="text-xl font-bold mb-4 text-center">
              Your Test Answers
            </h4>
            <ol className="space-y-4">
              {questions.map((q: { id: string; text: string }, idx: number) => {
                const answerIdx = Array.isArray(answers)
                  ? answers[idx]
                  : undefined;
                const answerLabels = [
                  "Strongly Disagree",
                  "Disagree",
                  "Neutral",
                  "Agree",
                  "Strongly Agree",
                ];
                let answerDisplay = "(No answer)";
                if (
                  typeof answerIdx === "number" &&
                  answerIdx > 0 &&
                  answerIdx <= 5
                ) {
                  answerDisplay = answerLabels[answerIdx - 1];
                }
                return (
                  <li key={q.id} className="border-b pb-2">
                    <div className="font-semibold">
                      Q{idx + 1}: {q.text}
                    </div>
                    <div className="text-purple-700 mt-1">
                      <span className="font-medium">Your answer:</span>{" "}
                      {answerDisplay}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        )}
        <ScoreBreakdown
          scores={scores}
          percentages={percentages}
          archetypeEmojis={archetypeEmojis}
        />

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h4 className="text-xl font-semibold text-gray-800 mb-4 text-center">
            Personality Quadrant
          </h4>
          <div
            className="relative w-full h-80 rounded-lg overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, #e0f2fe 0%, #f3e8ff 25%, #fff7ed 50%, #ecfdf5 75%, #e0f2fe 100%)",
            }}
          >
            <div className="absolute inset-0">
              {/* Top Left - Cowboy + Vampire (High Control, Low Emotion) */}
              <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gradient-to-br from-purple-100 to-sky-100 opacity-60"></div>
              {/* Top Right - Cowboy + Werewolf (High Control, High Emotion) */}
              <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-orange-100 to-sky-100 opacity-60"></div>
              {/* Bottom Left - Pirate + Vampire (Low Control, Low Emotion) */}
              <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-purple-100 to-emerald-100 opacity-60"></div>
              {/* Bottom Right - Pirate + Werewolf (Low Control, High Emotion) */}
              <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-to-tl from-orange-100 to-emerald-100 opacity-60"></div>
            </div>

            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-0.5 bg-gray-400 shadow-sm"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-full w-0.5 bg-gray-400 shadow-sm"></div>
            </div>

            {/* Corner Archetype Icons */}
            <div className="absolute top-4 left-4 text-2xl opacity-70">
              🤠🦇
            </div>
            <div className="absolute top-4 right-4 text-2xl opacity-70">
              🤠🐺
            </div>
            <div className="absolute bottom-4 left-4 text-2xl opacity-70">
              ☠️🦇
            </div>
            <div className="absolute bottom-4 right-4 text-2xl opacity-70">
              ☠️🐺
            </div>

            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-sm font-medium text-gray-700 bg-white/80 px-2 py-1 rounded">
              High Control
            </div>
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-sm font-medium text-gray-700 bg-white/80 px-2 py-1 rounded">
              Low Control
            </div>
            <div className="absolute left-2 top-1/2 transform -translate-y-1/2 -rotate-90 text-sm font-medium text-gray-700 bg-white/80 px-2 py-1 rounded">
              Low Emotion
            </div>
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 rotate-90 text-sm font-medium text-gray-700 bg-white/80 px-2 py-1 rounded">
              High Emotion
            </div>

            <div
              className="absolute w-6 h-6 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full transform -translate-x-1/2 -translate-y-1/2 border-3 border-white shadow-lg animate-pulse"
              style={{
                left: `${Math.max(10, Math.min(90, xPos))}%`,
                top: `${Math.max(10, Math.min(90, yPos))}%`,
              }}
            >
              <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-30"></div>
            </div>
          </div>
          <p className="text-center text-sm text-gray-600 mt-2">
            Your position on the Emotion vs Control spectrum
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleShare}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Share Results
          </button>
          <button
            onClick={handleRetakeTest}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
          >
            Retake Test
          </button>
          <PreviousResultsButton
            previousResults={previousResults}
            showPreviousResults={showPreviousResults}
            setShowPreviousResults={setShowPreviousResults}
          />
        </div>

        <PreviousResults
          previousResults={previousResults}
          archetypeEmojis={archetypeEmojis}
          showPreviousResults={showPreviousResults}
        />
      </div>
    </div>
  );
}
