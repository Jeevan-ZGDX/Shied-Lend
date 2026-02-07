import { Layout } from "@/components/Layout";
import { StatCard } from "@/components/StatCard";
import { usePools } from "@/hooks/use-pools";
import { useDeposits } from "@/hooks/use-deposits";
import { Wallet, TrendingUp, Shield, Activity, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { format } from "date-fns";

const mockData = [
  { name: 'Mon', value: 4000 },
  { name: 'Tue', value: 3000 },
  { name: 'Wed', value: 5000 },
  { name: 'Thu', value: 4500 },
  { name: 'Fri', value: 6000 },
  { name: 'Sat', value: 5500 },
  { name: 'Sun', value: 7000 },
];

export default function Dashboard() {
  const { data: pools } = usePools();
  const { data: deposits } = useDeposits();

  // Calculate totals
  const totalShielded = deposits?.reduce((acc, d) => acc + Number(d.amount), 0) || 0;
  const activePoolsCount = pools?.length || 0;

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Dashboard</h2>
          <p className="text-zinc-400 mt-2">Overview of your shielded assets and privacy metrics.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Value Locked" 
            value="$1,245,392.00" 
            subtext="+12.5% from last month"
            icon={Activity}
          />
          <StatCard 
            title="My Shielded Balance" 
            value={`$${totalShielded.toLocaleString()}`} 
            subtext="Across 3 pools"
            icon={Shield}
            delay={100}
          />
          <StatCard 
            title="Active APY" 
            value="5.5%" 
            subtext="Stellar USDC Pool"
            icon={TrendingUp}
            delay={200}
          />
          <StatCard 
            title="Active Loans" 
            value="$0.00" 
            subtext="Health Factor: ∞"
            icon={Wallet}
            delay={300}
          />
        </div>

        {/* Charts & Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="col-span-2 glass-panel border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Liquidity Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="name" 
                      stroke="#52525b" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="#52525b" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(value) => `$${value}`} 
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }}
                      itemStyle={{ color: '#10b981' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#10b981" 
                      strokeWidth={2} 
                      fillOpacity={1} 
                      fill="url(#colorValue)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="glass-panel border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button asChild className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold">
                  <Link href="/markets">
                    <Shield className="w-4 h-4 mr-2" />
                    Shield Assets
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white">
                  <Link href="/positions">
                    <Wallet className="w-4 h-4 mr-2" />
                    Manage Loans
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="glass-panel border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {deposits?.slice(0, 3).map((d) => (
                    <div key={d.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                          <Shield className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div>
                          <p className="font-medium text-white">Deposit Shielded</p>
                          <p className="text-xs text-zinc-500">{format(new Date(d.createdAt || new Date()), "MMM d, HH:mm")}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-emerald-500">+{d.amount}</p>
                        <p className="text-xs text-zinc-500">Confirmed</p>
                      </div>
                    </div>
                  ))}
                  {(!deposits || deposits.length === 0) && (
                    <p className="text-sm text-zinc-500 text-center py-4">No recent activity</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
