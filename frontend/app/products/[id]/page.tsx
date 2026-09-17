import { Product } from "@/types";
import ProductDetailsClient from "./ProductDetailsClient";
import { product_service } from "@/helper/services/product.service";
import { Metadata } from "next";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;

  const product = await product_service.get_product(id);

  return {
    title: `${product.name} | Northstar Supply Co.`,
    description: product.description,
  };
}

export async function generateStaticParams() {
  try {
    const products = await product_service.get_products();

    return products.map((product) => ({
      id: product.id,
    }));
  } catch {
    return [];
  }
}

export default function ProductDetailsPage() {
  return <ProductDetailsClient />;
}
