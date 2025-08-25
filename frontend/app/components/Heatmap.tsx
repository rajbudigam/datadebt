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
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-2 h-2 bg-brand-500 rounded-full"></div>
        <h3 className="font-bold text-white">Dataset Quality Overview</h3>
        <div className="ml-auto text-sm text-slate-400">
          {rows.length} datasets analyzed
        </div>
      </div>
      
      <div className="overflow-x-auto -mx-6 px-6">
        <div className="min-w-[800px]">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-4 pr-6 font-semibold text-slate-300 sticky left-0 bg-gradient-to-r from-slate-900/90 to-transparent backdrop-blur-sm">
                  <div className="min-w-[200px]">Dataset</div>
                </th>
                <th className="text-center py-4 px-3 font-semibold text-slate-300">
                  <div className="min-w-[60px]">Total</div>
                </th>
                {cols.map(c=>(
                  <th key={c.k} className="text-center py-4 px-3 font-semibold text-slate-300">
                    <div className="min-w-[80px]">{c.label}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, index)=>(
                <tr key={r.id} className="group hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0">
                  <td className="py-4 pr-6 sticky left-0 bg-gradient-to-r from-slate-900/90 to-transparent backdrop-blur-sm group-hover:from-slate-800/90">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center text-xs font-bold text-white">
                        {index + 1}
                      </div>
                      <Link 
                        className="font-medium text-slate-200 hover:text-brand-500 transition-colors line-clamp-2 min-w-0" 
                        href={`/dataset/${encodeURIComponent(r.id)}?portal=${encodeURIComponent(basePortal)}`}
                        title={r.title || r.id}
                      >
                        {r.title || r.id}
                      </Link>
                    </div>
                  </td>
                  <td className="py-4 px-3 text-center">
                    <div className="font-bold text-lg text-white">
                      {Math.round(r.total)}
                    </div>
                  </td>
                  {cols.map(c=>{
                    const v = (r.scores as any)[c.k] as number;
                    return (
                      <td key={c.k} className="py-4 px-3">
                        <div className="flex justify-center">
                          <div 
                            title={`${c.label}: ${Math.round(v)}`} 
                            className={`relative h-8 w-16 rounded-lg ${cellColor(v)} shadow-lg overflow-hidden group-hover:scale-105 transition-transform`}
                          >
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-white/10"></div>
                            <div className="relative flex items-center justify-center h-full">
                              <span className="text-xs font-bold text-slate-900 drop-shadow-sm">
                                {Math.round(v)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Quality Scale:</span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-rose-500/70"></div>
              <span>Poor (0-29)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-orange-500/70"></div>
              <span>Fair (30-49)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-amber-500/70"></div>
              <span>Good (50-69)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-lime-500/70"></div>
              <span>Very Good (70-84)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-emerald-500/70"></div>
              <span>Excellent (85+)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
