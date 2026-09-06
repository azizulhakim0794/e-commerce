"use client";
import Link from "next/link";
import { useStore } from "../../store/StoreProvider";
export default function OrdersPage() {
  const { user } = useStore();
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
      <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Order #NS-2048
            </p>
            <p className="mt-2 font-bold">April 18, 2026</p>
          </div>
          <span className="h-fit rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
            Processing
          </span>
        </div>
        <div className="mt-6 border-t border-slate-200 pt-5 text-sm dark:border-slate-800">
          <p className="text-slate-500">
            Your recent order will appear here with item details and tracking
            updates.
          </p>
          <p className="mt-3 font-black">Total: $0.00</p>
        </div>
      </div>
      <Link
        href="/products"
        className="mt-8 inline-block font-bold text-teal-700"
      >
        Keep shopping →
      </Link>
    </div>
  );
}
