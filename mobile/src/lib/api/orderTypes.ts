export type OrderStatus = "pending" | "paid" | "cancelled";

export type OrderLine = {
  pid: number;
  quantity: number;
  unit_price: number;
};

export type OrderSummary = {
  id: number;
  uid: number;
  status: OrderStatus;
  total_price: number;
  ct: number;
  ut: number;
};

export type OrderDetail = OrderSummary & {
  lines: OrderLine[];
};

export type OrderPagination = {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
};

export type OrderListResult = {
  items: OrderSummary[];
  pagination: OrderPagination;
};
