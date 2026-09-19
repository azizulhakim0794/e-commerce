"use client";

import { useEffect, useState } from "react";
import AdminPageHeader from "../../../../components/admin/AdminPageHeader";
import ProductForm from "../../../../components/admin/ProductForm";
import { product_service } from "../../../../helper/services/product.service";
import { Product } from "../../../../types";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const [product, setProduct] = useState<Product>();
  const [error, setError] = useState("");
  useEffect(() => { void params.then(({ id }) => product_service.get_product(id).then(setProduct).catch(() => setError("This product could not be loaded."))); }, [params]);
  if (error) return <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 font-bold text-rose-700">{error}</div>;
  if (!product) return <div className="p-8 text-sm font-bold text-slate-500">Loading product...</div>;
  return <div className="mx-auto max-w-[1400px]"><AdminPageHeader eyebrow="Catalog / Edit" title={`Edit ${product.name}`} description="Update the product details shown to your team." /><ProductForm product={product} /></div>;
}