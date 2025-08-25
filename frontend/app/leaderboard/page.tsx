"use client";
import { lastScan } from "@/lib/store";
import PercentileBadge from "../components/PercentileBadge";

export default function Leaderboard() {
  const scan = lastScan();
  if (!scan) return <main className="card">No scans yet. Go to <a className="underline" href="/scan">/scan</a> and run one.</main>;
  const rows = (scan.results||[]).map((r:any)=>({ id:r.dataset.id, title:r.dataset.title, total:r.score, d:r }));

  const dist = rows.map(r=>r.total).sort((a,b)=>a-b);
  const top = [...rows].sort((a,b)=>b.total-a.total);

  return (
    <main className="space-y-6">
      <div className="card">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold">Leaderboard</h2>
          <div className="text-sm text-slate-300">Portal: {scan.portal} · Query: "{scan.query}" · Datasets: {scan.total}</div>
        </div>
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        {top.map((r,i)=>(
          <a key={r.id} href={`/dataset/${encodeURIComponent(r.id)}?portal=${encodeURIComponent(scan.portal)}&query=${encodeURIComponent(scan.query||"")}`} className="card hover:border-brand-600">
            <div className="flex items-center justify-between gap-4">
              <div className="text-lg font-semibold">{i+1}. {r.title}</div>
              <div className="flex items-center gap-2">
                <PercentileBadge all={dist} value={r.total} />
                <img className="h-7" src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/generate/badge?score=${r.total}`} />
              </div>
            </div>
            <div className="text-sm text-slate-400 mt-1">Total: {Math.round(r.total)}</div>
          </a>
        ))}
      </div>
    </main>
  );
}
