import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type Deposit } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

type CreateDepositInput = z.infer<typeof api.deposits.create.input>;

export function useDeposits() {
  return useQuery({
    queryKey: [api.deposits.list.path],
    queryFn: async () => {
      const res = await fetch(api.deposits.list.path);
      if (!res.ok) throw new Error("Failed to fetch deposits");
      return api.deposits.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateDeposit() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateDepositInput) => {
      const res = await fetch(api.deposits.create.path, {
        method: api.deposits.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create deposit");
      }
      return api.deposits.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.deposits.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.pools.list.path] });
      // We don't show toast here as the UI will handle the success state animation
    },
    onError: (error: Error) => {
      toast({ 
        title: "Deposit Failed", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });
}

export function useVerifyDeposit() {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.deposits.verify.path, { id });
      const res = await fetch(url, { method: api.deposits.verify.method });
      
      if (!res.ok) throw new Error("Verification failed");
      return api.deposits.verify.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      toast({
        title: "Proof Verified On-Chain",
        description: `ZK Proof Hash: ${data.proofHash.substring(0, 16)}...`,
      });
    }
  });
}
