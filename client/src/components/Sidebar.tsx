import { Link, useLocation } from "wouter";
import { LayoutDashboard, Wallet, TrendingUp, ShieldCheck, LogOut, Hexagon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

export function Sidebar() {
  const [location] = useLocation();
  const { logout, user } = useAuth();

  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/markets", label: "Privacy Pools", icon: TrendingUp },
    { href: "/positions", label: "My Positions", icon: Wallet },
    { href: "/prover", label: "ZK Prover", icon: ShieldCheck },
  ];

  return (
    <div className="w-64 border-r border-zinc-800 bg-zinc-950/50 backdrop-blur flex flex-col h-screen fixed left-0 top-0 z-50">
      <div className="p-6 flex items-center gap-3 border-b border-zinc-800/50">
        <div className="relative">
          <Hexagon className="w-8 h-8 text-emerald-500 fill-emerald-500/10" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-bold text-emerald-500">ZK</span>
          </div>
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-tight text-white">Privacy Pool</h1>
          <p className="text-xs text-zinc-500">Stellar Network</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location === link.href;
          return (
            <Link key={link.href} href={link.href} className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
              isActive 
                ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-lg shadow-emerald-500/5" 
                : "text-zinc-400 hover:text-white hover:bg-zinc-900"
            )}>
              <Icon className={cn("w-5 h-5", isActive && "stroke-[2.5px]")} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-800/50">
        <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 mb-2">
          <p className="text-xs font-mono text-zinc-500 mb-1">CONNECTED AS</p>
          <p className="text-sm font-semibold text-white truncate">{user?.username}</p>
        </div>
        <button 
          onClick={() => logout()}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
