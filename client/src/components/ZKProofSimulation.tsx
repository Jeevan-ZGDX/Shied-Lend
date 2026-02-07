import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Shield, Lock, Cpu } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

interface ZKProofSimulationProps {
  open: boolean;
  onComplete: () => void;
  asset: string;
  amount: number;
}

const STEPS = [
  "Initializing ZK circuits...",
  "Generating randomness witness...",
  "Computing commitment hash...",
  "Generating zero-knowledge proof...",
  "Verifying proof locally...",
  "Constructing shielded transaction..."
];

export function ZKProofSimulation({ open, onComplete, asset, amount }: ZKProofSimulationProps) {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (open) {
      setStep(0);
      setProgress(0);
      
      const interval = setInterval(() => {
        setStep(prev => {
          if (prev >= STEPS.length - 1) {
            clearInterval(interval);
            setTimeout(onComplete, 800);
            return prev;
          }
          return prev + 1;
        });
      }, 800);

      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 2, 100));
      }, 40);

      return () => {
        clearInterval(interval);
        clearInterval(progressInterval);
      };
    }
  }, [open, onComplete]);

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md bg-zinc-950 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Shield className="w-6 h-6 text-emerald-500" />
            Shielding Assets
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Generating Zero-Knowledge Proof for {amount} {asset}
          </DialogDescription>
        </DialogHeader>

        <div className="py-8 space-y-8">
          {/* Visualizer */}
          <div className="flex justify-center items-center gap-8 relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-zinc-800 -z-10" />
            
            <motion.div 
              animate={{ scale: step >= 1 ? 1.1 : 1, color: step >= 1 ? "#10b981" : "#71717a" }}
              className="bg-zinc-900 p-3 rounded-full border border-zinc-800 z-10"
            >
              <Cpu className="w-6 h-6" />
            </motion.div>

            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="bg-zinc-900 p-4 rounded-full border border-emerald-500/30 shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)] z-10"
            >
              <Lock className="w-8 h-8 text-emerald-500" />
            </motion.div>

            <motion.div 
              animate={{ scale: step >= 4 ? 1.1 : 1, color: step >= 4 ? "#10b981" : "#71717a" }}
              className="bg-zinc-900 p-3 rounded-full border border-zinc-800 z-10"
            >
              <CheckCircle2 className="w-6 h-6" />
            </motion.div>
          </div>

          {/* Progress & Logs */}
          <div className="space-y-4">
            <div className="flex justify-between text-xs font-mono text-zinc-400 uppercase tracking-wider">
              <span>{Math.round(progress)}% Complete</span>
              <span>Groth16 Prover</span>
            </div>
            <Progress value={progress} className="h-2 bg-zinc-900" indicatorClassName="bg-emerald-500" />
            
            <div className="h-24 bg-zinc-950/50 rounded-lg border border-zinc-900 p-3 font-mono text-xs space-y-1 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent pointer-events-none" />
              {STEPS.slice(0, step + 1).reverse().map((s, i) => (
                <motion.div 
                  key={s}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1 - (i * 0.2), x: 0 }}
                  className="text-emerald-500/90"
                >
                  {">"} {s}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
