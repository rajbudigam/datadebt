"use client";
import Link from "next/link";

export default function Home() {
  return (
    <main className="space-y-6">
      <div className="card">
        <h2 className="text-xl font-bold">DataDebt</h2>
        <p className="text-slate-300 mt-2">Audit any open-data portal. Fix debt in minutes.</p>
        <div className="mt-4">
          <Link className="btn" href="/scan">Open Scanner</Link>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <a className="card hover:border-brand-600" href="/leaderboard">Leaderboard</a>
        <a className="card hover:border-brand-600" href="/compare">Compare</a>
        <a className="card hover:border-brand-600" href="https://recharts.org" target="_blank" rel="noreferrer">Charts power</a>
      </div>
    </main>
  );
}
