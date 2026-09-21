"use client";

import { authService } from "@/helper/services/auth.service";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types";
import { useEffect, useState } from "react";

const UserList = () => {
  const { handleRequest } = useApi();
  const [users, setUsers] = useState<User[]>();

  const loadProduct = async () => {
    const result = await handleRequest(authService.getUsers);

    if (result.success && result.data) {
      console.log(result.data);
      setUsers(result?.data);
    }
  };

  useEffect(() => {
    loadProduct();
  }, []);

  return (
    <>
      <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[650px] text-left">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Order Count</th>
              <th className="px-6 py-4">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users &&
              users.map((user) => (
                <tr key={user.email} className="hover:bg-slate-50">
                  <td className="px-6 py-5 font-black text-[#102d2a]">
                    {/* <span className="mr-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#d9ebe4] text-xs text-[#1b665d]">
                    {name.charAt(0)}
                  </span> */}
                    {user.username}
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-600">
                    {user.email}
                  </td>
                  <td className="px-6 py-5 text-sm font-bold">
                    {/* {activity} */}
                    {user.how_many_orders_placed
                      ? user.how_many_orders_placed
                      : "N/A"}
                  </td>
                  <td className="px-6 py-5 text-sm text-slate-500">
                    {user?.created_at
                      ? new Date(user.created_at).toLocaleString()
                      : "N/A"}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default UserList;
