// Simple localStorage cache keyed by portal|query.
// We also keep a "scanHistory" list so you can reopen past scans.

export type ScanResult = {
  portal: string;
  query: string | null;
  total: number;
  avg_score: number;
  results: any[];
};

const keyFor = (portal: string, query: string) =>
  `scan:${(portal||"").trim()}|${(query||"").trim()}`;

export function saveScan(scan: ScanResult) {
  if (typeof window === "undefined") return;
  const key = keyFor(scan.portal, scan.query || "");
  localStorage.setItem(key, JSON.stringify(scan));

  // Maintain a small history of last 10 keys
  const hkey = "scanHistory";
  const prev = JSON.parse(localStorage.getItem(hkey) || "[]") as string[];
  const next = [key, ...prev.filter(k => k !== key)].slice(0, 10);
  localStorage.setItem(hkey, JSON.stringify(next));
}

export function loadScan(portal: string, query: string): ScanResult | null {
  if (typeof window === "undefined") return null;
  const val = localStorage.getItem(keyFor(portal, query));
  return val ? JSON.parse(val) : null;
}

export function lastScan(): ScanResult | null {
  if (typeof window === "undefined") return null;
  const h = JSON.parse(localStorage.getItem("scanHistory") || "[]") as string[];
  if (!h.length) return null;
  const v = localStorage.getItem(h[0]);
  return v ? JSON.parse(v) : null;
}

export function allHistory(): { key: string; portal: string; query: string }[] {
  if (typeof window === "undefined") return [];
  const raw = JSON.parse(localStorage.getItem("scanHistory") || "[]") as string[];
  return raw.map(k => {
    const [_, rest] = k.split("scan:");
    const [portal, query] = rest.split("|");
    return { key: k, portal, query };
  });
}
