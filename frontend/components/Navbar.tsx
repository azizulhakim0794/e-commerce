"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  MoonIcon,
  ShoppingBagIcon,
  SunIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useStore } from "../store/StoreProvider";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { cart, user, theme, toggleTheme } = useStore();
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-[#f7f8f5]/40 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/40">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 lg:px-8">
        <div className="flex items-center gap-9">
          <Link
            href="/"
            className="flex items-center gap-2"
            onClick={() => setOpen(false)}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-700 text-sm font-black text-white">
              N
            </span>
            <span className="text-lg font-bold tracking-tight text-slate-950 dark:text-white">
              northstar<span className="text-teal-600">.</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-7 md:flex">
            <Link
              href="/products"
              className="text-sm font-semibold text-slate-600 hover:text-teal-700 dark:text-slate-300"
            >
              Shop
            </Link>
            <Link
              href="/products?category=New"
              className="text-sm font-semibold text-slate-600 hover:text-teal-700 dark:text-slate-300"
            >
              New arrivals
            </Link>
            <Link
              href="/products?category=Best%20sellers"
              className="text-sm font-semibold text-slate-600 hover:text-teal-700 dark:text-slate-300"
            >
              Best sellers
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/products"
            className="hidden rounded-full p-2.5 text-slate-600 hover:bg-slate-200/70 sm:block dark:text-slate-300"
            aria-label="Search products"
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
          </Link>
          <button
            onClick={toggleTheme}
            className="rounded-full p-2.5 text-slate-600 hover:bg-slate-200/70 dark:text-slate-300"
            aria-label="Toggle color theme"
          >
            {theme === "light" ? (
              <MoonIcon className="h-5 w-5" />
            ) : (
              <SunIcon className="h-5 w-5" />
            )}
          </button>
          <Link
            href="/cart"
            className="relative rounded-full p-2.5 text-slate-600 hover:bg-slate-200/70 dark:text-slate-300"
            aria-label={`Cart with ${count} items`}
          >
            <ShoppingBagIcon className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </Link>
          <Link
            href={user ? "/profile" : "/login"}
            className="hidden rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-teal-700 lg:block dark:bg-white dark:text-slate-950"
          >
            {user ? "Account" : "Sign in"}
          </Link>
          <button
            className="rounded-full p-2 md:hidden"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-slate-200 px-5 py-4 md:hidden dark:border-slate-800">
          <div className="flex flex-col gap-4">
            <Link
              href="/products"
              onClick={() => setOpen(false)}
              className="font-semibold"
            >
              Shop
            </Link>
            <Link
              href="/products?category=New"
              onClick={() => setOpen(false)}
              className="font-semibold"
            >
              New arrivals
            </Link>
            <Link
              href={user ? "/profile" : "/login"}
              onClick={() => setOpen(false)}
              className="font-semibold"
            >
              {user ? "Account" : "Sign in"}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
