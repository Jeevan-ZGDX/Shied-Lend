import { Sidebar } from "./Sidebar";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-foreground selection:bg-emerald-500/30">
      <Sidebar />
      <main className="pl-64">
        <div className="max-w-7xl mx-auto p-8 lg:p-12 animate-in fade-in duration-500 slide-in-from-bottom-4">
          {children}
        </div>
      </main>
    </div>
  );
}
