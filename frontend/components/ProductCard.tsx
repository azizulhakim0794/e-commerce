"use client";
import Link from "next/link";
import Image from "next/image";
import { CheckIcon, StarIcon } from "@heroicons/react/24/solid";
import { Product } from "@/types/product";
import { useStore } from "../store/StoreProvider";
import { product_service } from "@/helper/services/product.service";
import { useApi } from "@/hooks/useApi";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useStore();
  const { handleRequest } = useApi();

  const handleCartUpdate = async (product_id: string) => {
    const result = await handleRequest(product_service.save_product_into_cart, {
      quantity: 1,
      product_id,
    });
    if (result.success) {
      console.log(result.success);
    }
  };

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;
  return (
    <article className="group min-w-0">
      <Link
        href={`/products/${product.id}`}
        className="relative block aspect-[4/4.5] overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800"
      >
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            loading="lazy"
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-200 text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:bg-slate-700 dark:text-slate-300">
            No image
          </div>
        )}
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-800">
            {product.badge}
          </span>
        )}
        {discount > 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-orange-500 px-2.5 py-1 text-[11px] font-bold text-white">
            -{discount}%
          </span>
        )}
      </Link>

      <div className="pt-4">
        <div className="mb-1 flex items-center justify-between gap-2">
          <p className="text-xs font-bold uppercase tracking-widest text-teal-700 dark:text-teal-400">
            {product.category}
          </p>
          <span className="flex items-center gap-1 text-xs font-semibold text-slate-500">
            <StarIcon className="h-3.5 w-3.5 text-amber-400" />
            {product.rating}
          </span>
        </div>
        <Link
          href={`/products/${product.id}`}
          className="block truncate text-base font-bold text-slate-950 hover:text-teal-700 dark:text-white"
        >
          {product.name}
        </Link>
        <p className="mt-1 line-clamp-1 text-sm text-slate-500 dark:text-slate-400">
          {product.description}
        </p>
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-slate-950 dark:text-white">
              ${product.price}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-slate-400 line-through">
                ${product.originalPrice}
              </span>
            )}
          </div>
          <button
            onClick={() => handleCartUpdate(product.id)}
            className="flex items-center gap-1.5 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-teal-700 hover:bg-teal-700 hover:text-white dark:border-slate-700 dark:text-slate-200"
            aria-label={`Add ${product.name} to cart`}
          >
            <CheckIcon className="hidden h-3.5 w-3.5 sm:block" />
            Add
          </button>
        </div>
      </div>
    </article>
  );
}
