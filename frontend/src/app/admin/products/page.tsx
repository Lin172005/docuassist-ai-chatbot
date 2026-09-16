"use client";

import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { useAdmin } from "../layout";
import { useAdminProducts } from "@/context/AdminProductContext";
import type { AdminProduct, FieldConfig, ProductImage, ProductVariant, CategoryNode } from "@/lib/admin-products";
import { formatCurrency, slugify, generateSku, generateBarcode, today, nowISO, FIELD_GROUPS } from "@/lib/admin-products";

type SortField = "id" | "name" | "category" | "price" | "stock" | "status" | "updatedAt";
type SortDir = "asc" | "desc";
type ModalTab = "basic" | "pricing" | "inventory" | "media" | "shipping" | "seo" | "relations" | "custom";

function emptyProduct(): Omit<AdminProduct, "id" | "createdAt" | "updatedAt"> {
  return {
    name: "", slug: "", description: "", status: "draft", category: "", subcategory: "",
    tags: [], images: [], price: 0, currency: "INR", salePrice: undefined, priceTiers: [],
    variants: [], sku: "", barcode: "", stock: 0, lowStockThreshold: 10, allowBackorder: false,
    weight: 0, weightUnit: "kg", dimensions: { length: 0, width: 0, height: 0 }, dimensionUnit: "cm",
    relatedProductIds: [], crossSellIds: [],
    seo: { metaTitle: "", metaDescription: "", keywords: [], template: "default" },
    customFields: {},
  };
}

