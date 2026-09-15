"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { getProduct, type ApiProduct } from "@/lib/api";

function formatPrice(product: ApiProduct) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: product.currency || "INR", maximumFractionDigits: 0 }).format(product.price);
}

export default function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [error, setError] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    params.then(({ id }) => getProduct(id).then(setProduct).catch(() => setError(true)));
  }, [params]);

  if (!product && !error) {
    return <main className="products-page flex min-h-screen items-center justify-center bg-[#fbfaf5] text-sm text-[#657168]">Loading product...</main>;
  }

  if (error || !product) {
    return (
      <main className="products-page flex min-h-screen flex-col items-center justify-center gap-3 bg-[#fbfaf5] text-center text-[#243b2a]">
        <p className="text-lg font-semibold">Product not found</p>
        <a href="/products" className="rounded-full bg-[#19553a] px-5 py-2 text-xs font-semibold text-white">Back to products</a>
      </main>
    );
  }

  const image = product.images?.[0];
  const availability = product.stock === 0 ? "Out of stock" : product.stock <= product.low_stock_threshold ? "Low stock" : "In stock";

  return (
    <main className="products-page min-h-screen bg-[#fbfaf5] text-[#243b2a]">
      <Header dark />
      <div className="mx-auto grid max-w-6xl gap-12 px-6 pb-20 pt-32 md:grid-cols-2 md:items-center">
        <div className="flex min-h-[420px] items-center justify-center overflow-hidden rounded-3xl border border-[#eee7d8] bg-[#f1eadb]">
          {image?.url ? <img src={image.url} alt={image.alt || product.name} className="h-full max-h-[520px] w-full object-cover" /> : <div className="text-6xl text-[#b87819]">✽</div>}
        </div>
        <div>
          <a href="/products" className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9b6417]">Our products</a>
          <p className="mt-6 text-sm font-medium text-[#6f7b72]">{product.category_name || "WildHive collection"}</p>
          <h1 className="mt-2 font-serif text-4xl font-bold text-[#243b2a] sm:text-5xl">{product.name}</h1>
          <p className="mt-6 text-2xl font-bold text-[#d88a16]">{formatPrice(product)}</p>
          <p className={`mt-3 text-sm font-semibold ${product.stock === 0 ? "text-[#b94e38]" : product.stock <= product.low_stock_threshold ? "text-[#b87919]" : "text-[#35734e]"}`}>{availability}</p>
          <p className="mt-6 max-w-xl leading-7 text-[#657168]">{product.description || product.full_description || "Pure, naturally harvested goodness from WildHive."}</p>
          <div className="mt-8 flex items-center gap-3">
            <label className="flex items-center rounded-full border border-[#e4e5db] bg-white px-3 py-2 text-sm"><span className="mr-3 text-[#879088]">Qty</span><input type="number" min="1" max={Math.max(1, product.stock)} value={quantity} onChange={event => setQuantity(Math.max(1, Number(event.target.value)))} className="w-12 bg-transparent text-center outline-none" /></label>
            <a href="/contact" className="rounded-full bg-[#315c3a] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#264b2f]">Enquire Now</a>
          </div>
          <dl className="mt-10 grid grid-cols-2 gap-4 border-t border-[#eee7d8] pt-6 text-sm"><div><dt className="text-[#879088]">SKU</dt><dd className="mt-1 font-medium">{product.sku}</dd></div><div><dt className="text-[#879088]">Weight</dt><dd className="mt-1 font-medium">{product.weight ? `${product.weight} ${product.weight_unit}` : "As listed"}</dd></div></dl>
        </div>
      </div>
    </main>
  );
}