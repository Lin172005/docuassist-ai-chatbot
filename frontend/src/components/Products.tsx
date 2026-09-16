"use client";

import Link from "next/link";
import { useProductContext } from "@/context/ProductContext";

export default function Products() {
  const { getActiveProducts } = useProductContext();
  const allActive = getActiveProducts();
  const featured = allActive.filter(p => p.category === "Honey").slice(0, 3);

  const displayList = featured.length > 0 ? featured : [
    {
      id: "wildflower",
      name: "Wildflower Honey",
      description: "A smooth, floral honey collected from bees foraging across seasonal wildflowers.",
      size: "500 g",
      priceLabel: "₹349",
      color: "#f6cc72",
      images: [],
    },
    {
      id: "forest",
      name: "Forest Honey",
      description: "A rich and full-bodied honey sourced from flowering trees in natural forest regions.",
      size: "500 g",
      priceLabel: "₹449",
      color: "#b9c99b",
      images: [],
    },
    {
      id: "jamun",
      name: "Jamun Honey",
      description: "A distinctive honey with deep colour and a mildly tangy flavour from Jamun blossoms.",
      size: "500 g",
      priceLabel: "₹399",
      color: "#c6adca",
      images: [],
    },
  ];

  return (
    <section id="products" className="bg-[#faf9f5] border-t border-[#e8e5dc] px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c98a2c]">
              Pure Harvest
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#1c2e24] sm:text-4xl">
              Featured Honey Varieties
            </h2>
            <p className="mt-3 max-w-2xl text-base text-[#637368]">
              Discover raw, unadulterated varieties harvest-fresh from native floral blooms.
            </p>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1e3d2f] hover:text-[#c98a2c] transition"
          >
            Explore all items <span>→</span>
          </Link>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {displayList.map((product) => (
            <article
              key={product.name}
              className="group min-card flex flex-col overflow-hidden"
            >
              <div className="relative flex h-56 items-center justify-center bg-[#f4f2eb] p-6 overflow-hidden">
                {product.images && product.images[0]?.url ? (
                  <img
                    src={product.images[0].url}
                    alt={product.name}
                    className="h-full w-full object-cover rounded-xl transition duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-5xl text-[#c98a2c]">🍯</span>
                    <span className="mt-2 text-xs font-semibold text-[#637368] uppercase tracking-wider">
                      {product.size || "500g"}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-6 flex flex-1 flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-lg font-bold text-[#1c2e24]">
                      {product.name}
                    </h3>
                    <p className="text-base font-bold text-[#c98a2c]">
                      {product.priceLabel}
                    </p>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-[#637368] line-clamp-2">
                    {product.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#f0ede6] flex items-center justify-between">
                  <span className="text-xs text-[#8a9890]">{product.size || "500 g"}</span>
                  <Link
                    href={`/products/${product.id}`}
                    className="btn-primary text-xs !py-2 !px-4"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}