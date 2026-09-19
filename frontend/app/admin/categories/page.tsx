"use client";

import { useState } from "react";
import AdminPageHeader from "../../../components/admin/AdminPageHeader";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([
    "Home",
    "Apparel",
    "Travel",
    "Objects",
  ]);
  const [newCategory, setNewCategory] = useState("");
  return (
    <div className="mx-auto max-w-[1000px]">
      <AdminPageHeader
        eyebrow="Catalog"
        title="Categories"
        description="Keep the catalog easy to browse and consistent."
      />
      <div className="mt-8 grid gap-6 md:grid-cols-[1fr_300px]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-black text-[#102d2a]">Active categories</h2>
          <div className="mt-5 grid gap-2">
            {categories.map((category, index) => (
              <div
                key={category}
                className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
              >
                <span className="font-bold">{category}</span>
                <button
                  onClick={() =>
                    setCategories((current) =>
                      current.filter((_, itemIndex) => itemIndex !== index),
                    )
                  }
                  className="text-xs font-black text-rose-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-black text-[#102d2a]">Add category</h2>
          <form
            className="mt-5 grid gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              if (newCategory.trim()) {
                setCategories((current) => [...current, newCategory.trim()]);
                setNewCategory("");
              }
            }}
          >
            <label className="sr-only" htmlFor="category">
              Category name
            </label>
            <input
              id="category"
              value={newCategory}
              onChange={(event) => setNewCategory(event.target.value)}
              className="admin-input"
              placeholder="Category name"
            />
            <button className="rounded-xl bg-[#102d2a] px-4 py-3 text-sm font-black text-white">
              Add category
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
