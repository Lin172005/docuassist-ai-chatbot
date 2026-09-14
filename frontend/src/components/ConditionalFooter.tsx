"use client";

import { usePathname } from "next/navigation";
import Footer from "@/components/Footer";
import ChatWidget from "@/components/ChatWidget";

export default function ConditionalFooter() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return (
    <>
      <Footer />
      <ChatWidget />
    </>
  );
}
