"use client";

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

  const textColor = dark && !scrolled ? "text-white" : "text-[#243b2a]";
  const hoverColor = dark && !scrolled ? "hover:text-[#f6cc72]" : "hover:text-[#d88a16]";
  const ctaBg = dark && !scrolled ? "bg-white text-[#243b2a] hover:bg-white/90" : "bg-[#315c3a] text-white hover:bg-[#264b2f]";
  const mobileBg = dark && !scrolled ? "hover:bg-white/10" : "hover:bg-[#eee7d8]/60";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? "border-b border-[#eee7d8] bg-[#fffaf0]/80 shadow-sm backdrop-blur-md"
          : dark
            ? "bg-transparent"
            : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <a href="/" className={`text-2xl font-bold tracking-tight ${textColor}`}>
          Wild<span className={dark && !scrolled ? "text-[#f6cc72]" : "text-[#d88a16]"}>Hive</span>
        </a>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
          <a href="/products" className={`transition ${textColor} ${hoverColor}`}>
            Our Honey
          </a>
          <a href="/#story" className={`transition ${textColor} ${hoverColor}`}>
            Our Story
          </a>
          <a href="/#benefits" className={`transition ${textColor} ${hoverColor}`}>
            Why WildHive
          </a>
          <a href="/contact" className={`transition ${textColor} ${hoverColor}`}>
            Contact
          </a>
        </nav>

        <div className="hidden md:block">
          <a
            href="/products"
            className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${ctaBg}`}
          >
            Explore Honey
          </a>
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
        <div className="border-t border-[#eee7d8] bg-[#fffaf0]/95 backdrop-blur-md md:hidden">
          <nav className="flex flex-col gap-1 px-6 py-4">
            <a
              href="/products"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-4 py-3 text-sm font-medium transition hover:bg-[#eee7d8]/60"
            >
              Our Honey
            </a>
            <a
              href="/#story"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-4 py-3 text-sm font-medium transition hover:bg-[#eee7d8]/60"
            >
              Our Story
            </a>
            <a
              href="/#benefits"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-4 py-3 text-sm font-medium transition hover:bg-[#eee7d8]/60"
            >
              Why WildHive
            </a>
            <a
              href="/contact"
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-4 py-3 text-sm font-medium transition hover:bg-[#eee7d8]/60"
            >
              Contact
            </a>
            <a
              href="/products"
              onClick={() => setMobileOpen(false)}
              className="mt-2 rounded-full bg-[#315c3a] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#264b2f]"
            >
              Explore Honey
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
