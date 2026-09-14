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

  addProduct: (product: Omit<AdminProduct, "id" | "createdAt" | "updatedAt">) => AdminProduct;
  updateProduct: (id: string, updates: Partial<AdminProduct>) => void;
  deleteProduct: (id: string) => void;
  duplicateProduct: (id: string) => AdminProduct | null;
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

export function AdminProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<AdminProduct[]>(SEED_ADMIN_PRODUCTS);
  const [fieldConfigs, setFieldConfigs] = useState<FieldConfig[]>(DEFAULT_FIELD_CONFIGS);
  const [categories, setCategories] = useState<CategoryNode[]>(DEFAULT_CATEGORIES);
  const [customFields, setCustomFields] = useState<CustomFieldDef[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Refs to always have latest state for synchronous persistence
  const productsRef = useRef(products);
  const fieldConfigsRef = useRef(fieldConfigs);
  const categoriesRef = useRef(categories);
  const customFieldsRef = useRef(customFields);

  useEffect(() => { productsRef.current = products; }, [products]);
  useEffect(() => { fieldConfigsRef.current = fieldConfigs; }, [fieldConfigs]);
  useEffect(() => { categoriesRef.current = categories; }, [categories]);
  useEffect(() => { customFieldsRef.current = customFields; }, [customFields]);

  // Load from localStorage on mount
  useEffect(() => {
    const data = loadAdminData();
    setProducts(data.products);
    setFieldConfigs(data.fieldConfigs);
    setCategories(data.categories);
    setCustomFields(data.customFields);
    productsRef.current = data.products;
    fieldConfigsRef.current = data.fieldConfigs;
    categoriesRef.current = data.categories;
    customFieldsRef.current = data.customFields;
    setIsLoading(false);
  }, []);

  // Helper: persist current state synchronously using refs
  const save = useCallback(() => {
    persist({
      version: STORAGE_VERSION,
      products: productsRef.current,
      fieldConfigs: fieldConfigsRef.current,
      categories: categoriesRef.current,
      customFields: customFieldsRef.current,
    });
  }, []);

  const addProduct = useCallback((input: Omit<AdminProduct, "id" | "createdAt" | "updatedAt">): AdminProduct => {
    const currentProducts = productsRef.current;
    const id = `WH${String(currentProducts.length + 1).padStart(3, "0")}`;
    const now = nowISO();
    const product: AdminProduct = { ...input, id, createdAt: now, updatedAt: now };
    const next = [...currentProducts, product];
    setProducts(next);
    productsRef.current = next;
    save();
    return product;
  }, [save]);

  const updateProduct = useCallback((id: string, updates: Partial<AdminProduct>) => {
    const next = productsRef.current.map(p => p.id === id ? { ...p, ...updates, updatedAt: nowISO() } : p);
    setProducts(next);
    productsRef.current = next;
    save();
  }, [save]);

  const deleteProduct = useCallback((id: string) => {
    const next = productsRef.current.filter(p => p.id !== id);
    setProducts(next);
    productsRef.current = next;
    save();
  }, [save]);

  const duplicateProduct = useCallback((id: string): AdminProduct | null => {
    const src = productsRef.current.find(p => p.id === id);
    if (!src) return null;
    const newId = `WH${String(productsRef.current.length + 1).padStart(3, "0")}`;
    const now = nowISO();
    const dup: AdminProduct = {
      ...src, id: newId, name: `${src.name} (Copy)`, slug: `${src.slug}-copy`,
      sku: `${src.sku}-COPY`, status: "draft", createdAt: now, updatedAt: now,
    };
    const next = [...productsRef.current, dup];
    setProducts(next);
    productsRef.current = next;
    save();
    return dup;
  }, [save]);

  const getProductById = useCallback((id: string) => productsRef.current.find(p => p.id === id), []);

  const updateFieldConfig = useCallback((id: string, updates: Partial<FieldConfig>) => {
    const next = fieldConfigsRef.current.map(f => f.id === id ? { ...f, ...updates } : f);
    setFieldConfigs(next);
    fieldConfigsRef.current = next;
    save();
  }, [save]);

  const addFieldConfig = useCallback((config: FieldConfig) => {
    const next = [...fieldConfigsRef.current, config];
    setFieldConfigs(next);
    fieldConfigsRef.current = next;
    save();
  }, [save]);

  const removeFieldConfig = useCallback((id: string) => {
    const next = fieldConfigsRef.current.filter(f => f.id !== id);
    setFieldConfigs(next);
    fieldConfigsRef.current = next;
    save();
  }, [save]);

  const reorderFieldConfigs = useCallback((configs: FieldConfig[]) => {
    setFieldConfigs(configs);
    fieldConfigsRef.current = configs;
    save();
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
  }, [save]);

  const removeCustomField = useCallback((id: string) => {
    const next = customFieldsRef.current.filter(f => f.id !== id);
    setCustomFields(next);
    customFieldsRef.current = next;
    save();
  }, [save]);

  const updateCustomField = useCallback((id: string, updates: Partial<CustomFieldDef>) => {
    const next = customFieldsRef.current.map(f => f.id === id ? { ...f, ...updates } : f);
    setCustomFields(next);
    customFieldsRef.current = next;
    save();
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
