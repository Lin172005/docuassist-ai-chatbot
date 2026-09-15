"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { type Product } from "@/lib/products";
import { getProducts, type ApiProduct } from "@/lib/api";

interface ProductContextType {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  lastSynced: Date | null;
  refresh: () => void;

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

function mapApiToProduct(p: ApiProduct): Product {
  return {
    id: p.id,
    name: p.name,
    description: p.description || p.full_description || "",
    category: p.category_name || "Uncategorized",
    price: p.price,
    priceLabel: `₹${p.price.toLocaleString("en-IN")}`,
    color: COLOR_MAP[p.subcategory || ""] || "#d99b24",
    type: p.subcategory || p.category_name || "",
    size: p.variants?.[0]?.attributes?.size || "500 g",
    rating: "4.8",
    reviews: 200,
    images: (p.images || []).map(img => ({ id: img.id, url: img.url, alt: img.alt })),
    stock: p.stock,
    status: p.status === "published" ? "active" : p.status === "archived" ? "archived" : "inactive",
    lastUpdated: p.updated_at?.slice(0, 10) || "",
    lowStockThreshold: p.low_stock_threshold,
    createdAt: p.created_at,
  };
}

async function fetchProducts(): Promise<Product[]> {
  const res = await getProducts({ per_page: 100 });
  return res.products.map(mapApiToProduct);
}

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  useEffect(() => {
    fetchProducts()
      .then((p) => {
        setProducts(p);
        setError(null);
        setLastSynced(new Date());
      })
      .catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : "Products could not be loaded.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        fetchProducts().then((p) => {
          setProducts(p);
          setError(null);
          setLastSynced(new Date());
        }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Products could not be loaded."));
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);
    function handleProductsChanged() {
      fetchProducts().then((p) => {
        setProducts(p);
        setError(null);
        setLastSynced(new Date());
      }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Products could not be loaded."));
    }
    window.addEventListener("wildhive-products-changed", handleProductsChanged);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("wildhive-products-changed", handleProductsChanged);
    };
  }, []);

  const refresh = useCallback(() => {
    setIsLoading(true);
    fetchProducts().then((p) => {
      setProducts(p);
      setError(null);
      setLastSynced(new Date());
    }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Products could not be loaded.")).finally(() => setIsLoading(false));
  }, []);

  const updateProduct = useCallback((_id: string, _updates: Partial<Product>) => {}, []);
  const deleteProduct = useCallback((_id: string, _permanent: boolean) => {}, []);
  const addProduct = useCallback((_product: Omit<Product, "createdAt">) => {}, []);
  const restoreProduct = useCallback((_id: string) => {}, []);
  const bulkUpdate = useCallback((_ids: string[], _updates: Partial<Product>) => {}, []);
  const bulkDelete = useCallback((_ids: string[], _permanent: boolean) => {}, []);

  const getActiveProducts = useCallback(() => products.filter(p => p.status === "active"), [products]);
  const getProductsByCategory = useCallback(
    (category: string) => products.filter(p => p.status === "active" && p.category === category),
    [products],
  );
  const getProductById = useCallback((id: string) => products.find(p => p.id === id), [products]);

  const value = useMemo<ProductContextType>(
    () => ({
      products, isLoading, error, lastSynced, refresh,
      updateProduct, deleteProduct, addProduct, restoreProduct, bulkUpdate, bulkDelete,
      getActiveProducts, getProductsByCategory, getProductById,
    }),
    [products, isLoading, error, lastSynced, refresh, updateProduct, deleteProduct, addProduct, restoreProduct, bulkUpdate, bulkDelete, getActiveProducts, getProductsByCategory, getProductById],
  );

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
}

export function useProductContext(): ProductContextType {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error("useProductContext must be used within ProductProvider");
  return ctx;
}
