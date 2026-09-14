export type FieldType =
  | "text"
  | "textarea"
  | "richtext"
  | "number"
  | "currency"
  | "select"
  | "multiselect"
  | "tags"
  | "image"
  | "toggle"
  | "date"
  | "datetime"
  | "color"
  | "json";

export interface FieldConfig {
  id: string;
  label: string;
  type: FieldType;
  group: string;
  enabled: boolean;
  required: boolean;
  order: number;
  placeholder?: string;
  helpText?: string;
  defaultValue?: unknown;
  options?: { label: string; value: string }[];
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
  dependsOn?: { field: string; value: unknown };
}

export interface CategoryNode {
  id: string;
  name: string;
  slug: string;
  children: CategoryNode[];
}

export interface PriceTier {
  minQty: number;
  maxQty: number | null;
  price: number;
  currency: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  attributes: Record<string, string>;
  sku: string;
  barcode: string;
  price: number;
  stock: number;
  imageIndex?: number;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  order: number;
}

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: "draft" | "published" | "archived";
  scheduledPublishAt?: string;
  category: string;
  subcategory: string;
  tags: string[];
  images: ProductImage[];
  price: number;
  currency: string;
  salePrice?: number;
  priceTiers: PriceTier[];
  variants: ProductVariant[];
  sku: string;
  barcode: string;
  stock: number;
  lowStockThreshold: number;
  allowBackorder: boolean;
  weight: number;
  weightUnit: "kg" | "g" | "lb" | "oz";
  dimensions: { length: number; width: number; height: number };
  dimensionUnit: "cm" | "in" | "m";
  relatedProductIds: string[];
  crossSellIds: string[];
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    template: string;
  };
  customFields: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CustomFieldDef {
  id: string;
  name: string;
  type: FieldType;
  group: string;
  enabled: boolean;
  order: number;
  options?: { label: string; value: string }[];
  defaultValue?: unknown;
}

export const FIELD_GROUPS = [
  "Basic Info",
  "Pricing",
  "Inventory",
  "Media",
  "Shipping",
  "SEO",
  "Relations",
  "Advanced",
] as const;

