const base = process.env.NEXT_PUBLIC_API_BASE_URL!;
export async function scanCKAN(portal: string, query: string, rows=25) {
  const url = `${base}/scan/ckan?portal=${encodeURIComponent(portal)}&query=${encodeURIComponent(query)}&rows=${rows}`;
  console.log('Making request to:', url);
  
  try {
    const res = await fetch(url, { 
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      }
    });
    console.log('Response status:', res.status);
    console.log('Response ok:', res.ok);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }
    
    const data = await res.json();
    console.log('Response data:', data);
    return data;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}
export async function scanSocrata(domain: string, id: string, token?: string) {
  const url = new URL(`${base}/scan/socrata`);
  url.searchParams.set("domain", domain);
  url.searchParams.set("dataset_id", id);
  if (token) url.searchParams.set("app_token", token);
  const res = await fetch(url.toString(), { method: "POST" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
export function badgeURL(score: number) {
  const u = new URL(`${base}/generate/badge`);
  u.searchParams.set("score", String(score));
  return u.toString();
}
