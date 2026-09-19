import type { Metadata } from "next";
import "./globals.css";
import StorefrontShell from "../components/StorefrontShell";
import { StoreProvider } from "../store/StoreProvider";

export const metadata: Metadata = {
  title: "Northstar Supply Co.",
  description: "Considered goods for everyday living.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body>
        <StoreProvider>
          <StorefrontShell>{children}</StorefrontShell>
        </StoreProvider>
      </body>
    </html>
  );
}
