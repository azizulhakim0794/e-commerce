import Link from "next/link";
export default function Footer() {
  return (
    <footer className="mt-24 border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8">
        <div>
          <Link href="/" className="text-lg font-bold tracking-tight">
            northstar<span className="text-teal-600">.</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-6 text-slate-500 dark:text-slate-400">
            A considered collection of things made for living well, working
            lightly, and going further.
          </p>
        </div>
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Explore
          </h2>
          <div className="mt-4 grid gap-3 text-sm text-slate-600 dark:text-slate-300">
            <Link href="/products">All products</Link>
            <Link href="/products?category=New">New arrivals</Link>
            <Link href="/products?category=Sports">Outdoor</Link>
          </div>
        </div>
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Support
          </h2>
          <div className="mt-4 grid gap-3 text-sm text-slate-600 dark:text-slate-300">
            <a href="mailto:hello@northstar.example">Contact us</a>
            <Link href="/orders">Order status</Link>
            <Link href="/profile">My account</Link>
          </div>
        </div>
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Stay curious
          </h2>
          <p className="mt-4 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Notes on products, places, and the good stuff in between.
          </p>
          <div className="mt-4 flex gap-4 text-sm font-bold text-teal-700">
            <a href="#">Instagram</a>
            <a href="#">X</a>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl border-t border-slate-200 px-5 py-6 text-xs text-slate-400 dark:border-slate-800 lg:px-8">
        © 2026 Northstar Supply Co. All rights reserved.
      </div>
    </footer>
  );
}
