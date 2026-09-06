import Link from "next/link";
import Image from "next/image";
import { ArrowRightIcon, SparklesIcon } from "@heroicons/react/24/outline";
import ProductCard from "../components/ProductCard";
import { categories, products } from "../lib/products";

export default function Home() {
  return (
    <div>
      <section className="mx-auto grid max-w-7xl gap-8 px-5 pb-16 pt-10 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:px-8 lg:pb-24 lg:pt-16">
        <div className="max-w-xl">
          <div className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-teal-700 dark:text-teal-400">
            <SparklesIcon className="h-4 w-4" />
            Spring / summer 2026
          </div>
          <h1 className="text-5xl font-black leading-[.96] tracking-[-.045em] text-slate-950 sm:text-6xl lg:text-7xl dark:text-white">
            Objects with a{" "}
            <span className="text-teal-700 dark:text-teal-400">
              point of view.
            </span>
          </h1>
          <p className="mt-7 max-w-md text-base leading-7 text-slate-600 dark:text-slate-300">
            A considered collection of everyday essentials, chosen for how they
            feel, function, and stay with you.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href="/products"
              className="inline-flex items-center gap-3 rounded-full bg-slate-950 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-teal-700 dark:bg-white dark:text-slate-950"
            >
              Shop the collection <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Link
              href="#featured"
              className="text-sm font-bold text-slate-700 underline decoration-slate-300 underline-offset-8 hover:text-teal-700 dark:text-slate-200"
            >
              See what&apos;s new
            </Link>
          </div>
          <div className="mt-12 flex gap-8 border-t border-slate-200 pt-5 text-xs font-bold uppercase tracking-widest text-slate-400 dark:border-slate-800">
            <span>
              Free shipping
              <br />
              <b className="text-slate-700 dark:text-slate-200">over $75</b>
            </span>
            <span>
              Easy returns
              <br />
              <b className="text-slate-700 dark:text-slate-200">30 days</b>
            </span>
          </div>
        </div>
        <div className="relative min-h-[430px] overflow-hidden rounded-[2rem] bg-teal-900 sm:min-h-[560px]">
          <Image
            src="https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=1200&q=90"
            alt="Curated clothing hanging in a bright studio"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between text-white">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-teal-200">
                The edit / 01
              </p>
              <p className="mt-2 text-xl font-bold">Quiet utility</p>
            </div>
            <Link
              href="/products?category=Clothing"
              className="rounded-full bg-white/15 p-3 backdrop-blur-sm hover:bg-white/30"
              aria-label="Shop clothing"
            >
              <ArrowRightIcon className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
      <section className="border-y border-slate-200 bg-white py-10 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-400">
                Browse by mood
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-white">
                Find your next favorite.
              </h2>
            </div>
            <Link
              href="/products"
              className="hidden text-sm font-bold text-slate-500 hover:text-teal-700 sm:block"
            >
              View all <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={`/products?category=${encodeURIComponent(category.name)}`}
                className={`flex min-h-28 flex-col justify-between rounded-2xl p-4 transition hover:-translate-y-1 hover:shadow-md ${category.color}`}
              >
                <span className="text-2xl">{category.icon}</span>
                <span className="text-sm font-bold">{category.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section
        id="featured"
        className="mx-auto max-w-7xl px-5 py-16 lg:px-8 lg:py-24"
      >
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600">
              The good stuff
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white">
              A few things we love.
            </h2>
          </div>
          <Link
            href="/products"
            className="text-sm font-bold text-slate-500 hover:text-teal-700"
          >
            Shop all <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
          {products.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
