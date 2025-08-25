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
    <main className="space-y-8">
      {/* Search Section */}
      <div className="glass-card p-6">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-white mb-2">Scan Data Portal</h2>
          <p className="text-slate-400 text-sm">Enter a CKAN portal URL and search query to analyze dataset quality</p>
        </div>
        <div className="grid md:grid-cols-[1.4fr_1.2fr_auto] gap-4 items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Portal URL</label>
            <input 
              className="premium-input" 
              value={portal} 
              onChange={e=>setPortal(e.target.value)} 
              placeholder="https://catalog.data.gov" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Search Query</label>
            <input 
              className="premium-input" 
              value={query} 
              onChange={e=>setQuery(e.target.value)} 
              placeholder="water" 
            />
          </div>
          <button 
            className="premium-btn primary h-11" 
            onClick={goScan} 
            disabled={busy}
          >
            {busy ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin"></div>
                Scanning…
              </div>
            ) : (
              "Scan Portal"
            )}
          </button>
        </div>
        <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-xs text-blue-300">
            💡 <strong>Smart Caching:</strong> Navigate back to return to these results instantly—no re-scan required.
          </p>
        </div>
      </div>

      {scan && (
        <>
          {/* Results Overview */}
          <div className="glass-card p-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold text-white">Scan Results</h3>
                  <div className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-medium rounded-full">
                    COMPLETED
                  </div>
                </div>
                <div className="text-slate-400 text-sm font-mono break-all">
                  {scan.portal}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{scan.total}</div>
                  <div className="text-xs text-slate-400 uppercase tracking-wide">Datasets</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-brand-500">{Math.round(scan.avg_score)}</div>
                  <div className="text-xs text-slate-400 uppercase tracking-wide">Avg Score</div>
                </div>
                <div className="flex items-center gap-3">
                  <img className="h-8 drop-shadow-lg" src={badgeURL(scan.avg_score)} alt="Quality Badge" />
                  <Link className="premium-btn secondary" href="/leaderboard">
                    View Leaderboard
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="grid xl:grid-cols-[1.4fr_.6fr] gap-8">
            {/* Main Heatmap */}
            <div className="space-y-6">
              <Heatmap rows={showRows} basePortal={scan.portal} />
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Top Performers */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-2 bg-brand-500 rounded-full"></div>
                  <h3 className="font-bold text-white">Top Performers</h3>
                </div>
                <div className="space-y-3">
                  {showRows.slice(0,5).map((r: Row, index: number) => (
                    <div key={r.id} className="group">
                      <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
                        <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-brand-500 to-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-slate-900">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <a
                            className="block text-sm font-medium text-slate-200 hover:text-brand-500 transition-colors line-clamp-2"
                            href={`/dataset/${encodeURIComponent(r.id)}?portal=${encodeURIComponent(scan.portal)}`}
                            title={r.title || r.id}
                          >
                            {r.title || r.id}
                          </a>
                          <div className="flex items-center gap-2 mt-2">
                            <PercentileBadge all={rankBase as number[]} value={r.total} />
                            <img className="h-5" src={badgeURL(r.total)} alt="Score badge" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weight Controls */}
              <WeightSliders onChange={setWeights} />

              {/* Recent Scans */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <h3 className="font-bold text-white">Recent Scans</h3>
                </div>
                <div className="space-y-2">
                  {allHistory().slice(0, 5).map(h => (
                    <button 
                      key={h.key}
                      className="w-full text-left p-3 rounded-lg hover:bg-white/5 transition-colors group"
                      onClick={()=>{
                        const val = loadScan(h.portal, h.query);
                        if (val) setScan(val);
                        setPortal(h.portal); setQuery(h.query);
                      }}
                    >
                      <div className="text-sm font-medium text-slate-200 group-hover:text-brand-500 transition-colors truncate">
                        {h.portal.replace(/^https?:\/\//, '')}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        Query: "{h.query || 'all'}"
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
