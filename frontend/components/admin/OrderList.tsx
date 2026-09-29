"use client";

import { authService } from "@/helper/services/auth.service";
import { product_service } from "@/helper/services/product.service";
import { useApi } from "@/hooks/useApi";
import { Order } from "@/types";
import { useEffect, useState } from "react";

const OrderList = () => {
  const { handleRequest } = useApi();
  const [products, setProducts] = useState<Order>();

  const loadProduct = async () => {
    const result = await handleRequest(product_service.get_ordered_products);

    if (result.success && result.data) {
      console.log(result.data);
      setProducts(result?.data);
    }
  };

  useEffect(() => {
    loadProduct();
  }, []);

  return (
    <>
      <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[700px] text-left">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-6 py-4">Order</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Placed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products &&
              products.order_items.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50">
                  <td className="px-6 py-5 font-black text-[#102d2a]">
                    {product.id}
                  </td>
                  <td className="px-6 py-5 text-sm font-semibold">
                    {/* {customer}  */} dfgdfgdfg
                  </td>
                  <td className="px-6 py-5 text-sm font-black">gdfgdsf</td>
                  <td className="px-6 py-5">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black ${status === "Delivered" ? "bg-emerald-100 text-emerald-800" : status === "Ready to ship" ? "bg-[#f9e8ca] text-[#8b5a1e]" : "bg-slate-100 text-slate-700"}`}
                    >
                      {status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-500">
                    {product.quantity}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default OrderList;
