// Prefer env var; fall back to local dev API so scans work without extra setup
const base = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export async function scanCKAN(portal: string, query: string, rows=25) {
  const url = `${base}/scan/ckan?portal=${encodeURIComponent(portal)}&query=${encodeURIComponent(query)}&rows=${rows}`;
  console.log('Making request to:', url);
  console.log('API base URL:', base);
  
  try {
    const res = await fetch(url, { 
      method: "GET",
      headers: {
        'Accept': 'application/json',
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
    
    // Type guard for Error objects
    if (error instanceof Error) {
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      
      // If it's a network error, provide more helpful message
      if (error.message === 'Load failed' || error.message.includes('fetch')) {
        throw new Error(`Cannot connect to backend at ${base}. Make sure the backend server is running on port 8000.`);
      }
    }
    throw error;
  }
}
export async function scanSocrata(domain: string, id: string, token?: string) {
  const url = new URL(`${base}/scan/socrata`);
  url.searchParams.set("domain", domain);
  url.searchParams.set("dataset_id", id);
  if (token) url.searchParams.set("app_token", token);
  const res = await fetch(url.toString(), { method: "GET" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
export function badgeURL(score: number) {
  const u = new URL(`${base}/generate/badge`);
  u.searchParams.set("score", String(score));
  return u.toString();
}