export default function ProductManagementPage() {
  const { role } = useAdmin();
  const { products, fieldConfigs, categories, customFields, isLoading, addProduct, updateProduct, deleteProduct, duplicateProduct, addFieldConfig, updateFieldConfig, removeFieldConfig, addCategory, removeCategory, renameCategory, addCustomField, removeCustomField, updateCustomField } = useAdminProducts();
  const canEdit = role === "admin" || role === "editor";

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [updatedFilter, setUpdatedFilter] = useState("All");
  const [updatedCutoff, setUpdatedCutoff] = useState<number | null>(null);
  const [sortField, setSortField] = useState<SortField>("updatedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<AdminProduct, "id" | "createdAt" | "updatedAt">>(emptyProduct());
  const [formTab, setFormTab] = useState<ModalTab>("basic");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [showFieldManager, setShowFieldManager] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showCustomFieldManager, setShowCustomFieldManager] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [variantAttrInput, setVariantAttrInput] = useState("");
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const allCategories = useMemo(() => {
    const flat: string[] = [];
    function walk(nodes: CategoryNode[]) { for (const n of nodes) { flat.push(n.name); walk(n.children); } }
    walk(categories);
    return flat;
  }, [categories]);

  const filtered = useMemo(() => {
    let result = [...products];
    if (search) { const q = search.toLowerCase(); result = result.filter(p => p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)); }
    if (categoryFilter !== "All") result = result.filter(p => p.category === categoryFilter);
    if (statusFilter !== "All") result = result.filter(p => p.status === statusFilter);
    if (updatedCutoff !== null) {
      result = result.filter(p => new Date(p.updatedAt).getTime() >= updatedCutoff);
    }
    result.sort((a, b) => { const av = a[sortField]; const bv = b[sortField]; if (typeof av === "string" && typeof bv === "string") return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av); return sortDir === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number); });
    return result;
  }, [products, search, categoryFilter, statusFilter, updatedCutoff, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  function handleSort(field: SortField) { if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc"); else { setSortField(field); setSortDir("asc"); } }
  function toggleSelect(id: string) { setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; }); }
  function toggleSelectAll() { setSelected(prev => prev.size === paginated.length ? new Set() : new Set(paginated.map(p => p.id))); }

  function openCreate() { setEditingId(null); setFormData(emptyProduct()); setFormTab("basic"); setShowForm(true); }
  function openEdit(id: string) { const p = products.find(x => x.id === id); if (!p) return; const { id: _, createdAt: _c, updatedAt: _u, ...rest } = p; setEditingId(id); setFormData(rest); setFormTab("basic"); setShowForm(true); }

  function insertFormatting(prefix: string, suffix: string = "") {
    setFormData(d => {
      const current = d.description || "";
      const sample = "sample text";
      return {
        ...d,
        description: current ? `${current}\n${prefix}${sample}${suffix}` : `${prefix}${sample}${suffix}`,
      };
    });
  }

  async function handleSave() {
    if (!formData.name.trim()) {
      setNotice({ type: "error", message: "Product name is required." });
      return;
    }
    const slug = formData.slug || slugify(formData.name);
    const sku = formData.sku || generateSku(formData.category || "PRD", products.length);
    const barcode = formData.barcode || generateBarcode();
    const data = { ...formData, slug, sku, barcode };
    setSaving(true);
    setNotice(null);
    try {
      const saved = editingId
        ? await updateProduct(editingId, data)
        : await addProduct(data);
      setShowForm(false);
      setNotice({ type: "success", message: `${saved.name} was ${editingId ? "updated" : "created"} successfully.` });
    } catch (error) {
      setNotice({ type: "error", message: error instanceof Error ? error.message : "Product could not be saved." });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteProduct(id);
      setConfirmDelete(null);
      setSelected(prev => { const n = new Set(prev); n.delete(id); return n; });
      setNotice({ type: "success", message: "Product deleted successfully." });
    } catch (error) {
      setNotice({ type: "error", message: error instanceof Error ? error.message : "Product could not be deleted." });
    }
  }
  async function handleDuplicate(id: string) {
    try {
      const duplicate = await duplicateProduct(id);
      if (duplicate) setNotice({ type: "success", message: `${duplicate.name} was created as a draft.` });
    } catch (error) {
      setNotice({ type: "error", message: error instanceof Error ? error.message : "Product could not be duplicated." });
    }
  }

  function addTag(tag: string) { if (tag && !formData.tags.includes(tag)) setFormData(d => ({ ...d, tags: [...d.tags, tag] })); }
  function removeTag(tag: string) { setFormData(d => ({ ...d, tags: d.tags.filter(t => t !== tag) })); }

  function addImage() { const img: ProductImage = { id: `img-${Date.now()}`, url: "", alt: "", order: formData.images.length }; setFormData(d => ({ ...d, images: [...d.images, img] })); }
  function updateImage(id: string, updates: Partial<ProductImage>) { setFormData(d => ({ ...d, images: d.images.map(i => i.id === id ? { ...i, ...updates } : i) })); }
  function removeImage(id: string) { setFormData(d => ({ ...d, images: d.images.filter(i => i.id !== id) })); }
  function moveImage(from: number, to: number) {
    if (to < 0 || to >= formData.images.length) return;
    const imgs = [...formData.images];
    const [moved] = imgs.splice(from, 1);
    imgs.splice(to, 0, moved);
    setFormData(d => ({ ...d, images: imgs.map((i, idx) => ({ ...i, order: idx })) }));
  }

  function addVariant() {
    const v: ProductVariant = { id: `var-${Date.now()}`, name: `Variant ${formData.variants.length + 1}`, attributes: {}, sku: `${formData.sku || "PRD"}-V${formData.variants.length + 1}`, barcode: generateBarcode(), price: formData.price, stock: 0 };
    setFormData(d => ({ ...d, variants: [...d.variants, v] }));
  }
  function updateVariant(id: string, updates: Partial<ProductVariant>) { setFormData(d => ({ ...d, variants: d.variants.map(v => v.id === id ? { ...v, ...updates } : v) })); }
  function removeVariant(id: string) { setFormData(d => ({ ...d, variants: d.variants.filter(v => v.id !== id) })); }
  function addVariantAttr(variantId: string, key: string, value: string) {
    setFormData(d => ({ ...d, variants: d.variants.map(v => v.id === variantId ? { ...v, attributes: { ...v.attributes, [key]: value } } : v) }));
  }
  function removeVariantAttr(variantId: string, key: string) {
    setFormData(d => ({ ...d, variants: d.variants.map(v => { if (v.id !== variantId) return v; const a = { ...v.attributes }; delete a[key]; return { ...v, attributes: a }; }) }));
  }

  function addPriceTier() { setFormData(d => ({ ...d, priceTiers: [...d.priceTiers, { minQty: 1, maxQty: null, price: d.price, currency: d.currency }] })); }
  function updatePriceTier(idx: number, updates: Partial<{ minQty: number; maxQty: number | null; price: number }>) { setFormData(d => ({ ...d, priceTiers: d.priceTiers.map((t, i) => i === idx ? { ...t, ...updates } : t) })); }
  function removePriceTier(idx: number) { setFormData(d => ({ ...d, priceTiers: d.priceTiers.filter((_, i) => i !== idx) })); }

  const enabledFields = useMemo(() => fieldConfigs.filter(f => f.enabled).sort((a, b) => a.order - b.order), [fieldConfigs]);
  const fieldsByGroup = useMemo(() => {
    const map: Record<string, FieldConfig[]> = {};
    for (const g of FIELD_GROUPS) map[g] = [];
    for (const f of enabledFields) { (map[f.group] || (map[f.group] = [])).push(f); }
    return map;
  }, [enabledFields]);

  return (
    <div className="admin-product-page">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#c98a2c]">Admin Workspace</span>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#1c2e24]">Product Management</h1>
          <p className="mt-1 text-xs sm:text-sm text-[#637368]">Manage your honey products, update details, stock and status.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {canEdit && (
            <>
              <button
                onClick={openCreate}
                className="rounded-full bg-[#1e3d2f] px-5 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs transition hover:bg-[#162e23]"
              >
                Add Product <span className="ml-1">+</span>
              </button>
            </>
          )}
        </div>
      </div>

      {notice && <div className={`admin-notice ${notice.type === "success" ? "admin-notice-success" : "admin-notice-error"}`} role="status">{notice.message}<button onClick={() => setNotice(null)} aria-label="Dismiss notification">×</button></div>}

      {/* Bulk actions bar */}
      {canEdit && selected.size > 0 && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#ede8dd] bg-white px-5 py-3 shadow-xs">
          <span className="text-xs font-semibold text-[#1c2e24]">
            {selected.size} product{selected.size > 1 ? "s" : ""} selected
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={async () => {
                for (const id of selected) {
                  await updateProduct(id, { status: "published" });
                }
                setSelected(new Set());
                setNotice({ type: "success", message: `Published ${selected.size} products.` });
              }}
              className="rounded-full bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-800"
            >
              Bulk Publish
            </button>
            <button
              type="button"
              onClick={async () => {
                for (const id of selected) {
                  await updateProduct(id, { status: "archived" });
                }
                setSelected(new Set());
                setNotice({ type: "success", message: `Archived ${selected.size} products.` });
              }}
              className="rounded-full border border-[#ede8dd] bg-white px-3 py-1.5 text-xs font-semibold text-[#1c2e24] transition hover:bg-[#faf9f5]"
            >
              Bulk Archive
            </button>
            <button
              type="button"
              onClick={async () => {
                if (confirm(`Are you sure you want to delete ${selected.size} products?`)) {
                  for (const id of selected) {
                    await deleteProduct(id);
                  }
                  setSelected(new Set());
                  setNotice({ type: "success", message: "Deleted selected products." });
                }
              }}
              className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
            >
              Bulk Delete
            </button>
            <button
              type="button"
              onClick={() => setSelected(new Set())}
              className="text-xs font-medium text-[#8a948c] hover:underline"
            >
              Deselect
            </button>
          </div>
        </div>
      )}

      <div className="admin-toolbar mb-4 flex flex-wrap gap-3">
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search products by name, SKU or ID..."
          className="min-w-[220px] flex-1 rounded-full border border-[#ede8dd] bg-white px-4 py-2.5 text-xs sm:text-sm text-[#1c2e24] outline-none transition placeholder:text-[#8a948c] focus:border-[#1e3d2f]"
          aria-label="Search products"
        />
        <select
          value={categoryFilter}
          onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
          className="rounded-xl border border-[#ede8dd] bg-white px-3 py-2 text-xs sm:text-sm text-[#1c2e24] outline-none focus:border-[#1e3d2f]"
          aria-label="Filter by category"
        >
          <option value="All">All Categories</option>
          {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-xl border border-[#ede8dd] bg-white px-3 py-2 text-xs sm:text-sm text-[#1c2e24] outline-none focus:border-[#1e3d2f]"
          aria-label="Filter by status"
        >
          {["All", "published", "draft", "archived"].map(s => (
            <option key={s} value={s}>{s === "All" ? "All Statuses" : s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        <select
          value={updatedFilter}
          onChange={e => {
            const val = e.target.value;
            setUpdatedFilter(val);
            if (val === "Today") {
              setUpdatedCutoff(Date.now() - 1 * 24 * 60 * 60 * 1000);
            } else if (val === "Week") {
              setUpdatedCutoff(Date.now() - 7 * 24 * 60 * 60 * 1000);
            } else {
              setUpdatedCutoff(null);
            }
            setPage(1);
          }}
          className="rounded-xl border border-[#ede8dd] bg-white px-3 py-2 text-xs sm:text-sm text-[#1c2e24] outline-none focus:border-[#1e3d2f]"
          aria-label="Filter by last updated"
        >
          <option value="All">All Dates</option>
          <option value="Today">Updated Today</option>
          <option value="Week">Past 7 Days</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[#ede8dd] bg-white shadow-xs">
        <table className="w-full min-w-[760px] text-left text-xs sm:text-sm" role="grid">
          <thead>
            <tr className="border-b border-[#ede8dd] bg-[#faf9f5] text-[11px] font-semibold uppercase tracking-wider text-[#8a948c]">
              {canEdit && (
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selected.size === paginated.length && paginated.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-[#ede8dd]"
                    aria-label="Select all"
                  />
                </th>
              )}
              {(["name", "id", "category", "price", "stock", "status", "updatedAt"] as SortField[]).map(f => (
                <th key={f} className="cursor-pointer px-4 py-3 select-none" onClick={() => handleSort(f)}>
                  <div className="flex items-center gap-1">
                    <span>{f === "updatedAt" ? "Updated" : f.charAt(0).toUpperCase() + f.slice(1)}</span>
                    {sortField === f && <span className="text-[#c98a2c]">{sortDir === "asc" ? "↑" : "↓"}</span>}
                  </div>
                </th>
              ))}
              {canEdit && <th className="w-32 px-4 py-3 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ede8dd]">
            {isLoading && (
              <tr><td colSpan={canEdit ? 9 : 8} className="px-4 py-12 text-center text-[#8a948c]">Loading products...</td></tr>
            )}
            {!isLoading && paginated.map(product => (
              <tr key={product.id} className={`transition hover:bg-[#faf9f5]/70 ${selected.has(product.id) ? "bg-[#faf9f5]" : ""}`}>
                {canEdit && (
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(product.id)}
                      onChange={() => toggleSelect(product.id)}
                      className="rounded border-[#ede8dd]"
                      aria-label={`Select ${product.name}`}
                    />
                  </td>
                )}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-[#ede8dd] bg-[#faf9f5] flex items-center justify-center text-xs font-bold text-[#1e3d2f]">
                      {product.images[0]?.url ? (
                        <img src={product.images[0].url} alt={product.images[0].alt || product.name} className="h-full w-full object-cover" />
                      ) : (
                        <span>WH</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-[#1c2e24] truncate max-w-[200px]">{product.name}</p>
                      <p className="text-[11px] text-[#8a948c] truncate max-w-[200px]">{product.sku || "No SKU"}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-[11px] text-[#8a948c]">#{product.id.slice(0, 8)}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-[#faf9f5] border border-[#ede8dd] px-2.5 py-0.5 text-xs font-medium text-[#1c2e24]">
                    {product.category || "Uncategorized"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="font-semibold text-[#1c2e24]">{formatCurrency(product.price, product.currency)}</div>
                  {product.salePrice && (
                    <div className="text-[11px] text-[#8a948c] line-through">{formatCurrency(product.salePrice, product.currency)}</div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`font-semibold ${product.stock <= product.lowStockThreshold ? (product.stock === 0 ? "text-red-600" : "text-[#c98a2c]") : "text-[#1c2e24]"}`}>
                    {product.stock}{product.stock <= product.lowStockThreshold && product.stock > 0 && " ⚠"}{product.stock === 0 && " ✕"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={product.status}
                    onChange={async event => {
                      try {
                        await updateProduct(product.id, { status: event.target.value as AdminProduct["status"] });
                        setNotice({ type: "success", message: "Product status updated successfully." });
                      } catch (error) {
                        setNotice({ type: "error", message: error instanceof Error ? error.message : "Product status could not be updated." });
                      }
                    }}
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider outline-none ${
                      product.status === "published" ? "bg-emerald-50 text-emerald-800 border-emerald-200" :
                      product.status === "archived" ? "bg-gray-100 text-gray-700 border-gray-200" :
                      "bg-amber-50 text-amber-800 border-amber-200"
                    }`}
                    aria-label={`Change status for ${product.name}`}
                  >
                    <option value="published">published</option>
                    <option value="draft">draft</option>
                    <option value="archived">archived</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-xs text-[#8a948c]">{product.updatedAt.slice(0, 10)}</td>
                {canEdit && (
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEdit(product.id)}
                        className="rounded-lg border border-[#ede8dd] px-2 py-1 text-xs font-medium text-[#1c2e24] hover:bg-[#faf9f5]"
                        title="Edit product"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDuplicate(product.id)}
                        className="rounded-lg border border-[#ede8dd] px-2 py-1 text-xs font-medium text-[#1c2e24] hover:bg-[#faf9f5]"
                        title="Duplicate product"
                      >
                        Copy
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(product.id)}
                        className="rounded-lg border border-red-200 px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                        title="Delete product"
                      >
                        Del
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {!isLoading && paginated.length === 0 && (
              <tr><td colSpan={canEdit ? 9 : 8} className="px-4 py-12 text-center text-[#8a948c]">No products match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-xs text-[#637368]">Showing {((page - 1) * perPage) + 1}–{Math.min(page * perPage, filtered.length)} of {filtered.length}</p>
          <div className="flex gap-1.5">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-[#ede8dd] bg-white px-3 py-1.5 text-xs font-medium text-[#637368] transition hover:bg-[#faf9f5] hover:text-[#1c2e24] disabled:opacity-40"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  p === page
                    ? "bg-[#1e3d2f] text-white shadow-xs"
                    : "border border-[#ede8dd] bg-white text-[#637368] hover:bg-[#faf9f5] hover:text-[#1c2e24]"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-lg border border-[#ede8dd] bg-white px-3 py-1.5 text-xs font-medium text-[#637368] transition hover:bg-[#faf9f5] hover:text-[#1c2e24] disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* ============ PRODUCT FORM MODAL ============ */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 backdrop-blur-xs p-4 pt-8" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-3xl rounded-2xl border border-[#ede8dd] bg-white shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#ede8dd] bg-[#faf9f5] px-6 py-4">
              <h2 className="text-lg font-bold text-[#1c2e24]">{editingId ? "Edit Product" : "New Product"}</h2>
              <button onClick={() => setShowForm(false)} className="text-lg text-[#8a948c] hover:text-[#1c2e24] transition">✕</button>
            </div>

            <div className="flex gap-1 border-b border-[#ede8dd] bg-[#faf9f5] px-6 overflow-x-auto">
              {(["basic", "pricing", "inventory", "media", "shipping", "seo", "relations", "custom"] as ModalTab[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setFormTab(tab)}
                  className={`whitespace-nowrap px-3.5 py-2.5 text-xs font-semibold transition ${
                    formTab === tab
                      ? "border-b-2 border-[#1e3d2f] text-[#1e3d2f]"
                      : "text-[#637368] hover:text-[#1c2e24]"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="max-h-[60vh] overflow-y-auto p-6 space-y-4">
              {formTab === "basic" && (
                <div className="space-y-4">
                  <FieldRow label="Product Name" required>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData(d => ({ ...d, name: e.target.value, slug: d.slug || slugify(e.target.value) }))}
                      className="w-full rounded-xl border border-[#ede8dd] bg-white px-3.5 py-2 text-xs sm:text-sm text-[#1c2e24] placeholder:text-[#8a9890] outline-none focus:border-[#1e3d2f] focus:ring-1 focus:ring-[#1e3d2f]"
                      placeholder="e.g. Raw Jamun Honey"
                      maxLength={200}
                    />
                    <p className="mt-1 text-[11px] text-[#8a948c]">{formData.name.length}/200</p>
                  </FieldRow>

                  <FieldRow label="URL Slug">
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={e => setFormData(d => ({ ...d, slug: e.target.value }))}
                      className="w-full rounded-xl border border-[#ede8dd] bg-white px-3.5 py-2 text-xs sm:text-sm text-[#1c2e24] placeholder:text-[#8a9890] outline-none focus:border-[#1e3d2f] focus:ring-1 focus:ring-[#1e3d2f]"
                      placeholder="auto-generated"
                    />
                  </FieldRow>

                  <FieldRow label="Description">
                    <div className="rounded-xl border border-[#ede8dd] bg-white overflow-hidden">
                      <div className="flex flex-wrap items-center gap-1 border-b border-[#ede8dd] bg-[#faf9f5] px-2.5 py-1.5">
                        <button type="button" onClick={() => insertFormatting("**", "**")} className="rounded px-2 py-0.5 text-xs font-bold text-[#1c2e24] hover:bg-white border border-transparent hover:border-[#ede8dd]" title="Bold">B</button>
                        <button type="button" onClick={() => insertFormatting("*", "*")} className="rounded px-2 py-0.5 text-xs italic text-[#1c2e24] hover:bg-white border border-transparent hover:border-[#ede8dd]" title="Italic">I</button>
                        <button type="button" onClick={() => insertFormatting("### ")} className="rounded px-2 py-0.5 text-xs font-semibold text-[#1c2e24] hover:bg-white border border-transparent hover:border-[#ede8dd]" title="Heading">H3</button>
                        <button type="button" onClick={() => insertFormatting("- ")} className="rounded px-2 py-0.5 text-xs text-[#1c2e24] hover:bg-white border border-transparent hover:border-[#ede8dd]" title="Bullet List">• List</button>
                        <button type="button" onClick={() => insertFormatting("[link text](", ")")} className="rounded px-2 py-0.5 text-xs text-[#1c2e24] hover:bg-white border border-transparent hover:border-[#ede8dd]" title="Link">Link</button>
                      </div>
                      <textarea
                        value={formData.description}
                        onChange={e => setFormData(d => ({ ...d, description: e.target.value }))}
                        className="w-full border-0 bg-white p-3 text-xs sm:text-sm text-[#1c2e24] outline-none placeholder:text-[#8a948c]"
                        rows={5}
                        placeholder="Write detailed product description, floral notes, origins..."
                      />
                    </div>
                  </FieldRow>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FieldRow label="Status" required>
                      <select
                        value={formData.status}
                        onChange={e => setFormData(d => ({ ...d, status: e.target.value as AdminProduct["status"] }))}
                        className="w-full rounded-xl border border-[#ede8dd] bg-white px-3.5 py-2 text-xs sm:text-sm text-[#1c2e24] outline-none focus:border-[#1e3d2f]"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </select>
                    </FieldRow>

                    <FieldRow label="Category" required>
                      <select
                        value={formData.category}
                        onChange={e => setFormData(d => ({ ...d, category: e.target.value, subcategory: "" }))}
                        className="w-full rounded-xl border border-[#ede8dd] bg-white px-3.5 py-2 text-xs sm:text-sm text-[#1c2e24] outline-none focus:border-[#1e3d2f]"
                      >
                        <option value="">Select category</option>
                        {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </FieldRow>
                  </div>

                  {formData.status === "draft" && (
                    <FieldRow label="Schedule Publish">
                      <input
                        type="datetime-local"
                        value={formData.scheduledPublishAt || ""}
                        onChange={e => setFormData(d => ({ ...d, scheduledPublishAt: e.target.value || undefined }))}
                        className="w-full rounded-xl border border-[#ede8dd] bg-white px-3.5 py-2 text-xs sm:text-sm text-[#1c2e24] outline-none focus:border-[#1e3d2f]"
                      />
                    </FieldRow>
                  )}

                  {formData.category && (
                    <FieldRow label="Subcategory">
                      <select
                        value={formData.subcategory}
                        onChange={e => setFormData(d => ({ ...d, subcategory: e.target.value }))}
                        className="w-full rounded-xl border border-[#ede8dd] bg-white px-3.5 py-2 text-xs sm:text-sm text-[#1c2e24] outline-none focus:border-[#1e3d2f]"
                      >
                        <option value="">None</option>
                        {categories.find(c => c.name === formData.category)?.children.map(sc => <option key={sc.id} value={sc.name}>{sc.name}</option>)}
                      </select>
                    </FieldRow>
                  )}

                  <FieldRow label="Tags">
                    <div className="flex flex-wrap gap-2 rounded-xl border border-[#ede8dd] bg-white px-3 py-2">
                      {formData.tags.map(tag => (
                        <span key={tag} className="flex items-center gap-1 rounded-full bg-[#fbf3e6] border border-[#f0e3ce] px-2.5 py-0.5 text-xs font-semibold text-[#c98a2c]">
                          {tag}
                          <button onClick={() => removeTag(tag)} className="ml-0.5 text-[#c98a2c] hover:text-[#b57a22]">×</button>
                        </span>
                      ))}
                      <input
                        type="text"
                        value={tagInput}
                        onChange={e => setTagInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter" && tagInput.trim()) { addTag(tagInput.trim()); setTagInput(""); }
                          if (e.key === ",") { e.preventDefault(); if (tagInput.trim()) { addTag(tagInput.trim()); setTagInput(""); } }
                        }}
                        className="min-w-[80px] flex-1 bg-transparent text-xs sm:text-sm outline-none placeholder:text-[#8a9890]"
                        placeholder="Add tag and press Enter..."
                      />
                    </div>
                  </FieldRow>
                </div>
              )}

              {formTab === "pricing" && (
                <div className="space-y-4">
                  <FieldRow label="Base Price" required>
                    <div className="flex gap-2">
                      <select
                        value={formData.currency}
                        onChange={e => setFormData(d => ({ ...d, currency: e.target.value }))}
                        className="w-28 rounded-xl border border-[#ede8dd] bg-white px-3 py-2 text-xs sm:text-sm text-[#1c2e24] outline-none focus:border-[#1e3d2f]"
                      >
                        <option value="INR">INR (₹)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                      </select>
                      <input
                        type="number"
                        value={formData.price || ""}
                        onChange={e => setFormData(d => ({ ...d, price: parseFloat(e.target.value) || 0 }))}
                        className="flex-1 rounded-xl border border-[#ede8dd] bg-white px-3.5 py-2 text-xs sm:text-sm text-[#1c2e24] outline-none focus:border-[#1e3d2f]"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </FieldRow>

                  <FieldRow label="Sale Price (Optional)">
                    <input
                      type="number"
                      value={formData.salePrice || ""}
                      onChange={e => setFormData(d => ({ ...d, salePrice: e.target.value ? parseFloat(e.target.value) : undefined }))}
                      className="w-full rounded-xl border border-[#ede8dd] bg-white px-3.5 py-2 text-xs sm:text-sm text-[#1c2e24] placeholder:text-[#8a9890] outline-none focus:border-[#1e3d2f]"
                      min="0"
                      step="0.01"
                      placeholder="e.g. 349"
                    />
                  </FieldRow>

                  <FieldRow label="Bulk Pricing Tiers">
                    <div className="space-y-2">
                      {formData.priceTiers.map((tier, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="number"
                            value={tier.minQty}
                            onChange={e => updatePriceTier(idx, { minQty: parseInt(e.target.value) || 1 })}
                            className="w-20 rounded-xl border border-[#ede8dd] bg-white px-2 py-1.5 text-xs text-[#1c2e24]"
                            placeholder="Min"
                          />
                          <span className="text-xs text-[#8a9890]">to</span>
                          <input
                            type="number"
                            value={tier.maxQty ?? ""}
                            onChange={e => updatePriceTier(idx, { maxQty: e.target.value ? parseInt(e.target.value) : null })}
                            className="w-20 rounded-xl border border-[#ede8dd] bg-white px-2 py-1.5 text-xs text-[#1c2e24]"
                            placeholder="∞"
                          />
                          <input
                            type="number"
                            value={tier.price}
                            onChange={e => updatePriceTier(idx, { price: parseFloat(e.target.value) || 0 })}
                            className="flex-1 rounded-xl border border-[#ede8dd] bg-white px-2 py-1.5 text-xs text-[#1c2e24]"
                            placeholder="Price"
                          />
                          <button onClick={() => removePriceTier(idx)} className="text-[#8a9890] hover:text-[#b94e38]">×</button>
                        </div>
                      ))}
                      <button onClick={addPriceTier} className="text-xs font-semibold text-[#c98a2c] hover:underline">+ Add tier</button>
                    </div>
                  </FieldRow>
                </div>
              )}

              {formTab === "inventory" && (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FieldRow label="SKU" required>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.sku}
                          onChange={e => setFormData(d => ({ ...d, sku: e.target.value }))}
                          className="flex-1 rounded-xl border border-[#ede8dd] bg-white px-3 py-2 text-xs sm:text-sm text-[#1c2e24] placeholder:text-[#8a9890] outline-none focus:border-[#1e3d2f]"
                          placeholder="Auto-generated"
                        />
                        <button
                          onClick={() => setFormData(d => ({ ...d, sku: generateSku(d.category || "PRD", products.length) }))}
                          className="rounded-xl border border-[#ede8dd] bg-[#faf9f5] px-3 py-2 text-xs font-semibold text-[#1c2e24] hover:bg-[#ede8dd]/50"
                        >
                          Generate
                        </button>
                      </div>
                    </FieldRow>

                    <FieldRow label="Barcode">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={formData.barcode}
                          onChange={e => setFormData(d => ({ ...d, barcode: e.target.value }))}
                          className="flex-1 rounded-xl border border-[#ede8dd] bg-white px-3 py-2 text-xs sm:text-sm text-[#1c2e24] placeholder:text-[#8a9890] outline-none focus:border-[#1e3d2f]"
                          placeholder="Auto-generated"
                        />
                        <button
                          onClick={() => setFormData(d => ({ ...d, barcode: generateBarcode() }))}
                          className="rounded-xl border border-[#ede8dd] bg-[#faf9f5] px-3 py-2 text-xs font-semibold text-[#1c2e24] hover:bg-[#ede8dd]/50"
                        >
                          Generate
                        </button>
                      </div>
                    </FieldRow>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FieldRow label="Stock Quantity" required>
                      <input
                        type="number"
                        value={formData.stock}
                        onChange={e => setFormData(d => ({ ...d, stock: parseInt(e.target.value) || 0 }))}
                        className="w-full rounded-xl border border-[#ede8dd] bg-white px-3.5 py-2 text-xs sm:text-sm text-[#1c2e24] outline-none focus:border-[#1e3d2f]"
                        min="0"
                      />
                    </FieldRow>

                    <FieldRow label="Low Stock Threshold">
                      <input
                        type="number"
                        value={formData.lowStockThreshold}
                        onChange={e => setFormData(d => ({ ...d, lowStockThreshold: parseInt(e.target.value) || 0 }))}
                        className="w-full rounded-xl border border-[#ede8dd] bg-white px-3.5 py-2 text-xs sm:text-sm text-[#1c2e24] outline-none focus:border-[#1e3d2f]"
                        min="0"
                      />
                    </FieldRow>
                  </div>

                  <FieldRow label="Backorders">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.allowBackorder}
                        onChange={e => setFormData(d => ({ ...d, allowBackorder: e.target.checked }))}
                        className="h-4 w-4 rounded border-[#ede8dd] text-[#1e3d2f] focus:ring-[#1e3d2f]"
                      />
                      <span className="text-xs sm:text-sm text-[#637368]">Allow orders when out of stock</span>
                    </label>
                  </FieldRow>

                  <div className="border-t border-[#ede8dd] pt-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#1c2e24]">Product Variants</h3>
                      <button onClick={addVariant} className="text-xs font-semibold text-[#c98a2c] hover:underline">+ Add Variant</button>
                    </div>
                    {formData.variants.length === 0 && <p className="text-xs text-[#8a9890]">No variants defined.</p>}
                    {formData.variants.map(v => (
                      <div key={v.id} className="mb-3 rounded-xl border border-[#ede8dd] p-3 bg-[#faf9f5]">
                        <div className="mb-2 flex items-center justify-between">
                          <input
                            type="text"
                            value={v.name}
                            onChange={e => updateVariant(v.id, { name: e.target.value })}
                            className="rounded-lg border border-[#ede8dd] bg-white px-2.5 py-1 text-xs font-semibold text-[#1c2e24]"
                          />
                          <button onClick={() => removeVariant(v.id)} className="text-xs text-[#b94e38] hover:underline">Remove</button>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div><label className="text-[10px] text-[#8a9890] uppercase font-semibold">SKU</label><input type="text" value={v.sku} onChange={e => updateVariant(v.id, { sku: e.target.value })} className="mt-0.5 w-full rounded-lg border border-[#ede8dd] bg-white px-2 py-1 text-xs text-[#1c2e24]" /></div>
                          <div><label className="text-[10px] text-[#8a9890] uppercase font-semibold">Price</label><input type="number" value={v.price} onChange={e => updateVariant(v.id, { price: parseFloat(e.target.value) || 0 })} className="mt-0.5 w-full rounded-lg border border-[#ede8dd] bg-white px-2 py-1 text-xs text-[#1c2e24]" /></div>
                          <div><label className="text-[10px] text-[#8a9890] uppercase font-semibold">Stock</label><input type="number" value={v.stock} onChange={e => updateVariant(v.id, { stock: parseInt(e.target.value) || 0 })} className="mt-0.5 w-full rounded-lg border border-[#ede8dd] bg-white px-2 py-1 text-xs text-[#1c2e24]" /></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {formTab === "media" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#1c2e24]">Product Photos</h3>
                    <div className="flex gap-2">
                      <label className="cursor-pointer rounded-full bg-[#1e3d2f] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#162e23]">
                        Upload File
                        <input type="file" accept="image/*" multiple className="hidden" onChange={e => {
                          const files = e.target.files;
                          if (!files) return;
                          Array.from(files).forEach(file => {
                            const reader = new FileReader();
                            reader.onload = ev => {
                              const dataUrl = ev.target?.result as string;
                              const img: ProductImage = { id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, url: dataUrl, alt: file.name.replace(/\.[^.]+$/, ""), order: formData.images.length };
                              setFormData(d => ({ ...d, images: [...d.images, { ...img, order: d.images.length }] }));
                            };
                            reader.readAsDataURL(file);
                          });
                          e.target.value = "";
                        }} />
                      </label>
                      <button onClick={addImage} className="rounded-full border border-[#ede8dd] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#1c2e24] transition hover:bg-[#faf9f5]">+ Add URL</button>
                    </div>
                  </div>

                  <div
                    className="rounded-2xl border-2 border-dashed border-[#ede8dd] bg-[#faf9f5]/60 p-6 text-center transition hover:border-[#c98a2c] hover:bg-[#fbf3e6]/30"
                    onDragOver={e => { e.preventDefault(); }}
                    onDrop={e => {
                      e.preventDefault();
                      const files = e.dataTransfer.files;
                      if (!files) return;
                      Array.from(files).forEach(file => {
                        if (!file.type.startsWith("image/")) return;
                        const reader = new FileReader();
                        reader.onload = ev => {
                          const dataUrl = ev.target?.result as string;
                          const img: ProductImage = { id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, url: dataUrl, alt: file.name.replace(/\.[^.]+$/, ""), order: formData.images.length };
                          setFormData(d => ({ ...d, images: [...d.images, { ...img, order: d.images.length }] }));
                        };
                        reader.readAsDataURL(file);
                      });
                    }}
                  >
                    <div className="text-3xl">📷</div>
                    <p className="mt-2 text-xs sm:text-sm font-semibold text-[#1c2e24]">Drag & drop images here or click &quot;Upload File&quot;</p>
                    <p className="mt-1 text-[11px] text-[#8a9890]">Supports JPG, PNG, WebP</p>
                  </div>

                  {formData.images.length === 0 && (
                    <p className="text-center text-xs text-[#8a9890]">No images yet. Default apothecary jar illustration will be used.</p>
                  )}

                  {formData.images.map((img, idx) => (
                    <div key={img.id} className="flex items-start gap-3 rounded-xl border border-[#ede8dd] p-3 bg-white" draggable onDragStart={() => setDragIdx(idx)} onDragOver={e => e.preventDefault()} onDrop={() => { if (dragIdx !== null) { moveImage(dragIdx, idx); setDragIdx(null); } }} onDragEnd={() => setDragIdx(null)}>
                      <div className="flex flex-col items-center gap-1 pt-2">
                        <span className="cursor-grab text-[#8a9890]">⋮⋮</span>
                        <span className="text-[10px] text-[#8a9890]">#{idx + 1}</span>
                      </div>
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-[#ede8dd] bg-[#faf9f5]">
                        {img.url ? <img src={img.url} alt={img.alt} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-xl">🍯</div>}
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <input type="text" value={img.url.startsWith("data:") ? "(Uploaded file)" : img.url} onChange={e => { if (!img.url.startsWith("data:")) updateImage(img.id, { url: e.target.value }); }} className="w-full rounded-lg border border-[#ede8dd] bg-white px-2.5 py-1 text-xs text-[#1c2e24]" placeholder="Image URL" readOnly={img.url.startsWith("data:")} />
                        <input type="text" value={img.alt} onChange={e => updateImage(img.id, { alt: e.target.value })} className="w-full rounded-lg border border-[#ede8dd] bg-white px-2.5 py-1 text-xs text-[#1c2e24]" placeholder="Alt text" />
                      </div>
                      <button onClick={() => removeImage(img.id)} className="text-[#8a9890] hover:text-[#b94e38]">✕</button>
                    </div>
                  ))}
                </div>
              )}

              {formTab === "shipping" && (
                <div className="space-y-4">
                  <FieldRow label="Weight">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={formData.weight || ""}
                        onChange={e => setFormData(d => ({ ...d, weight: parseFloat(e.target.value) || 0 }))}
                        className="flex-1 rounded-xl border border-[#ede8dd] bg-white px-3.5 py-2 text-xs sm:text-sm text-[#1c2e24] outline-none focus:border-[#1e3d2f]"
                        min="0"
                        step="0.01"
                      />
                      <select
                        value={formData.weightUnit}
                        onChange={e => setFormData(d => ({ ...d, weightUnit: e.target.value as AdminProduct["weightUnit"] }))}
                        className="w-24 rounded-xl border border-[#ede8dd] bg-white px-3 py-2 text-xs sm:text-sm text-[#1c2e24] outline-none"
                      >
                        <option value="kg">kg</option>
                        <option value="g">g</option>
                        <option value="lb">lb</option>
                        <option value="oz">oz</option>
                      </select>
                    </div>
                  </FieldRow>

                  <FieldRow label="Package Dimensions (L × W × H)">
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={formData.dimensions.length || ""}
                        onChange={e => setFormData(d => ({ ...d, dimensions: { ...d.dimensions, length: parseFloat(e.target.value) || 0 } }))}
                        className="flex-1 rounded-xl border border-[#ede8dd] bg-white px-3 py-2 text-xs text-[#1c2e24]"
                        placeholder="L"
                        min="0"
                        step="0.1"
                      />
                      <input
                        type="number"
                        value={formData.dimensions.width || ""}
                        onChange={e => setFormData(d => ({ ...d, dimensions: { ...d.dimensions, width: parseFloat(e.target.value) || 0 } }))}
                        className="flex-1 rounded-xl border border-[#ede8dd] bg-white px-3 py-2 text-xs text-[#1c2e24]"
                        placeholder="W"
                        min="0"
                        step="0.1"
                      />
                      <input
                        type="number"
                        value={formData.dimensions.height || ""}
                        onChange={e => setFormData(d => ({ ...d, dimensions: { ...d.dimensions, height: parseFloat(e.target.value) || 0 } }))}
                        className="flex-1 rounded-xl border border-[#ede8dd] bg-white px-3 py-2 text-xs text-[#1c2e24]"
                        placeholder="H"
                        min="0"
                        step="0.1"
                      />
                      <select
                        value={formData.dimensionUnit}
                        onChange={e => setFormData(d => ({ ...d, dimensionUnit: e.target.value as AdminProduct["dimensionUnit"] }))}
                        className="w-24 rounded-xl border border-[#ede8dd] bg-white px-3 py-2 text-xs text-[#1c2e24]"
                      >
                        <option value="cm">cm</option>
                        <option value="in">in</option>
                        <option value="m">m</option>
                      </select>
                    </div>
                  </FieldRow>
                </div>
              )}

              {formTab === "seo" && (
                <div className="space-y-4">
                  <FieldRow label="Meta Title">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.seo.metaTitle}
                        onChange={e => setFormData(d => ({ ...d, seo: { ...d.seo, metaTitle: e.target.value } }))}
                        className="flex-1 rounded-xl border border-[#ede8dd] bg-white px-3.5 py-2 text-xs sm:text-sm text-[#1c2e24] placeholder:text-[#8a9890] outline-none"
                        placeholder={formData.name || "Inherits from product name"}
                      />
                      <button
                        onClick={() => setFormData(d => ({ ...d, seo: { ...d.seo, metaTitle: d.name } }))}
                        className="rounded-xl border border-[#ede8dd] bg-[#faf9f5] px-3.5 py-2 text-xs font-semibold text-[#1c2e24] hover:bg-[#ede8dd]/50"
                      >
                        Use Name
                      </button>
                    </div>
                  </FieldRow>

                  <FieldRow label="Meta Description">
                    <textarea
                      value={formData.seo.metaDescription}
                      onChange={e => setFormData(d => ({ ...d, seo: { ...d.seo, metaDescription: e.target.value } }))}
                      className="w-full rounded-xl border border-[#ede8dd] bg-white px-3.5 py-2 text-xs sm:text-sm text-[#1c2e24] placeholder:text-[#8a9890] outline-none"
                      rows={3}
                      placeholder={formData.description || "Inherits from description"}
                    />
                  </FieldRow>
                </div>
              )}

              {formTab === "relations" && (
                <div className="space-y-4">
                  <FieldRow label="Related Products">
                    <select
                      multiple
                      value={formData.relatedProductIds}
                      onChange={e => setFormData(d => ({ ...d, relatedProductIds: Array.from(e.target.selectedOptions, o => o.value) }))}
                      className="w-full rounded-xl border border-[#ede8dd] bg-white p-2.5 text-xs text-[#1c2e24] outline-none"
                      size={5}
                    >
                      {products.filter(p => p.id !== editingId).map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku || p.id.slice(0, 8)})</option>)}
                    </select>
                    <p className="mt-1 text-[11px] text-[#8a9890]">Hold Ctrl or Cmd to select multiple products.</p>
                  </FieldRow>
                </div>
              )}

              {formTab === "custom" && (
                <div className="space-y-4">
                  <p className="text-xs text-[#8a9890]">Add custom key-value attributes stored with this product.</p>
                  {Object.entries(formData.customFields).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-2">
                      <input type="text" value={key} readOnly className="w-40 rounded-xl border border-[#ede8dd] bg-[#faf9f5] px-3 py-2 text-xs font-semibold text-[#1c2e24]" />
                      <input type="text" value={String(val)} onChange={e => setFormData(d => ({ ...d, customFields: { ...d.customFields, [key]: e.target.value } }))} className="flex-1 rounded-xl border border-[#ede8dd] bg-white px-3 py-2 text-xs text-[#1c2e24]" />
                      <button onClick={() => setFormData(d => { const cf = { ...d.customFields }; delete cf[key]; return { ...d, customFields: cf }; })} className="text-[#8a9890] hover:text-[#b94e38]">×</button>
                    </div>
                  ))}
                  <AddCustomFieldValue onAdd={(k, v) => setFormData(d => ({ ...d, customFields: { ...d.customFields, [k]: v } }))} />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-[#ede8dd] bg-[#faf9f5] px-6 py-4">
              <div>
                {editingId && (
                  <button
                    onClick={() => { setConfirmDelete(editingId); setShowForm(false); }}
                    className="text-xs font-semibold text-[#b94e38] hover:underline"
                  >
                    Delete Product
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setShowForm(false)}
                  className="rounded-full border border-[#ede8dd] bg-white px-5 py-2 text-xs sm:text-sm font-semibold text-[#637368] transition hover:bg-[#faf9f5] hover:text-[#1c2e24]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-full bg-[#1e3d2f] px-6 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs transition hover:bg-[#162e23] disabled:cursor-wait disabled:opacity-60"
                >
                  {saving ? "Saving…" : editingId ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ DELETE CONFIRM ============ */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4" onClick={() => setConfirmDelete(null)}>
          <div className="w-full max-w-sm rounded-2xl border border-[#ede8dd] bg-white p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[#1c2e24]">Delete Product</h3>
            <p className="mt-2 text-xs sm:text-sm text-[#637368]">
              Are you sure you want to delete <strong>{products.find(p => p.id === confirmDelete)?.name}</strong>? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-2.5">
              <button
                onClick={() => setConfirmDelete(null)}
                className="rounded-full border border-[#ede8dd] bg-white px-4 py-2 text-xs font-medium text-[#637368] transition hover:bg-[#faf9f5] hover:text-[#1c2e24]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="rounded-full bg-[#b94e38] px-5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#9c3f2d]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ FIELD MANAGER ============ */}
      {showFieldManager && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 backdrop-blur-xs p-4 pt-8" onClick={() => setShowFieldManager(false)}>
          <div className="w-full max-w-2xl rounded-2xl border border-[#ede8dd] bg-white shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#ede8dd] bg-[#faf9f5] px-6 py-4">
              <h2 className="text-lg font-bold text-[#1c2e24]">Field Configuration</h2>
              <button onClick={() => setShowFieldManager(false)} className="text-lg text-[#8a9890] hover:text-[#1c2e24]">✕</button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-6 space-y-6">
              {FIELD_GROUPS.map(group => {
                const groupFields = fieldConfigs.filter(f => f.group === group).sort((a, b) => a.order - b.order);
                if (groupFields.length === 0) return null;
                return (
                  <div key={group}>
                    <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-[#8a9890]">{group}</h3>
                    <div className="space-y-1.5">
                      {groupFields.map(f => (
                        <div key={f.id} className="flex items-center gap-3 rounded-xl border border-[#ede8dd] bg-white px-4 py-2.5 shadow-xs">
                          <input
                            type="checkbox"
                            checked={f.enabled}
                            onChange={e => updateFieldConfig(f.id, { enabled: e.target.checked })}
                            className="h-4 w-4 rounded border-[#ede8dd] text-[#1e3d2f] focus:ring-[#1e3d2f]"
                          />
                          <span className={`flex-1 text-xs sm:text-sm ${f.enabled ? "font-semibold text-[#1c2e24]" : "text-[#8a9890] line-through"}`}>
                            {f.label}
                          </span>
                          <span className="rounded-md bg-[#faf9f5] border border-[#ede8dd] px-2 py-0.5 text-[10px] font-semibold text-[#637368]">
                            {f.type}
                          </span>
                          {f.required && <span className="text-[10px] font-bold text-[#c98a2c]">Required</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============ CATEGORY MANAGER ============ */}
      {showCategoryManager && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 backdrop-blur-xs p-4 pt-8" onClick={() => setShowCategoryManager(false)}>
          <div className="w-full max-w-md rounded-2xl border border-[#ede8dd] bg-white shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#ede8dd] bg-[#faf9f5] px-6 py-4">
              <h2 className="text-lg font-bold text-[#1c2e24]">Manage Categories</h2>
              <button onClick={() => setShowCategoryManager(false)} className="text-lg text-[#8a9890] hover:text-[#1c2e24]">✕</button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-6">
              <CategoryTree nodes={categories} onAdd={addCategory} onRemove={removeCategory} onRename={renameCategory} />
              <AddCategoryInput onAdd={(name) => addCategory(null, name)} />
            </div>
          </div>
        </div>
      )}

      {/* ============ CUSTOM FIELD MANAGER ============ */}
      {showCustomFieldManager && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 backdrop-blur-xs p-4 pt-8" onClick={() => setShowCustomFieldManager(false)}>
          <div className="w-full max-w-2xl rounded-2xl border border-[#ede8dd] bg-white shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-[#ede8dd] bg-[#faf9f5] px-6 py-4">
              <h2 className="text-lg font-bold text-[#1c2e24]">Custom Fields</h2>
              <button onClick={() => setShowCustomFieldManager(false)} className="text-lg text-[#8a9890] hover:text-[#1c2e24]">✕</button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-6">
              <p className="mb-4 text-xs text-[#8a9890]">Define fields that appear on all products. Stored directly in each product&apos;s customFields map.</p>
              {customFields.map(f => (
                <div key={f.id} className="mb-2 flex items-center gap-2.5 rounded-xl border border-[#ede8dd] bg-white px-3.5 py-2.5 shadow-xs">
                  <input
                    type="checkbox"
                    checked={f.enabled}
                    onChange={e => updateCustomField(f.id, { enabled: e.target.checked })}
                    className="h-4 w-4 rounded border-[#ede8dd] text-[#1e3d2f] focus:ring-[#1e3d2f]"
                  />
                  <span className="flex-1 text-xs sm:text-sm font-semibold text-[#1c2e24]">{f.name}</span>
                  <span className="rounded-md bg-[#faf9f5] border border-[#ede8dd] px-2 py-0.5 text-[10px] font-semibold text-[#637368]">{f.type}</span>
                  <button onClick={() => removeCustomField(f.id)} className="text-xs font-semibold text-[#b94e38] hover:underline">Remove</button>
                </div>
              ))}
              <AddCustomFieldForm onAdd={addCustomField} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FieldRow({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#637368]">
        {label}{required && <span className="ml-1 text-[#b94e38]">*</span>}
      </label>
      {children}
    </div>
  );
}

function AddCustomFieldValue({ onAdd }: { onAdd: (key: string, value: string) => void }) {
  const [key, setKey] = useState("");
  const [val, setVal] = useState("");
  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={key}
        onChange={e => setKey(e.target.value)}
        className="w-40 rounded-xl border border-[#ede8dd] bg-white px-3 py-2 text-xs sm:text-sm text-[#1c2e24] placeholder:text-[#8a9890] outline-none"
        placeholder="Field name"
      />
      <input
        type="text"
        value={val}
        onChange={e => setVal(e.target.value)}
        className="flex-1 rounded-xl border border-[#ede8dd] bg-white px-3 py-2 text-xs sm:text-sm text-[#1c2e24] placeholder:text-[#8a9890] outline-none"
        placeholder="Value"
      />
      <button
        onClick={() => { if (key.trim()) { onAdd(key.trim(), val); setKey(""); setVal(""); } }}
        className="rounded-xl bg-[#1e3d2f] px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#162e23]"
      >
        Add
      </button>
    </div>
  );
}

function CategoryTree({ nodes, onAdd, onRemove, onRename, parentId }: { nodes: CategoryNode[]; onAdd: (parentId: string, name: string) => void; onRemove: (id: string) => void; onRename: (id: string, name: string) => void; parentId?: string }) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [newChildName, setNewChildName] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  function toggle(id: string) { setExpanded(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; }); }

  return (
    <div className={parentId ? "ml-4 border-l border-[#ede8dd] pl-3" : ""}>
      {nodes.map(node => (
        <div key={node.id} className="mb-1">
          <div className="flex items-center gap-2 rounded-xl px-2.5 py-1.5 hover:bg-[#faf9f5] transition">
            {node.children.length > 0 && <button onClick={() => toggle(node.id)} className="text-xs text-[#8a9890]">{expanded.has(node.id) ? "▼" : "▶"}</button>}
            {editingId === node.id ? (
              <input
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                onBlur={() => { if (editName.trim()) { onRename(node.id, editName.trim()); } setEditingId(null); }}
                onKeyDown={e => { if (e.key === "Enter") { if (editName.trim()) onRename(node.id, editName.trim()); setEditingId(null); } if (e.key === "Escape") setEditingId(null); }}
                className="flex-1 rounded-lg border border-[#c98a2c] px-2 py-0.5 text-xs text-[#1c2e24] outline-none"
                autoFocus
              />
            ) : (
              <span className="flex-1 text-xs sm:text-sm font-semibold text-[#1c2e24]" onDoubleClick={() => { setEditingId(node.id); setEditName(node.name); }}>{node.name}</span>
            )}
            <button onClick={() => { setNewChildName(node.id); }} className="text-xs font-semibold text-[#c98a2c] hover:underline">+sub</button>
            <button onClick={() => onRemove(node.id)} className="text-xs font-bold text-[#b94e38] hover:text-red-700 px-1">×</button>
          </div>
          {expanded.has(node.id) && <CategoryTree nodes={node.children} onAdd={onAdd} onRemove={onRemove} onRename={onRename} parentId={node.id} />}
          {newChildName === node.id && (
            <div className="ml-6 mt-1 flex gap-1">
              <input
                type="text"
                autoFocus
                onKeyDown={e => {
                  if (e.key === "Enter" && (e.target as HTMLInputElement).value.trim()) {
                    onAdd(node.id, (e.target as HTMLInputElement).value.trim());
                    setNewChildName(null);
                  }
                  if (e.key === "Escape") setNewChildName(null);
                }}
                className="rounded-lg border border-[#c98a2c] px-2.5 py-1 text-xs text-[#1c2e24] outline-none"
                placeholder="Subcategory name"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function AddCategoryInput({ onAdd }: { onAdd: (name: string) => void }) {
  const [name, setName] = useState("");
  return (
    <div className="mt-4 flex gap-2">
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter" && name.trim()) { onAdd(name.trim()); setName(""); } }}
        className="flex-1 rounded-xl border border-[#ede8dd] bg-white px-3.5 py-2 text-xs sm:text-sm text-[#1c2e24] placeholder:text-[#8a9890] outline-none focus:border-[#1e3d2f]"
        placeholder="New category name..."
      />
      <button
        onClick={() => { if (name.trim()) { onAdd(name.trim()); setName(""); } }}
        className="rounded-xl bg-[#1e3d2f] px-5 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs transition hover:bg-[#162e23]"
      >
        Add
      </button>
    </div>
  );
}

function AddCustomFieldForm({ onAdd }: { onAdd: (field: import("@/lib/admin-products").CustomFieldDef) => void }) {
  const [name, setName] = useState("");
  const [type, setType] = useState<import("@/lib/admin-products").FieldType>("text");
  return (
    <div className="mt-4 flex gap-2">
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        className="flex-1 rounded-xl border border-[#ede8dd] bg-white px-3 py-2 text-xs sm:text-sm text-[#1c2e24] placeholder:text-[#8a9890] outline-none focus:border-[#1e3d2f]"
        placeholder="Field name..."
      />
      <select
        value={type}
        onChange={e => setType(e.target.value as import("@/lib/admin-products").FieldType)}
        className="rounded-xl border border-[#ede8dd] bg-white px-3 py-2 text-xs sm:text-sm text-[#1c2e24] outline-none"
      >
        <option value="text">Text</option>
        <option value="number">Number</option>
        <option value="select">Select</option>
        <option value="toggle">Toggle</option>
        <option value="date">Date</option>
        <option value="textarea">Textarea</option>
      </select>
      <button
        onClick={() => { if (name.trim()) { onAdd({ id: `cf-${Date.now()}`, name: name.trim(), type, group: "Custom", enabled: true, order: 0 }); setName(""); } }}
        className="rounded-xl bg-[#1e3d2f] px-5 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs transition hover:bg-[#162e23]"
      >
        Add
      </button>
    </div>
  );
}
