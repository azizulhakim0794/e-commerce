"use client";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "../../store/StoreProvider";
export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useStore();
  const [error, setError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email"));
    const password = String(data.get("password"));
    if (!email || !password)
      return setError("Email and password are required.");
    setUser({ name: email.split("@")[0], email });
    router.push("/profile");
  }
  return (
    <div className="mx-auto max-w-md px-5 py-20 lg:py-28">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">
        Welcome back
      </p>
      <h1 className="mt-3 text-4xl font-black">Sign in to Northstar.</h1>
      <form onSubmit={submit} className="mt-8 grid gap-5">
        <label className="grid gap-2 text-sm font-bold">
          Email
          <input
            name="email"
            type="email"
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-teal-600 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Password
          <input
            name="password"
            type="password"
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-teal-600 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
        {error && <p className="text-sm font-bold text-rose-600">{error}</p>}
        <button className="rounded-full bg-slate-950 px-5 py-3.5 text-sm font-bold text-white hover:bg-teal-700 dark:bg-white dark:text-slate-950">
          Sign in
        </button>
      </form>
      <p className="mt-7 text-center text-sm text-slate-500">
        New here?{" "}
        <Link href="/register" className="font-bold text-teal-700">
          Create an account
        </Link>
      </p>
    </div>
  );
}
