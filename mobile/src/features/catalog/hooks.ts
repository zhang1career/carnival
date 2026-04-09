import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { getCommerceRepo } from "@/lib/api";

const DEFAULT_PER_PAGE = 15;

export function useProductsQuery(opts?: { page?: number; per_page?: number }) {
  const page = opts?.page ?? 1;
  const per_page = opts?.per_page ?? DEFAULT_PER_PAGE;
  return useQuery({
    queryKey: ["products", page, per_page],
    queryFn: () => getCommerceRepo().listProducts({ page, per_page }),
  });
}

export function useProductsInfiniteQuery(perPage: number = DEFAULT_PER_PAGE) {
  return useInfiniteQuery({
    queryKey: ["products", "paged", perPage],
    queryFn: ({ pageParam }) =>
      getCommerceRepo().listProducts({ page: pageParam, per_page: perPage }),
    initialPageParam: 1,
    getNextPageParam: (last) => {
      const { current_page, last_page } = last.pagination;
      if (current_page >= last_page) return undefined;
      return current_page + 1;
    },
  });
}

export function useProductQuery(id: string, options?: { enabled?: boolean }) {
  const enabled = options?.enabled !== false;
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => getCommerceRepo().getProduct(id),
    enabled: enabled && !!id,
  });
}
