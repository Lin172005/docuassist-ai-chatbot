"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Header({ dark = false }: { dark?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const textColor = dark && !scrolled ? "text-white" : "text-[#1c2e24]";
  const hoverColor = dark && !scrolled ? "hover:text-[#f6cc72]" : "hover:text-[#c98a2c]";
  const ctaBg = dark && !scrolled ? "bg-white text-[#1c2e24] hover:bg-white/90" : "bg-[#1e3d2f] text-white hover:bg-[#162e23]";
  const mobileBg = dark && !scrolled ? "hover:bg-white/10" : "hover:bg-[#f4f2eb]";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? "border-b border-[#e8e5dc] bg-[#faf9f5]/90 shadow-xs backdrop-blur-md"
          : dark
            ? "bg-transparent"
            : "border-b border-[#e8e5dc]/60 bg-[#faf9f5]/95 backdrop-blur-md"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className={`text-2xl font-bold tracking-tight ${textColor}`}>
          Wild<span className={dark && !scrolled ? "text-[#f6cc72]" : "text-[#c98a2c]"}>Hive</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
          <Link href="/products" className={`transition ${textColor} ${hoverColor}`}>
            Our Honey
          </Link>
          <Link href="/#story" className={`transition ${textColor} ${hoverColor}`}>
            Our Story
          </Link>
          <Link href="/#benefits" className={`transition ${textColor} ${hoverColor}`}>
            Why WildHive
          </Link>
          <Link href="/contact" className={`transition ${textColor} ${hoverColor}`}>
            Contact
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("open-chat"))}
            className={`text-xs font-semibold px-3.5 py-2 rounded-full border transition ${
              dark && !scrolled ? "border-white/30 text-white hover:bg-white/10" : "border-[#e8e5dc] text-[#1c2e24] hover:bg-[#f4f2eb]"
            }`}
          >
            ✦ Ask AI Guide
          </button>
          <Link
            href="/products"
            className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${ctaBg}`}
          >
            Explore Honey
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className={`flex h-10 w-10 items-center justify-center rounded-lg transition ${textColor} ${mobileBg} md:hidden`}
          aria-label="Toggle menu"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            {mobileOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-[#e8e5dc] bg-[#faf9f5]/98 backdrop-blur-md md:hidden">
          <nav className="flex flex-col gap-1 px-6 py-4">
            <Link
              href="/products"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-4 py-3 text-sm font-medium text-[#1c2e24] transition hover:bg-[#f4f2eb]"
            >
              Our Honey
            </Link>
            <Link
              href="/#story"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-4 py-3 text-sm font-medium text-[#1c2e24] transition hover:bg-[#f4f2eb]"
            >
              Our Story
            </Link>
            <Link
              href="/#benefits"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-4 py-3 text-sm font-medium text-[#1c2e24] transition hover:bg-[#f4f2eb]"
            >
              Why WildHive
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-4 py-3 text-sm font-medium text-[#1c2e24] transition hover:bg-[#f4f2eb]"
            >
              Contact
            </Link>
            <Link
              href="/products"
              onClick={() => setMobileOpen(false)}
              className="mt-2 rounded-full bg-[#1e3d2f] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#162e23]"
            >
              Explore Honey
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
