"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { CartItem, Product, User } from "../types";

interface StoreContextValue {
  cart: CartItem[];
  user: User | null;
  theme: "light" | "dark";
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  removeFromCart: (id: number) => void;
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
      updateQuantity: (id: number, quantity: number) =>
        setCart((current) =>
          quantity < 1
            ? current.filter((item) => item.id !== id)
            : current.map((item) =>
                item.id === id ? { ...item, quantity } : item,
              ),
        ),
      removeFromCart: (id: number) =>
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

// "use client";

// // React hooks and functions:
// // createContext  → Creates a global Context for sharing store data.
// // useContext     → Allows components to access the StoreContext.
// // useEffect      → Runs side effects such as localStorage/document updates.
// // useMemo        → Prevents recreating the context value unnecessarily.
// // useState       → Creates and manages component state.
// import { createContext, useContext, useEffect, useMemo, useState } from "react";

// // Application-specific TypeScript types:
// // CartItem → Represents a product stored in the shopping cart.
// // Product  → Represents a product in the store.
// // User     → Represents the logged-in user's data.
// import { CartItem, Product, User } from "../types";

// // Defines the complete structure of the data and functions
// // that will be available through StoreContext.
// interface StoreContextValue {
//   // Current products/items in the shopping cart.
//   cart: CartItem[];

//   // Currently logged-in user.
//   // null means no user is logged in.
//   user: User | null;

//   // Current application theme.
//   theme: "light" | "dark";

//   // Adds a product to the cart.
//   // quantity is optional and defaults to 1.
//   addToCart: (product: Product, quantity?: number) => void;

//   // Changes the quantity of a product in the cart.
//   updateQuantity: (id: number, quantity: number) => void;

//   // Removes a specific product from the cart.
//   removeFromCart: (id: number) => void;

//   // Removes every product from the cart.
//   clearCart: () => void;

//   // Updates the currently logged-in user.
//   setUser: (user: User | null) => void;

//   // Switches between light and dark mode.
//   toggleTheme: () => void;
// }

// // Creates the React Context.
// // null is used as the initial value because StoreProvider
// // has not provided any store data yet.
// const StoreContext = createContext<StoreContextValue | null>(null);

// // StoreProvider makes the global store available
// // to all components inside this provider.
// export function StoreProvider({ children }: { children: React.ReactNode }) {
//   // ---------------------------------------------------------
//   // CART STATE
//   // ---------------------------------------------------------

//   // Stores all products currently in the shopping cart.
//   //
//   // The function passed to useState runs only when the
//   // state is initialized.
//   const [cart, setCart] = useState<CartItem[]>(() => {
//     // During Next.js server rendering, window does not exist.
//     // Therefore, return an empty cart on the server.
//     if (typeof window === "undefined") return [];

//     // Try to retrieve the previously saved cart
//     // from the browser's localStorage.
//     const saved = window.localStorage.getItem("northstar-cart");

//     // If saved cart data exists, convert the JSON string
//     // back into a JavaScript object/array.
//     //
//     // If nothing was saved, start with an empty array.
//     return saved ? JSON.parse(saved) : [];
//   });

//   // ---------------------------------------------------------
//   // USER STATE
//   // ---------------------------------------------------------

//   // Stores the currently logged-in user.
//   // null means that no user is logged in.
//   const [user, setUser] = useState<User | null>(() => {
//     // window is unavailable during server-side rendering.
//     if (typeof window === "undefined") return null;

//     // Get the saved user from localStorage.
//     const saved = window.localStorage.getItem("northstar-user");

//     // Convert the JSON string back into a User object.
//     // If there is no saved user, return null.
//     return saved ? JSON.parse(saved) : null;
//   });

//   // ---------------------------------------------------------
//   // THEME STATE
//   // ---------------------------------------------------------

//   // Stores whether the application is using light or dark mode.
//   const [theme, setTheme] = useState<"light" | "dark">(() => {
//     // window does not exist during server-side rendering.
//     // Use light mode as the default on the server.
//     if (typeof window === "undefined") return "light";

//     return (
//       // Read the saved theme from localStorage.
//       (window.localStorage.getItem("northstar-theme") as
//         // Tell TypeScript that the stored value should be
//         // either "light", "dark", or null.
//         "light" | "dark" | null) ??
//       // If there is no saved theme, use "light".
//       "light"
//     );
//   });

//   // ---------------------------------------------------------
//   // SAVE CART TO LOCAL STORAGE
//   // ---------------------------------------------------------

//   // Runs whenever the cart changes.
//   useEffect(() => {
//     // Convert the cart array into a JSON string
//     // and save it in the browser's localStorage.
//     window.localStorage.setItem("northstar-cart", JSON.stringify(cart));
//   }, [cart]);

//   // ---------------------------------------------------------
//   // SAVE USER TO LOCAL STORAGE
//   // ---------------------------------------------------------

//   // Runs whenever the user state changes.
//   useEffect(() => {
//     // If a user exists, save the user to localStorage.
//     if (user) {
//       window.localStorage.setItem("northstar-user", JSON.stringify(user));

//       // If the user is null, remove the saved user.
//     } else {
//       window.localStorage.removeItem("northstar-user");
//     }
//   }, [user]);

//   // ---------------------------------------------------------
//   // APPLY THEME
//   // ---------------------------------------------------------

//   // Runs whenever the theme changes.
//   useEffect(() => {
//     // Add the "dark" class to the <html> element
//     // when dark mode is selected.
//     //
//     // Remove it when light mode is selected.
//     document.documentElement.classList.toggle("dark", theme === "dark");

//     // Save the selected theme so it survives page refreshes.
//     window.localStorage.setItem("northstar-theme", theme);
//   }, [theme]);

//   // ---------------------------------------------------------
//   // CONTEXT VALUE
//   // ---------------------------------------------------------

//   // useMemo prevents creating a new value object
//   // on every render unless cart, user, or theme changes.
//   const value = useMemo(
//     () => ({
//       // Current shopping cart.
//       cart,

//       // Current logged-in user.
//       user,

//       // Current theme.
//       theme,

//       // -----------------------------------------------------
//       // ADD TO CART
//       // -----------------------------------------------------

//       // Adds a product to the cart.
//       addToCart: (product: Product, quantity = 1) =>
//         setCart((current) => {
//           // Check whether this product already exists
//           // in the shopping cart.
//           const existing = current.find((item) => item.id === product.id);

//           // If the product already exists...
//           return existing
//             ? // Update the existing product's quantity.
//               current.map((item) =>
//                 item.id === product.id
//                   ? {
//                       ...item,

//                       // Increase the quantity, but never allow
//                       // it to exceed the available stock.
//                       quantity: Math.min(
//                         item.quantity + quantity,
//                         product.stock,
//                       ),
//                     }
//                   : item,
//               )
//             : // If the product doesn't exist,
//               // add it as a new cart item.
//               [...current, { ...product, quantity }];
//         }),

//       // -----------------------------------------------------
//       // UPDATE QUANTITY
//       // -----------------------------------------------------

//       // Updates the quantity of an existing cart item.
//       updateQuantity: (id: number, quantity: number) =>
//         setCart((current) =>
//           // If quantity is less than 1,
//           // remove the item from the cart.
//           quantity < 1
//             ? current.filter((item) => item.id !== id)
//             : // Otherwise update the item's quantity.
//               current.map((item) =>
//                 item.id === id ? { ...item, quantity } : item,
//               ),
//         ),

//       // -----------------------------------------------------
//       // REMOVE FROM CART
//       // -----------------------------------------------------

//       // Removes one specific product from the cart.
//       removeFromCart: (id: number) =>
//         setCart((current) => current.filter((item) => item.id !== id)),

//       // -----------------------------------------------------
//       // CLEAR CART
//       // -----------------------------------------------------

//       // Removes all products from the cart.
//       clearCart: () => setCart([]),

//       // -----------------------------------------------------
//       // SET USER
//       // -----------------------------------------------------

//       // Exposes React's setUser function so components
//       // can log in, log out, or change the current user.
//       setUser,

//       // -----------------------------------------------------
//       // TOGGLE THEME
//       // -----------------------------------------------------

//       // Switches light → dark or dark → light.
//       toggleTheme: () =>
//         setTheme((current) => (current === "light" ? "dark" : "light")),
//     }),

//     // Recalculate the context value only when
//     // one of these values changes.
//     [cart, user, theme],
//   );

//   // ---------------------------------------------------------
//   // PROVIDER
//   // ---------------------------------------------------------

//   // Makes cart, user, theme, and all store functions
//   // available to every component inside StoreProvider.
//   return (
//     <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
//   );
// }

// // -----------------------------------------------------------
// // useStore CUSTOM HOOK
// // -----------------------------------------------------------

// // This custom hook makes it easier for components
// // to access the global store.
// export function useStore() {
//   // Get the StoreContext value.
//   const context = useContext(StoreContext);

//   // If this hook is used outside StoreProvider,
//   // context will be null.
//   //
//   // Throw an error so the developer immediately knows
//   // that the component is missing StoreProvider.
//   if (!context) {
//     throw new Error("useStore must be used inside StoreProvider");
//   }

//   // Return the store data and functions.
//   return context;
// }
