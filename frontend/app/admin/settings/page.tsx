"use client";

import { useState } from "react";
import AdminPageHeader from "../../../components/admin/AdminPageHeader";

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);
  return (
    <div className="mx-auto max-w-[1000px]">
      <AdminPageHeader
        eyebrow="Workspace"
        title="Settings"
        description="Set the defaults your team sees while managing the store."
      />
      <form
        className="mt-8 max-w-2xl space-y-6"
        onSubmit={(event) => {
          event.preventDefault();
          setSaved(true);
        }}
      >
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <h2 className="font-black text-[#102d2a]">Store profile</h2>
          <div className="mt-5 grid gap-5">
            <label className="grid gap-2 text-sm font-bold">
              Store name
              <input
                defaultValue="Northstar Supply Co."
                className="admin-input"
              />
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Support email
              <input
                type="email"
                defaultValue="hello@northstar.example"
                className="admin-input"
              />
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Currency
              <select defaultValue="USD" className="admin-input">
                <option>USD - US Dollar</option>
                <option>EUR - Euro</option>
                <option>GBP - Pound Sterling</option>
              </select>
            </label>
          </div>
        </section>
        <div className="flex items-center gap-4">
          <button className="rounded-xl bg-[#102d2a] px-5 py-3 text-sm font-black text-white">
            Save settings
          </button>
          {saved && (
            <span className="text-sm font-bold text-emerald-700">
              Settings saved.
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
