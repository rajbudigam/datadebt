"use client";
"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { lastScan, loadScan } from "@/lib/store";
import { badgeURL } from "@/lib/api";

export default function DatasetPage({ params, searchParams }: any) {
  const id = decodeURIComponent(params.id);
  const portal = searchParams.portal || "";
  const [scan, setScan] = useState<any>(null);
  const [item, setItem] = useState<any>(null);

  useEffect(() => {
    // Try exact match first
    const q = searchParams.query || "";
    const specific = loadScan(portal, q);
    const s = specific || lastScan();
    setScan(s || null);
  }, [portal, searchParams.query]);

  useEffect(() => {
    if (!scan) return;
    const r = scan.results.find((x:any)=> x.dataset.id===id);
    setItem(r || null);
  }, [scan, id]);

  if (!item) {
    return <main className="card">No cached result found. Go back to <a className="underline" href="/scan">scan</a> and open a dataset.</main>;
  }
  const ds = item.dataset;
  const ev = item.evidence;

  const jsonldSnippet = JSON.stringify({
    "@context":"https://schema.org", "@type":"Dataset",
    "name": ds.title, "description": ds.description, "license": ds.license, "url": ds.landing_page,
    "distribution": (ds.distributions || []).filter((d:any)=>d.url).map((d:any)=>({
      "@type":"DataDownload","contentUrl":d.url,"encodingFormat": d.format || d.media_type || "text/csv"
    }))
  }, null, 2);

  return (
    <main className="space-y-6">
      <div className="flex items-center gap-3">
        <Link className="btn" href={`/scan?portal=${encodeURIComponent(portal)}&query=${encodeURIComponent(searchParams.query||"")}`}>← Back to results</Link>
      </div>

      <div className="card">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold">{ds.title}</h2>
          <img className="h-7" src={badgeURL(item.score)} />
        </div>
        <p className="text-slate-300 mt-2">{ds.description || "—"}</p>
        <div className="mt-3 text-sm text-slate-400 grid md:grid-cols-2 gap-2">
          <div>Portal: {ds.portal}</div>
          <div>Landing: <a className="underline" href={ds.landing_page} target="_blank">{ds.landing_page || "—"}</a></div>
          <div>License: {ds.license || "—"}</div>
          <div>Modified: {ds.modified || "—"}</div>
          <div>Publisher: {ds.publisher || "—"}</div>
          <div>Contact: {ds.contact || "—"}</div>
        </div>
      </div>

      <div className="grid xl:grid-cols-3 gap-4">
        <div className="card">
          <h3 className="font-semibold">Debt Evidence</h3>
          <ul className="mt-2 text-sm list-disc ml-5">
            {ev.missing_fields?.map((m:string)=> <li key={m}>Missing: {m}</li>)}
            {ev.access_notes?.map((m:string)=> <li key={m}>{m}</li>)}
            {ev.compliance_notes?.map((m:string)=> <li key={m}>{m}</li>)}
          </ul>
          <div className="text-xs text-slate-400 mt-2">Timeliness: {ev.timeliness_days ?? "?"} days since last modified</div>
        </div>
        <div className="card">
          <h3 className="font-semibold mb-2">Add this JSON-LD (schema.org/Dataset)</h3>
          <pre className="code">{jsonldSnippet}</pre>
        </div>
        <div className="card">
          <h3 className="font-semibold mb-2">Distribution links</h3>
          <ul className="mt-1 text-sm space-y-2">
            {(ds.distributions||[]).filter((d:any)=>d.url).map((d:any, i:number)=>(
              <li key={i}><a className="underline" href={d.url} target="_blank">{d.url}</a></li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
