"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import AdminPageHeader from "../../../components/admin/AdminPageHeader";
import { product_service } from "../../../helper/services/product.service";
import { Product } from "../../../types";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    void product_service
      .get_products()
      .then(setProducts)
      .catch(() => setError("Products could not be loaded right now."))
      .finally(() => setLoading(false));
  }, []);
  return (
    <div className="mx-auto max-w-[1400px]">
      <AdminPageHeader
        eyebrow="Catalog"
        title="Product list"
        description="Review inventory and keep the catalog polished."
        action={
          <Link
            href="/admin/create-product"
            className="flex items-center justify-center gap-2 rounded-xl bg-[#102d2a] px-4 py-3 text-sm font-black text-white hover:bg-[#1b4a44]"
          >
            <PlusIcon className="h-5 w-5" /> Add product
          </Link>
        }
      />
      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-sm font-bold text-slate-500">
            Loading catalog...
          </div>
        ) : error ? (
          <div className="p-12 text-center text-sm font-bold text-rose-600">
            {error}
          </div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-black text-[#102d2a]">No products yet</p>
            <p className="mt-2 text-sm text-slate-500">
              Add the first product to start building the catalog.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Price</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4">Rating</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <p className="font-black text-[#102d2a]">
                        {product.name}
                      </p>
                      <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                        {product.description}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-600">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 text-sm font-black">
                      ${product.price}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-sm font-bold ${product.stock < 10 ? "text-orange-600" : "text-emerald-700"}`}
                      >
                        {product.stock} units
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold">
                      {product.rating.toFixed(1)} / 5
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-[#102d2a]"
                          aria-label={`Edit ${product.name}`}
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() =>
                            setProducts((current) =>
                              current.filter((item) => item.id !== product.id),
                            )
                          }
                          className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                          aria-label={`Delete ${product.name}`}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
