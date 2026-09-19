"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function StorefrontShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}
