"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getProduct, getProducts, type ApiProduct } from "@/lib/api";

function formatCurrency(amount: number, currency: string = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function JarIllustration({ name }: { name: string }) {
  return (
    <div className="relative flex h-full w-full min-h-[340px] items-center justify-center p-8 bg-gradient-to-b from-[#faf7f0] to-[#f4eee1] select-none">
      <div className="absolute h-48 w-48 rounded-full bg-[#d99b24] blur-3xl opacity-30" />
      <div className="relative flex flex-col items-center">
        <div className="h-4 w-24 rounded-t-sm bg-[#9c7246] shadow-xs border-b border-[#7d5630]" />
        <div className="h-2 w-20 bg-[#7d5630]" />
        <div className="relative h-44 w-36 rounded-b-2xl border border-white/70 bg-white/40 shadow-md backdrop-blur-xs overflow-hidden flex flex-col justify-end p-2.5">
          <div
            className="w-full rounded-b-xl shadow-inner"
            style={{
              height: "80%",
              background: "linear-gradient(180deg, #e8a938dd 0%, #c98a2c 100%)",
            }}
          />
          <div className="absolute inset-x-3 top-10 flex flex-col items-center justify-center rounded-sm bg-white/95 py-2 px-1 shadow-xs border border-[#eae5d8]">
            <span className="text-[9px] font-black tracking-[0.2em] text-[#1e3d2f] uppercase">WILDHIVE</span>
            <span className="text-[7px] font-semibold text-[#c98a2c] uppercase tracking-wider">RAW HONEY</span>
            <span className="mt-1 text-[8px] font-bold text-[#1c2e24] line-clamp-2 text-center leading-tight">
              {name}
            </span>
          </div>
          <div className="absolute left-2 top-3 bottom-3 w-1.5 rounded-full bg-white/30" />
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ApiProduct[]>([]);
  const [error, setError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"details" | "benefits" | "purity" | "specs">("details");

  useEffect(() => {
    params.then(({ id }) => {
      getProduct(id)
        .then((p) => {
          setProduct(p);
          if (p.variants && p.variants.length > 0) {
            setSelectedVariantIndex(0);
          }
        })
        .catch(() => setError(true));

      // Fetch related products
      getProducts({ per_page: 4 })
        .then((res) => {
          const others = res.products.filter((item) => item.id !== id).slice(0, 3);
          setRelatedProducts(others);
        })
        .catch(() => {});
    });
  }, [params]);

  if (!product && !error) {
    return (
      <main className="min-h-screen bg-[#faf9f5] text-[#1c2e24]">
        <Header />
        <div className="mx-auto max-w-6xl px-6 py-32 flex flex-col items-center justify-center gap-4 text-center">
          <span className="h-8 w-8 animate-spin rounded-full border-3 border-[#1e3d2f] border-t-transparent" />
          <p className="text-xs font-semibold uppercase tracking-wider text-[#8a948c]">
            Gathering harvest details...
          </p>
        </div>
        <Footer />
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-[#faf9f5] text-[#1c2e24]">
        <Header />
        <div className="mx-auto max-w-xl px-6 py-32 text-center">
          <div className="rounded-2xl border border-[#ede8dd] bg-white p-8 shadow-xs">
            <span className="text-4xl">🍯</span>
            <h1 className="mt-4 text-xl font-bold text-[#1c2e24]">Product Not Found</h1>
            <p className="mt-2 text-xs sm:text-sm text-[#6b7770]">
              The requested honey batch could not be found or has been moved.
            </p>
            <div className="mt-6">
              <Link
                href="/products"
                className="inline-block rounded-full bg-[#1e3d2f] px-6 py-2.5 text-xs font-semibold text-white transition hover:bg-[#152c22]"
              >
                Explore All Products
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  const selectedVariant =
    selectedVariantIndex !== null && product.variants?.[selectedVariantIndex]
      ? product.variants[selectedVariantIndex]
      : null;

  const currentPrice = selectedVariant ? selectedVariant.price : product.price_inr || product.price;
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
  const currentSku = selectedVariant ? selectedVariant.sku : product.sku;

  const images = product.images && product.images.length > 0 ? product.images : [];
  const activeImage = images[selectedImageIndex] || images[0];

  const subtotal = currentPrice * quantity;

  function openAIChat() {
    window.dispatchEvent(new CustomEvent("open-chat"));
  }

  return (
    <main className="min-h-screen bg-[#faf9f5] text-[#1c2e24]">
      <Header />

      <div className="mx-auto max-w-6xl px-6 pb-20 pt-28">
        {/* Breadcrumb Navigation */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-[#8a948c]" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-[#1c2e24] transition">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-[#1c2e24] transition">Products</Link>
          <span>/</span>
          <span className="text-[#525e56]">{product.category_name || "Honey"}</span>
          <span>/</span>
          <span className="font-semibold text-[#1c2e24] truncate max-w-[200px] sm:max-w-none">{product.name}</span>
        </nav>

        {/* Product Hero Grid */}
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          {/* Left Column: Image & Gallery & Trust Guarantees */}
          <div className="flex flex-col gap-5">
            <div className="relative flex min-h-[380px] max-h-[500px] items-center justify-center overflow-hidden rounded-3xl border border-[#ede8dd] bg-[#f4f2eb] shadow-xs group">
              {activeImage?.url ? (
                <div className="p-8 h-full w-full flex items-center justify-center">
                  <img
                    src={activeImage.url}
                    alt={activeImage.alt || product.name}
                    className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                  />
                </div>
              ) : (
                <JarIllustration name={product.name} />
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                <span className="rounded-full border border-emerald-200 bg-emerald-50/90 backdrop-blur-xs px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                  100% Raw Forest Harvest
                </span>
              </div>
            </div>

            {/* Thumbnail Row */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                      selectedImageIndex === idx
                        ? "border-[#1e3d2f] shadow-xs"
                        : "border-[#ede8dd] opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={img.alt || product.name}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Trust Badges Bar */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-start gap-2.5 rounded-xl border border-[#ede8dd] bg-white p-3.5 shadow-xs">
                <span className="text-base text-[#1e3d2f]">🌿</span>
                <div>
                  <p className="text-xs font-bold text-[#1c2e24]">Unpasteurized</p>
                  <p className="text-[10px] text-[#6b7770]">Preserves natural bee pollen & active enzymes</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 rounded-xl border border-[#ede8dd] bg-white p-3.5 shadow-xs">
                <span className="text-base text-[#c98a2c]">🔬</span>
                <div>
                  <p className="text-xs font-bold text-[#1c2e24]">Lab Certified</p>
                  <p className="text-[10px] text-[#6b7770]">Tested negative for synthetic sugar syrup</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 rounded-xl border border-[#ede8dd] bg-white p-3.5 shadow-xs">
                <span className="text-base text-[#1e3d2f]">📦</span>
                <div>
                  <p className="text-xs font-bold text-[#1c2e24]">Glass Jar Pack</p>
                  <p className="text-[10px] text-[#6b7770]">No plastic leaching, airtight seal guarantee</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 rounded-xl border border-[#ede8dd] bg-white p-3.5 shadow-xs">
                <span className="text-base text-[#c98a2c]">🚚</span>
                <div>
                  <p className="text-xs font-bold text-[#1c2e24]">Safe Delivery</p>
                  <p className="text-[10px] text-[#6b7770]">Dispatched direct from our Nilgiri hive store</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Product Specs, Variants, Quantity & Actions */}
          <div className="space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="rounded-full bg-[#1e3d2f]/10 px-3 py-0.5 text-[11px] font-semibold tracking-wider uppercase text-[#1e3d2f]">
                  {product.category_name || "Raw Honey"}
                </span>

                {/* Stock Status Badge */}
                {currentStock === 0 ? (
                  <span className="rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-[11px] font-bold text-red-700">
                    ● Temporarily Sold Out
                  </span>
                ) : currentStock <= product.low_stock_threshold ? (
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                    ● Limited Batch (Only {currentStock} left)
                  </span>
                ) : (
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                    ● Fresh Stock Ready to Dispatch
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1c2e24]">
                {product.name}
              </h1>

              {product.flavour_profile && (
                <p className="mt-1 text-xs font-medium text-[#c98a2c]">
                  Notes: {product.flavour_profile}
                </p>
              )}
            </div>

            {/* Price Block */}
            <div className="rounded-2xl border border-[#ede8dd] bg-white p-5 shadow-xs">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-[#c98a2c]">
                  {formatCurrency(currentPrice, product.currency)}
                </span>
                {product.sale_price && product.sale_price < currentPrice && (
                  <span className="text-sm font-medium text-[#8a948c] line-through">
                    {formatCurrency(product.price, product.currency)}
                  </span>
                )}
                {product.sale_price && product.sale_price < currentPrice && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    Special Offer
                  </span>
                )}
              </div>
              <p className="mt-1 text-[11px] text-[#6b7770]">
                All taxes included. Free courier delivery across India on orders over ₹999.
              </p>
            </div>

            {/* Variants Selector */}
            {product.variants && product.variants.length > 0 && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#6b7770] mb-2">
                  Select Size / Variant
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant, idx) => (
                    <button
                      key={variant.id || idx}
                      type="button"
                      onClick={() => {
                        setSelectedVariantIndex(idx);
                        if (typeof variant.imageIndex === "number") {
                          setSelectedImageIndex(variant.imageIndex);
                        }
                      }}
                      className={`rounded-xl border px-4 py-2.5 text-xs font-semibold transition ${
                        selectedVariantIndex === idx
                          ? "border-[#1e3d2f] bg-[#1e3d2f] text-white shadow-xs"
                          : "border-[#ede8dd] bg-white text-[#1c2e24] hover:border-[#1e3d2f]"
                      }`}
                    >
                      <span>{variant.name || `Option ${idx + 1}`}</span>
                      <span className="ml-1.5 opacity-80">· {formatCurrency(variant.price, product.currency)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Bulk Price Tiers */}
            {product.price_tiers && product.price_tiers.length > 0 && (
              <div className="rounded-2xl border border-[#ede8dd] bg-white p-4 shadow-xs">
                <p className="text-xs font-bold uppercase tracking-wider text-[#c98a2c]">
                  Bulk Family & Hive Savings
                </p>
                <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {product.price_tiers.map((tier, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-[#ede8dd] bg-[#faf9f5] p-2.5 text-center"
                    >
                      <span className="block text-[10px] font-medium text-[#6b7770]">
                        {tier.minQty}{tier.maxQty ? ` - ${tier.maxQty}` : "+"} jars
                      </span>
                      <strong className="block text-xs font-bold text-[#1c2e24]">
                        {formatCurrency(tier.price, tier.currency || product.currency)} / jar
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interactive Quantity & Action Bar */}
            <div className="space-y-3 rounded-2xl border border-[#ede8dd] bg-white p-5 shadow-xs">
              {currentStock > 0 ? (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#6b7770]">Quantity</span>
                    <div className="flex items-center gap-1 rounded-full border border-[#ede8dd] bg-[#faf9f5] p-1">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-base font-bold text-[#1c2e24] transition hover:bg-white disabled:opacity-30"
                        disabled={quantity <= 1}
                        aria-label="Decrease quantity"
                      >
                        –
                      </button>
                      <span className="w-10 text-center text-xs font-bold text-[#1c2e24]">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-base font-bold text-[#1c2e24] transition hover:bg-white disabled:opacity-30"
                        disabled={quantity >= currentStock}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#ede8dd] pt-3 text-xs">
                    <span className="text-[#6b7770]">Estimated Subtotal</span>
                    <strong className="text-base font-bold text-[#1c2e24]">
                      {formatCurrency(subtotal, product.currency)}
                    </strong>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                    <Link
                      href={`/contact?product=${product.id}&name=${encodeURIComponent(product.name)}&qty=${quantity}${selectedVariant ? `&variant=${encodeURIComponent(selectedVariant.name)}` : ""}`}
                      className="flex-1 rounded-full bg-[#1e3d2f] py-3 text-center text-xs sm:text-sm font-semibold text-white shadow-xs transition hover:bg-[#152c22]"
                    >
                      Enquire / Order {quantity} Jar{quantity > 1 ? "s" : ""}
                    </Link>
                    <button
                      type="button"
                      onClick={openAIChat}
                      className="rounded-full border border-[#ede8dd] bg-[#faf9f5] px-4 py-3 text-center text-xs font-semibold text-[#1c2e24] transition hover:bg-[#ede8dd]/50"
                    >
                      ✦ Ask AI Guide
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-3 text-center py-2">
                  <p className="text-xs text-[#6b7770]">
                    This specific forest batch is currently out of stock while bees forage the next bloom.
                  </p>
                  <Link
                    href={`/contact?product=${product.id}&name=${encodeURIComponent(product.name)}&subject=Out+of+Stock+Notification`}
                    className="inline-block w-full rounded-full border border-[#1e3d2f] bg-[#1e3d2f] py-3 text-xs font-semibold text-white transition hover:bg-[#152c22]"
                  >
                    Notify When Harvest Arrives
                  </Link>
                </div>
              )}
            </div>

            {/* Information Tabs */}
            <div className="rounded-2xl border border-[#ede8dd] bg-white overflow-hidden shadow-xs">
              {/* Tab Navigation */}
              <div className="flex border-b border-[#ede8dd] bg-[#faf9f5] overflow-x-auto text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab("details")}
                  className={`px-4 py-3 whitespace-nowrap transition ${
                    activeTab === "details"
                      ? "border-b-2 border-[#1e3d2f] text-[#1e3d2f] bg-white"
                      : "text-[#6b7770] hover:text-[#1c2e24]"
                  }`}
                >
                  Overview & Origin
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("benefits")}
                  className={`px-4 py-3 whitespace-nowrap transition ${
                    activeTab === "benefits"
                      ? "border-b-2 border-[#1e3d2f] text-[#1e3d2f] bg-white"
                      : "text-[#6b7770] hover:text-[#1c2e24]"
                  }`}
                >
                  Health Benefits
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("purity")}
                  className={`px-4 py-3 whitespace-nowrap transition ${
                    activeTab === "purity"
                      ? "border-b-2 border-[#1e3d2f] text-[#1e3d2f] bg-white"
                      : "text-[#6b7770] hover:text-[#1c2e24]"
                  }`}
                >
                  Crystallization Guide
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("specs")}
                  className={`px-4 py-3 whitespace-nowrap transition ${
                    activeTab === "specs"
                      ? "border-b-2 border-[#1e3d2f] text-[#1e3d2f] bg-white"
                      : "text-[#6b7770] hover:text-[#1c2e24]"
                  }`}
                >
                  Specifications
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-5 text-xs sm:text-sm leading-relaxed text-[#525e56]">
                {activeTab === "details" && (
                  <div className="space-y-3">
                    <p>
                      {product.description ||
                        product.full_description ||
                        "Our raw forest honey is harvested straight from remote flowering reserves without industrial pasteurization or micro-filtration."}
                    </p>
                    {product.source_description && (
                      <div className="rounded-xl border border-[#ede8dd] bg-[#faf9f5] p-3 text-xs">
                        <strong className="block text-[#1c2e24] mb-0.5">Harvest Source:</strong>
                        <span>{product.source_description}</span>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "benefits" && (
                  <ul className="list-disc space-y-2 pl-4 text-xs">
                    <li><strong className="text-[#1c2e24]">Enzyme Rich:</strong> Unheated extraction preserves glucose oxidase and invertase enzymes.</li>
                    <li><strong className="text-[#1c2e24]">Natural Antioxidants:</strong> Contains plant flavonoids and phenolic acids reflecting wild flora.</li>
                    <li><strong className="text-[#1c2e24]">Gentle Throat Soother:</strong> Thick natural consistency provides comforting relief for dry throats.</li>
                    <li><strong className="text-[#1c2e24]">Prebiotic Support:</strong> Supports healthy gut microbiome flora naturally.</li>
                  </ul>
                )}

                {activeTab === "purity" && (
                  <div className="space-y-2.5 text-xs">
                    <p className="font-semibold text-[#1c2e24]">
                      Real Raw Honey Naturally Crystallizes:
                    </p>
                    <p>
                      Crystallization is the hallmark of genuine, unprocessed honey containing natural floral pollens. If your honey sets or granulates over time, it is proof of zero ultra-heating.
                    </p>
                    <p className="text-[#6b7770]">
                      To re-liquefy, gently place the glass jar into a bowl of warm water (under 40°C) for a few minutes. Never microwave raw honey as extreme heat damages its natural enzymes.
                    </p>
                  </div>
                )}

                {activeTab === "specs" && (
                  <dl className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <dt className="text-[#8a948c]">SKU Code</dt>
                      <dd className="font-mono font-medium text-[#1c2e24]">{currentSku}</dd>
                    </div>
                    <div>
                      <dt className="text-[#8a948c]">Net Weight</dt>
                      <dd className="font-medium text-[#1c2e24]">
                        {product.weight
                          ? `${product.weight} ${product.weight_unit}`
                          : product.weight_grams
                          ? `${product.weight_grams} g`
                          : "Standard 500 g"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[#8a948c]">Container</dt>
                      <dd className="font-medium text-[#1c2e24]">Food-grade Glass Jar</dd>
                    </div>
                    <div>
                      <dt className="text-[#8a948c]">Category</dt>
                      <dd className="font-medium text-[#1c2e24]">{product.category_name || "Honey"}</dd>
                    </div>
                    {product.custom_fields && Object.entries(product.custom_fields).map(([k, v]) => (
                      <div key={k}>
                        <dt className="text-[#8a948c] capitalize">{k.replace(/_/g, " ")}</dt>
                        <dd className="font-medium text-[#1c2e24]">{String(v)}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* You May Also Like Section */}
        {relatedProducts.length > 0 && (
          <section className="mt-20 pt-12 border-t border-[#ede8dd]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-[#1c2e24]">
                  Other Wild Harvester Selections
                </h2>
                <p className="text-xs text-[#6b7770] mt-0.5">
                  Complement your pantry with different seasonal forest blooms
                </p>
              </div>
              <Link href="/products" className="text-xs font-semibold text-[#c98a2c] hover:underline">
                View All Varieties →
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              {relatedProducts.map((item) => (
                <article key={item.id} className="rounded-2xl border border-[#ede8dd] bg-white overflow-hidden shadow-xs flex flex-col justify-between group transition hover:border-[#1e3d2f]/40">
                  <Link href={`/products/${item.id}`} className="block h-44 bg-[#f4f2eb] overflow-hidden flex items-center justify-center">
                    {item.images?.[0]?.url ? (
                      <img
                        src={item.images[0].url}
                        alt={item.name}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <span className="text-5xl">🍯</span>
                    )}
                  </Link>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link href={`/products/${item.id}`} className="font-bold text-sm text-[#1c2e24] hover:text-[#c98a2c] transition">
                          {item.name}
                        </Link>
                        <strong className="text-xs font-bold text-[#c98a2c]">
                          {formatCurrency(item.price_inr || item.price, item.currency)}
                        </strong>
                      </div>
                      <p className="mt-1 text-xs text-[#6b7770] line-clamp-2">
                        {item.description || item.short_description || "Pure raw Nilgiri forest honey."}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#ede8dd] flex items-center gap-2">
                      <Link
                        href={`/products/${item.id}`}
                        className="flex-1 rounded-full border border-[#ede8dd] bg-[#faf9f5] py-1.5 text-center text-xs font-semibold text-[#1c2e24] hover:bg-[#ede8dd]/50"
                      >
                        Details
                      </Link>
                      <Link
                        href={`/contact?product=${item.id}&name=${encodeURIComponent(item.name)}&qty=1`}
                        className="flex-1 rounded-full bg-[#1e3d2f] py-1.5 text-center text-xs font-semibold text-white hover:bg-[#152c22]"
                      >
                        Enquire
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </main>
  );
}