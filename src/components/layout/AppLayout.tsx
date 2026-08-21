"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isReaderPage = pathname?.includes("/read/");

  if (isReaderPage) {
    return <main style={{ flex: 1 }}>{children}</main>;
  }

  return (
    <>
      <Navbar />
      <main style={{ flex: 1, paddingTop: "64px" }}>{children}</main>
      <Footer />
    </>
  );
}