export const DEFAULT_FIELD_CONFIGS: FieldConfig[] = [
  { id: "name", label: "Product Name", type: "text", group: "Basic Info", enabled: true, required: true, order: 0, placeholder: "e.g. Multi Flower Honey", validation: { maxLength: 200 } },
  { id: "slug", label: "URL Slug", type: "text", group: "Basic Info", enabled: true, required: true, order: 1, placeholder: "auto-generated" },
  { id: "description", label: "Description", type: "richtext", group: "Basic Info", enabled: true, required: false, order: 2 },
  { id: "status", label: "Status", type: "select", group: "Basic Info", enabled: true, required: true, order: 3, options: [{ label: "Draft", value: "draft" }, { label: "Published", value: "published" }, { label: "Archived", value: "archived" }], defaultValue: "draft" },
  { id: "scheduledPublishAt", label: "Schedule Publish", type: "datetime", group: "Basic Info", enabled: true, required: false, order: 4, dependsOn: { field: "status", value: "draft" } },
  { id: "category", label: "Category", type: "select", group: "Basic Info", enabled: true, required: true, order: 5 },
  { id: "subcategory", label: "Subcategory", type: "select", group: "Basic Info", enabled: true, required: false, order: 6 },
  { id: "tags", label: "Tags", type: "tags", group: "Basic Info", enabled: true, required: false, order: 7 },

  { id: "price", label: "Price", type: "currency", group: "Pricing", enabled: true, required: true, order: 0 },
  { id: "currency", label: "Currency", type: "select", group: "Pricing", enabled: true, required: true, order: 1, options: [{ label: "INR (₹)", value: "INR" }, { label: "USD ($)", value: "USD" }, { label: "EUR (€)", value: "EUR" }, { label: "GBP (£)", value: "GBP" }], defaultValue: "INR" },
  { id: "salePrice", label: "Sale Price", type: "currency", group: "Pricing", enabled: true, required: false, order: 2 },
  { id: "priceTiers", label: "Bulk Pricing", type: "json", group: "Pricing", enabled: true, required: false, order: 3 },

  { id: "sku", label: "SKU", type: "text", group: "Inventory", enabled: true, required: true, order: 0, placeholder: "Auto-generated" },
  { id: "barcode", label: "Barcode / UPC", type: "text", group: "Inventory", enabled: true, required: false, order: 1 },
  { id: "stock", label: "Stock Quantity", type: "number", group: "Inventory", enabled: true, required: true, order: 2 },
  { id: "lowStockThreshold", label: "Low Stock Alert", type: "number", group: "Inventory", enabled: true, required: false, order: 3, defaultValue: 10 },
  { id: "allowBackorder", label: "Allow Backorder", type: "toggle", group: "Inventory", enabled: true, required: false, order: 4, defaultValue: false },
  { id: "variants", label: "Variants", type: "json", group: "Inventory", enabled: true, required: false, order: 5 },

  { id: "images", label: "Product Images", type: "image", group: "Media", enabled: true, required: false, order: 0 },

  { id: "weight", label: "Weight", type: "number", group: "Shipping", enabled: true, required: false, order: 0 },
  { id: "weightUnit", label: "Weight Unit", type: "select", group: "Shipping", enabled: true, required: false, order: 1, options: [{ label: "kg", value: "kg" }, { label: "g", value: "g" }, { label: "lb", value: "lb" }, { label: "oz", value: "oz" }], defaultValue: "kg" },
  { id: "dimensions", label: "Dimensions (L×W×H)", type: "json", group: "Shipping", enabled: true, required: false, order: 2 },
  { id: "dimensionUnit", label: "Dimension Unit", type: "select", group: "Shipping", enabled: true, required: false, order: 3, options: [{ label: "cm", value: "cm" }, { label: "in", value: "in" }, { label: "m", value: "m" }], defaultValue: "cm" },

  { id: "seo.metaTitle", label: "Meta Title", type: "text", group: "SEO", enabled: true, required: false, order: 0, placeholder: "Inherits from name" },
  { id: "seo.metaDescription", label: "Meta Description", type: "textarea", group: "SEO", enabled: true, required: false, order: 1, placeholder: "Inherits from description" },
  { id: "seo.keywords", label: "Keywords", type: "tags", group: "SEO", enabled: true, required: false, order: 2 },
  { id: "seo.template", label: "SEO Template", type: "select", group: "SEO", enabled: true, required: false, order: 3, options: [{ label: "Default", value: "default" }, { label: "Product Page", value: "product" }, { label: "Category Page", value: "category" }], defaultValue: "default" },

  { id: "relatedProductIds", label: "Related Products", type: "json", group: "Relations", enabled: true, required: false, order: 0 },
  { id: "crossSellIds", label: "Cross-sell Products", type: "json", group: "Relations", enabled: true, required: false, order: 1 },
];

export const DEFAULT_CATEGORIES: CategoryNode[] = [
  {
    id: "cat-honey", name: "Honey", slug: "honey", children: [
      { id: "cat-multi", name: "Multi Flower", slug: "multi-flower", children: [] },
      { id: "cat-forest", name: "Forest", slug: "forest", children: [] },
      { id: "cat-kombu", name: "Kombu", slug: "kombu", children: [] },
      { id: "cat-murngai", name: "Murngai", slug: "murngai", children: [] },
      { id: "cat-stingless", name: "Stingless Bee", slug: "stingless-bee", children: [] },
    ],
  },
  {
    id: "cat-equipment", name: "Equipment", slug: "equipment", children: [
      { id: "cat-boxes", name: "Bee Boxes", slug: "bee-boxes", children: [] },
      { id: "cat-tools", name: "Tools", slug: "tools", children: [] },
      { id: "cat-suits", name: "Protective Gear", slug: "protective-gear", children: [] },
    ],
  },
  {
    id: "cat-bees", name: "Bees", slug: "bees", children: [
      { id: "cat-italian", name: "Italian", slug: "italian", children: [] },
      { id: "cat-carnolian", name: "Carnolian", slug: "carnolian", children: [] },
      { id: "cat-russian", name: "Russian", slug: "russian", children: [] },
    ],
  },
];

