import { Layout } from "@/components/Layout";
import { useDeposits } from "@/hooks/use-deposits";
import { useLoans } from "@/hooks/use-loans";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ArrowUpRight, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Positions() {
  const { data: deposits, isLoading: depositsLoading } = useDeposits();
  const { data: loans, isLoading: loansLoading } = useLoans();
  const { toast } = useToast();

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    toast({ title: "Copied", description: "Commitment hash copied to clipboard" });
  };

  if (depositsLoading || loansLoading) {
    return <Layout><div className="text-white">Loading positions...</div></Layout>;
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">My Positions</h2>
          <p className="text-zinc-400 mt-2">Manage your shielded collateral and active loans.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Deposits Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              Shielded Deposits
            </h3>
            {deposits?.length === 0 ? (
              <Card className="glass-panel border-dashed border-zinc-800 bg-transparent">
                <CardContent className="py-8 text-center text-zinc-500">
                  No shielded deposits found. Go to Markets to start.
                </CardContent>
              </Card>
            ) : (
              deposits?.map((deposit) => (
                <Card key={deposit.id} className="glass-panel border-zinc-800">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-medium text-white">
                      {Number(deposit.amount).toLocaleString()} USDC
                    </CardTitle>
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 uppercase">
                      {deposit.status}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-zinc-500 mb-1">Commitment Hash</p>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-zinc-900 px-2 py-1 rounded text-zinc-300 font-mono truncate max-w-[200px] md:max-w-xs">
                            {deposit.commitmentHash}
                          </code>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyHash(deposit.commitmentHash)}>
                            <Copy className="w-3 h-3 text-zinc-500" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex gap-2">
                         <Button variant="outline" size="sm" className="flex-1 border-zinc-700 text-zinc-300">
                            View Proof
                         </Button>
                         <Button variant="secondary" size="sm" className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white">
                            Borrow Against
                         </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Loans Section */}
          <div className="space-y-4">
             <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <ArrowUpRight className="w-5 h-5 text-accent" />
              Active Loans
            </h3>
            {loans?.length === 0 ? (
              <Card className="glass-panel border-dashed border-zinc-800 bg-transparent">
                <CardContent className="py-8 text-center text-zinc-500">
                  No active loans.
                </CardContent>
              </Card>
            ) : (
              loans?.map((loan) => (
                <Card key={loan.id} className="glass-panel border-zinc-800">
                  <CardContent className="pt-6">
                    <div className="flex justify-between mb-4">
                      <div>
                        <p className="text-sm text-zinc-400">Borrowed Amount</p>
                        <p className="text-2xl font-bold text-white">${loan.amount}</p>
                      </div>
                      <Badge variant="outline" className="h-fit border-accent/20 text-accent bg-accent/5">
                        Active
                      </Badge>
                    </div>
                    <div className="h-2 bg-zinc-900 rounded-full overflow-hidden">
                      <div className="h-full bg-accent w-1/3" />
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-zinc-500">
                      <span>Health Factor: 2.5</span>
                      <span>Safe</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
