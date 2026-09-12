"use client";
import { useEffect, useMemo, useState } from "react";
import {
  FunnelIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import ProductCard from "../../components/ProductCard";
import { categories } from "../../lib/products";
import { Product } from "@/types";
import { useApi } from "@/hooks/useApi";
import { product_service } from "@/helper/services/product.service";

export default function Products() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>();
  const { handleRequest, isLoading } = useApi();
  const [category, setCategory] = useState(() =>
    typeof window === "undefined"
      ? "All"
      : (new URLSearchParams(window.location.search).get("category") ?? "All"),
  );
  useEffect(() => {}, []);

  useEffect(() => {
    const loadProduct = async () => {
      const result = await handleRequest(product_service.get_products);

      if (result.success && result.data) {
        setProducts(result.data);
      }
    };

    loadProduct();
  }, []);
  const [sort, setSort] = useState("default");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filtered = useMemo(() => {
    const result = (products ?? []).filter(
      (product) =>
        (category === "All" || product.category === category) &&
        `${product.name} ${product.description} ${product.category}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    );

    return [...result].sort((a, b) =>
      sort === "low"
        ? a.price - b.price
        : sort === "high"
          ? b.price - a.price
          : sort === "rating"
            ? b.rating - a.rating
            : 0,
    );
  }, [category, products, query, sort]);
  return (
    <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-16">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-400">
            The catalog
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950 dark:text-white">
            Good things, gathered.
          </h1>
          <p className="mt-3 text-slate-500 dark:text-slate-400">
            {filtered.length} pieces to make your everyday better.
          </p>
        </div>
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2.5 text-sm font-bold sm:hidden dark:border-slate-700"
        >
          <FunnelIcon className="h-4 w-4" /> Filters
        </button>
      </div>
      <div className="mt-10 grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className={`${filtersOpen ? "block" : "hidden"} sm:block`}>
          <div className="sticky top-28">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">
                Filter by
              </h2>
              <button
                className="sm:hidden"
                onClick={() => setFiltersOpen(false)}
                aria-label="Close filters"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-5 flex flex-wrap gap-2 sm:grid">
              <button
                onClick={() => setCategory("All")}
                className={`rounded-full px-3 py-2 text-left text-sm font-semibold sm:rounded-none sm:px-0 ${category === "All" ? "text-teal-700" : "text-slate-500"}`}
              >
                All products
              </button>
              {categories.map((item) => (
                <button
                  key={item.name}
                  onClick={() => setCategory(item.name)}
                  className={`rounded-full px-3 py-2 text-left text-sm font-semibold sm:rounded-none sm:px-0 ${category === item.name ? "text-teal-700" : "text-slate-500"}`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        </aside>
        <div>
          <div className="mb-7 flex flex-col gap-3 sm:flex-row">
            <label className="relative flex-1">
              <span className="sr-only">Search products</span>
              <MagnifyingGlassIcon className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search products, categories..."
                className="w-full rounded-full border border-slate-300 bg-white py-3 pl-12 pr-4 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-teal-900"
              />
            </label>
            <label className="flex items-center gap-3 rounded-full border border-slate-300 bg-white px-4 text-sm dark:border-slate-700 dark:bg-slate-900">
              <span className="whitespace-nowrap text-slate-400">Sort</span>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="bg-transparent py-3 font-semibold outline-none"
              >
                <option value="default">Featured</option>
                <option value="low">Price: low to high</option>
                <option value="high">Price: high to low</option>
                <option value="rating">Top rated</option>
              </select>
            </label>
          </div>
          {filtered.length ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:gap-x-6">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 py-24 text-center dark:border-slate-700">
              <p className="text-lg font-bold">No products found.</p>
              <p className="mt-2 text-sm text-slate-500">
                Try changing your search or filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
