"use client";
import { useState, useEffect } from "react";

const defaultW = { metadata:.25, access:.15, quality:.25, timeliness:.15, discoverability:.10, compliance:.10 };

export default function WeightSliders({ onChange }:{ onChange:(w:any)=>void }) {
  const [w, setW] = useState<any>(defaultW);
  useEffect(()=>{ onChange(w); }, [w, onChange]);

  const Row = ({k,label}:{k:keyof typeof defaultW, label:string}) => (
    <div className="group">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-slate-300">{label}</label>
        <div className="text-sm font-bold text-brand-500">{Math.round(w[k]*100)}%</div>
      </div>
      <div className="relative">
        <input 
          type="range" 
          min={0} 
          max={50} 
          value={w[k]*100} 
          onChange={e=>{
            const v = Number(e.target.value)/100;
            const next = { ...w, [k]: v };
            const sum = Object.values(next).reduce((a: number, b: any) => a + b, 0) as number;
            // normalize to sum=1
            Object.keys(next).forEach(key=> next[key] = next[key]/sum);
            setW({...next});
          }}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 
                     [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r 
                     [&::-webkit-slider-thumb]:from-brand-500 [&::-webkit-slider-thumb]:to-blue-500
                     [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-brand-500/50
                     [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-200
                     hover:[&::-webkit-slider-thumb]:scale-110
                     [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full 
                     [&::-moz-range-thumb]:bg-gradient-to-r [&::-moz-range-thumb]:from-brand-500 
                     [&::-moz-range-thumb]:to-blue-500 [&::-moz-range-thumb]:border-none 
                     [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:shadow-brand-500/50"
        />
        <div 
          className="absolute top-1 left-0 h-0 bg-gradient-to-r from-brand-500 to-blue-500 rounded-lg pointer-events-none transition-all duration-200"
          style={{ width: `${w[k]*200}%`, height: '8px' }}
        />
      </div>
    </div>
  );

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
        <h3 className="font-bold text-white">Scoring Weights</h3>
        <div className="ml-auto">
          <button 
            onClick={() => setW(defaultW)}
            className="text-xs text-slate-400 hover:text-brand-500 transition-colors"
          >
            Reset to Default
          </button>
        </div>
      </div>
      
      <div className="space-y-5">
        <Row k="metadata" label="Metadata" />
        <Row k="access" label="Access" />
        <Row k="quality" label="Quality" />
        <Row k="timeliness" label="Timeliness" />
        <Row k="discoverability" label="Discoverability" />
        <Row k="compliance" label="Compliance" />
      </div>
      
      <div className="mt-6 pt-4 border-t border-white/10">
        <div className="flex items-start gap-3">
          <div className="w-4 h-4 text-blue-400 mt-0.5">💡</div>
          <div className="text-xs text-slate-400">
            <p className="font-medium text-slate-300 mb-1">What-if Analysis</p>
            <p>Adjust weights to explore different quality priorities. Changes are applied instantly to recalculate scores.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
