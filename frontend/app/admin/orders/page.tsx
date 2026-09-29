import OrderList from "@/components/admin/OrderList";
import AdminPageHeader from "../../../components/admin/AdminPageHeader";

const orders = [
  ["#NS-1048", "Maya Chen", "$248.00", "Processing", "Today, 10:42"],
  ["#NS-1047", "Theo Martin", "$96.50", "Ready to ship", "Today, 09:18"],
  ["#NS-1046", "Ari Williams", "$412.00", "Delivered", "Yesterday"],
  // ["#NS-1045", "June Park", "$72.00", "Delivered", "Yesterday"],
];

export default function AdminOrdersPage() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <AdminPageHeader
        eyebrow="Fulfillment"
        title="Orders"
        description="Track the customer orders that keep the business moving."
      />

      <OrderList />

      {/* <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
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
            {orders.map(([id, customer, total, status, placed]) => (
              <tr key={id} className="hover:bg-slate-50">
                <td className="px-6 py-5 font-black text-[#102d2a]">{id}</td>
                <td className="px-6 py-5 text-sm font-semibold">{customer}</td>
                <td className="px-6 py-5 text-sm font-black">{total}</td>
                <td className="px-6 py-5">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-black ${status === "Delivered" ? "bg-emerald-100 text-emerald-800" : status === "Ready to ship" ? "bg-[#f9e8ca] text-[#8b5a1e]" : "bg-slate-100 text-slate-700"}`}
                  >
                    {status}
                  </span>
                </td>
                <td className="px-6 py-5 text-sm text-slate-500">{placed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div> */}
    </div>
  );
}
