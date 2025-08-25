"use client";
import { percentileRank } from "@/lib/stats";

export default function PercentileBadge({ all, value }:{ all: number[], value: number }) {
  const p = percentileRank(all, value);
  const tone = p >= 90 ? "bg-emerald-400 text-emerald-950" :
               p >= 70 ? "bg-lime-400 text-lime-950" :
               p >= 40 ? "bg-yellow-400 text-yellow-950" :
               "bg-rose-400 text-rose-950";
  return (
    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${tone}`}>
      {p}th percentile
    </span>
  );
}
