"use client";
import { useState, useEffect } from "react";

const defaultW = { metadata:.25, access:.15, quality:.25, timeliness:.15, discoverability:.10, compliance:.10 };

export default function WeightSliders({ onChange }:{ onChange:(w:any)=>void }) {
  const [w, setW] = useState<any>(defaultW);
  useEffect(()=>{ onChange(w); }, [w, onChange]);

  const Row = ({k,label}:{k:keyof typeof defaultW, label:string}) => (
    <div className="grid grid-cols-[110px_1fr_60px] items-center gap-3">
      <div className="text-sm text-slate-300">{label}</div>
      <input type="range" min={0} max={50} value={w[k]*100} onChange={e=>{
        const v = Number(e.target.value)/100;
        const next = { ...w, [k]: v };
        const sum = Object.values(next).reduce((a: number, b: any) => a + b, 0) as number;
        // normalize to sum=1
        Object.keys(next).forEach(key=> next[key] = next[key]/sum);
        setW({...next});
      }} />
      <div className="text-xs text-slate-400">{Math.round(w[k]*100)}%</div>
    </div>
  );

  return (
    <div className="card">
      <h3 className="font-semibold mb-3">What-if Weights</h3>
      <div className="space-y-2">
        <Row k="metadata" label="Metadata" />
        <Row k="access" label="Access" />
        <Row k="quality" label="Quality" />
        <Row k="timeliness" label="Timeliness" />
        <Row k="discoverability" label="Discoverability" />
        <Row k="compliance" label="Compliance" />
      </div>
      <p className="text-xs text-slate-400 mt-3">Drag sliders to explore different priorities. Navigation retains your last scan—no re-scan needed.</p>
    </div>
  );
}
