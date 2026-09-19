"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArchiveBoxIcon,
  ArrowLeftIcon,
  Bars3Icon,
  ChartBarIcon,
  Cog6ToothIcon,
  FolderIcon,
  PlusIcon,
  RectangleStackIcon,
  UserGroupIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useStore } from "../../store/StoreProvider";

const navigation = [
  { href: "/admin", label: "Dashboard", icon: ChartBarIcon },
  { href: "/admin/products/new", label: "Add product", icon: PlusIcon },
  { href: "/admin/products", label: "Product list", icon: ArchiveBoxIcon },
  { href: "/admin/orders", label: "Orders", icon: RectangleStackIcon },
  { href: "/admin/users", label: "Users", icon: UserGroupIcon },
  { href: "/admin/categories", label: "Categories", icon: FolderIcon },
  { href: "/admin/settings", label: "Settings", icon: Cog6ToothIcon },
];

export default function AdminShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isSessionLoading } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isSessionLoading && (!user || !user.is_admin)) {
      router.replace(user ? "/" : "/login");
    }
  }, [isSessionLoading, router, user]);

  if (isSessionLoading || !user?.is_admin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#eef3f0] text-sm font-bold text-slate-500">
        Verifying admin access...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eef3f0] text-slate-900">
      {sidebarOpen && (
        <button
          className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-[#102d2a] px-5 py-6 text-white transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-2">
          <Link href="/admin" className="text-xl font-black tracking-tight">
            northstar<span className="text-[#e8b46a]">/admin</span>
          </Link>
          <button
            className="rounded-lg p-2 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-12 px-2 text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-200/60">
          Workspace
        </p>
        <nav className="mt-4 grid gap-1" aria-label="Admin navigation">
          {navigation.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/admin" ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition ${active ? "bg-[#e8b46a] text-[#102d2a]" : "text-emerald-50/75 hover:bg-white/10 hover:text-white"}`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto border-t border-white/10 pt-5">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-emerald-50/75 hover:bg-white/10 hover:text-white"
          >
            <ArrowLeftIcon className="h-5 w-5" /> Back to storefront
          </Link>
        </div>
      </aside>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-slate-200 bg-[#eef3f0]/90 px-5 backdrop-blur lg:px-10">
          <button
            className="rounded-lg p-2 lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <div className="hidden lg:block">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              Operations console
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-600">
              Keep the shop moving.
            </p>
          </div>
          <div className="flex items-center gap-3 text-right">
            <div>
              <p className="text-sm font-black">{user.username}</p>
              <p className="text-xs text-slate-500">Administrator</p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#102d2a] font-black text-[#e8b46a]">
              {user.username.charAt(0).toUpperCase()}
            </span>
          </div>
        </header>
        <main className="px-5 py-8 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
