import { useQuery } from "@tanstack/react-query";
import { getCommerceRepo } from "@/lib/api";

export function useProductsQuery() {
  return useQuery({
    queryKey: ["products"],
    queryFn: () => getCommerceRepo().listProducts(),
  });
}

export function useProductQuery(id: string) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => getCommerceRepo().getProduct(id),
    enabled: !!id,
  });
}
