"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useProductContext } from "@/context/ProductContext";
import { type Product } from "@/lib/products";

const sizes = ["250 g", "500 g", "1 kg", "5 kg+"];
const sortOptions = ["Popularity", "Price: Low to High", "Price: High to Low", "Rating", "Name: A-Z"] as const;

/* Elegant minimal Jar Illustration when photo is not uploaded */
function JarIllustration({ name, color }: { name: string; color?: string }) {
  const honeyColor = color || "#d99b24";
  return (
    <div className="relative flex h-full w-full items-center justify-center p-6 bg-gradient-to-b from-[#faf7f0] to-[#f4eee1] select-none">
      {/* Subtle radial glow */}
      <div
        className="absolute h-36 w-36 rounded-full blur-2xl opacity-40"
        style={{ backgroundColor: honeyColor }}
      />

      {/* Modern apothecary jar container */}
      <div className="relative flex flex-col items-center">
        {/* Jar Lid - natural beechwood look */}
        <div className="h-3 w-16 rounded-t-sm bg-[#9c7246] shadow-xs border-b border-[#7d5630]" />
        <div className="h-1.5 w-14 bg-[#7d5630]" />

        {/* Jar Glass Body */}
        <div className="relative h-28 w-24 rounded-b-xl border border-white/60 bg-white/40 shadow-sm backdrop-blur-xs overflow-hidden flex flex-col justify-end p-1.5">
          {/* Liquid Honey Fill */}
          <div
            className="w-full rounded-b-lg transition-all duration-300 shadow-inner"
            style={{
              height: "78%",
              background: `linear-gradient(180deg, ${honeyColor}dd 0%, ${honeyColor} 100%)`,
            }}
          />

          {/* Minimal Label overlay */}
          <div className="absolute inset-x-2 top-7 flex flex-col items-center justify-center rounded-sm bg-white/95 py-1 px-1 shadow-xs border border-[#eae5d8]">
            <span className="text-[7px] font-black tracking-[0.18em] text-[#1e3d2f] uppercase">WILDHIVE</span>
            <span className="text-[6px] font-semibold text-[#c98a2c] uppercase tracking-wider">RAW HONEY</span>
            <span className="mt-0.5 text-[7px] font-bold text-[#1c2e24] line-clamp-1 text-center leading-tight">
              {name.replace(" Honey", "")}
            </span>
          </div>

          {/* Glass reflection highlight */}
          <div className="absolute left-1.5 top-2 bottom-2 w-1 rounded-full bg-white/30" />
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const { getActiveProducts, error, isLoading, refresh } = useProductContext();

  const allActive = useMemo(() => getActiveProducts(), [getActiveProducts]);
  const honeyProducts = useMemo(() => allActive.filter(p => p.category === "Honey"), [allActive]);
  const equipmentProducts = useMemo(() => allActive.filter(p => p.category === "Equipment"), [allActive]);
  const beeProducts = useMemo(() => allActive.filter(p => p.category === "Bees"), [allActive]);

  const honeyTypes = useMemo(() => [...new Set(honeyProducts.map(p => p.type).filter(Boolean))], [honeyProducts]);

  const categories = useMemo(() => [
    { name: "All Products", count: allActive.length },
    { name: "Honey Varieties", count: honeyProducts.length },
    { name: "Bee Boxes", count: equipmentProducts.filter(e => e.name.toLowerCase().includes("box")).length },
    { name: "Beekeeping Equipment", count: equipmentProducts.length },
    { name: "Bees for Sale", count: beeProducts.length },
  ], [allActive, honeyProducts, equipmentProducts, beeProducts]);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All Products");
  const [sortBy, setSortBy] = useState<string>("Popularity");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  function toggleType(type: string) {
    setSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
  }

  function toggleSize(size: string) {
    setSelectedSizes(prev => prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]);
  }

  const showHoney = category === "All Products" || category === "Honey Varieties";
  const showEquipment = category === "All Products" || category === "Beekeeping Equipment" || category === "Bee Boxes";
  const showBees = category === "All Products" || category === "Bees for Sale";

  const filteredProducts = useMemo(() => {
    let result = [...honeyProducts];

    if (query) {
      result = result.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (selectedTypes.length > 0) {
      result = result.filter(p => selectedTypes.includes(p.type));
    }

    if (selectedSizes.length > 0) {
      result = result.filter(p => selectedSizes.includes(p.size));
    }

    switch (sortBy) {
      case "Price: Low to High":
        result.sort((a, b) => a.price - b.price);
        break;
      case "Price: High to Low":
        result.sort((a, b) => b.price - a.price);
        break;
      case "Rating":
        result.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
        break;
      case "Name: A-Z":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        result.sort((a, b) => b.reviews - a.reviews);
    }

    return result;
  }, [honeyProducts, query, sortBy, selectedTypes, selectedSizes]);

  const filteredEquipment = useMemo(() => {
    let result = equipmentProducts;
    if (category === "Bee Boxes") {
      result = result.filter(e => e.name.toLowerCase().includes("box"));
    }
    if (query) {
      result = result.filter(e =>
        e.name.toLowerCase().includes(query.toLowerCase()) ||
        e.description.toLowerCase().includes(query.toLowerCase())
      );
    }
    return result;
  }, [equipmentProducts, category, query]);

  const filteredBees = useMemo(() => {
    let result = beeProducts;
    if (query) {
      result = result.filter(b =>
        b.name.toLowerCase().includes(query.toLowerCase()) ||
        b.description.toLowerCase().includes(query.toLowerCase())
      );
    }
    return result;
  }, [beeProducts, query]);

  const activeFilterCount = selectedTypes.length + selectedSizes.length;

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf9f5] text-sm text-[#637368]">
        <div className="flex items-center gap-3">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#1e3d2f] border-t-transparent" />
          <span className="font-medium">Loading WildHive catalogue...</span>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#faf9f5] px-6 text-center text-[#1c2e24]">
        <p className="text-lg font-semibold">Catalogue could not be loaded.</p>
        <p className="text-sm text-[#637368]">Please check your connection and try again.</p>
        <button onClick={refresh} className="btn-primary">Retry</button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf9f5] text-[#1c2e24]">
      {/* Navigation Header */}
      <Header />

      {/* Breadcrumb Navigation */}
      <div className="border-b border-[#f0ede6] bg-white/60 pt-24">
        <div className="mx-auto max-w-7xl px-6 py-3.5 flex items-center justify-between text-xs text-[#8a9890]">
          <nav className="flex items-center gap-2">
            <Link href="/" className="hover:text-[#1c2e24] transition">Home</Link>
            <span>/</span>
            <span className="font-semibold text-[#1c2e24]">Catalogue</span>
            {category !== "All Products" && (
              <>
                <span>/</span>
                <span className="font-medium text-[#c98a2c]">{category}</span>
              </>
            )}
          </nav>
          <span>Showing {allActive.length} verified products</span>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid gap-8 lg:grid-cols-[250px_1fr]">
          {/* Desktop Filter Sidebar */}
          <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white p-6 shadow-xl lg:static lg:w-auto lg:p-0 lg:bg-transparent lg:shadow-none transition-transform duration-200 ${mobileFilterOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
            <div className="flex items-center justify-between lg:hidden mb-6">
              <h2 className="font-bold text-base text-[#1c2e24]">Filter Catalogue</h2>
              <button onClick={() => setMobileFilterOpen(false)} className="p-2 text-xl text-[#637368] hover:text-[#1c2e24]">×</button>
            </div>

            <div className="min-card p-5 space-y-6">
              {/* Category selector */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#8a9890] mb-3">Categories</h3>
                <div className="space-y-1.5">
                  {categories.map((item) => {
                    const active = category === item.name;
                    return (
                      <button
                        key={item.name}
                        onClick={() => { setCategory(item.name); setMobileFilterOpen(false); }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium rounded-xl transition ${
                          active
                            ? "bg-[#1e3d2f] text-white shadow-xs"
                            : "text-[#637368] hover:bg-[#f4f2eb] hover:text-[#1c2e24]"
                        }`}
                      >
                        <span>{item.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${active ? "bg-white/20 text-white" : "bg-[#f0ede6] text-[#637368]"}`}>
                          {item.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Honey Type Filter */}
              {showHoney && honeyTypes.length > 0 && (
                <div className="pt-5 border-t border-[#f0ede6]">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#8a9890]">Honey Variety</h3>
                    {selectedTypes.length > 0 && (
                      <button onClick={() => setSelectedTypes([])} className="text-[10px] text-[#c98a2c] font-semibold hover:underline">
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {honeyTypes.map(item => (
                      <label key={item} className="flex items-center gap-2.5 text-xs text-[#637368] cursor-pointer hover:text-[#1c2e24]">
                        <input
                          type="checkbox"
                          checked={selectedTypes.includes(item)}
                          onChange={() => toggleType(item)}
                          className="h-4 w-4 rounded border-[#d8d5cc] text-[#1e3d2f] focus:ring-[#1e3d2f]"
                        />
                        <span>{item}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Jar Size Filter */}
              {showHoney && (
                <div className="pt-5 border-t border-[#f0ede6]">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#8a9890]">Pack Size</h3>
                    {selectedSizes.length > 0 && (
                      <button onClick={() => setSelectedSizes([])} className="text-[10px] text-[#c98a2c] font-semibold hover:underline">
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {sizes.map(size => {
                      const isSelected = selectedSizes.includes(size);
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => toggleSize(size)}
                          className={`px-2.5 py-1.5 text-xs rounded-lg font-medium border text-center transition ${
                            isSelected
                              ? "border-[#1e3d2f] bg-[#1e3d2f] text-white"
                              : "border-[#e8e5dc] text-[#637368] hover:border-[#1e3d2f] hover:text-[#1c2e24]"
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Clear all active filters */}
              {activeFilterCount > 0 && (
                <button
                  onClick={() => { setSelectedTypes([]); setSelectedSizes([]); }}
                  className="w-full text-xs font-semibold py-2 px-3 rounded-xl border border-[#e8e5dc] text-[#637368] hover:bg-[#f4f2eb] hover:text-[#1c2e24] transition"
                >
                  Clear all filters ({activeFilterCount})
                </button>
              )}
            </div>
          </aside>

          {/* Catalog Main Panel */}
          <div>
            {/* Top Toolbar (Search, Filter Button, Sort Dropdown) */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="relative flex-1 min-w-[220px] max-w-md">
                <input
                  type="text"
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  placeholder="Search by honey name, notes, or equipment..."
                  className="min-input pl-9 text-xs"
                />
                <span className="absolute left-3 top-2.5 text-xs text-[#8a9890]">⌕</span>
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="absolute right-3 top-2.5 text-xs text-[#8a9890] hover:text-[#1c2e24]"
                    title="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMobileFilterOpen(true)}
                  className="lg:hidden btn-secondary !py-2 !px-3 text-xs"
                >
                  Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                </button>

                <div className="flex items-center gap-2 text-xs text-[#637368]">
                  <span className="hidden sm:inline">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="min-input !w-auto text-xs py-2 pr-8"
                    aria-label="Sort products"
                  >
                    {sortOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Honey Products Section */}
            {showHoney && (
              <div className="mb-14">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-lg font-bold text-[#1c2e24]">Honey Varieties</h2>
                    <p className="text-xs text-[#8a9890]">100% Unpasteurized, Raw & Filtered Only Once</p>
                  </div>
                  <span className="text-xs font-semibold text-[#8a9890]">{filteredProducts.length} items</span>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredProducts.map((product: Product) => (
                    <article
                      key={product.id}
                      className="min-card group flex flex-col justify-between overflow-hidden"
                    >
                      {/* Product Visual Container */}
                      <Link
                        href={`/products/${product.id}`}
                        className="relative block h-56 w-full overflow-hidden bg-[#f4f2eb]"
                      >
                        {product.images && product.images.length > 0 && product.images[0]?.url ? (
                          <img
                            src={product.images[0].url}
                            alt={product.images[0].alt || product.name}
                            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <JarIllustration name={product.name} color={product.color} />
                        )}

                        {/* Size Badge */}
                        <span className="absolute top-3 right-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-[#1c2e24] shadow-xs backdrop-blur-xs">
                          {product.size || "500 g"}
                        </span>

                        {/* Best seller or Pure Harvest badge */}
                        <span className="absolute top-3 left-3 rounded-full bg-[#1e3d2f]/90 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider backdrop-blur-xs">
                          Raw Honey
                        </span>
                      </Link>

                      {/* Card Content Details */}
                      <div className="p-5 flex flex-1 flex-col justify-between">
                        <div>
                          {/* Rating & reviews */}
                          <div className="flex items-center gap-1 text-xs text-[#c98a2c]">
                            <span>★</span>
                            <span className="font-bold text-[#1c2e24]">{product.rating}</span>
                            <span className="text-[#8a9890]">({product.reviews} reviews)</span>
                          </div>

                          {/* Title and price */}
                          <div className="mt-2 flex items-start justify-between gap-2">
                            <Link href={`/products/${product.id}`} className="hover:text-[#c98a2c] transition">
                              <h3 className="font-bold text-base text-[#1c2e24] leading-snug">{product.name}</h3>
                            </Link>
                            <span className="text-base font-bold text-[#c98a2c] shrink-0">{product.priceLabel}</span>
                          </div>

                          <p className="mt-1.5 text-xs leading-relaxed text-[#637368] line-clamp-2">
                            {product.description}
                          </p>
                        </div>

                        {/* Action buttons */}
                        <div className="mt-5 pt-3.5 border-t border-[#f0ede6] flex items-center gap-2">
                          <Link
                            href={`/products/${product.id}`}
                            className="btn-secondary !text-xs !py-2 flex-1 text-center font-medium"
                          >
                            Details
                          </Link>
                          <Link
                            href={`/contact?product=${product.id}&name=${encodeURIComponent(product.name)}&qty=1`}
                            className="btn-primary !text-xs !py-2 flex-1 text-center"
                          >
                            Enquire
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {filteredProducts.length === 0 && (
                  <div className="min-card p-12 text-center">
                    <p className="font-semibold text-base text-[#1c2e24]">No honey products match your criteria</p>
                    <p className="mt-1 text-xs text-[#637368]">Try resetting your search query or variety filters.</p>
                    <button
                      onClick={() => { setQuery(""); setSelectedTypes([]); setSelectedSizes([]); }}
                      className="btn-secondary text-xs mt-4"
                    >
                      Reset filters
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Equipment Section */}
            {showEquipment && filteredEquipment.length > 0 && (
              <div className="mb-14">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-lg font-bold text-[#1c2e24]">Beekeeping Equipment & Hardware</h2>
                    <p className="text-xs text-[#8a9890]">Smokers, protective suits, extraction tools, and hive components</p>
                  </div>
                  <span className="text-xs font-semibold text-[#8a9890]">{filteredEquipment.length} items</span>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredEquipment.map((item) => (
                    <article key={item.id} className="min-card flex flex-col justify-between overflow-hidden group">
                      <div className="relative flex h-48 items-center justify-center bg-[#f4f2eb] overflow-hidden">
                        {item.images && item.images.length > 0 && item.images[0]?.url ? (
                          <img src={item.images[0].url} alt={item.name} className="h-full w-full object-cover transition group-hover:scale-105" />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-[#9c7246]">
                            <span className="text-4xl">🛠️</span>
                            <span className="mt-2 text-[10px] font-bold uppercase tracking-wider text-[#8a9890]">Hardware</span>
                          </div>
                        )}
                      </div>

                      <div className="p-5 flex flex-1 flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-bold text-sm text-[#1c2e24]">{item.name}</h3>
                            <strong className="text-sm font-bold text-[#c98a2c] shrink-0">{item.priceLabel}</strong>
                          </div>
                          <p className="mt-1.5 text-xs text-[#637368] line-clamp-2 leading-relaxed">{item.description}</p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-[#f0ede6]">
                          <Link
                            href={`/contact?product=${item.id}&name=${encodeURIComponent(item.name)}&qty=1`}
                            className="btn-primary !text-xs !py-2 w-full text-center"
                          >
                            Enquire / Order
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {/* Bees Section */}
            {showBees && filteredBees.length > 0 && (
              <div className="mb-14">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-lg font-bold text-[#1c2e24]">Live Colonies & Queen Bees</h2>
                    <p className="text-xs text-[#8a9890]">Disease-screened healthy colonies with mated queens</p>
                  </div>
                  <span className="text-xs font-semibold text-[#8a9890]">{filteredBees.length} items</span>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredBees.map((item) => (
                    <article key={item.id} className="min-card flex flex-col justify-between overflow-hidden group">
                      <div className="relative flex h-48 items-center justify-center bg-[#f4f2eb] overflow-hidden">
                        {item.images && item.images.length > 0 && item.images[0]?.url ? (
                          <img src={item.images[0].url} alt={item.name} className="h-full w-full object-cover transition group-hover:scale-105" />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-[#c98a2c]">
                            <span className="text-4xl">🐝</span>
                            <span className="mt-2 text-[10px] font-bold uppercase tracking-wider text-[#8a9890]">Live Colony</span>
                          </div>
                        )}
                      </div>

                      <div className="p-5 flex flex-1 flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-bold text-sm text-[#1c2e24]">{item.name}</h3>
                            <strong className="text-sm font-bold text-[#c98a2c] shrink-0">{item.priceLabel}</strong>
                          </div>
                          <p className="mt-1.5 text-xs text-[#637368] line-clamp-2 leading-relaxed">{item.description}</p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-[#f0ede6]">
                          <Link
                            href={`/contact?product=${item.id}&name=${encodeURIComponent(item.name)}&qty=1`}
                            className="btn-primary !text-xs !py-2 w-full text-center"
                          >
                            Enquire for Colony
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer Backdrop */}
      {mobileFilterOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileFilterOpen(false)}
        />
      )}

      {/* Shared Minimal Footer */}
      <Footer />
    </main>
  );
}
