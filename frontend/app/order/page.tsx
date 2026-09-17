"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import type { OrderResponse } from "@/types/order";
import Loading from "../loading";

export default function OrderPage() {
  const router = useRouter();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedOrder = window.sessionStorage.getItem(
      "northstar-pending-order",
    );

    if (!storedOrder) {
      setOrder(null);
      setIsLoadingOrder(false);
      return;
    }

    try {
      setOrder(JSON.parse(storedOrder) as OrderResponse);
    } catch {
      setOrder(null);
    } finally {
      setIsLoadingOrder(false);
    }
  }, []);

  if (isLoadingOrder) {
    return (
      <div className="mx-auto max-w-xl px-5 py-32 text-center">
        <Loading />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-xl px-5 py-32 text-center">
        <h1 className="text-3xl font-black">No order ready yet.</h1>
        <p className="mt-3 text-slate-500">
          Choose an address from the checkout modal to continue.
        </p>
        <button
          type="button"
          onClick={() => router.push("/products")}
          className="mt-8 inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white hover:bg-teal-700"
        >
          Browse products
        </button>
      </div>
    );
  }

  const subtotal = order.order_items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const shipping = subtotal >= 75 || subtotal === 0 ? 0 : 8;
  const orderStatus = order.status === "delivered" ? "Delivered" : "Processing";
  const statusStyle =
    order.status === "delivered"
      ? "bg-emerald-100 text-emerald-800"
      : "bg-amber-100 text-amber-800";

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 lg:px-8 lg:py-16">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">
        Order confirmed
      </p>
      <h1 className="mt-2 text-4xl font-black">
        {order.status === "delivered"
          ? "Your order has been delivered."
          : "Your order is on the way."}
      </h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                  Order ID
                </p>
                <p className="mt-2 text-xl font-black">{order.id}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyle}`}
              >
                {orderStatus}
              </span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                  Placed on
                </p>
                <p className="mt-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                  {order.created_at
                    ? new Date(order.created_at).toLocaleDateString()
                    : "Pending"}
                </p>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                  Delivery date
                </p>
                <p className="mt-2 text-sm font-bold text-slate-700 dark:text-slate-200">
                  {order.delivery_at
                    ? new Date(order.delivery_at).toLocaleDateString()
                    : "Pending"}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-black">Items</h2>
            <div className="mt-5 space-y-4">
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
                  </div>
                  <p className="font-black">
                    ${item.product.price * item.quantity}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-2xl bg-slate-100 p-6 dark:bg-slate-800">
          <h2 className="text-lg font-black">Order summary</h2>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-bold">${subtotal}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Shipping</span>
              <span className="font-bold">
                {shipping ? `$${shipping}` : "Free"}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-base dark:border-slate-700">
              <span className="font-black">Total</span>
              <span className="font-black">${subtotal + shipping}</span>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <Link
              href="/products"
              className="block rounded-full bg-slate-950 px-5 py-3 text-center text-sm font-bold text-white hover:bg-teal-700 dark:bg-white dark:text-slate-950"
            >
              Continue shopping
            </Link>
            <Link
              href="/orders"
              className="block rounded-full border border-slate-300 px-5 py-3 text-center text-sm font-bold hover:border-teal-700 hover:text-teal-700 dark:border-slate-700"
            >
              View orders
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
