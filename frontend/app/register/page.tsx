"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { authService } from "@/helper/services/auth.service";
import { useStore } from "../../store/StoreProvider";

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useStore();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const username = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const password = String(data.get("password") || "");
    const confirm = String(data.get("confirm") || "");

    if (!username || !email || !password) {
      setError("Please complete all required fields.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setError("");
      setIsSubmitting(true);

      await authService.register({ username, email, password });
      await authService.login({ email, password });
      const currentUser = await authService.getMe();

      setUser(currentUser);
      router.push("/profile");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to create your account right now.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-5 py-20 lg:py-28">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">
        Join the club
      </p>
      <h1 className="mt-3 text-4xl font-black">Make space for good things.</h1>
      <form onSubmit={submit} className="mt-8 grid gap-5">
        <label className="grid gap-2 text-sm font-bold">
          Full name
          <input
            name="name"
            required
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-teal-600 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Email
          <input
            name="email"
            required
            type="email"
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-teal-600 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Password
          <input
            name="password"
            required
            type="password"
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-teal-600 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
        <label className="grid gap-2 text-sm font-bold">
          Confirm password
          <input
            name="confirm"
            required
            type="password"
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-teal-600 dark:border-slate-700 dark:bg-slate-900"
          />
        </label>
        {error && <p className="text-sm font-bold text-rose-600">{error}</p>}
        <button
          disabled={isSubmitting}
          className="rounded-full bg-slate-950 px-5 py-3.5 text-sm font-bold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-slate-950"
        >
          {isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>
      <p className="mt-7 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-bold text-teal-700">
          Sign in
        </Link>
      </p>
    </div>
  );
}
