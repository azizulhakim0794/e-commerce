"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { authService } from "@/helper/services/auth.service";
import { addressService } from "@/helper/services/address.service";
import { useApi } from "@/hooks/useApi";
import { useStore } from "../../store/StoreProvider";
import type { Address, AddressFormValues, AddressType } from "@/types/address";

const defaultAddressForm: AddressFormValues = {
  full_name: "",
  phone_number: "",
  address_type: "home",
  address_line_1: "",
  address_line_2: "",
  city: "",
  state_or_division: "",
  postal_code: "",
  country: "",
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser, isSessionLoading } = useStore();
  const { handleRequest, isLoading } = useApi();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [formValues, setFormValues] =
    useState<AddressFormValues>(defaultAddressForm);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!user) return;

    void loadAddresses();
  }, [user]);

  useEffect(() => {
    if (!isModalOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isModalOpen]);

  const handle_click_logout = async () => {
    const result = await handleRequest(authService.logout());

    if (result.success) {
      setUser(null);
      router.push("/");
    }
  };

  const loadAddresses = async () => {
    const result = await handleRequest(addressService.getAddresses);

    if (result.success && Array.isArray(result.data)) {
      setAddresses(result.data);
      return;
    }

    setAddresses([]);
  };

  const handleFieldChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
  };

  const handleAddressTypeChange = (type: AddressType) => {
    setFormValues((current) => ({ ...current, address_type: type }));
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setEditingAddressId(null);
    setFormValues(defaultAddressForm);
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (address: Address) => {
    setIsEditing(true);
    setEditingAddressId(address.id);
    setFormValues({
      full_name: address.full_name,
      phone_number: address.phone_number,
      address_type: address.address_type,
      address_line_1: address.address_line_1,
      address_line_2: address.address_line_2,
      city: address.city,
      state_or_division: address.state_or_division,
      postal_code: address.postal_code,
      country: address.country,
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setEditingAddressId(null);
    setFormValues(defaultAddressForm);
    setFormError("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const requiredFields = Object.entries(formValues).filter(
      ([key, value]) => key !== "address_line_2" && !value.trim(),
    );

    if (requiredFields.length > 0) {
      setFormError("Please fill in all required address fields.");
      return;
    }

    setFormError("");

    const result =
      isEditing && editingAddressId
        ? await handleRequest(addressService.updateAddress, {
            ...formValues,
            id: editingAddressId,
          })
        : await handleRequest(addressService.createAddress, formValues);

    if (!result.success) {
      setFormError("Something went wrong while saving the address.");
      return;
    }

    await loadAddresses();
    closeModal();
  };

  const handleDeleteAddress = async (addressId: string) => {
    const confirmed = window.confirm("Remove this address?");

    if (!confirmed) return;

    const result = await handleRequest(addressService.deleteAddress, addressId);

    if (result.success) {
      setAddresses((current) =>
        current.filter((item) => item.id !== addressId),
      );
    }
  };

  if (isSessionLoading)
    return (
      <main
        className="flex min-h-[60vh] items-center justify-center px-5 py-24"
        aria-busy="true"
        aria-live="polite"
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <span
            className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-teal-700 dark:border-slate-700 dark:border-t-teal-400"
            aria-hidden="true"
          />
          <p className="text-sm font-bold tracking-wide text-slate-500 dark:text-slate-300">
            Loading...
          </p>
        </div>
      </main>
    );

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
          onClick={() => void handle_click_logout()}
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

        <section className="rounded-2xl bg-teal-800 p-6 text-white shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-teal-200">
            Member perks
          </p>

          <h2 className="mt-3 text-2xl font-black tracking-tight">
            Good choices, rewarded.
          </h2>

          <p className="mt-3 max-w-md text-sm leading-6 text-teal-100">
            Free delivery, early access to new edits, and a simpler way to keep
            track of your orders.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/orders"
              className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2.5 text-sm font-bold text-teal-900 transition hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-teal-800"
            >
              View orders
            </Link>

            <Link
              href="/order"
              className="inline-flex items-center justify-center rounded-full border border-teal-300/50 bg-teal-700/50 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-teal-800"
            >
              Pending orders
            </Link>
          </div>
        </section>
      </div>

      <section className="mt-10 rounded-2xl bg-white p-6 shadow-sm dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">
              Addresses
            </p>
            <h2 className="mt-2 text-2xl font-black">Saved delivery details</h2>
          </div>

          {!addresses.length ? (
            <button
              type="button"
              onClick={openCreateModal}
              className="rounded-full bg-teal-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-teal-800"
            >
              Add address
            </button>
          ) : null}
        </div>

        {isLoading ? (
          <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
            Loading addresses...
          </div>
        ) : addresses.length ? (
          <div className="mt-6 space-y-4">
            {addresses.map((address) => (
              <div
                key={address.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/60"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-teal-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-teal-800">
                        {address.address_type}
                      </span>
                    </div>
                    <h3 className="mt-3 text-xl font-black">
                      {address.full_name}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      {address.address_line_1}
                      {address.address_line_2
                        ? `, ${address.address_line_2}`
                        : ""}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {address.city}, {address.state_or_division}{" "}
                      {address.postal_code}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {address.country}
                    </p>
                    <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300">
                      {address.phone_number}
                    </p>
                  </div>

                  <div className="flex gap-2 md:flex-col">
                    <button
                      type="button"
                      onClick={() => openEditModal(address)}
                      className="rounded-full border border-slate-300 px-3 py-2 text-sm font-bold text-slate-700 transition hover:border-teal-600 hover:text-teal-700 dark:border-slate-600 dark:text-slate-200"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDeleteAddress(address.id)}
                      className="rounded-full border border-rose-200 px-3 py-2 text-sm font-bold text-rose-600 transition hover:bg-rose-50 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-950/40"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={openCreateModal}
              className="mt-4 inline-flex rounded-full border border-dashed border-teal-600 px-4 py-2 text-sm font-bold text-teal-700 transition hover:bg-teal-50 dark:border-teal-500 dark:text-teal-300 dark:hover:bg-teal-950/40"
            >
              Add another address
            </button>
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
            No address saved yet. Add your first delivery address to continue.
          </div>
        )}
      </section>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 px-3 py-4 sm:px-4">
          <div className="flex min-h-full items-end justify-center sm:items-center">
            <div className="w-full max-w-2xl rounded-2xl bg-white p-4 shadow-2xl sm:rounded-3xl sm:p-6 dark:bg-slate-900">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-700">
                    {isEditing ? "Edit" : "Add"} address
                  </p>
                  <h3 className="mt-2 text-xl font-black sm:text-2xl">
                    {isEditing
                      ? "Update delivery address"
                      : "Add a new delivery address"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  aria-label="Close address modal"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-slate-500 transition hover:border-slate-400 hover:text-slate-800 dark:border-slate-600 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-white"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    className="h-5 w-5"
                  >
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>

              <form
                onSubmit={(event) => void handleSubmit(event)}
                className="mt-6 space-y-5"
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Full name
                    <input
                      type="text"
                      name="full_name"
                      autoFocus
                      value={formValues.full_name}
                      onChange={handleFieldChange}
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                      placeholder="John Doe"
                    />
                  </label>

                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Phone number
                    <input
                      type="text"
                      name="phone_number"
                      value={formValues.phone_number}
                      onChange={handleFieldChange}
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                      placeholder="+1 234 567 890"
                    />
                  </label>
                </div>

                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Address type
                  </p>
                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
                    {(["home", "office"] as AddressType[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleAddressTypeChange(type)}
                        className={`rounded-xl border px-4 py-3 text-left text-sm font-bold transition ${
                          formValues.address_type === type
                            ? "border-teal-600 bg-teal-50 text-teal-700 dark:border-teal-500 dark:bg-teal-950/40 dark:text-teal-300"
                            : "border-slate-300 bg-white text-slate-700 hover:border-teal-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
                        }`}
                      >
                        {type === "home" ? "Home" : "Office"}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 sm:col-span-2">
                    Address line 1
                    <input
                      type="text"
                      name="address_line_1"
                      value={formValues.address_line_1}
                      onChange={handleFieldChange}
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                      placeholder="123 Main Street"
                    />
                  </label>

                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 sm:col-span-2">
                    Address line 2
                    <input
                      type="text"
                      name="address_line_2"
                      value={formValues.address_line_2}
                      onChange={handleFieldChange}
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                      placeholder="Apartment, suite, floor (optional)"
                    />
                  </label>

                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                    City
                    <input
                      type="text"
                      name="city"
                      value={formValues.city}
                      onChange={handleFieldChange}
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                      placeholder="New York"
                    />
                  </label>

                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                    State / Division
                    <input
                      type="text"
                      name="state_or_division"
                      value={formValues.state_or_division}
                      onChange={handleFieldChange}
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                      placeholder="NY"
                    />
                  </label>

                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Postal code
                    <input
                      type="text"
                      name="postal_code"
                      value={formValues.postal_code}
                      onChange={handleFieldChange}
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                      placeholder="10001"
                    />
                  </label>

                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Country
                    <input
                      type="text"
                      name="country"
                      value={formValues.country}
                      onChange={handleFieldChange}
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                      placeholder="United States"
                    />
                  </label>
                </div>

                {formError ? (
                  <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-300">
                    {formError}
                  </p>
                ) : null}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-full border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-slate-400 dark:border-slate-600 dark:text-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="rounded-full bg-teal-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-teal-400"
                  >
                    {isLoading
                      ? "Saving..."
                      : isEditing
                        ? "Save changes"
                        : "Save address"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
