import AdminPageHeader from "../../../components/admin/AdminPageHeader";

const users = [
  ["Maya Chen", "maya.chen@example.com", "18 orders", "Sep 14, 2026"],
  ["Theo Martin", "theo.martin@example.com", "7 orders", "Sep 12, 2026"],
  ["Ari Williams", "ari.williams@example.com", "4 orders", "Sep 11, 2026"],
  ["June Park", "june.park@example.com", "12 orders", "Sep 08, 2026"],
];

export default function AdminUsersPage() {
  return (
    <div className="mx-auto max-w-[1400px]">
      <AdminPageHeader
        eyebrow="Customers"
        title="Users"
        description="Understand who is buying and how often they return."
      />
      <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[650px] text-left">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Activity</th>
              <th className="px-6 py-4">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(([name, email, activity, joined]) => (
              <tr key={email} className="hover:bg-slate-50">
                <td className="px-6 py-5 font-black text-[#102d2a]">
                  <span className="mr-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#d9ebe4] text-xs text-[#1b665d]">
                    {name.charAt(0)}
                  </span>
                  {name}
                </td>
                <td className="px-6 py-5 text-sm text-slate-600">{email}</td>
                <td className="px-6 py-5 text-sm font-bold">{activity}</td>
                <td className="px-6 py-5 text-sm text-slate-500">{joined}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
