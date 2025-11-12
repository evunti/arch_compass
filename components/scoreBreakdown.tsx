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

  const pieColors: Record<string, string> = {
    cowboy: "#10b981", // emerald-500
    pirate: "#0ea5e9", // sky-500
    vampire: "#a855f7", // purple-500
    werewolf: "#f97316", // orange-500
  };

  const totalPoints = Object.values(scores || {}).reduce(
    (acc, v) => acc + (v || 0),
    0
  );

  const normalized: Record<string, number> = {};
  for (const [k, v] of Object.entries(scores || {})) {
    normalized[k] =
      totalPoints > 0 ? Math.round(((v || 0) / totalPoints) * 100) : 0;
  }

  const createPieChart = () => {
    const orderedTypes = ["cowboy", "pirate", "werewolf", "vampire"];
    let cumulativePercent = 0;

    return orderedTypes.map((type) => {
      const percent = normalized[type] ?? 0;
      const startPercent = cumulativePercent;
      cumulativePercent += percent;

      return {
        type,
        percent,
        startPercent,
        endPercent: cumulativePercent,
      };
    });
  };

  const pieSegments = createPieChart();

  // Convert percentage to coordinates on a circle
  const getCoordinatesForPercent = (percent: number) => {
    const x = Math.cos(2 * Math.PI * percent);
    const y = Math.sin(2 * Math.PI * percent);
    return [x, y];
  };

  const createPieSlice = (startPercent: number, endPercent: number) => {
    const [startX, startY] = getCoordinatesForPercent(startPercent);
    const [endX, endY] = getCoordinatesForPercent(endPercent);

    const largeArcFlag = endPercent - startPercent > 0.5 ? 1 : 0;

    return [
      `M 0 0`,
      `L ${startX} ${startY}`,
      `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
      `Z`,
    ].join(" ");
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h4 className="text-xl font-semibold text-gray-800 mb-6 text-center">
        Score Breakdown
      </h4>

      <div className="flex flex-col items-center space-y-6">
        <div className="w-64 h-64">
          <svg viewBox="-1 -1 2 2" className="transform -rotate-90">
            {pieSegments.map((segment) => (
              <path
                key={segment.type}
                d={createPieSlice(
                  segment.startPercent / 100,
                  segment.endPercent / 100
                )}
                fill={pieColors[segment.type]}
                className="hover:opacity-80 transition-opacity cursor-pointer"
              />
            ))}
          </svg>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
          {Object.entries(scores).map(([type]) => (
            <div key={type} className="flex items-center space-x-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: pieColors[type] }}
              ></div>
              <div className="text-xl">
                {archetypeEmojis[type as keyof typeof archetypeEmojis]}
              </div>
              <div className="text-sm font-medium text-gray-700 capitalize">
                {type}
              </div>
              <div className="text-sm font-semibold text-gray-900">
                {normalized[type] ?? 0}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* <div className="space-y-6">
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
      </div> */}
    </div>
  );
}
