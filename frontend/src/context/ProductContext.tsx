"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { type Product, seedProducts } from "@/lib/products";
import type { AdminProduct } from "@/lib/admin-products";

const ADMIN_STORAGE_KEY = "wildhive-admin";
const ADMIN_STORAGE_VERSION = 1;

interface AdminStoredData {
  version: number;
  products: AdminProduct[];
}

interface ProductContextType {
  products: Product[];
  isLoading: boolean;
  lastSynced: Date | null;

  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string, permanent: boolean) => void;
  addProduct: (product: Omit<Product, "createdAt">) => void;
  restoreProduct: (id: string) => void;
  bulkUpdate: (ids: string[], updates: Partial<Product>) => void;
  bulkDelete: (ids: string[], permanent: boolean) => void;

  getActiveProducts: () => Product[];
  getProductsByCategory: (category: string) => Product[];
  getProductById: (id: string) => Product | undefined;
}

const ProductContext = createContext<ProductContextType | null>(null);

const COLOR_MAP: Record<string, string> = {
  "Multi Flower": "#d99b24", "Leaf Nectar": "#e9b735", Kombu: "#bd6c13",
  Forest: "#a96318", Murngai: "#e3a62b", "Stingless Bee": "#c97818",
  "Bee Box": "#b8956a", Extractor: "#a0a0a0", Smoker: "#8a8a8a",
  Suit: "#e8e8e8", "Tool Set": "#c0a060",
  Italian: "#e8c84a", Carnolian: "#d4a840", Russian: "#c8a030",
  Blend: "#e0b050",
};

function mapAdminToProduct(p: AdminProduct): Product {
  const currencySymbol = p.currency === "USD" ? "$" : p.currency === "EUR" ? "€" : p.currency === "GBP" ? "£" : "₹";
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    category: p.category,
    price: p.price,
    priceLabel: `${currencySymbol}${p.price.toLocaleString("en-IN")}`,
    color: COLOR_MAP[p.subcategory] || "#d99b24",
    type: p.subcategory || p.category,
    size: p.variants?.[0]?.attributes?.size || "500 g",
    rating: "4.8",
    reviews: 200,
    images: (p.images || []).map(img => ({ id: img.id, url: img.url, alt: img.alt })),
    stock: p.stock,
    status: p.status === "published" ? "active" : p.status === "archived" ? "archived" : "inactive",
    lastUpdated: p.updatedAt?.slice(0, 10) || "",
    lowStockThreshold: p.lowStockThreshold,
    createdAt: p.createdAt,
  };
}

function loadFreshProducts(): Product[] {
  if (typeof window === "undefined") return seedProducts;
  try {
    const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (!raw) return seedProducts;
    const data: AdminStoredData = JSON.parse(raw);
    if (data.version !== ADMIN_STORAGE_VERSION) return seedProducts;
    if (!Array.isArray(data.products)) return seedProducts;
    return data.products.map(mapAdminToProduct);
  } catch {
    return seedProducts;
  }
}

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(seedProducts);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  const refreshFromStorage = useCallback(() => {
    setProducts(loadFreshProducts());
    setLastSynced(new Date());
  }, []);

  // Load on mount (handles direct URL navigation)
  useEffect(() => {
    refreshFromStorage();
    setIsLoading(false);
  }, [refreshFromStorage]);

  // Sync from other tabs via storage event (cross-tab)
  useEffect(() => {
    function onStorageChange(e: StorageEvent) {
      if (e.key !== ADMIN_STORAGE_KEY) return;
      try {
        if (!e.newValue) return;
        const data: AdminStoredData = JSON.parse(e.newValue);
        if (data.version === ADMIN_STORAGE_VERSION && Array.isArray(data.products)) {
          setProducts(data.products.map(mapAdminToProduct));
          setLastSynced(new Date());
        }
      } catch { /* corrupted */ }
    }
    window.addEventListener("storage", onStorageChange);
    return () => window.removeEventListener("storage", onStorageChange);
  }, []);

  // Re-read when page becomes visible (handles same-tab SPA back/forward navigation)
  useEffect(() => {
    function onVisible() {
      if (document.visibilityState === "visible") refreshFromStorage();
    }
    function onFocus() { refreshFromStorage(); }

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onFocus);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onFocus);
    };
  }, [refreshFromStorage]);

  const updateProduct = useCallback((_id: string, _updates: Partial<Product>) => {
    // Storefront is read-only — admin manages all data
  }, []);

  const deleteProduct = useCallback((_id: string, _permanent: boolean) => {
    // Storefront is read-only
  }, []);

  const addProduct = useCallback((_product: Omit<Product, "createdAt">) => {
    // Storefront is read-only
  }, []);

  const restoreProduct = useCallback((_id: string) => {
    // Storefront is read-only
  }, []);

  const bulkUpdate = useCallback((_ids: string[], _updates: Partial<Product>) => {
    // Storefront is read-only
  }, []);

  const bulkDelete = useCallback((_ids: string[], _permanent: boolean) => {
    // Storefront is read-only
  }, []);

  const getActiveProducts = useCallback(() => products.filter(p => p.status === "active"), [products]);

  const getProductsByCategory = useCallback(
    (category: string) => products.filter(p => p.status === "active" && p.category === category),
    [products]
  );

  const getProductById = useCallback((id: string) => products.find(p => p.id === id), [products]);

  const value = useMemo<ProductContextType>(
    () => ({
      products, isLoading, lastSynced,
      updateProduct, deleteProduct, addProduct, restoreProduct, bulkUpdate, bulkDelete,
      getActiveProducts, getProductsByCategory, getProductById,
    }),
    [products, isLoading, lastSynced, updateProduct, deleteProduct, addProduct, restoreProduct, bulkUpdate, bulkDelete, getActiveProducts, getProductsByCategory, getProductById]
  );

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
}

export function useProductContext(): ProductContextType {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error("useProductContext must be used within ProductProvider");
  return ctx;
}
