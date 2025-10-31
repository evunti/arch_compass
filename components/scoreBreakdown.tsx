interface ScoreBreakdownProps {
  scores: Record<string, number>;
  percentages?: Record<string, number>;
  archetypeEmojis: Record<string, string>;
}

export default function ScoreBreakdown({
  scores,
  archetypeEmojis,
}: ScoreBreakdownProps) {
  const colorClasses: Record<string, string> = {
    cowboy: "bg-emerald-500",
    pirate: "bg-sky-500",
    vampire: "bg-purple-500",
    werewolf: "bg-orange-500",
  };

  // Compute normalized percentages from the raw scores so they always reflect
  // the composition out of 100% (handles zero-total case).
  const totalPoints = Object.values(scores || {}).reduce(
    (acc, v) => acc + (v || 0),
    0
  );

  const normalized: Record<string, number> = {};
  for (const [k, v] of Object.entries(scores || {})) {
    normalized[k] =
      totalPoints > 0 ? Math.round(((v || 0) / totalPoints) * 100) : 0;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h4 className="text-xl font-semibold text-gray-800 mb-6 text-center">
        Score Breakdown
      </h4>

      <div className="space-y-6">
        {Object.entries(scores).map(([type]) => (
          <div key={type} className="flex items-center space-x-4">
            <div className="flex items-center space-x-3 w-32">
              <div className="text-xl">
                {archetypeEmojis[type as keyof typeof archetypeEmojis]}
              </div>
              <div className="text-sm font-medium text-gray-700 capitalize">
                {type}
              </div>
            </div>

            <div className="flex-1 bg-gray-200 rounded-full h-10 relative overflow-hidden">
              <div
                className={`h-full rounded-full ${colorClasses[type]}`}
                style={{
                  width: `${normalized[type] ?? 0}%`,
                }}
              ></div>

              <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-white drop-shadow">
                {normalized[type] ?? 0}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
