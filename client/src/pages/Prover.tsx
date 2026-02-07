import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Lock, Server, ArrowRight, ShieldCheck, Database } from "lucide-react";

export default function Prover() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold tracking-tight text-white">How Privacy Works</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            Our protocol uses zk-SNARKs (Zero-Knowledge Succinct Non-Interactive Arguments of Knowledge) 
            to mathematically prove you own assets without revealing which specific assets they are.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Connecting Line */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-zinc-800 via-emerald-900 to-zinc-800 -z-10" />

          {/* Step 1 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass-panel border-zinc-800 h-full relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
              <CardContent className="pt-8 text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800">
                  <Lock className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold text-white">1. Client-Side Proving</h3>
                <p className="text-sm text-zinc-400">
                  Your browser generates a cryptographic proof locally. Your secrets never leave your device.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Step 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="glass-panel border-zinc-800 h-full relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500" />
              <CardContent className="pt-8 text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800">
                  <Server className="w-8 h-8 text-cyan-500" />
                </div>
                <h3 className="text-xl font-bold text-white">2. Relayer Submission</h3>
                <p className="text-sm text-zinc-400">
                  The proof is sent to the blockchain via a relayer, decoupling your IP and wallet address.
                </p>
              </CardContent>
            </Card>
          </motion.div>

           {/* Step 3 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="glass-panel border-zinc-800 h-full relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
              <CardContent className="pt-8 text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800">
                  <Database className="w-8 h-8 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold text-white">3. On-Chain Verification</h3>
                <p className="text-sm text-zinc-400">
                  The smart contract verifies the math. If valid, the transaction executes without revealing data.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800 text-center">
           <ShieldCheck className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
           <h3 className="text-xl font-bold text-white mb-2">Institutional Grade Privacy</h3>
           <p className="text-zinc-400">Audited circuits. Open source prover. Compliant architecture.</p>
        </div>
      </div>
    </Layout>
  );
}
