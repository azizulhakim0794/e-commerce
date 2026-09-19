"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRightIcon,
  CubeIcon,
  CurrencyDollarIcon,
  ShoppingCartIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import AdminPageHeader from "../../components/admin/AdminPageHeader";
import api from "../../helper/api";

const cards = [
  {
    label: "Gross sales",
    value: "$24,680",
    change: "+12.8%",
    icon: CurrencyDollarIcon,
  },
  { label: "Orders", value: "186", change: "+8.4%", icon: ShoppingCartIcon },
  { label: "Customers", value: "2,431", change: "+5.2%", icon: UserGroupIcon },
  { label: "Products", value: "84", change: "+3 new", icon: CubeIcon },
];

export default function AdminDashboard() {
  const [status, setStatus] = useState("Checking protected API...");

  useEffect(() => {
    void api
      .get("/admin/overview")
      .then(() => setStatus("Protected admin API connected"))
      .catch(() => setStatus("Admin API unavailable"));
  }, []);

  return (
    <div className="mx-auto max-w-[1400px]">
      <AdminPageHeader
        eyebrow="Monday, September 19"
        title="Good morning, admin."
        description="A calm view of what needs attention across Northstar today."
        action={
          <span className="rounded-full bg-emerald-100 px-3 py-2 text-xs font-black text-emerald-800">
            {status}
          </span>
        }
      />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, change, icon: Icon }) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f0ec] text-[#1b665d]">
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-xs font-black text-emerald-700">
                {change}
              </span>
            </div>
            <p className="mt-7 text-sm font-bold text-slate-500">{label}</p>
            <p className="mt-1 text-3xl font-black text-[#102d2a]">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-[#102d2a]">
                Sales overview
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Revenue performance over the last 7 days
              </p>
            </div>
            <span className="text-sm font-bold text-slate-400">This week</span>
          </div>
          <div className="mt-10 flex h-52 items-end gap-3 border-b border-slate-100 px-2">
            {[38, 55, 44, 68, 58, 78, 92].map((height, index) => (
              <div
                key={index}
                className="group flex flex-1 flex-col items-center gap-2"
              >
                <div
                  style={{ height: `${height}%` }}
                  className="w-full max-w-12 rounded-t-lg bg-[#8bb8a8] transition group-hover:bg-[#e8b46a]"
                />
                <span className="text-xs font-bold text-slate-400">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index]}
                </span>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-[#102d2a] p-5 text-white shadow-sm md:p-7">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#e8b46a]">
            Needs attention
          </p>
          <h2 className="mt-3 text-2xl font-black">Keep the details moving.</h2>
          <div className="mt-8 grid gap-3">
            <Link
              href="/admin/products/new"
              className="flex items-center justify-between rounded-xl bg-white/10 p-4 text-sm font-bold hover:bg-white/15"
            >
              <span>3 products need images</span>
              <ArrowUpRightIcon className="h-5 w-5" />
            </Link>
            <Link
              href="/admin/orders"
              className="flex items-center justify-between rounded-xl bg-white/10 p-4 text-sm font-bold hover:bg-white/15"
            >
              <span>12 orders ready to ship</span>
              <ArrowUpRightIcon className="h-5 w-5" />
            </Link>
            <Link
              href="/admin/users"
              className="flex items-center justify-between rounded-xl bg-white/10 p-4 text-sm font-bold hover:bg-white/15"
            >
              <span>8 new customers today</span>
              <ArrowUpRightIcon className="h-5 w-5" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
