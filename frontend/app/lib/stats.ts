// Percentile rank & helpers (NIST-style definition: <= value proportion)
// NIST e-Handbook explains percentiles via order statistics.

export function percentileRank(values: number[], v: number): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a,b)=>a-b);
  const count = sorted.filter(x => x <= v).length;
  return Math.round((count / sorted.length) * 100);
}

export function bucketMatrix(scan: any) {
  // Returns [{id,title, scores:{metadata,access,quality,timeliness,discoverability,compliance}, total}]
  return (scan?.results || []).map((r: any) => ({
    id: r.dataset.id,
    title: r.dataset.title,
    total: r.score,
    scores: r.buckets
  }));
}
