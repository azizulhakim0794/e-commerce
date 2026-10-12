"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowUpTrayIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { Product } from "@/types";
import MultiTextInput from "./MultiTextInput";
import { useApi } from "@/hooks/useApi";
import { product_service } from "@/helper/services/product.service";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";

const emptyProduct = {
  name: "",
  category: "Home",
  price: 0,
  stock: 0,
  description: "",
  photo_url: "",
  specs: [],
  rating: 0,
  reviews: 0,
  badge: "New",
};

export default function ProductForm({ product }: { product?: Product }) {
  const [specs, setSpecs] = useState<string[]>(product ? product.specs : []);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const photoPreviewUrl = useRef<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState("");
  const [savedProductId, setSavedProductId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
          photo_url: product.photo_url ?? "",
          specs: product.specs ?? [],
          badge: product.badge ?? "",
          rating: product.rating ?? 0,
          reviews: product.reviews ?? 0,
        }
      : emptyProduct,
  );

  const update = (key: keyof typeof emptyProduct, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  const updatephotoPreview = (file: File | null) => {
    if (photoPreviewUrl.current) {
      URL.revokeObjectURL(photoPreviewUrl.current);
      photoPreviewUrl.current = null;
    }

    if (file) {
      photoPreviewUrl.current = URL.createObjectURL(file);
    }

    setPhotoPreview(photoPreviewUrl.current);
  };

  useEffect(
    () => () => {
      if (photoPreviewUrl.current) {
        URL.revokeObjectURL(photoPreviewUrl.current);
      }
    },
    [],
  );

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setImageUploadError("");

    const data = {
      badge: form.badge,
      category: form.category,
      description: form.description,
      photo_url: form.photo_url,
      name: form.name,
      price: form.price,
      specs: specs,
      stock: form.stock,
      rating: form.rating,
      reviews: form.reviews,
    };

    try {
      const existingId = product?.id ?? savedProductId;
      const result = existingId
        ? await handleRequest(product_service.update_product, {
            ...data,
            id: existingId,
          })
        : await handleRequest(product_service.create_product, data);

      if (!result.success || !result.data) {
        setImageUploadError("Could not save the product. Please try again.");
        return;
      }

      const savedProduct = result.data as Product;
      if (!product) {
        setSavedProductId(savedProduct.id);
      }

      if (photo) {
        setIsUploadingImage(true);
        await product_service.upload_product_image(savedProduct.id, photo);
      }

      setForm({
        name: "",
        category: "",
        price: 0,
        stock: 0,
        description: "",
        photo_url: "",
        specs: [],
        badge: "",
        rating: 0,
        reviews: 0,
      });
      setSpecs([]);
      setPhoto(null);
      updatephotoPreview(null);
      router.push("/admin/products");
    } catch (error) {
      setImageUploadError(
        axios.isAxiosError<{ detail?: string }>(error)
          ? (error.response?.data.detail ?? error.message)
          : error instanceof Error
            ? error.message
            : "Image upload failed.",
      );
    } finally {
      setIsUploadingImage(false);
      setIsSubmitting(false);
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
        <section
          aria-labelledby="product-image-heading"
          className="grid gap-4 md:col-span-2"
        >
          <div>
            <h2
              id="product-image-heading"
              className="text-sm font-bold text-slate-900"
            >
              Product image
            </h2>
            <p className="mt-1 text-sm font-normal text-slate-500">
              Add a clear image to help customers recognize this product.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
            <label className="group relative flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/70 px-6 py-8 text-center transition hover:border-[#1b4a44] hover:bg-emerald-50/40 focus-within:border-[#1b4a44] focus-within:ring-4 focus-within:ring-emerald-900/10">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  setPhoto(file);
                  updatephotoPreview(file);
                  setImageUploadError("");
                }}
                disabled={isSubmitting}
                className="absolute inset-0 cursor-pointer opacity-0"
                aria-label="Choose a product image"
              />
              <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-[#1b4a44] shadow-sm ring-1 ring-slate-200 transition group-hover:scale-105">
                <ArrowUpTrayIcon className="h-6 w-6" aria-hidden="true" />
              </span>
              <span className="text-sm font-bold text-slate-800">
                {photo ? "Choose a different image" : "Choose an image"}
              </span>
              <span className="mt-1 text-sm text-slate-500">
                Select a file from your device
              </span>
              <span className="mt-3 text-xs font-medium text-slate-400">
                JPEG, PNG, or WebP
              </span>
            </label>

            <div className="flex min-h-52 flex-col rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="relative flex min-h-32 flex-1 items-center justify-center overflow-hidden rounded-xl bg-[#f3f6f4]">
                {photoPreview || form.photo_url ? (
                  <Image
                    src={photoPreview ?? form.photo_url}
                    alt={
                      photo
                        ? `Selected image: ${photo.name}`
                        : "Current product image"
                    }
                    fill
                    unoptimized
                    sizes="220px"
                    className="object-contain p-2"
                  />
                ) : (
                  <PhotoIcon
                    className="h-10 w-10 text-slate-300"
                    aria-hidden="true"
                  />
                )}
              </div>
              <div className="mt-3 min-w-0">
                <p className="truncate text-xs font-bold text-slate-700">
                  {photo
                    ? photo.name
                    : form.photo_url
                      ? "Current product image"
                      : "Image preview"}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  {photo
                    ? `${(photo.size / (1024 * 1024)).toFixed(2)} MB`
                    : form.photo_url
                      ? "Ready to use"
                      : "Preview will appear here"}
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {imageUploadError && (
              <p role="alert" className="text-sm font-medium text-red-600">
                {imageUploadError}
              </p>
            )}
          </div>
        </section>
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
          disabled={isSubmitting}
          className="rounded-xl bg-[#102d2a] px-5 py-3 text-sm font-black text-white hover:bg-[#1b4a44]"
        >
          {isUploadingImage
            ? "Uploading image..."
            : isSubmitting
              ? "Saving..."
              : product
                ? "Update product"
                : "Create product"}
        </button>
      </div>
    </form>
  );
}
