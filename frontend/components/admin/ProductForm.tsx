"use client";

import { FormEvent, useState } from "react";
import { Product } from "@/types";
import MultiTextInput from "./MultiTextInput";
import { useApi } from "@/hooks/useApi";
import { product_service } from "@/helper/services/product.service";

const emptyProduct = {
  name: "",
  category: "Home",
  price: 0,
  stock: 0,
  description: "",
  image: "",
  specs: [],
  rating: 0,
  reviews: 0,
  badge: "New",
};

export default function ProductForm({ product }: { product?: Product }) {
  const [saved, setSaved] = useState(false);
  const [specs, setSpecs] = useState<string[]>([]);
  const { handleRequest } = useApi();

  const [form, setForm] = useState(
    product
      ? {
          name: product.name,
          category: product.category,
          price: product.price,
          stock: product.stock,
          description: product.description,
          image: product.image ?? "",
          specs: specs,
          badge: product.badge ?? "",
        }
      : emptyProduct,
  );

  const update = (key: keyof typeof emptyProduct, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = await handleRequest(product_service.save_product, form);

    if (result.success && result.data) {
      console.log(form, specs);
      setSaved(true);
      setForm({
        name: "",
        category: "",
        price: 0,
        stock: 0,
        description: "",
        image: "",
        specs: [],
        badge: "",
      });
    }
  };

  return (
    <form onSubmit={submit} className="mt-8 max-w-4xl space-y-8">
      <div className="grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2 md:p-7">
        <label className="grid gap-2 text-sm font-bold md:col-span-2">
          Product name
          <input
            required
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className="admin-input"
            placeholder="e.g. Linen Weekender"
          />
        </label>

        <label className="grid gap-2 text-sm font-bold">
          Category
          <select
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
            className="admin-input"
          >
            <option>Home</option>
            <option>Apparel</option>
            <option>Travel</option>
            <option>Objects</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Badge
          <input
            value={form.badge}
            onChange={(e) => update("badge", e.target.value)}
            className="admin-input"
            placeholder="Bestseller"
          />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Price
          <input
            required
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => update("price", e.target.value)}
            className="admin-input"
            placeholder="0.00"
          />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Stock
          <input
            required
            type="number"
            min="0"
            value={form.stock}
            onChange={(e) => update("stock", e.target.value)}
            className="admin-input"
            placeholder="0"
          />
        </label>
        <label className="grid gap-2 text-sm font-bold md:col-span-2">
          Specs
          <MultiTextInput
            value={specs}
            onChange={setSpecs}
            placeholder="Add product specification..."
          />
        </label>
        <label className="grid gap-2 text-sm font-bold md:col-span-2">
          Image URL
          <input
            value={form.image}
            onChange={(e) => update("image", e.target.value)}
            className="admin-input"
            placeholder="https://..."
          />
        </label>
        <label className="grid gap-2 text-sm font-bold md:col-span-2">
          Description
          <textarea
            required
            rows={5}
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            className="admin-input resize-y"
            placeholder="Describe the product for shoppers..."
          />
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          className="rounded-xl bg-[#102d2a] px-5 py-3 text-sm font-black text-white hover:bg-[#1b4a44]"
        >
          {product ? "Save changes" : "Create product"}
        </button>
        {saved && (
          <p className="text-sm font-bold text-emerald-700">
            Saved locally for this preview. Backend product actions are coming
            later.
          </p>
        )}
      </div>
    </form>
  );
}
