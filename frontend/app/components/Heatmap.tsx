"use client";
import Link from "next/link";

type Row = {
  id: string;
  title: string;
  total: number;
  scores: { metadata:number; access:number; quality:number; timeliness:number; discoverability:number; compliance:number };
};

const cols = [
  { k:"metadata", label:"Metadata" },
  { k:"access", label:"Access" },
  { k:"quality", label:"Quality" },
  { k:"timeliness", label:"Timeliness" },
  { k:"discoverability", label:"Discover" },
  { k:"compliance", label:"Compliance" },
];

function cellColor(v:number){
  if (v >= 85) return "bg-emerald-500/70";
  if (v >= 70) return "bg-lime-500/70";
  if (v >= 50) return "bg-amber-500/70";
  if (v >= 30) return "bg-orange-500/70";
  return "bg-rose-500/70";
}

export default function Heatmap({ rows, basePortal }:{ rows: Row[]; basePortal: string }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10">
      <table className="min-w-full text-sm">
        <thead className="bg-white/5">
          <tr>
            <th className="text-left p-3 font-semibold w-[38%]">Dataset</th>
            <th className="text-left p-3 font-semibold">Total</th>
            {cols.map(c=>(
              <th key={c.k} className="text-left p-3 font-semibold">{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(r=>(
            <tr key={r.id} className="border-t border-white/5 hover:bg-white/5">
              <td className="p-3 pr-6">
                <Link className="underline decoration-brand-500 hover:text-brand-500" href={`/dataset/${encodeURIComponent(r.id)}?portal=${encodeURIComponent(basePortal)}`}>
                  {r.title || r.id}
                </Link>
              </td>
              <td className="p-3 font-semibold">{Math.round(r.total)}</td>
              {cols.map(c=>{
                const v = (r.scores as any)[c.k] as number;
                return (
                  <td key={c.k} className="p-2">
                    <div title={`${c.label}: ${Math.round(v)}`} className={`h-6 rounded ${cellColor(v)} shadow-inner`} style={{minWidth:80}}>
                      <div className="px-2 text-[11px] font-bold text-slate-950/90">{Math.round(v)}</div>
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
