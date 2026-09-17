"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { orderService } from "@/helper/services/order.service";
import RatingModal from "@/components/RatingModal";
import { useApi } from "@/hooks/useApi";
import { useStore } from "@/store/StoreProvider";
import { StarIcon } from "@heroicons/react/24/outline";
import type { OrderResponse } from "@/types/order";
import Loading from "@/components/Loading";

export default function OrdersPage() {
  const { user, isSessionLoading } = useStore();
  const { handleRequest } = useApi();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [ratingProduct, setRatingProduct] = useState<
    OrderResponse["order_items"][number]["product"] | null
  >(null);

  useEffect(() => {
    if (!user) return;

    const loadOrders = async () => {
      setIsLoading(true);
      const result = await handleRequest(orderService.getOrders);

      if (result.success && Array.isArray(result.data)) {
        setOrders(result.data);
      }

      setIsLoading(false);
    };

    void loadOrders();
  }, [user]);

  const totalOrders = useMemo(
    () =>
      orders.reduce(
        (sum, order) =>
          sum +
          order.order_items.reduce(
            (itemSum, item) => itemSum + item.product.price * item.quantity,
            0,
          ),
        0,
      ),
    [orders],
  );

  if (isSessionLoading) return <Loading />;

  if (!user)
    return (
      <div className="mx-auto max-w-xl px-5 py-32 text-center">
        <h1 className="text-3xl font-black">Sign in to view your orders.</h1>
        <Link
          href="/login"
          className="mt-6 inline-block font-bold text-teal-700"
        >
          Go to sign in
        </Link>
      </div>
    );

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 lg:px-8 lg:py-16">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">
        Account
      </p>
      <h1 className="mt-2 text-4xl font-black">Your orders.</h1>

      {isLoading ? (
        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
          Loading your orders...
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-slate-500">
            You haven&apos;t placed any orders yet.
          </p>
        </div>
      ) : (
        <div className="mt-10 space-y-6">
          {orders.map((order) => {
            const subtotal = order.order_items.reduce(
              (sum, item) => sum + item.product.price * item.quantity,
              0,
            );
            const statusLabel =
              order.status === "delivered" ? "Delivered" : "Processing";
            const statusStyles =
              order.status === "delivered"
                ? "bg-emerald-100 text-emerald-800"
                : "bg-amber-100 text-amber-800";

            return (
              <div
                key={order.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                      Order ID
                    </p>
                    <p className="mt-2 font-bold">{order.id}</p>
                    <p className="mt-2 text-sm text-slate-500">
                      Placed on{" "}
                      {order.created_at
                        ? new Date(order.created_at).toLocaleDateString()
                        : "Pending"}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`h-fit rounded-full px-3 py-1 text-xs font-bold ${statusStyles}`}
                    >
                      {statusLabel}
                    </span>
                  </div>
                </div>

                <div className="mt-6 border-t border-slate-200 pt-5 dark:border-slate-800">
                  <div className="space-y-4">
                    {order.order_items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-3 dark:bg-slate-800"
                      >
                        <div>
                          <p className="font-bold">{item.product.name}</p>
                          <p className="text-sm text-slate-500">
                            Quantity: {item.quantity}
                          </p>
                          {order.status === "delivered" ? (
                            <button
                              type="button"
                              onClick={() => setRatingProduct(item.product)}
                              className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-teal-700 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-teal-800"
                            >
                              <StarIcon className="h-3.5 w-3.5" />
                              Review & rate
                            </button>
                          ) : null}
                        </div>
                        <p className="font-black">
                          ${item.product.price * item.quantity}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 text-sm dark:border-slate-800">
                    <div>
                      <p className="text-slate-500">Delivery date</p>
                      <p className="mt-1 font-bold">
                        {order.delivery_at
                          ? new Date(order.delivery_at).toLocaleDateString()
                          : "Pending"}
                      </p>
                    </div>
                    <p className="text-lg font-black">Total: ${subtotal}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-8 flex items-center justify-between gap-4 border-t border-slate-200 pt-6 text-sm dark:border-slate-800">
        <span className="text-slate-500">Orders total</span>
        <span className="text-lg font-black">${totalOrders}</span>
      </div>

      <Link
        href="/products"
        className="mt-8 inline-block font-bold text-teal-700"
      >
        Keep shopping →
      </Link>

      <RatingModal
        product={ratingProduct}
        onClose={() => setRatingProduct(null)}
      />
    </div>
  );
}
