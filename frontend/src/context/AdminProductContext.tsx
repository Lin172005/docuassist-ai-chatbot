"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  type AdminProduct,
  type FieldConfig,
  type CategoryNode,
  type CustomFieldDef,
  SEED_ADMIN_PRODUCTS,
  DEFAULT_FIELD_CONFIGS,
  DEFAULT_CATEGORIES,
  STORAGE_VERSION,
  nowISO,
  slugify,
} from "@/lib/admin-products";
import {
  getProducts,
  createProduct as apiCreateProduct,
  updateProduct as apiUpdateProduct,
  deleteProduct as apiDeleteProduct,
  getCategories as apiGetCategories,
  getFieldConfigs as apiGetFieldConfigs,
  upsertFieldConfig as apiUpsertFieldConfig,
  createFieldConfig as apiCreateFieldConfig,
  deleteFieldConfig as apiDeleteFieldConfig,
  reorderFieldConfigs as apiReorderFieldConfigs,
  getCustomFields as apiGetCustomFields,
  upsertCustomField as apiUpsertCustomField,
  createCustomField as apiCreateCustomField,
  deleteCustomField as apiDeleteCustomField,
  type ApiProduct,
} from "@/lib/api";

const ADMIN_STORAGE_KEY = "wildhive-admin";

interface AdminProductData {
  version: number;
  products: AdminProduct[];
  fieldConfigs: FieldConfig[];
  categories: CategoryNode[];
  customFields: CustomFieldDef[];
}

interface AdminProductContextType {
  products: AdminProduct[];
  fieldConfigs: FieldConfig[];
  categories: CategoryNode[];
  customFields: CustomFieldDef[];
  isLoading: boolean;

  addProduct: (product: Omit<AdminProduct, "id" | "createdAt" | "updatedAt">) => Promise<AdminProduct>;
  updateProduct: (id: string, updates: Partial<AdminProduct>) => Promise<AdminProduct>;
  deleteProduct: (id: string) => Promise<void>;
  duplicateProduct: (id: string) => Promise<AdminProduct | null>;
  getProductById: (id: string) => AdminProduct | undefined;

  updateFieldConfig: (id: string, updates: Partial<FieldConfig>) => void;
  addFieldConfig: (config: FieldConfig) => void;
  removeFieldConfig: (id: string) => void;
  reorderFieldConfigs: (configs: FieldConfig[]) => void;

  addCategory: (parentId: string | null, name: string) => void;
  removeCategory: (id: string) => void;
  renameCategory: (id: string, name: string) => void;

  addCustomField: (field: CustomFieldDef) => void;
  removeCustomField: (id: string) => void;
  updateCustomField: (id: string, updates: Partial<CustomFieldDef>) => void;
}

const AdminProductContext = createContext<AdminProductContextType | null>(null);

function mapAdminToApiCreate(input: Omit<AdminProduct, "id" | "createdAt" | "updatedAt">): Record<string, unknown> {
  const categories = JSON.parse(localStorage.getItem("wildhive-admin") || "{}").categories as CategoryNode[] | undefined;
  let categoryId: string | null = null;
  if (categories && input.category) {
    function findCat(nodes: CategoryNode[]): CategoryNode | undefined {
      for (const n of nodes) {
        if (n.name === input.category) return n;
        const found = findCat(n.children);
        if (found) return found;
      }
      return undefined;
    }
    const cat = findCat(categories);
    if (cat && !cat.id.startsWith("cat-")) categoryId = cat.id;
  }

  return {
    name: input.name,
    slug: input.slug || slugify(input.name),
    description: input.description,
    status: input.status,
    category_id: categoryId,
    subcategory: input.subcategory,
    tags: input.tags,
    price: input.price,
    currency: input.currency,
    sale_price: input.salePrice,
    price_tiers: input.priceTiers,
    sku: input.sku,
    barcode: input.barcode,
    stock: input.stock,
    low_stock_threshold: input.lowStockThreshold,
    allow_backorder: input.allowBackorder,
    variants: input.variants,
    images: input.images,
    weight: input.weight,
    weight_unit: input.weightUnit,
    dimensions: input.dimensions,
    dimension_unit: input.dimensionUnit,
    related_product_ids: input.relatedProductIds,
    cross_sell_ids: input.crossSellIds,
    seo: input.seo,
    custom_fields: input.customFields,
  };
}

