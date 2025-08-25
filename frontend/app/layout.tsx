import "./globals.css";
import AuroraFX from "./components/AuroraFX";

export const metadata = {
  title: "DataDebt",
  description: "Credit score for public datasets",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 antialiased">
        {/* Aurora Background Effect */}
        <AuroraFX />
        
        <div className="relative z-10">
          <div className="relative mx-auto max-w-7xl px-6 py-12">
            <header className="mb-12">
              <div className="text-center">
                <h1 className="text-5xl font-black tracking-tight mb-4">
                  <span className="bg-gradient-to-r from-brand-500 via-blue-400 to-purple-400 bg-clip-text text-transparent drop-shadow-2xl">
                    Data
                  </span>
                  <span className="text-white">Debt</span>
                </h1>
                <p className="text-xl text-slate-300 mb-2 font-light">
                  Audit any open-data portal. Fix debt in minutes.
                </p>
                <div className="h-1 w-24 bg-gradient-to-r from-brand-500 to-blue-500 rounded-full mx-auto"></div>
              </div>
            </header>
            
            <main className="relative">
              {children}
            </main>
            
            <footer className="mt-20 pt-8 border-t border-white/10">
              <div className="text-center">
                <p className="text-sm text-slate-400">
                  © 2025 DataDebt • Built with precision and care
                </p>
              </div>
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
