"use client";

import { authService } from "@/helper/services/auth.service";
import { User } from "@/types/auth";
import { CartItem, Product } from "@/types/product";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

interface StoreContextValue {
  cart: CartItem[];
  user: User | null;
  theme: "light" | "dark";
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (id: string | number, quantity: number) => void;
  removeFromCart: (id: string | number) => void;
  clearCart: () => void;
  setUser: (user: User | null) => void;
  toggleTheme: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = window.localStorage.getItem("northstar-cart");
    return saved ? JSON.parse(saved) : [];
  });

  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    const saved = window.localStorage.getItem("northstar-user");
    return saved ? JSON.parse(saved) : null;
  });

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    return (
      (window.localStorage.getItem("northstar-theme") as
        "light" | "dark" | null) ?? "light"
    );
  });

  useEffect(() => {
    window.localStorage.setItem("northstar-cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (user)
      window.localStorage.setItem("northstar-user", JSON.stringify(user));
    else window.localStorage.removeItem("northstar-user");
  }, [user]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("northstar-theme", theme);
  }, [theme]);

  useEffect(() => {
    void getMe();
  }, []);

  const getMe = async () => {
    try {
      const currentUser = await authService.getMe();
      setUser(currentUser);
    } catch {
      // Ignore unauthenticated state for guests.
    }
  };

  const value = useMemo(
    () => ({
      cart,
      user,
      theme,
      addToCart: (product: Product, quantity = 1) =>
        setCart((current) => {
          const existing = current.find((item) => item.id === product.id);
          return existing
            ? current.map((item) =>
                item.id === product.id
                  ? {
                      ...item,
                      quantity: Math.min(
                        item.quantity + quantity,
                        product.stock,
                      ),
                    }
                  : item,
              )
            : [...current, { ...product, quantity }];
        }),
      updateQuantity: (id: string | number, quantity: number) =>
        setCart((current) =>
          quantity < 1
            ? current.filter((item) => item.id !== id)
            : current.map((item) =>
                item.id === id ? { ...item, quantity } : item,
              ),
        ),
      removeFromCart: (id: string | number) =>
        setCart((current) => current.filter((item) => item.id !== id)),
      clearCart: () => setCart([]),
      setUser,
      toggleTheme: () =>
        setTheme((current) => (current === "light" ? "dark" : "light")),
    }),
    [cart, user, theme],
  );

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used inside StoreProvider");
  return context;
}
