"use client";

import { authService } from "@/helper/services/auth.service";
import { useApi } from "@/hooks/useApi";
import { User } from "@/types/auth";
import { CartItem, Product } from "@/types/product";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

interface StoreContextValue {
  cart: CartItem[];
  user: User | null;
  theme: "light" | "dark";
  isSessionLoading: boolean;
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (id: string | number, quantity: number) => void;
  removeFromCart: (id: string | number) => void;
  clearCart: () => void;
  setUser: (user: User | null) => void;
  toggleTheme: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isHydrated, setIsHydrated] = useState(false);
  const { handleRequest, isLoading } = useApi();

  useEffect(() => {
    const savedCart = window.localStorage.getItem("northstar-cart");
    const savedTheme = window.localStorage.getItem("northstar-theme");

    setCart(savedCart ? JSON.parse(savedCart) : []);
    setTheme(savedTheme === "dark" ? "dark" : "light");
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    window.localStorage.setItem("northstar-cart", JSON.stringify(cart));
  }, [cart, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;

    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("northstar-theme", theme);
  }, [theme, isHydrated]);

  const hasCheckedSession = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || hasCheckedSession.current) return;

    hasCheckedSession.current = true;
    void getMe();
  }, []);

  const getMe = async () => {
    const response = await handleRequest(authService.getMe());

    if (response.success && response.data) {
      setUser(response.data);
      return;
    }

    setUser(null);
  };

  const value = useMemo(
    () => ({
      cart,
      user,
      theme,
      isSessionLoading: isLoading,
      addToCart: (product: Product, quantity = 1) =>
        setCart((current) => {
          const existing = current.find(
            (item) => item.product.id === product.id,
          );

          if (existing) {
            return current.map((item) =>
              item.product.id === product.id
                ? {
                    ...item,
                    quantity: Math.min(item.quantity + quantity, product.stock),
                  }
                : item,
            );
          }

          return [
            ...current,
            {
              id: crypto.randomUUID(),
              product,
              quantity: Math.min(quantity, product.stock),
            },
          ];
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
    [cart, user, theme, isLoading],
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
