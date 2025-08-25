"use client";
import { useMemo, useState } from "react";
import { lastScan } from "@/lib/store";
import PercentileBadge from "../components/PercentileBadge";

export default function ComparePage() {
  const scan = lastScan();
  const [ids, setIds] = useState<string>("");
  if (!scan) return <main className="card">No scans yet. Run one at <a className="underline" href="/scan">/scan</a>.</main>;

  const rows = (scan.results || []).map((r:any)=>({ id:r.dataset.id, title:r.dataset.title, b:r.buckets, total:r.score, d:r }));
  const dist = rows.map(r=>r.total);

  const chosen = useMemo(()=>{
    const set = new Set(ids.split(",").map(s=>s.trim()).filter(Boolean));
    if (!set.size) return [];
    return rows.filter(r=> set.has(r.id) || set.has(r.title));
  }, [ids, rows]);

  return (
    <main className="space-y-6">
      <div className="card">
        <h2 className="text-xl font-bold">Compare datasets</h2>
        <p className="text-slate-300 mt-1">Enter IDs or titles (comma-separated). Use items from your last scan.</p>
        <input className="card bg-slate-900/40 mt-3" value={ids} onChange={e=>setIds(e.target.value)} placeholder="Paste: id1, id2, id3" />
      </div>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {chosen.map((r:any)=>(
          <a key={r.id} href={`/dataset/${encodeURIComponent(r.id)}?portal=${encodeURIComponent(scan.portal)}&query=${encodeURIComponent(scan.query||"")}`} className="card hover:border-brand-600">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{r.title}</h3>
              <PercentileBadge all={dist} value={r.total}/>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-slate-300">
              <div>Metadata <b>{Math.round(r.b.metadata)}</b></div>
              <div>Access <b>{Math.round(r.b.access)}</b></div>
              <div>Quality <b>{Math.round(r.b.quality)}</b></div>
              <div>Timeliness <b>{Math.round(r.b.timeliness)}</b></div>
              <div>Discover <b>{Math.round(r.b.discoverability)}</b></div>
              <div>Compliance <b>{Math.round(r.b.compliance)}</b></div>
            </div>
          </a>
        ))}
      </div>
      <div className="text-xs text-slate-500">Tip: click a card to open the drilldown with fix snippets.</div>
    </main>
  );
}
