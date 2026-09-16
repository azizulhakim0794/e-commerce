import ProductDetailsClient from "./ProductDetailsClient";
import { product_service } from "@/helper/services/product.service";

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
