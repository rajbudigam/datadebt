"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { scanCKAN, badgeURL } from "@/lib/api";
import { saveScan, loadScan, allHistory } from "@/lib/store";
import Heatmap from "../components/Heatmap";
import PercentileBadge from "../components/PercentileBadge";
import WeightSliders from "../components/WeightSliders";
import { bucketMatrix } from "@/lib/stats";

export default function ScanPage() {
  const [portal, setPortal] = useState<string>("https://catalog.data.gov");
  const [query, setQuery] = useState<string>("water");
  const [busy, setBusy] = useState(false);
  const [scan, setScan] = useState<any>(null);
  const [weights, setWeights] = useState<any>(null);

  // On mount, try to restore a cached scan that matches the defaults
  useEffect(() => {
    const cached = loadScan(portal, query);
    if (cached) setScan(cached);
  }, []);

  async function goScan() {
    setBusy(true);
    try {
      const res = await scanCKAN(portal, query, 25);
      setScan(res);
      saveScan(res);  // 💾 persists so Back doesn't require re-scan
    } finally { setBusy(false); }
  }

  const rows = useMemo(()=> scan ? bucketMatrix(scan) : [], [scan]);
interface ScoreMap {
    [key: string]: number;
}

interface Row {
    id: string;
    title?: string;
    scores: ScoreMap;
    total: number;
    [key: string]: any;
}

interface Weights {
    [key: string]: number;
}

const rankBase = useMemo<number[]>(() => rows.map((r: Row) => r.total), [rows]);

  // Optional: "what-if" re-calculation with weights (client-side only)
  const weightedRows = useMemo(()=>{
    if (!scan || !weights) return rows;
    interface Weights {
      [key: string]: number;
    }

    interface Row {
      id: string;
      title?: string;
      scores: { [key: string]: number };
      total: number;
      [key: string]: any;
    }

    return rows.map((r: Row) => {
      const b = r.scores as { [key: string]: number };
      const total = Object.entries(weights as Weights).reduce(
        (acc, [k, w]: [string, number]) => acc + (b[k] ?? 0) * w,
        0
      );
      return { ...r, total };
    }).sort((a: Row, b: Row) => b.total - a.total);
  }, [rows, scan, weights]);

  const showRows = weights ? weightedRows : rows;

  return (
    <main className="space-y-6">
      <div className="card">
        <div className="grid md:grid-cols-[1.4fr_1.2fr_auto] gap-3">
          <input className="card bg-slate-900/40 border-slate-800" value={portal} onChange={e=>setPortal(e.target.value)} placeholder="CKAN base URL" />
          <input className="card bg-slate-900/40 border-slate-800" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search query" />
          <button className="btn" onClick={goScan} disabled={busy}>{busy ? "Scanning…" : "Scan CKAN"}</button>
        </div>
        <p className="text-xs text-slate-400 mt-3">Client-side navigation & caching: going Back returns to these results instantly—no re-scan.</p>
      </div>

      {scan && (
        <>
          <div className="card">
            <div className="flex flex-wrap items-center gap-4">
              <div className="text-lg font-bold">Portal:</div>
              <div className="text-slate-300">{scan.portal}</div>
              <div className="ml-auto text-sm">Datasets: <b>{scan.total}</b></div>
              <div className="text-sm">Avg Score: <b>{Math.round(scan.avg_score)}</b></div>
              <img className="h-7" src={badgeURL(scan.avg_score)} />
              <Link className="btn ml-4" href="/leaderboard">Open Leaderboard</Link>
            </div>
          </div>

          <div className="grid xl:grid-cols-[1.35fr_.65fr] gap-4">
            <div className="space-y-4">
              <Heatmap rows={showRows} basePortal={scan.portal} />
            </div>
            <div className="space-y-4">
              <div className="card">
                <h3 className="font-semibold">Top 5 by total score</h3>
                <ol className="mt-2 space-y-2 list-decimal ml-5">
                  {showRows.slice(0,5).map((r: Row) => (
                    <li key={r.id} className="flex items-center justify-between gap-2">
                      <a
                        className="underline decoration-brand-500 hover:text-brand-500"
                        href={`/dataset/${encodeURIComponent(r.id)}?portal=${encodeURIComponent(scan.portal)}`}
                      >
                        {r.title || r.id}
                      </a>
                      <div className="flex items-center gap-2">
                        <PercentileBadge all={rankBase as number[]} value={r.total} />
                        <img className="h-6" src={badgeURL(r.total)} />
                      </div>
                    </li>
                  ))}
                </ol>
              </div>

              <WeightSliders onChange={setWeights} />

              <div className="card">
                <h3 className="font-semibold">Recent Scans</h3>
                <ul className="mt-2 text-sm space-y-1">
                  {allHistory().map(h => (
                    <li key={h.key}><button className="underline" onClick={()=>{
                      const val = loadScan(h.portal, h.query);
                      if (val) setScan(val);
                      setPortal(h.portal); setQuery(h.query);
                    }}>{h.portal} — "{h.query || ""}"</button></li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
