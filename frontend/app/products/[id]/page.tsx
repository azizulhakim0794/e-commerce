"use client";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeftIcon,
  CheckIcon,
  MinusIcon,
  PlusIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { getProduct } from "../../../lib/products";
import { useStore } from "../../../store/StoreProvider";

export default function ProductDetails() {
  const params = useParams<{ id: string }>();
  const product = getProduct(Number(params.id));
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useStore();
  if (!product)
    return (
      <div className="mx-auto max-w-7xl px-5 py-32 text-center">
        <h1 className="text-3xl font-black">Product not found.</h1>
        <Link
          href="/products"
          className="mt-5 inline-block font-bold text-teal-700"
        >
          Back to products
        </Link>
      </div>
    );
  return (
    <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-16">
      <Link
        href="/products"
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-teal-700"
      >
        <ArrowLeftIcon className="h-4 w-4" /> Back to shop
      </Link>
      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-20">
        <div className="relative aspect-square overflow-hidden rounded-3xl bg-slate-100 dark:bg-slate-800">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col justify-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-400">
            {product.category}
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl dark:text-white">
            {product.name}
          </h1>
          <div className="mt-5 flex items-center gap-3">
            <span className="flex items-center gap-1 text-sm font-bold">
              <StarIcon className="h-5 w-5 fill-amber-400 text-amber-400" />{" "}
              {product.rating}
            </span>
            <span className="text-sm text-slate-500">
              {product.reviews} reviews
            </span>
            <span className="text-sm font-bold text-teal-700">In stock</span>
          </div>
          <p className="mt-7 text-lg leading-8 text-slate-600 dark:text-slate-300">
            {product.description}
          </p>
          <div className="mt-8 flex items-baseline gap-3">
            <span className="text-3xl font-black">${product.price}</span>
            {product.originalPrice && (
              <span className="text-lg text-slate-400 line-through">
                ${product.originalPrice}
              </span>
            )}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <div className="flex items-center rounded-full border border-slate-300 dark:border-slate-700">
              <button
                className="p-3"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                aria-label="Decrease quantity"
              >
                <MinusIcon className="h-4 w-4" />
              </button>
              <span className="w-8 text-center text-sm font-bold">
                {quantity}
              </span>
              <button
                className="p-3"
                onClick={() =>
                  setQuantity(Math.min(product.stock, quantity + 1))
                }
                aria-label="Increase quantity"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={() => addToCart(product, quantity)}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white hover:bg-teal-700 dark:bg-white dark:text-slate-950"
            >
              <CheckIcon className="h-5 w-5" /> Add to cart
            </button>
            <Link
              href="/checkout"
              onClick={() => addToCart(product, quantity)}
              className="w-full rounded-full border border-slate-300 px-6 py-3 text-center text-sm font-bold hover:border-teal-700 hover:text-teal-700 dark:border-slate-700"
            >
              Buy now
            </Link>
          </div>
          <div className="mt-10 border-t border-slate-200 pt-7 dark:border-slate-800">
            <h2 className="text-sm font-bold uppercase tracking-widest">
              Details
            </h2>
            <ul className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2 dark:text-slate-300">
              {product.specs.map((spec) => (
                <li key={spec} className="flex items-center gap-2">
                  <CheckIcon className="h-4 w-4 text-teal-600" />
                  {spec}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
