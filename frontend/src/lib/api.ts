const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface ApiOptions extends RequestInit {
  token?: string;
}

async function request<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!res.ok) {
    const responseText = await res.text();
    let detail = responseText;
    try {
      const parsed = JSON.parse(responseText) as { detail?: string };
      detail = parsed.detail || responseText;
    } catch {
      // Keep plain-text server errors useful to the caller.
    }
    throw new Error(detail || `Request failed with HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Auth ──────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: AuthUser;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  return request<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function getMe(token: string): Promise<AuthUser> {
  return request<AuthUser>("/api/auth/me", { token });
}

// ── Products ──────────────────────────────────────────

export interface ApiProduct {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string | null;
  short_description: string | null;
  full_description: string | null;
  status: string;
  category_id: string | null;
  category_name: string | null;
  subcategory: string | null;
  tags: string[];
  price: number;
  price_inr: number;
  currency: string;
  sale_price: number | null;
  price_tiers: Array<{ minQty: number; maxQty: number | null; price: number; currency: string }>;
  stock: number;
  low_stock_threshold: number;
  allow_backorder: boolean;
  variants: Array<{
    id: string;
    name: string;
    attributes: Record<string, string>;
    sku: string;
    barcode: string;
    price: number;
    stock: number;
    imageIndex?: number;
  }>;
  images: Array<{ id: string; url: string; alt: string; order: number }>;
  weight: number | null;
  weight_grams: number | null;
  weight_unit: string;
  dimensions: { length: number; width: number; height: number } | null;
  dimension_unit: string;
  barcode: string | null;
  flavour_profile: string | null;
  source_description: string | null;
  related_product_ids: string[];
  cross_sell_ids: string[];
  seo: { metaTitle: string; metaDescription: string; keywords: string[]; template: string };
  custom_fields: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductListResponse {
  products: ApiProduct[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export async function getProducts(params?: {
  page?: number;
  per_page?: number;
  category?: string;
  status?: string;
  search?: string;
  token?: string;
}): Promise<ProductListResponse> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.per_page) searchParams.set("per_page", String(params.per_page));
  if (params?.category) searchParams.set("category", params.category);
  if (params?.status) searchParams.set("status", params.status);
  if (params?.search) searchParams.set("search", params.search);
  if (params?.token) searchParams.set("token", params.token);

  const qs = searchParams.toString();
  return request<ProductListResponse>(`/api/products${qs ? `?${qs}` : ""}`, {
    token: params?.token,
  });
}

export async function getProduct(id: string, token?: string): Promise<ApiProduct> {
  return request<ApiProduct>(`/api/products/${id}`, { token });
}

export async function createProduct(
  data: Record<string, unknown>,
  token: string,
): Promise<ApiProduct> {
  return request<ApiProduct>("/api/products", {
    method: "POST",
    body: JSON.stringify(data),
    token,
  });
}

export async function updateProduct(
  id: string,
  data: Record<string, unknown>,
  token: string,
): Promise<ApiProduct> {
  return request<ApiProduct>(`/api/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
    token,
  });
}

export async function deleteProduct(id: string, token: string): Promise<void> {
  return request<void>(`/api/products/${id}`, {
    method: "DELETE",
    token,
  });
}

// ── Categories ────────────────────────────────────────

export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export async function getCategories(token?: string): Promise<ApiCategory[]> {
  return request<ApiCategory[]>("/api/categories", { token });
}

export async function createCategory(
  data: { name: string; slug: string; description?: string; parent_id?: string },
  token: string,
): Promise<ApiCategory> {
  return request<ApiCategory>("/api/categories", {
    method: "POST",
    body: JSON.stringify(data),
    token,
  });
}

export async function updateCategory(
  id: string,
  data: Record<string, unknown>,
  token: string,
): Promise<ApiCategory> {
  return request<ApiCategory>(`/api/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
    token,
  });
}

export async function deleteCategory(id: string, token: string): Promise<void> {
  return request<void>(`/api/categories/${id}`, {
    method: "DELETE",
    token,
  });
}

// ── Admin form configuration (field configs & custom field defs) ──

export interface ApiFieldConfigPayload {
  id: string;
  [key: string]: unknown;
}

export async function getFieldConfigs(token: string): Promise<Record<string, unknown>[]> {
  return request<Record<string, unknown>[]>("/api/field-configs", { token });
}

export async function upsertFieldConfig(
  id: string,
  data: Record<string, unknown>,
  token: string,
): Promise<Record<string, unknown>> {
  return request<Record<string, unknown>>(`/api/field-configs/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
    token,
  });
}

export async function createFieldConfig(
  data: Record<string, unknown>,
  token: string,
): Promise<Record<string, unknown>> {
  return request<Record<string, unknown>>("/api/field-configs", {
    method: "POST",
    body: JSON.stringify(data),
    token,
  });
}

export async function deleteFieldConfig(id: string, token: string): Promise<void> {
  return request<void>(`/api/field-configs/${id}`, {
    method: "DELETE",
    token,
  });
}

export async function reorderFieldConfigs(ids: string[], token: string): Promise<void> {
  return request<void>("/api/field-configs/reorder", {
    method: "PUT",
    body: JSON.stringify({ ids }),
    token,
  });
}

export async function getCustomFields(token: string): Promise<Record<string, unknown>[]> {
  return request<Record<string, unknown>[]>("/api/custom-fields", { token });
}

export async function upsertCustomField(
  id: string,
  data: Record<string, unknown>,
  token: string,
): Promise<Record<string, unknown>> {
  return request<Record<string, unknown>>(`/api/custom-fields/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
    token,
  });
}

export async function createCustomField(
  data: Record<string, unknown>,
  token: string,
): Promise<Record<string, unknown>> {
  return request<Record<string, unknown>>("/api/custom-fields", {
    method: "POST",
    body: JSON.stringify(data),
    token,
  });
}

export async function deleteCustomField(id: string, token: string): Promise<void> {
  return request<void>(`/api/custom-fields/${id}`, {
    method: "DELETE",
    token,
  });
}