function mapAdminToApiUpdate(updates: Partial<AdminProduct>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  if (updates.name !== undefined) result.name = updates.name;
  if (updates.slug !== undefined) result.slug = updates.slug;
  if (updates.description !== undefined) result.description = updates.description;
  if (updates.status !== undefined) result.status = updates.status;
  if (updates.category !== undefined) {
    const categories = JSON.parse(localStorage.getItem("wildhive-admin") || "{}").categories as CategoryNode[] | undefined;
    let categoryId: string | null = null;
    if (categories && updates.category) {
      function findCat(nodes: CategoryNode[]): CategoryNode | undefined {
        for (const n of nodes) {
          if (n.name === updates.category) return n;
          const found = findCat(n.children);
          if (found) return found;
        }
        return undefined;
      }
      const cat = findCat(categories);
      if (cat && !cat.id.startsWith("cat-")) categoryId = cat.id;
    }
    result.category_id = categoryId;
  }
  if (updates.subcategory !== undefined) result.subcategory = updates.subcategory;
  if (updates.tags !== undefined) result.tags = updates.tags;
  if (updates.price !== undefined) result.price = updates.price;
  if (updates.currency !== undefined) result.currency = updates.currency;
  if (updates.salePrice !== undefined) result.sale_price = updates.salePrice;
  if (updates.priceTiers !== undefined) result.price_tiers = updates.priceTiers;
  if (updates.sku !== undefined) result.sku = updates.sku;
  if (updates.barcode !== undefined) result.barcode = updates.barcode;
  if (updates.stock !== undefined) result.stock = updates.stock;
  if (updates.lowStockThreshold !== undefined) result.low_stock_threshold = updates.lowStockThreshold;
  if (updates.allowBackorder !== undefined) result.allow_backorder = updates.allowBackorder;
  if (updates.variants !== undefined) result.variants = updates.variants;
  if (updates.images !== undefined) result.images = updates.images;
  if (updates.weight !== undefined) result.weight = updates.weight;
  if (updates.weightUnit !== undefined) result.weight_unit = updates.weightUnit;
  if (updates.dimensions !== undefined) result.dimensions = updates.dimensions;
  if (updates.dimensionUnit !== undefined) result.dimension_unit = updates.dimensionUnit;
  if (updates.relatedProductIds !== undefined) result.related_product_ids = updates.relatedProductIds;
  if (updates.crossSellIds !== undefined) result.cross_sell_ids = updates.crossSellIds;
  if (updates.seo !== undefined) result.seo = updates.seo;
  if (updates.customFields !== undefined) result.custom_fields = updates.customFields;
  return result;
}

function loadAdminData(): AdminProductData {
  if (typeof window === "undefined") {
    return { version: 1, products: SEED_ADMIN_PRODUCTS, fieldConfigs: DEFAULT_FIELD_CONFIGS, categories: DEFAULT_CATEGORIES, customFields: [] };
  }
  try {
    const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
    if (!raw) return { version: 1, products: SEED_ADMIN_PRODUCTS, fieldConfigs: DEFAULT_FIELD_CONFIGS, categories: DEFAULT_CATEGORIES, customFields: [] };
    const data = JSON.parse(raw);
    if (data.version !== STORAGE_VERSION) return { version: 1, products: SEED_ADMIN_PRODUCTS, fieldConfigs: DEFAULT_FIELD_CONFIGS, categories: DEFAULT_CATEGORIES, customFields: [] };
    return data;
  } catch {
    return { version: 1, products: SEED_ADMIN_PRODUCTS, fieldConfigs: DEFAULT_FIELD_CONFIGS, categories: DEFAULT_CATEGORIES, customFields: [] };
  }
}

function persist(data: AdminProductData) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify({ ...data, version: STORAGE_VERSION }));
  } catch { /* silent */ }
}

function mapApiToAdminProduct(p: ApiProduct): AdminProduct {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description || p.full_description || "",
    status: p.status as AdminProduct["status"],
    category: p.category_name || "",
    subcategory: p.subcategory || "",
    tags: p.tags || [],
    images: (p.images || []).map((img, i) => ({ id: img.id, url: img.url, alt: img.alt, order: i })),
    price: p.price,
    currency: p.currency,
    salePrice: p.sale_price || undefined,
    priceTiers: p.price_tiers || [],
    variants: (p.variants || []).map(v => ({
      id: v.id,
      name: v.name,
      attributes: v.attributes,
      sku: v.sku,
      barcode: v.barcode,
      price: v.price,
      stock: v.stock,
      imageIndex: v.imageIndex,
    })),
    sku: p.sku,
    barcode: p.barcode || "",
    stock: p.stock,
    lowStockThreshold: p.low_stock_threshold,
    allowBackorder: p.allow_backorder,
    weight: p.weight || 0,
    weightUnit: p.weight_unit as AdminProduct["weightUnit"],
    dimensions: p.dimensions || { length: 0, width: 0, height: 0 },
    dimensionUnit: p.dimension_unit as AdminProduct["dimensionUnit"],
    relatedProductIds: p.related_product_ids || [],
    crossSellIds: p.cross_sell_ids || [],
    seo: p.seo || { metaTitle: "", metaDescription: "", keywords: [], template: "default" },
    customFields: p.custom_fields || {},
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  };
}

