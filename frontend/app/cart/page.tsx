"use client";
import Link from "next/link";
import Image from "next/image";
import { MinusIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useStore } from "../../store/StoreProvider";
import { useEffect, useState } from "react";
import { useApi } from "@/hooks/useApi";
import { product_service } from "@/helper/services/product.service";
import { CartItem } from "@/types";

type CartResponse = {
  id: string;
  user_id: string;
  items: CartItem[];
};

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart } = useStore();
  const [cartProducts, setCartProducts] = useState<CartResponse[] | null>(null);
  const { handleRequest } = useApi();
  const cartItems = cartProducts?.[0]?.items ?? [];
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );
  const shipping = subtotal >= 75 || subtotal === 0 ? 0 : 8;

  const loadProduct = async () => {
    const result = await handleRequest(product_service.get_cart_product);

    if (result.success && Array.isArray(result.data)) {
      setCartProducts(result.data);
    }
  };
  useEffect(() => {
    loadProduct();
  }, []);

  const hanldeRemoveProductFromCart = async (cart_id: string) => {
    const result = await handleRequest(
      product_service.remove_cart_product,
      cart_id,
    );

    if (result.success) {
      loadProduct();
    }
  };

  const handleCartUpdate = async (cart_id: string, quantity: number) => {
    const result = await handleRequest(
      product_service.update_cart_products_quantity,
      { quantity, cart_id },
    );
    if (result.success) {
      loadProduct();
    }
  };

  const handleUpdateCartsProduct = async (
    cart_id: string,
    quantity: number,
    action_type: "add" | "remove",
  ) => {
    if (action_type == "add") {
      handleCartUpdate(cart_id, quantity);
    } else {
      handleCartUpdate(cart_id, quantity);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8 lg:py-16">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">
        Your bag
      </p>
      <h1 className="mt-2 text-4xl font-black tracking-tight">
        Ready when you are.
      </h1>
      {cartItems.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-xl font-bold">Your cart is empty.</p>
          <p className="mt-2 text-sm text-slate-500">
            There&apos;s plenty worth discovering.
          </p>
          <Link
            href="/products"
            className="mt-7 inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-bold text-white hover:bg-teal-700"
          >
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_360px]">
          <div className="divide-y divide-slate-200 dark:divide-slate-800">
            {cartItems.map((item) => (
              <div key={item.id} className="flex gap-4 py-6 first:pt-0">
                <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                  {item.product.image ? (
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-200 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                      No image
                    </div>
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div className="flex justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-teal-700">
                        {item.product.category}
                      </p>
                      <h2 className="mt-1 truncate font-bold">
                        {item.product.name}
                      </h2>
                    </div>
                    <p className="font-bold">
                      ${item.product.price * item.quantity}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center rounded-full border border-slate-300 dark:border-slate-700">
                      <button
                        onClick={() =>
                          handleUpdateCartsProduct(
                            item.id,
                            item.quantity - 1,
                            "remove",
                          )
                        }
                        className="p-2"
                        aria-label="Decrease quantity"
                      >
                        <MinusIcon className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-7 text-center text-xs font-bold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleUpdateCartsProduct(
                            item.id,
                            item.quantity + 1,
                            "add",
                          )
                        }
                        className="p-2"
                        aria-label="Increase quantity"
                      >
                        <PlusIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <button
                      onClick={() => hanldeRemoveProductFromCart(item.id)}
                      className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-rose-600"
                    >
                      <TrashIcon className="h-4 w-4" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <aside className="h-fit rounded-2xl bg-slate-100 p-6 dark:bg-slate-900">
            <h2 className="text-lg font-black">Order summary</h2>
            <div className="mt-6 grid gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-bold">${subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Shipping</span>
                <span className="font-bold">
                  {shipping ? `$${shipping}` : "Free"}
                </span>
              </div>
              <div className="mt-2 flex justify-between border-t border-slate-200 pt-4 text-base dark:border-slate-700">
                <span className="font-bold">Total</span>
                <span className="font-black">${subtotal + shipping}</span>
              </div>
            </div>
            <Link
              href="/checkout"
              className="mt-7 block rounded-full bg-slate-950 px-5 py-3.5 text-center text-sm font-bold text-white hover:bg-teal-700 dark:bg-white dark:text-slate-950"
            >
              Proceed to checkout
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
