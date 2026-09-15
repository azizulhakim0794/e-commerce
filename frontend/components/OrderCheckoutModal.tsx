"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckIcon, MapPinIcon, XMarkIcon } from "@heroicons/react/24/outline";

import { addressService } from "@/helper/services/address.service";
import { orderService } from "@/helper/services/order.service";
import { useApi } from "@/hooks/useApi";
import { useStore } from "@/store/StoreProvider";
import type { CartItem } from "@/types";
import type { Address } from "@/types/address";

type OrderCheckoutModalProps = {
  isOpen: boolean;
  items: CartItem[];
  onClose: () => void;
  orderMode?: "cart" | "buy-now";
};

export default function OrderCheckoutModal({
  isOpen,
  items,
  onClose,
  orderMode = "cart",
}: OrderCheckoutModalProps) {
  const router = useRouter();
  const { user } = useStore();
  const { handleRequest, isLoading } = useApi();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);

  const loadAddresses = async () => {
    setIsLoadingAddresses(true);

    const result = await handleRequest(addressService.getAddresses);

    if (result.success && Array.isArray(result.data)) {
      const loadedAddresses = result.data;
      setAddresses(loadedAddresses);
      setSelectedAddressId((current) => {
        if (
          current &&
          loadedAddresses.some((address) => address.id === current)
        ) {
          return current;
        }

        return loadedAddresses[0]?.id ?? null;
      });
    } else {
      setAddresses([]);
      setSelectedAddressId(null);
    }

    setIsLoadingAddresses(false);
  };

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !user) {
      setAddresses([]);
      setSelectedAddressId(null);
      return;
    }

    void loadAddresses();
  }, [isOpen, user]);

  const subtotal = useMemo(
    () =>
      items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [items],
  );

  const shipping = subtotal >= 75 || subtotal === 0 ? 0 : 8;
  const selectedAddress =
    addresses.find((address) => address.id === selectedAddressId) ?? null;

  const handleConfirm = async () => {
    if (!selectedAddress) return;

    const isBuyNow = orderMode === "buy-now";

    let result;

    if (isBuyNow) {
      if (!items[0]) return;

      result = await handleRequest(orderService.createOrderBuyNow, {
        product_id: items[0].product.id,
        quantity: items[0].quantity,
        address_id: selectedAddress.id,
      });
    } else {
      result = await handleRequest(orderService.createOrderFromCart, {
        address_id: selectedAddress.id,
      });
    }

    if (!result.success || !result.data) {
      return;
    }

    sessionStorage.setItem(
      "northstar-pending-order",
      JSON.stringify(result.data),
    );
    onClose();
    router.push("/order");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[28px] bg-white p-5 shadow-2xl dark:bg-slate-900 sm:p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-white"
          aria-label="Close checkout dialog"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>

        <div className="pr-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">
            Checkout
          </p>
          <h2 className="mt-2 text-3xl font-black">Choose delivery address</h2>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            {!user ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center dark:border-slate-700 dark:bg-slate-800/60">
                <p className="text-lg font-bold">Sign in to continue</p>
                <p className="mt-2 text-sm text-slate-500">
                  You&apos;ll need an account before choosing a delivery
                  address.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    router.push("/login");
                  }}
                  className="mt-5 rounded-full bg-slate-950 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-700 dark:bg-white dark:text-slate-950"
                >
                  Go to sign in
                </button>
              </div>
            ) : isLoadingAddresses ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
                Loading saved addresses...
              </div>
            ) : addresses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center dark:border-slate-700 dark:bg-slate-800/60">
                <p className="text-lg font-bold">No saved addresses yet</p>
                <p className="mt-2 text-sm text-slate-500">
                  Add an address in your account so you can place the order.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    router.push("/profile");
                  }}
                  className="mt-5 rounded-full bg-teal-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-800"
                >
                  Add address
                </button>
              </div>
            ) : (
              addresses.map((address) => {
                const isSelected = address.id === selectedAddressId;

                return (
                  <button
                    key={address.id}
                    type="button"
                    onClick={() => setSelectedAddressId(address.id)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      isSelected
                        ? "border-teal-600 bg-teal-50 shadow-sm dark:border-teal-400 dark:bg-teal-950/40"
                        : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border ${isSelected ? "border-teal-600 bg-teal-600 dark:border-teal-400 dark:bg-teal-400" : "border-slate-300 dark:border-slate-600"}`}
                        >
                          {isSelected ? (
                            <CheckIcon className="h-3 w-3 text-white" />
                          ) : null}
                        </div>

                        <div>
                          <p className="font-black">{address.full_name}</p>
                          <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
                            {address.address_type}
                          </p>
                        </div>
                      </div>

                      <MapPinIcon className="h-5 w-5 text-teal-600" />
                    </div>

                    <div className="mt-4 space-y-1 text-sm text-slate-600 dark:text-slate-300">
                      <p>{address.address_line_1}</p>
                      {address.address_line_2 ? (
                        <p>{address.address_line_2}</p>
                      ) : null}
                      <p>
                        {address.city}, {address.state_or_division}{" "}
                        {address.postal_code}
                      </p>
                      <p>{address.country}</p>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {address.phone_number}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <aside className="h-fit rounded-2xl bg-slate-100 p-5 dark:bg-slate-800">
            <h3 className="text-lg font-black">Order summary</h3>

            <div className="mt-5 space-y-3">
              {items.map((item) => (
                <div
                  key={`${item.id}-${item.product.id}`}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="text-slate-600 dark:text-slate-300">
                    {item.product.name} × {item.quantity}
                  </span>
                  <span className="font-bold">
                    ${item.product.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-3 border-t border-slate-200 pt-4 text-sm dark:border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-bold">${subtotal}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Shipping</span>
                <span className="font-bold">
                  {shipping ? `$${shipping}` : "Free"}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-4 text-base dark:border-slate-700">
                <span className="font-black">Total</span>
                <span className="font-black">${subtotal + shipping}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleConfirm}
              disabled={!selectedAddress || isLoading}
              className="mt-6 w-full rounded-full bg-slate-950 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300 dark:bg-white dark:text-slate-950 dark:hover:bg-teal-700 dark:hover:text-white disabled:dark:bg-slate-700"
            >
              {isLoading ? "Confirming..." : "Confirm order"}
            </button>
          </aside>
        </div>
      </div>
    </div>
  );
}
