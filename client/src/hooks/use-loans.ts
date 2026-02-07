import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

type CreateLoanInput = z.infer<typeof api.loans.create.input>;

export function useLoans() {
  return useQuery({
    queryKey: [api.loans.list.path],
    queryFn: async () => {
      const res = await fetch(api.loans.list.path);
      if (!res.ok) throw new Error("Failed to fetch loans");
      return api.loans.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateLoan() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateLoanInput) => {
      const res = await fetch(api.loans.create.path, {
        method: api.loans.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create loan");
      }
      return api.loans.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.loans.list.path] });
      toast({
        title: "Loan Approved",
        description: "Funds have been transferred to your shielded wallet.",
      });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Loan Failed", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });
}
