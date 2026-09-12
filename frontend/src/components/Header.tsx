export default function Header() {
  return (
    <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
      <a href="#" className="text-2xl font-bold tracking-tight">
        Wild<span className="text-[#d88a16]">Hive</span>
      </a>

      <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
        <a href="#products" className="transition hover:text-[#d88a16]">
          Our Honey
        </a>

        <a href="#story" className="transition hover:text-[#d88a16]">
          Our Story
        </a>

        <a href="#benefits" className="transition hover:text-[#d88a16]">
          Why WildHive
        </a>
      </nav>

      <a
        href="#products"
        className="rounded-full bg-[#315c3a] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#264b2f]"
      >
        Explore Honey
      </a>
    </header>
  );
}