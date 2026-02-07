import { useState } from "react";
import { Layout } from "@/components/Layout";
import { usePools } from "@/hooks/use-pools";
import { useCreateDeposit } from "@/hooks/use-deposits";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Shield, TrendingUp, Lock } from "lucide-react";
import { ZKProofSimulation } from "@/components/ZKProofSimulation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { Pool } from "@shared/schema";

const depositSchema = z.object({
  amount: z.coerce.number().min(1, "Amount must be at least 1"),
});

export default function Markets() {
  const { data: pools, isLoading } = usePools();

  if (isLoading) {
    return <Layout><div className="text-white">Loading markets...</div></Layout>;
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Privacy Markets</h2>
          <p className="text-zinc-400 mt-2">Select a pool to shield your assets and earn yield.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pools?.map((pool) => (
            <PoolCard key={pool.id} pool={pool} />
          ))}
        </div>
      </div>
    </Layout>
  );
}

function PoolCard({ pool }: { pool: Pool }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const { mutate: createDeposit } = useCreateDeposit();
  
  const form = useForm<z.infer<typeof depositSchema>>({
    resolver: zodResolver(depositSchema),
    defaultValues: { amount: 0 },
  });

  const onSubmit = (data: z.infer<typeof depositSchema>) => {
    setIsDialogOpen(false);
    setIsSimulating(true);
    // Mutation is called after simulation completes
  };

  const handleSimulationComplete = () => {
    const amount = form.getValues().amount;
    createDeposit({
      poolId: pool.id,
      amount: amount,
      isShielded: true,
      commitmentHash: `0x${Math.random().toString(16).substr(2, 64)}` // Mock hash
    });
    setIsSimulating(false);
    form.reset();
  };

  return (
    <>
      <Card className="glass-panel border-zinc-800 hover:border-zinc-700 transition-colors group">
        <CardHeader>
          <div className="flex justify-between items-start mb-2">
            <div className="p-3 bg-zinc-900 rounded-xl border border-zinc-800 group-hover:border-emerald-500/30 transition-colors">
              <Shield className="w-6 h-6 text-emerald-500" />
            </div>
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
              <TrendingUp className="w-3 h-3 mr-1" />
              {pool.apy}% APY
            </Badge>
          </div>
          <CardTitle className="text-white text-xl">{pool.name}</CardTitle>
          <CardDescription className="text-zinc-400">Asset: {pool.asset}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Total Liquidity</span>
              <span className="font-mono text-zinc-300">${Number(pool.totalLiquidity).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Min. Collateral</span>
              <span className="font-mono text-zinc-300">{pool.minCollateralRatio}%</span>
            </div>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold shadow-lg shadow-emerald-500/10">
                <Lock className="w-4 h-4 mr-2" />
                Deposit & Shield
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-950 border-zinc-800 text-white">
              <DialogHeader>
                <DialogTitle>Deposit to {pool.name}</DialogTitle>
                <DialogDescription>
                  Your assets will be shielded using Zero-Knowledge proofs before entering the pool.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount ({pool.asset})</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            className="bg-zinc-900 border-zinc-800 text-white focus:border-emerald-500" 
                            placeholder="0.00" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-lg text-xs text-emerald-400 flex gap-2">
                    <Shield className="w-4 h-4 shrink-0" />
                    <p>
                      Privacy Note: Once deposited, your funds are unlinked from your public address. You will receive a commitment hash.
                    </p>
                  </div>
                  <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold">
                    Generate Proof & Deposit
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      <ZKProofSimulation 
        open={isSimulating} 
        onComplete={handleSimulationComplete} 
        asset={pool.asset}
        amount={form.getValues().amount}
      />
    </>
  );
}
