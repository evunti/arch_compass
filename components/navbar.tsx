export default function NavBar({
  onNavigate,
}: {
  onNavigate?: (page: "landing" | "history") => void;
}) {
  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm h-16 flex justify-between items-center shadow-sm px-4">
      <button
        onClick={() => onNavigate?.("landing")}
        className="text-xl font-semibold text-purple-600 hover:text-purple-700 transition-colors"
      >
        The Archetype Compass
      </button>
      <div className="flex items-center gap-4">
        <button
          onClick={() => onNavigate?.("history")}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          History
        </button>
      </div>
    </header>
  );
}
