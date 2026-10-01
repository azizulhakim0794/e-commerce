"use client";

import { product_service } from "@/helper/services/product.service";
import { useApi } from "@/hooks/useApi";
import { AllOrderResponse, AdminOrderItem } from "@/types";
import { useEffect, useState } from "react";

const OrderList = () => {
  const { handleRequest } = useApi();
  const [orders, setOrders] = useState<AllOrderResponse[]>([]);

  const loadOrders = async () => {
    const result = await handleRequest(product_service.get_ordered_products);
    if (result.success && result.data) {
      setOrders(result.data);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Flatten all order items across all orders for display
  const rows: { order: AllOrderResponse; item: AdminOrderItem }[] =
    orders.flatMap((order) =>
      order.order_items.map((item) => ({ order, item })),
    );

  return (
    <>
      <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[700px] text-left">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-6 py-4">Order Item ID</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Qty</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Placed</th>
              <th className="px-6 py-4">Delivery</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-8 text-center text-slate-400"
                >
                  No orders found.
                </td>
              </tr>
            ) : (
              rows.map(({ order, item }) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-6 py-5 font-mono text-xs text-[#102d2a]">
                    {item.id.slice(0, 8)}…
                  </td>
                  <td className="px-6 py-5 text-sm font-semibold">
                    {item.user_details?.username ?? "—"}
                  </td>
                  <td className="px-6 py-5 text-sm font-black">
                    ${Number(item.price).toFixed(2)}
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-600">
                    {item.quantity}
                  </td>
                  <td className="px-6 py-5">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black ${
                        order.status === "delivered"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-[#f9e8ca] text-[#8b5a1e]"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-500">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-500">
                    {new Date(order.delivery_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default OrderList;