export function AdminProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<AdminProduct[]>(SEED_ADMIN_PRODUCTS);
  const [fieldConfigs, setFieldConfigs] = useState<FieldConfig[]>(DEFAULT_FIELD_CONFIGS);
  const [categories, setCategories] = useState<CategoryNode[]>(DEFAULT_CATEGORIES);
  const [customFields, setCustomFields] = useState<CustomFieldDef[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const productsRef = useRef(products);
  const fieldConfigsRef = useRef(fieldConfigs);
  const categoriesRef = useRef(categories);
  const customFieldsRef = useRef(customFields);

  useEffect(() => { productsRef.current = products; }, [products]);
  useEffect(() => { fieldConfigsRef.current = fieldConfigs; }, [fieldConfigs]);
  useEffect(() => { categoriesRef.current = categories; }, [categories]);
  useEffect(() => { customFieldsRef.current = customFields; }, [customFields]);

  // Load from API on mount, with localStorage fallback
  useEffect(() => {
    const stored = localStorage.getItem("wildhive-token");

    async function loadFromApi() {
      try {
        const [productRes, categoryRes, fieldConfigRes, customFieldRes] = await Promise.all([
          getProducts({ per_page: 100, token: stored || undefined }),
          apiGetCategories(stored || undefined).catch(() => null),
          stored ? apiGetFieldConfigs(stored).catch(() => null) : Promise.resolve(null),
          stored ? apiGetCustomFields(stored).catch(() => null) : Promise.resolve(null),
        ]);

        const adminProducts = productRes.products.map(mapApiToAdminProduct);
        setProducts(adminProducts);
        productsRef.current = adminProducts;

        if (categoryRes) {
          const apiTree = buildCategoryTree(categoryRes);
          const merged = mergeWithDefaults(apiTree, DEFAULT_CATEGORIES);
          setCategories(merged);
          categoriesRef.current = merged;
        }

        if (fieldConfigRes && fieldConfigRes.length > 0) {
          const configs = fieldConfigRes as unknown as FieldConfig[];
          setFieldConfigs(configs);
          fieldConfigsRef.current = configs;
        } else {
          const data = loadAdminData();
          setFieldConfigs(data.fieldConfigs);
          fieldConfigsRef.current = data.fieldConfigs;
        }

        if (customFieldRes && customFieldRes.length > 0) {
          const defs = customFieldRes as unknown as CustomFieldDef[];
          setCustomFields(defs);
          customFieldsRef.current = defs;
        } else {
          const data = loadAdminData();
          setCustomFields(data.customFields);
          customFieldsRef.current = data.customFields;
        }
      } catch {
        const data = loadAdminData();
        setProducts(data.products);
        setFieldConfigs(data.fieldConfigs);
        setCategories(data.categories);
        setCustomFields(data.customFields);
        productsRef.current = data.products;
        fieldConfigsRef.current = data.fieldConfigs;
        categoriesRef.current = data.categories;
        customFieldsRef.current = data.customFields;
      }
      setIsLoading(false);
    }

    loadFromApi();
  }, []);

  const save = useCallback(() => {
    persist({
      version: STORAGE_VERSION,
      products: productsRef.current,
      fieldConfigs: fieldConfigsRef.current,
      categories: categoriesRef.current,
      customFields: customFieldsRef.current,
    });
  }, []);

  const addProduct = useCallback(async (input: Omit<AdminProduct, "id" | "createdAt" | "updatedAt">): Promise<AdminProduct> => {
    const token = localStorage.getItem("wildhive-token");
    if (!token) throw new Error("You must be signed in to create a product.");

    const created = await apiCreateProduct(mapAdminToApiCreate(input), token);
    const product = mapApiToAdminProduct(created);
    const next = [...productsRef.current, product];
    setProducts(next);
    productsRef.current = next;
    save();
    window.dispatchEvent(new CustomEvent("wildhive-products-changed"));
    return product;
  }, [save]);

  const updateProduct = useCallback(async (id: string, updates: Partial<AdminProduct>): Promise<AdminProduct> => {
    const token = localStorage.getItem("wildhive-token");
    if (!token) throw new Error("You must be signed in to update a product.");

    const updatedFromApi = await apiUpdateProduct(id, mapAdminToApiUpdate(updates), token);
    const updatedProduct = mapApiToAdminProduct(updatedFromApi);
    const next = productsRef.current.map(p => p.id === id ? updatedProduct : p);
    setProducts(next);
    productsRef.current = next;
    save();
    window.dispatchEvent(new CustomEvent("wildhive-products-changed"));
    return updatedProduct;
  }, [save]);

  const deleteProduct = useCallback(async (id: string): Promise<void> => {
    const token = localStorage.getItem("wildhive-token");
    if (!token) throw new Error("You must be signed in to delete a product.");

    await apiDeleteProduct(id, token);
    const next = productsRef.current.filter(p => p.id !== id);
    setProducts(next);
    productsRef.current = next;
    save();
    window.dispatchEvent(new CustomEvent("wildhive-products-changed"));
  }, [save]);

  const duplicateProduct = useCallback(async (id: string): Promise<AdminProduct | null> => {
    const src = productsRef.current.find(p => p.id === id);
    if (!src) return null;
    const token = localStorage.getItem("wildhive-token");
    if (!token) throw new Error("You must be signed in to duplicate a product.");
    const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...copy } = src;
    const duplicate = {
      ...copy,
      name: `${src.name} (Copy)`,
      slug: `${src.slug}-copy-${Date.now()}`,
      sku: `${src.sku}-COPY-${productsRef.current.length + 1}`,
      status: "draft" as const,
    };
    const created = await apiCreateProduct(mapAdminToApiCreate(duplicate), token);
    const dup = mapApiToAdminProduct(created);
    const next = [...productsRef.current, dup];
    setProducts(next);
    productsRef.current = next;
    save();
    window.dispatchEvent(new CustomEvent("wildhive-products-changed"));
    return dup;
  }, [save]);

  const getProductById = useCallback((id: string) => productsRef.current.find(p => p.id === id), []);

  const updateFieldConfig = useCallback((id: string, updates: Partial<FieldConfig>) => {
    const next = fieldConfigsRef.current.map(f => f.id === id ? { ...f, ...updates } : f);
    setFieldConfigs(next);
    fieldConfigsRef.current = next;
    save();
    const token = localStorage.getItem("wildhive-token");
    const target = next.find(f => f.id === id);
    if (token && target) {
      apiUpsertFieldConfig(id, target as unknown as Record<string, unknown>, token).catch(e => console.error("Failed to sync field config:", e));
    }
  }, [save]);

  const addFieldConfig = useCallback((config: FieldConfig) => {
    const next = [...fieldConfigsRef.current, config];
    setFieldConfigs(next);
    fieldConfigsRef.current = next;
    save();
    const token = localStorage.getItem("wildhive-token");
    if (token) {
      apiCreateFieldConfig(config as unknown as Record<string, unknown>, token).catch(e => console.error("Failed to sync field config:", e));
    }
  }, [save]);

  const removeFieldConfig = useCallback((id: string) => {
    const next = fieldConfigsRef.current.filter(f => f.id !== id);
    setFieldConfigs(next);
    fieldConfigsRef.current = next;
    save();
    const token = localStorage.getItem("wildhive-token");
    if (token) {
      apiDeleteFieldConfig(id, token).catch(e => console.error("Failed to delete field config:", e));
    }
  }, [save]);

  const reorderFieldConfigs = useCallback((configs: FieldConfig[]) => {
    setFieldConfigs(configs);
    fieldConfigsRef.current = configs;
    save();
    const token = localStorage.getItem("wildhive-token");
    if (token) {
      apiReorderFieldConfigs(configs.map(c => c.id), token).catch(e => console.error("Failed to reorder field configs:", e));
    }
  }, [save]);

  const addCategory = useCallback((parentId: string | null, name: string) => {
    const newNode: CategoryNode = { id: `cat-${slugify(name)}-${Date.now()}`, name, slug: slugify(name), children: [] };
    let next: CategoryNode[];
    if (!parentId) {
      next = [...categoriesRef.current, newNode];
    } else {
      next = categoriesRef.current.map(c => addchild(c, parentId, newNode));
    }
    setCategories(next);
    categoriesRef.current = next;
    save();
  }, [save]);

  const removeCategory = useCallback((id: string) => {
    const next = categoriesRef.current.filter(c => c.id !== id).map(c => removeChildRecursive(c, id));
    setCategories(next);
    categoriesRef.current = next;
    save();
  }, [save]);

  const renameCategory = useCallback((id: string, name: string) => {
    const next = categoriesRef.current.map(c => renameChildRecursive(c, id, name));
    setCategories(next);
    categoriesRef.current = next;
    save();
  }, [save]);

  const addCustomField = useCallback((field: CustomFieldDef) => {
    const next = [...customFieldsRef.current, field];
    setCustomFields(next);
    customFieldsRef.current = next;
    save();
    const token = localStorage.getItem("wildhive-token");
    if (token) {
      apiCreateCustomField(field as unknown as Record<string, unknown>, token).catch(e => console.error("Failed to sync custom field:", e));
    }
  }, [save]);

  const removeCustomField = useCallback((id: string) => {
    const next = customFieldsRef.current.filter(f => f.id !== id);
    setCustomFields(next);
    customFieldsRef.current = next;
    save();
    const token = localStorage.getItem("wildhive-token");
    if (token) {
      apiDeleteCustomField(id, token).catch(e => console.error("Failed to delete custom field:", e));
    }
  }, [save]);

  const updateCustomField = useCallback((id: string, updates: Partial<CustomFieldDef>) => {
    const next = customFieldsRef.current.map(f => f.id === id ? { ...f, ...updates } : f);
    setCustomFields(next);
    customFieldsRef.current = next;
    save();
    const token = localStorage.getItem("wildhive-token");
    const target = next.find(f => f.id === id);
    if (token && target) {
      apiUpsertCustomField(id, target as unknown as Record<string, unknown>, token).catch(e => console.error("Failed to sync custom field:", e));
    }
  }, [save]);

  const value = useMemo<AdminProductContextType>(() => ({
    products, fieldConfigs, categories, customFields, isLoading,
    addProduct, updateProduct, deleteProduct, duplicateProduct, getProductById,
    updateFieldConfig, addFieldConfig, removeFieldConfig, reorderFieldConfigs,
    addCategory, removeCategory, renameCategory,
    addCustomField, removeCustomField, updateCustomField,
  }), [
    products, fieldConfigs, categories, customFields, isLoading,
    addProduct, updateProduct, deleteProduct, duplicateProduct, getProductById,
    updateFieldConfig, addFieldConfig, removeFieldConfig, reorderFieldConfigs,
    addCategory, removeCategory, renameCategory,
    addCustomField, removeCustomField, updateCustomField,
  ]);

  return <AdminProductContext.Provider value={value}>{children}</AdminProductContext.Provider>;
}

