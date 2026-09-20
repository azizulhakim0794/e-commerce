import AdminPageHeader from "../../../components/admin/AdminPageHeader";
import ProductForm from "../../../components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <AdminPageHeader
        eyebrow="Catalog / New"
        title="Add a product"
        description="Give a new piece a clear place in the collection."
      />
      <ProductForm />
    </div>
  );
}
