"use client";
import { useState } from "react";
import { scanCKAN } from "./lib/api";

export default function Home() {
  const [portal, setPortal] = useState("https://catalog.data.gov");
  const [query, setQuery] = useState("water");
  const [data, setData] = useState<any>(null);
  const [busy, setBusy] = useState(false);
  const go = async () => {
    setBusy(true);
    console.log('Environment variables:', {
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL
    });
    try { 
      console.log('Starting scan with API URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
      const result = await scanCKAN(portal, query, 25);
      console.log('Scan result:', result);
      setData(result);
      sessionStorage.setItem("last_scan", JSON.stringify(result));
    } catch (error) {
      console.error('Scan error:', error);
      alert('Error scanning: ' + (error instanceof Error ? error.message : String(error)));
    } finally { 
      setBusy(false); 
    }
  };

  return (
    <main className="space-y-6">
      <div className="card">
        <div className="grid md:grid-cols-3 gap-3">
          <input className="card bg-slate-900/40 border-slate-800" value={portal} onChange={e=>setPortal(e.target.value)} placeholder="CKAN base URL" />
          <input className="card bg-slate-900/40 border-slate-800" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search query" />
          <button className="btn" onClick={go} disabled={busy}>{busy ? "Scanning…" : "Scan CKAN"}</button>
        </div>
        <p className="text-xs text-slate-400 mt-3">Uses CKAN package_search API. DCAT/DWBP + Frictionless scoring.</p>
      </div>

      {data && (
        <div className="space-y-6">
          <div className="card">
            <div className="flex flex-wrap items-center gap-4">
              <div className="text-lg font-bold">Portal:</div>
              <div className="text-slate-300">{data.portal}</div>
              <div className="ml-auto text-sm">Datasets: <b>{data.total}</b></div>
              <div className="text-sm">Avg Score: <b>{data.avg_score}</b></div>
              <img className="h-7" src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/generate/badge?score=${data.avg_score}`} />
            </div>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {data.results.map((r:any) => (
              <a key={r.dataset.id} href={`/dataset/${encodeURIComponent(r.dataset.id)}?portal=${encodeURIComponent(data.portal)}`} className="card hover:border-brand-600">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-100">{r.dataset.title}</h3>
                  <img className="h-6" src={`${process.env.NEXT_PUBLIC_API_BASE_URL}/generate/badge?score=${r.score}`} />
                </div>
                <p className="text-sm text-slate-400 line-clamp-3 mt-1">{r.dataset.description || "—"}</p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-slate-300">
                  <div>Metadata <b>{Math.round(r.buckets.metadata)}</b></div>
                  <div>Access <b>{Math.round(r.buckets.access)}</b></div>
                  <div>Quality <b>{Math.round(r.buckets.quality)}</b></div>
                  <div>Timeliness <b>{Math.round(r.buckets.timeliness)}</b></div>
                  <div>Discover <b>{Math.round(r.buckets.discoverability)}</b></div>
                  <div>Compliance <b>{Math.round(r.buckets.compliance)}</b></div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
