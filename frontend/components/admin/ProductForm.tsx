"use client";

import { FormEvent, useState } from "react";
import { Product } from "@/types";
import MultiTextInput from "./MultiTextInput";
import { useApi } from "@/hooks/useApi";
import { product_service } from "@/helper/services/product.service";
import { useRouter } from "next/navigation";

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
  const [specs, setSpecs] = useState<string[]>(product ? product.specs : []);
  const router = useRouter();
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
          specs: product.specs ?? [],
          badge: product.badge ?? "",
          rating: product.rating ?? 0,
          reviews: product.reviews ?? 0,
        }
      : emptyProduct,
  );

  const update = (key: keyof typeof emptyProduct, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const data = {
      badge: form.badge,
      category: form.category,
      description: form.description,
      image: form.image,
      name: form.name,
      price: form.price,
      specs: specs,
      stock: form.stock,
      rating: form.rating,
      reviews: form.reviews,
    };
    // const result_save = await handleRequest(product_service.save_product, data);

    let result;

    if (product) {
      result = await handleRequest(product_service.update_product, {
        ...data,
        id: product ? product.id : "",
      });
    } else {
      result = await handleRequest(product_service.save_product, data);
    }
    if (result.success && result.data) {
      console.log(form, specs);
      // setSaved(true);
      setForm({
        name: "",
        category: "",
        price: 0,
        stock: 0,
        description: "",
        image: "",
        specs: [],
        badge: "",
        rating: 0,
        reviews: 0,
      });
      setSpecs([]);
      router.push("/admin/products");
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
            <option>Electronics</option>
            <option>Accessories</option>
            <option>Clothing</option>
            <option>Shoes</option>
            <option>Beauty</option>
            <option>Sports</option>
            <option>Home & Living</option>
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
          {product ? "Update product" : "Create product"}
        </button>
      </div>
    </form>
  );
}
