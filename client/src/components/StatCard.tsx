import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  subtext?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  delay?: number;
}

export function StatCard({ title, value, subtext, icon: Icon, trend, delay = 0 }: StatCardProps) {
  return (
    <Card 
      className="glass-panel border-zinc-800/50 overflow-hidden relative group"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
        <CardTitle className="text-sm font-medium text-zinc-400 font-mono tracking-wider uppercase">
          {title}
        </CardTitle>
        <div className={cn(
          "p-2 rounded-lg bg-zinc-900/50 border border-zinc-800",
          "group-hover:border-emerald-500/30 group-hover:text-emerald-500 transition-colors"
        )}>
          <Icon className="w-4 h-4 text-zinc-400 group-hover:text-emerald-500" />
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-3xl font-bold tracking-tight text-white mb-1">
          {value}
        </div>
        {subtext && (
          <p className="text-xs text-zinc-500 font-mono">
            {subtext}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
