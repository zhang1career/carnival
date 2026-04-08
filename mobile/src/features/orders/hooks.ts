import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { fetchMallOrder, fetchMallOrdersPage } from "@/lib/api/mallOrdersApi";
import { useAuthStore } from "@/stores/authStore";

const DEFAULT_PER_PAGE = 15;

export function useOrdersInfiniteQuery(perPage: number = DEFAULT_PER_PAGE) {
  const token = useAuthStore((s) => s.accessToken);
  return useInfiniteQuery({
    queryKey: ["mall-orders", "paged", perPage, token],
    queryFn: ({ pageParam }) => {
      if (!token) throw new Error("Not signed in");
      return fetchMallOrdersPage(token, { page: pageParam, per_page: perPage });
    },
    initialPageParam: 1,
    enabled: !!token,
    getNextPageParam: (last) => {
      const { current_page, last_page } = last.pagination;
      if (current_page >= last_page) return undefined;
      return current_page + 1;
    },
  });
}

export function useOrderQuery(orderId: string) {
  const token = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ["mall-order", orderId, token],
    queryFn: () => {
      if (!token) throw new Error("Not signed in");
      return fetchMallOrder(token, orderId);
    },
    enabled: !!token && !!orderId,
  });
}
