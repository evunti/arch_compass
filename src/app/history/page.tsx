"use client";

import React, { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import NavBar from "../../../components/navbar";

export default function History() {
  const router = useRouter();

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

  // Sort items by completion date (most recent first)
  items.sort((a, b) => {
    const dateA = a.completedAt || 0;
    const dateB = b.completedAt || 0;
    return dateB - dateA;
  });

  // Auto-redirect to most recent result
  useEffect(() => {
    if (items.length > 0) {
      const mostRecentResult = items[0];
      const searchParams = new URLSearchParams();
      if (mostRecentResult.sessionId) {
        searchParams.set("sessionId", mostRecentResult.sessionId);
      }
      router.push(`/results?${searchParams.toString()}`);
    }
  }, [items, router]);

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

  // Show loading state while redirecting to most recent result
  return (
    <div>
      <NavBar />
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h3 className="text-2xl font-bold mb-4">Loading Your Latest Result</h3>
        <p className="text-gray-600 mb-6">
          Redirecting to your most recent test result...
        </p>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
      </div>
    </div>
  );
}
