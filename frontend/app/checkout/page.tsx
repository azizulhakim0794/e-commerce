"use client";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useStore } from "../../store/StoreProvider";

export default function CheckoutPage() {
  const { cart, clearCart, user } = useStore();
  const [placed, setPlaced] = useState(false);
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  function placeOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPlaced(true);
    clearCart();
  }
  if (placed)
    return (
      <div className="mx-auto max-w-xl px-5 py-32 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-100 text-2xl text-teal-700">
          ✓
        </div>
        <h1 className="mt-6 text-3xl font-black">Order placed. Lovely.</h1>
        <p className="mt-3 text-slate-500">
          We&apos;ll send a confirmation and tracking details to your inbox.
        </p>
        <Link
          href="/products"
          className="mt-8 inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white"
        >
          Continue shopping
        </Link>
      </div>
    );
  if (!cart.length)
    return (
      <div className="mx-auto max-w-xl px-5 py-32 text-center">
        <h1 className="text-3xl font-black">Nothing to check out yet.</h1>
        <Link
          href="/products"
          className="mt-6 inline-block font-bold text-teal-700"
        >
          Browse products
        </Link>
      </div>
    );
  return (
    <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-16">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">
        Almost there
      </p>
      <h1 className="mt-2 text-4xl font-black">Checkout</h1>
      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_380px]">
        <form onSubmit={placeOrder} className="grid gap-6">
          <section>
            <h2 className="text-lg font-black">Contact information</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold sm:col-span-2">
                Email
                <input
                  required
                  type="email"
                  defaultValue={user?.email}
                  placeholder="you@example.com"
                  className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal outline-none focus:border-teal-600 dark:border-slate-700 dark:bg-slate-900"
                />
              </label>
              <label className="grid gap-2 text-sm font-bold sm:col-span-2">
                Phone
                <input
                  required
                  type="tel"
                  placeholder="+1 555 000 0000"
                  className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal outline-none focus:border-teal-600 dark:border-slate-700 dark:bg-slate-900"
                />
              </label>
            </div>
          </section>
          <section>
            <h2 className="text-lg font-black">Shipping address</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold sm:col-span-2">
                Full name
                <input
                  required
                  placeholder="Alex Morgan"
                  className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal outline-none focus:border-teal-600 dark:border-slate-700 dark:bg-slate-900"
                />
              </label>
              <label className="grid gap-2 text-sm font-bold sm:col-span-2">
                Address
                <input
                  required
                  placeholder="123 Market Street"
                  className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal outline-none focus:border-teal-600 dark:border-slate-700 dark:bg-slate-900"
                />
              </label>
              <label className="grid gap-2 text-sm font-bold">
                City
                <input
                  required
                  className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal outline-none focus:border-teal-600 dark:border-slate-700 dark:bg-slate-900"
                />
              </label>
              <label className="grid gap-2 text-sm font-bold">
                Postal code
                <input
                  required
                  className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-normal outline-none focus:border-teal-600 dark:border-slate-700 dark:bg-slate-900"
                />
              </label>
            </div>
          </section>
          <button className="rounded-full bg-slate-950 px-6 py-4 text-sm font-bold text-white hover:bg-teal-700 dark:bg-white dark:text-slate-950">
            Place order
          </button>
        </form>
        <aside className="h-fit rounded-2xl bg-slate-100 p-6 dark:bg-slate-900">
          <h2 className="text-lg font-black">Your order</h2>
          {cart.map((item) => (
            <div
              key={item.id}
              className="mt-4 flex justify-between gap-4 text-sm"
            >
              <span className="text-slate-500">
                {item.name} × {item.quantity}
              </span>
              <span className="font-bold">${item.price * item.quantity}</span>
            </div>
          ))}
          <div className="mt-6 flex justify-between border-t border-slate-200 pt-4 font-black dark:border-slate-700">
            <span>Total</span>
            <span>${subtotal + (subtotal >= 75 ? 0 : 8)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
