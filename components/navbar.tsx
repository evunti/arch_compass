"use client";

import Link from "next/link";

export default function NavBar() {
  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm h-16 flex justify-between items-center shadow-sm px-4">
      <Link
        href="/"
        className="text-xl font-semibold text-purple-600 hover:text-purple-700 transition-colors"
      >
        The Archetype Compass
      </Link>
      <div className="flex items-center gap-4">
        <Link
          href="/history"
          className="text-sm text-gray-600 hover:text-gray-800 hover:underline transition-colors"
        >
          History
        </Link>
      </div>
    </header>
  );
}
