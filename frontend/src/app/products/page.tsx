"use client";

import { useMemo, useState } from "react";
import Header from "@/components/Header";
import { useProductContext } from "@/context/ProductContext";

const sizes = ["250 g", "500 g", "1 kg", "5 kg+"];
const sortOptions = ["Popularity", "Price: Low to High", "Price: High to Low", "Rating", "Name: A-Z"] as const;

function ProductJar({ color }: { color: string }) {
  return (
    <div className="jar" style={{ background: `linear-gradient(90deg, #a85b0f, ${color}, #f5c34a)` }}>
      <div className="jar-lid" />
      <div className="jar-label"><span>WildHive</span><small>RAW HONEY</small></div>
    </div>
  );
}

export default function ProductsPage() {
  const { getActiveProducts, getProductsByCategory } = useProductContext();

  const allActive = useMemo(() => getActiveProducts(), [getActiveProducts]);
  const honeyProducts = useMemo(() => allActive.filter(p => p.category === "Honey"), [allActive]);
  const equipmentProducts = useMemo(() => allActive.filter(p => p.category === "Equipment"), [allActive]);
  const beeProducts = useMemo(() => allActive.filter(p => p.category === "Bees"), [allActive]);

  const honeyTypes = useMemo(() => [...new Set(honeyProducts.map(p => p.type))], [honeyProducts]);

  const categories = useMemo(() => [
    { name: "All Products", icon: "▦", count: allActive.length + 2 },
    { name: "Honey Varieties", icon: "♧", count: honeyProducts.length },
    { name: "Bee Boxes", icon: "□", count: equipmentProducts.filter(e => e.name.toLowerCase().includes("box")).length || 1 },
    { name: "Beekeeping Equipment", icon: "♧", count: equipmentProducts.length },
    { name: "Bees for Sale", icon: "✽", count: beeProducts.length },
    { name: "Training & Courses", icon: "♧", count: 1 },
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
  const showTraining = category === "All Products" || category === "Training & Courses";

  const filteredProducts = useMemo(() => {
    let result = [...honeyProducts];

    if (query) {
      result = result.filter(p => p.name.toLowerCase().includes(query.toLowerCase()));
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
    if (category === "Bee Boxes") {
      return equipmentProducts.filter(e => e.name.toLowerCase().includes("box"));
    }
    return equipmentProducts;
  }, [equipmentProducts, category]);

  const activeFilterCount = selectedTypes.length + selectedSizes.length;
  const hasAnyContent = showHoney || showEquipment || showBees || showTraining;

  return (
    <main className="products-page min-h-screen bg-[#fbfaf5] text-[#243b2a]">
      <Header dark />

      {/* Store Hero */}
      <section className="store-hero mx-auto mt-20 max-w-[1440px] overflow-hidden rounded-b-xl bg-[#193a27] text-white">
        <div className="hero-copy">
          <p>OUR PRODUCTS</p>
          <h1>Premium Honey &amp;<br />Beekeeping Essentials</h1>
          <span>From pure natural honey to beekeeping equipment,<br />we have everything you need.</span>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="mx-auto max-w-[1440px] px-4 py-4 lg:px-5">
        <nav className="flex items-center gap-2 text-xs text-[#879088]">
          <a href="/" className="transition hover:text-[#d88a16]">Home</a>
          <span>/</span>
          <span className="font-medium text-[#243b2a]">Products</span>
          {category !== "All Products" && (
            <>
              <span>/</span>
              <span className="font-medium text-[#243b2a]">{category}</span>
            </>
          )}
        </nav>
      </div>

      {/* Main Content */}
      <section className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 md:grid-cols-[220px_1fr] lg:px-5">
        {/* Filter Sidebar */}
        <aside className={`filter-panel ${mobileFilterOpen ? "mobile-open" : ""}`}>
          <div className="category-list">
            {categories.map((item) => (
              <button
                key={item.name}
                onClick={() => { setCategory(item.name); setMobileFilterOpen(false); }}
                className={category === item.name ? "active" : ""}
              >
                <span className="category-icon">{item.icon}</span>
                {item.name}
                <small>{category === item.name ? "→" : `(${item.count})`}</small>
              </button>
            ))}
          </div>

          {/* Honey filters only visible when showing honey */}
          {showHoney && (
            <>
              <div className="filter-block">
                <h3>Filter</h3>
                <p>Honey Type</p>
                {honeyTypes.map(item => (
                  <label key={item}>
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(item)}
                      onChange={() => toggleType(item)}
                    />
                    {item}
                  </label>
                ))}
              </div>

              <div className="filter-block">
                <p>Size</p>
                {sizes.map(item => (
                  <label key={item}>
                    <input
                      type="checkbox"
                      checked={selectedSizes.includes(item)}
                      onChange={() => toggleSize(item)}
                    />
                    {item}
                  </label>
                ))}
              </div>
            </>
          )}

          {activeFilterCount > 0 && (
            <div className="filter-block">
              <button
                onClick={() => { setSelectedTypes([]); setSelectedSizes([]); }}
                className="w-full rounded-lg bg-[#e7eee5] px-3 py-2 text-xs font-semibold text-[#234a36] transition hover:bg-[#d4e2d0]"
              >
                Clear all filters ({activeFilterCount})
              </button>
            </div>
          )}
        </aside>

        {/* Catalog Content */}
        <div className="catalog-content">
          {/* Toolbar */}
          <div className="catalog-toolbar">
            <label className="search-box">
              <span>⌕</span>
              <input
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="Search products..."
              />
            </label>
            <button
              className="sort-button"
              onClick={() => {
                const currentIndex = sortOptions.indexOf(sortBy as typeof sortOptions[number]);
                setSortBy(sortOptions[(currentIndex + 1) % sortOptions.length]);
              }}
            >
              Sort by: {sortBy} <span>⌄</span>
            </button>
            <button
              className="mobile-filter-toggle"
              onClick={() => setMobileFilterOpen(true)}
            >
              Filter {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>
          </div>

          {/* Product Count */}
          <p className="mb-3 text-xs text-[#879088]">
            {category === "All Products"
              ? `Showing all ${allActive.length + 2} items`
              : category === "Bee Boxes"
                ? `Showing 1 item`
                : category === "Training & Courses"
                  ? `Showing 1 item`
                  : `Showing ${category === "Honey Varieties" ? filteredProducts.length : category === "Beekeeping Equipment" ? filteredEquipment.length : beeProducts.length} items`}
          </p>

          {/* Honey Products */}
          {showHoney && (
            <>
              <div className="product-layout">
                <div className="product-grid">
                  {filteredProducts.map((product, index) => (
                    <article className="product-card" key={product.name}>
                      <div className="product-image">
                        {product.images && product.images.length > 0 && product.images[0].url ? (
                          <img src={product.images[0].url} alt={product.images[0].alt || product.name} className="h-full w-full rounded-lg object-cover" />
                        ) : (
                          <ProductJar color={product.color} />
                        )}
                        {index === 0 && <b className="best-seller">Best Seller</b>}
                        <span className="sprigs">✽</span>
                      </div>
                      <div className="product-info">
                        <h2>{product.name}</h2>
                        <p>{product.description}</p>
                        <div className="rating">
                          ★ {product.rating} <small>({product.reviews})</small>
                        </div>
                        <div className="product-buy">
                          <strong>{product.priceLabel}</strong>
                          <span>{product.size}</span>
                        </div>
                        <a href="/contact">Enquire Now</a>
                      </div>
                    </article>
                  ))}
                </div>

                {filteredProducts.length > 0 && (
                  <div className="feature-card">
                    <div>
                      <p>Pure. Natural. Powerful.</p>
                      <span>Experience the goodness<br />of real honey.</span>
                      <a href="/contact">
                        Shop All Honey <b>→</b>
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {filteredProducts.length === 0 && (
                <div className="rounded-xl border border-[#e8e8df] bg-white p-12 text-center">
                  <p className="text-lg font-semibold text-[#243b2a]">No products found</p>
                  <p className="mt-2 text-sm text-[#879088]">Try adjusting your search or filters.</p>
                  <button
                    onClick={() => { setQuery(""); setSelectedTypes([]); setSelectedSizes([]); }}
                    className="mt-4 rounded-full bg-[#19553a] px-5 py-2 text-xs font-semibold text-white transition hover:bg-[#144530]"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </>
          )}

          {/* Equipment Section */}
          {showEquipment && (
            <section className="merch-section">
              <div className="section-heading">
                <h2>{category === "Bee Boxes" ? "Bee Boxes" : "Honey Bee Accessories & Equipment"}</h2>
                {category === "All Products" && <a href="/products" onClick={() => setCategory("Beekeeping Equipment")}>View All →</a>}
              </div>
              <div className="equipment-grid">
                {filteredEquipment.map((item, index) => (
                  <article key={item.name}>
                    <div className={`equipment-art art-${index}`}>
                      {item.images && item.images.length > 0 && item.images[0].url ? (
                        <img src={item.images[0].url} alt={item.images[0].alt || item.name} className="h-full w-full object-cover rounded-lg" />
                      ) : (
                        <span>{item.icon || "♧"}</span>
                      )}
                    </div>
                    <h3>{item.name}</h3>
                    <strong>{item.priceLabel}</strong>
                    <a href="/contact">Add to Cart</a>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Bees Section */}
          {showBees && (
            <section className="bees-section">
              <div>
                <div className="section-heading">
                  <h2>Bees for Sale</h2>
                </div>
                <div className="bee-list">
                  {beeProducts.map((item, index) => (
                    <article key={item.name}>
                      <div className="bee-art">
                        {item.images && item.images.length > 0 && item.images[0].url ? (
                          <img src={item.images[0].url} alt={item.images[0].alt || item.name} className="h-full w-full object-cover rounded-lg" />
                        ) : (
                          <span>✽</span>
                        )}
                      </div>
                      <h3>{item.name}</h3>
                      <p>{item.priceLabel} / colony</p>
                      <a href="/contact">Add to Cart</a>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Training Section */}
          {showTraining && (
            <section className="bees-section" style={{ marginTop: showBees ? 0 : 25 }}>
              <div className="training-card">
                <div>
                  <span>♧</span>
                  <h2>Beekeeping Training</h2>
                  <p>Learn from experts and start<br />your own honey business.</p>
                  <a href="/contact">View Courses →</a>
                </div>
              </div>
            </section>
          )}

          {/* Empty State */}
          {!hasAnyContent && (
            <div className="rounded-xl border border-[#e8e8df] bg-white p-12 text-center">
              <p className="text-lg font-semibold text-[#243b2a]">No items found</p>
              <p className="mt-2 text-sm text-[#879088]">Try a different category.</p>
            </div>
          )}
        </div>
      </section>

      {/* Mobile filter overlay */}
      {mobileFilterOpen && (
        <div className="filter-overlay" onClick={() => setMobileFilterOpen(false)} />
      )}
    </main>
  );
}
