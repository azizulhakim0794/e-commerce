"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "../../store/StoreProvider";
import { authService } from "@/helper/services/auth.service";
import { useApi } from "@/hooks/useApi";
export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser } = useStore();
  const { handleRequest, isLoading } = useApi();

  const handle_click_logout = async () => {
    const result = await handleRequest(authService.logout());

    if (result.success) {
      setUser(null);
      router.push("/");
    }
  };

  if (!user)
    return (
      <div className="mx-auto max-w-xl px-5 py-32 text-center">
        <h1 className="text-3xl font-black">Sign in to view your account.</h1>
        <Link
          href="/login"
          className="mt-6 inline-block font-bold text-teal-700"
        >
          Go to sign in
        </Link>
      </div>
    );
  return (
    <div className="mx-auto max-w-5xl px-5 py-10 lg:px-8 lg:py-16">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">
        Your account
      </p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-4xl font-black">Hello, {user.name}.</h1>
        <button
          onClick={() => handle_click_logout()}
          className="text-sm font-bold text-rose-600"
        >
          Sign out
        </button>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">
          <h2 className="text-lg font-black">Personal details</h2>
          <dl className="mt-6 grid gap-5 text-sm">
            <div>
              <dt className="text-slate-400">Name</dt>
              <dd className="mt-1 font-bold">{user.name}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Email</dt>
              <dd className="mt-1 font-bold">{user.email}</dd>
            </div>
            <div>
              <dt className="text-slate-400">Phone</dt>
              <dd className="mt-1 font-bold text-slate-500">
                Add a phone number
              </dd>
            </div>
          </dl>
        </section>
        <section className="rounded-2xl bg-teal-800 p-6 text-white">
          <p className="text-xs font-bold uppercase tracking-widest text-teal-200">
            Member perks
          </p>
          <h2 className="mt-4 text-2xl font-black">Good choices, rewarded.</h2>
          <p className="mt-3 text-sm leading-6 text-teal-100">
            Free delivery, early access to new edits, and a simpler way to keep
            track of your orders.
          </p>
          <Link
            href="/orders"
            className="mt-6 inline-block rounded-full bg-white px-4 py-2 text-sm font-bold text-teal-900"
          >
            View orders
          </Link>
        </section>
      </div>
    </div>
  );
}
