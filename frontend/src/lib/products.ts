export interface ProductImage {
  id: string;
  url: string;
  alt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  priceLabel: string;
  color: string;
  type: string;
  size: string;
  rating: string;
  reviews: number;
  icon?: string;
  images: ProductImage[];
  stock: number;
  lowStockThreshold: number;
  status: "active" | "inactive" | "archived";
  lastUpdated: string;
  createdAt: string;
}

export const STORAGE_KEY = "wildhive-products";
export const STORAGE_VERSION = 1;

export const seedProducts: Product[] = [
  { id: "WH001", name: "Multi Flower Honey", description: "A rich blend of wild flowers, with a smooth and natural taste.", category: "Honey", price: 499, priceLabel: "₹499", color: "#d99b24", type: "Multi Flower", size: "500 g", rating: "4.8", reviews: 342, images: [], stock: 45, lowStockThreshold: 20, status: "active", lastUpdated: "2026-09-14", createdAt: "2026-01-15" },
  { id: "WH002", name: "Leaf Nectar Honey", description: "Light, aromatic and full of natural goodness.", category: "Honey", price: 599, priceLabel: "₹599", color: "#e9b735", type: "Leaf Nectar", size: "500 g", rating: "4.7", reviews: 218, images: [], stock: 32, lowStockThreshold: 20, status: "active", lastUpdated: "2026-09-13", createdAt: "2026-01-20" },
  { id: "WH003", name: "Kombu Honey", description: "Rare and premium honey from sea-kelp flowers.", category: "Honey", price: 799, priceLabel: "₹799", color: "#bd6c13", type: "Kombu", size: "250 g", rating: "4.9", reviews: 156, images: [], stock: 8, lowStockThreshold: 20, status: "active", lastUpdated: "2026-09-12", createdAt: "2026-02-01" },
  { id: "WH004", name: "Forest Honey", description: "Bold flavour with rich natural nutrients.", category: "Honey", price: 699, priceLabel: "₹699", color: "#a96318", type: "Forest", size: "500 g", rating: "4.8", reviews: 487, images: [], stock: 52, lowStockThreshold: 20, status: "active", lastUpdated: "2026-09-14", createdAt: "2026-01-10" },
  { id: "WH005", name: "Murngai Honey", description: "Unique taste with powerful natural benefits.", category: "Honey", price: 649, priceLabel: "₹649", color: "#e3a62b", type: "Murngai", size: "1 kg", rating: "4.8", reviews: 293, images: [], stock: 15, lowStockThreshold: 20, status: "active", lastUpdated: "2026-09-11", createdAt: "2026-02-10" },
  { id: "WH006", name: "Stingless Bee Honey", description: "Rare, delicate and highly medicinal.", category: "Honey", price: 1099, priceLabel: "₹1,099", color: "#c97818", type: "Stingless Bee", size: "250 g", rating: "4.7", reviews: 124, images: [], stock: 12, lowStockThreshold: 20, status: "active", lastUpdated: "2026-09-10", createdAt: "2026-03-01" },
  { id: "WH007", name: "Langstroth Bee Box", description: "Professional-grade bee box for honey production.", category: "Equipment", price: 2499, priceLabel: "₹2,499", color: "#b8956a", type: "Bee Box", size: "Standard", rating: "4.6", reviews: 89, icon: "▱", images: [], stock: 18, lowStockThreshold: 10, status: "active", lastUpdated: "2026-09-09", createdAt: "2026-01-05" },
  { id: "WH008", name: "Honey Extractor", description: "Efficient centrifugal extractor for honey harvesting.", category: "Equipment", price: 6999, priceLabel: "₹6,999", color: "#a0a0a0", type: "Extractor", size: "Standard", rating: "4.5", reviews: 67, icon: "◉", images: [], stock: 5, lowStockThreshold: 10, status: "active", lastUpdated: "2026-09-08", createdAt: "2026-01-08" },
  { id: "WH009", name: "Bee Smoker", description: "Calms bees during hive inspection and honey collection.", category: "Equipment", price: 1299, priceLabel: "₹1,299", color: "#8a8a8a", type: "Smoker", size: "Standard", rating: "4.7", reviews: 156, icon: "♢", images: [], stock: 3, lowStockThreshold: 10, status: "active", lastUpdated: "2026-09-07", createdAt: "2026-01-12" },
  { id: "WH010", name: "Protective Suit", description: "Full-body beekeeping suit with veil for safety.", category: "Equipment", price: 3499, priceLabel: "₹3,499", color: "#e8e8e8", type: "Suit", size: "Universal", rating: "4.4", reviews: 112, icon: "♙", images: [], stock: 22, lowStockThreshold: 10, status: "active", lastUpdated: "2026-09-06", createdAt: "2026-02-15" },
  { id: "WH011", name: "Hive Tool Set", description: "Essential tools for hive maintenance and inspection.", category: "Equipment", price: 599, priceLabel: "₹599", color: "#c0a060", type: "Tool Set", size: "Standard", rating: "4.6", reviews: 201, icon: "⌁", images: [], stock: 7, lowStockThreshold: 15, status: "active", lastUpdated: "2026-09-05", createdAt: "2026-01-18" },
  { id: "WH012", name: "Italian Honey Bee", description: "Gentle and productive bee colony for beginners.", category: "Bees", price: 1500, priceLabel: "₹1,500", color: "#e8c84a", type: "Italian", size: "Colony", rating: "4.8", reviews: 78, images: [], stock: 0, lowStockThreshold: 5, status: "inactive", lastUpdated: "2026-09-04", createdAt: "2026-03-10" },
  { id: "WH013", name: "Carnolian Bee", description: "Hardy bee variety excellent for cold climates.", category: "Bees", price: 1800, priceLabel: "₹1,800", color: "#d4a840", type: "Carnolian", size: "Colony", rating: "4.7", reviews: 56, images: [], stock: 4, lowStockThreshold: 5, status: "active", lastUpdated: "2026-09-03", createdAt: "2026-03-15" },
  { id: "WH014", name: "Russian Bee", description: "Varroa-resistant bee strain for sustainable beekeeping.", category: "Bees", price: 1700, priceLabel: "₹1,700", color: "#c8a030", type: "Russian", size: "Colony", rating: "4.6", reviews: 43, images: [], stock: 2, lowStockThreshold: 5, status: "active", lastUpdated: "2026-09-02", createdAt: "2026-04-01" },
  { id: "WH015", name: "Seasonal Blend", description: "Limited edition seasonal honey blend.", category: "Honey", price: 449, priceLabel: "₹449", color: "#e0b050", type: "Blend", size: "500 g", rating: "4.5", reviews: 91, images: [], stock: 0, lowStockThreshold: 20, status: "archived", lastUpdated: "2026-08-15", createdAt: "2026-06-01" },
];

export function formatPrice(price: number): string {
  return `₹${price.toLocaleString("en-IN")}`;
}

export function isActive(product: Product): boolean {
  return product.status === "active";
}

export function isLowStock(product: Product): boolean {
  return product.stock > 0 && product.stock <= product.lowStockThreshold;
}

export function isOutOfStock(product: Product): boolean {
  return product.stock === 0;
}

export function getCategoryCount(products: Product[], category: string): number {
  if (category === "All Products") return products.filter(isActive).length;
  return products.filter(p => isActive(p) && p.category === category).length;
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}