export function useAdminProducts() {
  const ctx = useContext(AdminProductContext);
  if (!ctx) throw new Error("useAdminProducts must be used within AdminProductProvider");
  return ctx;
}

// ── Helper: merge API categories with default subcategories ───────
function mergeWithDefaults(apiTree: CategoryNode[], defaults: CategoryNode[]): CategoryNode[] {
  const result: CategoryNode[] = [];
  const apiMap = new Map(apiTree.map(c => [c.name.toLowerCase(), c]));

  for (const def of defaults) {
    const apiCat = apiMap.get(def.name.toLowerCase());
    if (apiCat) {
      const existingChildNames = new Set(apiCat.children.map(c => c.name.toLowerCase()));
      const mergedChildren = [...apiCat.children];
      for (const defChild of def.children) {
        if (!existingChildNames.has(defChild.name.toLowerCase())) {
          mergedChildren.push(defChild);
        }
      }
      result.push({ ...apiCat, children: mergedChildren });
      apiMap.delete(def.name.toLowerCase());
    } else {
      result.push(def);
    }
  }

  for (const apiCat of apiMap.values()) {
    result.push(apiCat);
  }

  return result;
}

// ── Helper: build tree from flat API categories ───────
function buildCategoryTree(cats: Array<{ id: string; name: string; slug: string; parent_id: string | null }>): CategoryNode[] {
  const map = new Map<string, CategoryNode>();
  const roots: CategoryNode[] = [];

  for (const c of cats) {
    map.set(c.id, { id: c.id, name: c.name, slug: c.slug, children: [] });
  }

  for (const c of cats) {
    const node = map.get(c.id)!;
    if (c.parent_id && map.has(c.parent_id)) {
      map.get(c.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

function addchild(node: CategoryNode, parentId: string, child: CategoryNode): CategoryNode {
  if (node.id === parentId) return { ...node, children: [...node.children, child] };
  return { ...node, children: node.children.map(c => addchild(c, parentId, child)) };
}

function removeChildRecursive(node: CategoryNode, childId: string): CategoryNode {
  return { ...node, children: node.children.filter(c => c.id !== childId).map(c => removeChildRecursive(c, childId)) };
}

function renameChildRecursive(node: CategoryNode, id: string, name: string): CategoryNode {
  if (node.id === id) return { ...node, name, slug: slugify(name) };
  return { ...node, children: node.children.map(c => renameChildRecursive(c, id, name)) };
}