export const SEED_ADMIN_PRODUCTS: AdminProduct[] = [
  {
    id: "WH001", name: "Multi Flower Honey", slug: "multi-flower-honey",
    description: "A rich blend of wild flowers, with a smooth and natural taste.",
    status: "published", category: "Honey", subcategory: "Multi Flower",
    tags: ["bestseller", "natural", "raw"],
    images: [{ id: "img1", url: "", alt: "Multi Flower Honey", order: 0 }],
    price: 499, currency: "INR", salePrice: undefined,
    priceTiers: [{ minQty: 10, maxQty: 49, price: 475, currency: "INR" }, { minQty: 50, maxQty: null, price: 450, currency: "INR" }],
    variants: [
      { id: "v1", name: "500g", attributes: { size: "500 g" }, sku: "WH001-500", barcode: "8901234567001", price: 499, stock: 30 },
      { id: "v2", name: "1kg", attributes: { size: "1 kg" }, sku: "WH001-1KG", barcode: "8901234567002", price: 899, stock: 15 },
    ],
    sku: "WH001", barcode: "8901234567000", stock: 45, lowStockThreshold: 20, allowBackorder: false,
    weight: 0.6, weightUnit: "kg", dimensions: { length: 10, width: 10, height: 12 }, dimensionUnit: "cm",
    relatedProductIds: ["WH002", "WH004"], crossSellIds: ["WH007"],
    seo: { metaTitle: "Multi Flower Honey - WildHive", metaDescription: "Pure multi flower honey from WildHive", keywords: ["honey", "multi flower", "natural"], template: "product" },
    customFields: {}, createdAt: "2026-01-15", updatedAt: "2026-09-14",
  },
  {
    id: "WH002", name: "Leaf Nectar Honey", slug: "leaf-nectar-honey",
    description: "Light, aromatic and full of natural goodness.",
    status: "published", category: "Honey", subcategory: "Leaf Nectar",
    tags: ["aromatic", "light"],
    images: [{ id: "img2", url: "", alt: "Leaf Nectar Honey", order: 0 }],
    price: 599, currency: "INR",
    priceTiers: [], variants: [],
    sku: "WH002", barcode: "8901234567003", stock: 32, lowStockThreshold: 20, allowBackorder: false,
    weight: 0.6, weightUnit: "kg", dimensions: { length: 10, width: 10, height: 12 }, dimensionUnit: "cm",
    relatedProductIds: [], crossSellIds: [],
    seo: { metaTitle: "", metaDescription: "", keywords: [], template: "default" },
    customFields: {}, createdAt: "2026-01-20", updatedAt: "2026-09-13",
  },
  {
    id: "WH003", name: "Kombu Honey", slug: "kombu-honey",
    description: "Rare and premium honey from sea-kelp flowers.",
    status: "published", category: "Honey", subcategory: "Kombu",
    tags: ["rare", "premium"],
    images: [{ id: "img3", url: "", alt: "Kombu Honey", order: 0 }],
    price: 799, currency: "INR",
    priceTiers: [], variants: [],
    sku: "WH003", barcode: "8901234567004", stock: 8, lowStockThreshold: 20, allowBackorder: false,
    weight: 0.35, weightUnit: "kg", dimensions: { length: 8, width: 8, height: 10 }, dimensionUnit: "cm",
    relatedProductIds: [], crossSellIds: [],
    seo: { metaTitle: "", metaDescription: "", keywords: [], template: "default" },
    customFields: {}, createdAt: "2026-02-01", updatedAt: "2026-09-12",
  },
  {
    id: "WH004", name: "Forest Honey", slug: "forest-honey",
    description: "Bold flavour with rich natural nutrients.",
    status: "published", category: "Honey", subcategory: "Forest",
    tags: ["bold", "nutrients"],
    images: [{ id: "img4", url: "", alt: "Forest Honey", order: 0 }],
    price: 699, currency: "INR",
    priceTiers: [], variants: [],
    sku: "WH004", barcode: "8901234567005", stock: 52, lowStockThreshold: 20, allowBackorder: false,
    weight: 0.6, weightUnit: "kg", dimensions: { length: 10, width: 10, height: 12 }, dimensionUnit: "cm",
    relatedProductIds: [], crossSellIds: [],
    seo: { metaTitle: "", metaDescription: "", keywords: [], template: "default" },
    customFields: {}, createdAt: "2026-01-10", updatedAt: "2026-09-14",
  },
  {
    id: "WH005", name: "Murngai Honey", slug: "murngai-honey",
    description: "Unique taste with powerful natural benefits.",
    status: "published", category: "Honey", subcategory: "Murngai",
    tags: ["medicinal", "unique"],
    images: [{ id: "img5", url: "", alt: "Murngai Honey", order: 0 }],
    price: 649, currency: "INR",
    priceTiers: [], variants: [],
    sku: "WH005", barcode: "8901234567006", stock: 15, lowStockThreshold: 20, allowBackorder: false,
    weight: 1.1, weightUnit: "kg", dimensions: { length: 12, width: 12, height: 14 }, dimensionUnit: "cm",
    relatedProductIds: [], crossSellIds: [],
    seo: { metaTitle: "", metaDescription: "", keywords: [], template: "default" },
    customFields: {}, createdAt: "2026-02-10", updatedAt: "2026-09-11",
  },
  {
    id: "WH006", name: "Stingless Bee Honey", slug: "stingless-bee-honey",
    description: "Rare, delicate and highly medicinal.",
    status: "published", category: "Honey", subcategory: "Stingless Bee",
    tags: ["rare", "medicinal"],
    images: [{ id: "img6", url: "", alt: "Stingless Bee Honey", order: 0 }],
    price: 1099, currency: "INR",
    priceTiers: [], variants: [],
    sku: "WH006", barcode: "8901234567007", stock: 12, lowStockThreshold: 20, allowBackorder: false,
    weight: 0.35, weightUnit: "kg", dimensions: { length: 8, width: 8, height: 10 }, dimensionUnit: "cm",
    relatedProductIds: [], crossSellIds: [],
    seo: { metaTitle: "", metaDescription: "", keywords: [], template: "default" },
    customFields: {}, createdAt: "2026-03-01", updatedAt: "2026-09-10",
  },
  {
    id: "WH007", name: "Langstroth Bee Box", slug: "langstroth-bee-box",
    description: "Professional-grade bee box for honey production.",
    status: "published", category: "Equipment", subcategory: "Bee Boxes",
    tags: ["professional", "beekeeping"],
    images: [{ id: "img7", url: "", alt: "Langstroth Bee Box", order: 0 }],
    price: 2499, currency: "INR",
    priceTiers: [], variants: [],
    sku: "WH007", barcode: "8901234567008", stock: 18, lowStockThreshold: 10, allowBackorder: false,
    weight: 5.0, weightUnit: "kg", dimensions: { length: 50, width: 40, height: 30 }, dimensionUnit: "cm",
    relatedProductIds: [], crossSellIds: ["WH008", "WH009"],
    seo: { metaTitle: "", metaDescription: "", keywords: [], template: "default" },
    customFields: {}, createdAt: "2026-01-05", updatedAt: "2026-09-09",
  },
  {
    id: "WH008", name: "Honey Extractor", slug: "honey-extractor",
    description: "Efficient centrifugal extractor for honey harvesting.",
    status: "published", category: "Equipment", subcategory: "Tools",
    tags: ["extractor", "harvesting"],
    images: [{ id: "img8", url: "", alt: "Honey Extractor", order: 0 }],
    price: 6999, currency: "INR",
    priceTiers: [], variants: [],
    sku: "WH008", barcode: "8901234567009", stock: 5, lowStockThreshold: 10, allowBackorder: false,
    weight: 8.0, weightUnit: "kg", dimensions: { length: 45, width: 45, height: 60 }, dimensionUnit: "cm",
    relatedProductIds: [], crossSellIds: [],
    seo: { metaTitle: "", metaDescription: "", keywords: [], template: "default" },
    customFields: {}, createdAt: "2026-01-08", updatedAt: "2026-09-08",
  },
  {
    id: "WH009", name: "Bee Smoker", slug: "bee-smoker",
    description: "Calms bees during hive inspection and honey collection.",
    status: "published", category: "Equipment", subcategory: "Tools",
    tags: ["smoker", "essential"],
    images: [{ id: "img9", url: "", alt: "Bee Smoker", order: 0 }],
    price: 1299, currency: "INR",
    priceTiers: [], variants: [],
    sku: "WH009", barcode: "8901234567010", stock: 3, lowStockThreshold: 10, allowBackorder: false,
    weight: 0.8, weightUnit: "kg", dimensions: { length: 15, width: 10, height: 25 }, dimensionUnit: "cm",
    relatedProductIds: [], crossSellIds: [],
    seo: { metaTitle: "", metaDescription: "", keywords: [], template: "default" },
    customFields: {}, createdAt: "2026-01-12", updatedAt: "2026-09-07",
  },
  {
    id: "WH010", name: "Protective Suit", slug: "protective-suit",
    description: "Full-body beekeeping suit with veil for safety.",
    status: "published", category: "Equipment", subcategory: "Protective Gear",
    tags: ["safety", "suit"],
    images: [{ id: "img10", url: "", alt: "Protective Suit", order: 0 }],
    price: 3499, currency: "INR",
    priceTiers: [], variants: [],
    sku: "WH010", barcode: "8901234567011", stock: 22, lowStockThreshold: 10, allowBackorder: false,
    weight: 1.2, weightUnit: "kg", dimensions: { length: 30, width: 25, height: 10 }, dimensionUnit: "cm",
    relatedProductIds: [], crossSellIds: [],
    seo: { metaTitle: "", metaDescription: "", keywords: [], template: "default" },
    customFields: {}, createdAt: "2026-02-15", updatedAt: "2026-09-06",
  },
  {
    id: "WH011", name: "Hive Tool Set", slug: "hive-tool-set",
    description: "Essential tools for hive maintenance and inspection.",
    status: "published", category: "Equipment", subcategory: "Tools",
    tags: ["tools", "maintenance"],
    images: [{ id: "img11", url: "", alt: "Hive Tool Set", order: 0 }],
    price: 599, currency: "INR",
    priceTiers: [], variants: [],
    sku: "WH011", barcode: "8901234567012", stock: 7, lowStockThreshold: 15, allowBackorder: false,
    weight: 0.5, weightUnit: "kg", dimensions: { length: 20, width: 10, height: 5 }, dimensionUnit: "cm",
    relatedProductIds: [], crossSellIds: [],
    seo: { metaTitle: "", metaDescription: "", keywords: [], template: "default" },
    customFields: {}, createdAt: "2026-01-18", updatedAt: "2026-09-05",
  },
  {
    id: "WH012", name: "Italian Honey Bee", slug: "italian-honey-bee",
    description: "Gentle and productive bee colony for beginners.",
    status: "draft", category: "Bees", subcategory: "Italian",
    tags: ["beginner", "gentle"],
    images: [{ id: "img12", url: "", alt: "Italian Honey Bee", order: 0 }],
    price: 1500, currency: "INR",
    priceTiers: [], variants: [],
    sku: "WH012", barcode: "8901234567013", stock: 0, lowStockThreshold: 5, allowBackorder: true,
    weight: 2.0, weightUnit: "kg", dimensions: { length: 20, width: 15, height: 15 }, dimensionUnit: "cm",
    relatedProductIds: [], crossSellIds: [],
    seo: { metaTitle: "", metaDescription: "", keywords: [], template: "default" },
    customFields: {}, createdAt: "2026-03-10", updatedAt: "2026-09-04",
  },
  {
    id: "WH013", name: "Carnolian Bee", slug: "carnolian-bee",
    description: "Hardy bee variety excellent for cold climates.",
    status: "published", category: "Bees", subcategory: "Carnolian",
    tags: ["hardy", "cold-climate"],
    images: [{ id: "img13", url: "", alt: "Carnolian Bee", order: 0 }],
    price: 1800, currency: "INR",
    priceTiers: [], variants: [],
    sku: "WH013", barcode: "8901234567014", stock: 4, lowStockThreshold: 5, allowBackorder: false,
    weight: 2.0, weightUnit: "kg", dimensions: { length: 20, width: 15, height: 15 }, dimensionUnit: "cm",
    relatedProductIds: [], crossSellIds: [],
    seo: { metaTitle: "", metaDescription: "", keywords: [], template: "default" },
    customFields: {}, createdAt: "2026-03-15", updatedAt: "2026-09-03",
  },
  {
    id: "WH014", name: "Russian Bee", slug: "russian-bee",
    description: "Varroa-resistant bee strain for sustainable beekeeping.",
    status: "published", category: "Bees", subcategory: "Russian",
    tags: ["varroa-resistant", "sustainable"],
    images: [{ id: "img14", url: "", alt: "Russian Bee", order: 0 }],
    price: 1700, currency: "INR",
    priceTiers: [], variants: [],
    sku: "WH014", barcode: "8901234567015", stock: 2, lowStockThreshold: 5, allowBackorder: false,
    weight: 2.0, weightUnit: "kg", dimensions: { length: 20, width: 15, height: 15 }, dimensionUnit: "cm",
    relatedProductIds: [], crossSellIds: [],
    seo: { metaTitle: "", metaDescription: "", keywords: [], template: "default" },
    customFields: {}, createdAt: "2026-04-01", updatedAt: "2026-09-02",
  },
  {
    id: "WH015", name: "Seasonal Blend", slug: "seasonal-blend",
    description: "Limited edition seasonal honey blend.",
    status: "archived", category: "Honey", subcategory: "Multi Flower",
    tags: ["seasonal", "limited"],
    images: [{ id: "img15", url: "", alt: "Seasonal Blend", order: 0 }],
    price: 449, currency: "INR",
    priceTiers: [], variants: [],
    sku: "WH015", barcode: "8901234567016", stock: 0, lowStockThreshold: 20, allowBackorder: false,
    weight: 0.6, weightUnit: "kg", dimensions: { length: 10, width: 10, height: 12 }, dimensionUnit: "cm",
    relatedProductIds: [], crossSellIds: [],
    seo: { metaTitle: "", metaDescription: "", keywords: [], template: "default" },
    customFields: {}, createdAt: "2026-06-01", updatedAt: "2026-08-15",
  },
];

export const STORAGE_KEY = "wildhive-admin";
export const STORAGE_VERSION = 1;

export function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function generateSku(category: string, index: number): string {
  const prefix = category.slice(0, 3).toUpperCase();
  return `${prefix}-${String(index + 1).padStart(4, "0")}`;
}

export function generateBarcode(): string {
  return "890" + Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join("");
}

export function formatCurrency(amount: number, currency: string): string {
  const symbols: Record<string, string> = { INR: "₹", USD: "$", EUR: "€", GBP: "£" };
  return `${symbols[currency] || currency}${amount.toLocaleString("en-IN")}`;
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function nowISO(): string {
  return new Date().toISOString();
}
