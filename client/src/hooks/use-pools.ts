import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

export function usePools() {
  return useQuery({
    queryKey: [api.pools.list.path],
    queryFn: async () => {
      const res = await fetch(api.pools.list.path);
      if (!res.ok) throw new Error("Failed to fetch pools");
      return api.pools.list.responses[200].parse(await res.json());
    },
  });
}

export function usePool(id: number) {
  return useQuery({
    queryKey: [api.pools.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.pools.get.path, { id });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch pool");
      return api.pools.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}
