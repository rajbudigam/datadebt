"use client";
import { percentileRank } from "@/lib/stats";

export default function PercentileBadge({ all, value }:{ all: number[], value: number }) {
  const p = percentileRank(all, value);
  const styles = p >= 90 ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/30" :
                 p >= 70 ? "bg-gradient-to-r from-lime-500 to-green-500 text-white shadow-lg shadow-lime-500/30" :
                 p >= 40 ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30" :
                 "bg-gradient-to-r from-rose-500 to-red-500 text-white shadow-lg shadow-rose-500/30";
  
  const icon = p >= 90 ? "🏆" : p >= 70 ? "⭐" : p >= 40 ? "📈" : "⚠️";
  
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold ${styles} transition-all duration-200 hover:scale-105`}>
      <span className="text-xs">{icon}</span>
      {p}th
    </span>
  );
}
