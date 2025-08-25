import "./globals.css";

export const metadata = {
  title: "DataDebt",
  description: "Credit score for public datasets",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <header className="mb-8">
            <h1 className="text-3xl font-black tracking-tight">
              <span className="text-brand-500 drop-shadow glow">Data</span>Debt
            </h1>
            <p className="text-slate-300 mt-2">Audit any open-data portal. Fix debt in minutes.</p>
          </header>
          {children}
          <footer className="mt-12 text-xs text-slate-400">© 2025 DataDebt</footer>
        </div>
      </body>
    </html>
  );
}
