"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  XMarkIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { useStore } from "../store/StoreProvider";
import { useApi } from "@/hooks/useApi";
import { authService } from "@/helper/services/auth.service";
import { ENV } from "@/config/env";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const { cart, user, setUser, isSessionLoading } = useStore();
  const { handleRequest } = useApi();
  const accountRef = useRef<HTMLDivElement>(null);
  const count = cart.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const closeAccountMenu = (event: MouseEvent) => {
      if (
        accountRef.current &&
        !accountRef.current.contains(event.target as Node)
      ) {
        setAccountOpen(false);
      }
    };

    document.addEventListener("mousedown", closeAccountMenu);
    return () => document.removeEventListener("mousedown", closeAccountMenu);
  }, []);

  const handleLogout = async () => {
    const result = await handleRequest(authService.logout());

    if (result.success) {
      setUser(null);
      setAccountOpen(false);
      setOpen(false);
    }
  };

  const profileImage = user?.profile_pic
    ? user.profile_pic.startsWith("http")
      ? user.profile_pic
      : `${ENV.API_BASE_URL?.replace(/\/api\/v1\/?$/, "")}${user.profile_pic}`
    : null;
  return (
    <>
      {!isSessionLoading ? (
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
              {/* <button
            onClick={toggleTheme}
            className="rounded-full p-2.5 text-slate-600 hover:bg-slate-200/70 dark:text-slate-300"
            aria-label="Toggle color theme"
          >
            {mounted &&
              (theme === "dark" ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              ))}
          </button> */}
              {user?.id && (
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
              )}
              {user ? (
                <div ref={accountRef} className="relative hidden lg:block">
                  <button
                    type="button"
                    onClick={() => setAccountOpen((current) => !current)}
                    className="flex items-center gap-2 rounded-full p-1.5 text-sm font-bold text-slate-700 hover:bg-slate-200/70 dark:text-slate-200"
                    aria-expanded={accountOpen}
                    aria-haspopup="menu"
                    aria-label="Open account menu"
                  >
                    {profileImage ? (
                      <Image
                        src={profileImage}
                        alt=""
                        width={36}
                        height={36}
                        unoptimized
                        className="h-9 w-9 rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-700 text-sm font-black text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                    <ChevronDownIcon className="h-4 w-4" />
                  </button>
                  {accountOpen && (
                    <div
                      className="absolute right-0 top-14 z-50 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900"
                      role="menu"
                    >
                      <div className="border-b border-slate-100 px-3 py-2 dark:border-slate-800">
                        <p className="truncate font-bold">{user.name}</p>
                        <p className="truncate text-xs text-slate-500">
                          {user.email}
                        </p>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setAccountOpen(false)}
                        className="block rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                        role="menuitem"
                      >
                        Profile details
                      </Link>
                      <Link
                        href="/orders"
                        onClick={() => setAccountOpen(false)}
                        className="block rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                        role="menuitem"
                      >
                        Orders
                      </Link>
                      <Link
                        href="/order"
                        onClick={() => setAccountOpen(false)}
                        className="block rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
                        role="menuitem"
                      >
                        Pending order
                      </Link>
                      <button
                        type="button"
                        onClick={() => void handleLogout()}
                        className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        role="menuitem"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="hidden rounded-full bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-teal-700 lg:block dark:bg-white dark:text-slate-950"
                >
                  Sign in
                </Link>
              )}
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
                {user ? (
                  <>
                    <Link
                      href="/profile"
                      onClick={() => setOpen(false)}
                      className="font-semibold"
                    >
                      Profile details
                    </Link>
                    <Link
                      href="/orders"
                      onClick={() => setOpen(false)}
                      className="font-semibold"
                    >
                      Orders
                    </Link>
                    <Link
                      href="/order"
                      onClick={() => setOpen(false)}
                      className="font-semibold"
                    >
                      Pending order
                    </Link>
                    <button
                      type="button"
                      onClick={() => void handleLogout()}
                      className="text-left font-semibold text-rose-600"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="font-semibold"
                  >
                    Sign in
                  </Link>
                )}
              </div>
            </nav>
          )}
        </header>
      ) : (
        <></>
      )}
    </>
  );
}
