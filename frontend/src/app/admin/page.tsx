"use client";

import Link from "next/link";
import { useAdminProducts } from "@/context/AdminProductContext";
import { formatCurrency } from "@/lib/admin-products";

export default function AdminDashboard() {
  const { products } = useAdminProducts();

  const totalProducts = products.length;
  const published = products.filter(p => p.status === "published").length;
  const draft = products.filter(p => p.status === "draft").length;
  const archived = products.filter(p => p.status === "archived").length;
  const lowStock = products.filter(p => p.stock > 0 && p.stock <= p.lowStockThreshold).length;
  const outOfStock = products.filter(p => p.stock === 0).length;
  const totalValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);

  const stats = [
    { label: "Total Products", value: totalProducts, detail: `${published} published`, icon: "📦" },
    { label: "Published Active", value: published, detail: `${draft} in draft`, icon: "✓" },
    { label: "Low Inventory", value: lowStock, detail: `${outOfStock} out of stock`, icon: "⚠" },
    { label: "Inventory Value", value: formatCurrency(totalValue, "INR"), detail: `Across ${totalProducts} items`, icon: "₹" },
  ];

  const lowStockProducts = products
    .filter(p => p.stock > 0 && p.stock <= p.lowStockThreshold)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 6);

  const recentProducts = [...products].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 8);

  const categoryBreakdown = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1c2e24]">Store Overview</h1>
          <p className="mt-1 text-xs sm:text-sm text-[#6b7770]">
            Monitor inventory health, catalog sync, and active stock levels.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/products"
            className="rounded-full bg-[#1e3d2f] px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#152c22]"
          >
            + Manage Products
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(stat => (
          <div key={stat.label} className="rounded-2xl border border-[#ede8dd] bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#faf9f5] border border-[#ede8dd] text-sm font-bold text-[#1e3d2f]">
                {stat.icon}
              </span>
              <span className="text-[11px] font-medium text-[#8a948c]">{stat.detail}</span>
            </div>
            <p className="mt-4 text-2xl font-bold tracking-tight text-[#1c2e24]">{stat.value}</p>
            <p className="mt-0.5 text-xs font-medium text-[#6b7770]">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Table Column */}
        <div className="rounded-2xl border border-[#ede8dd] bg-white shadow-xs lg:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#ede8dd] px-6 py-4">
            <div>
              <h2 className="text-sm font-bold text-[#1c2e24]">Recently Updated Products</h2>
              <p className="text-[11px] text-[#8a948c]">Track changes to catalog pricing & status</p>
            </div>
            <Link
              href="/admin/products"
              className="text-xs font-semibold text-[#c98a2c] hover:underline"
            >
              View catalog →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-[#ede8dd] bg-[#faf9f5] text-[11px] font-semibold uppercase tracking-wider text-[#8a948c]">
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Price</th>
                  <th className="px-6 py-3">Stock</th>
                  <th className="px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ede8dd]">
                {recentProducts.map(p => (
                  <tr key={p.id} className="hover:bg-[#faf9f5]/60 transition">
                    <td className="px-6 py-3.5">
                      <p className="font-semibold text-[#1c2e24]">{p.name}</p>
                      <p className="text-[10px] text-[#8a948c] font-mono">#{p.id.slice(0, 8)}</p>
                    </td>
                    <td className="px-6 py-3.5 text-[#6b7770]">{p.category}</td>
                    <td className="px-6 py-3.5 font-semibold text-[#1c2e24]">{formatCurrency(p.price, p.currency)}</td>
                    <td className="px-6 py-3.5">
                      <span className={`font-semibold ${p.stock <= p.lowStockThreshold ? (p.stock === 0 ? "text-red-600" : "text-[#c98a2c]") : "text-[#1c2e24]"}`}>
                        {p.stock}
                        {p.stock <= p.lowStockThreshold && p.stock > 0 && " ⚠"}
                        {p.stock === 0 && " ✕"}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${
                        p.status === "published" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" :
                        p.status === "archived" ? "bg-gray-100 text-gray-700 border border-gray-200" :
                        "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}>{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          {/* Low Stock Alerts */}
          <div className="rounded-2xl border border-[#ede8dd] bg-white p-5 shadow-xs">
            <h2 className="text-sm font-bold text-[#1c2e24] mb-3">Inventory Watchlist</h2>
            <div className="divide-y divide-[#ede8dd]">
              {lowStockProducts.length === 0 ? (
                <p className="py-4 text-xs text-[#8a948c]">All product stock levels are healthy.</p>
              ) : (
                lowStockProducts.map(p => (
                  <div key={p.id} className="flex items-center justify-between py-2.5">
                    <div>
                      <p className="text-xs font-semibold text-[#1c2e24]">{p.name}</p>
                      <p className="text-[10px] text-[#8a948c]">Threshold: {p.lowStockThreshold} units</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      p.stock === 0
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : "bg-amber-50 text-amber-800 border border-amber-200"
                    }`}>
                      {p.stock === 0 ? "Out of Stock" : `${p.stock} units left`}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Categories */}
          <div className="rounded-2xl border border-[#ede8dd] bg-white p-5 shadow-xs">
            <h2 className="text-sm font-bold text-[#1c2e24] mb-3">Category Distribution</h2>
            <div className="space-y-2">
              {Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
                <div key={cat} className="flex items-center justify-between text-xs py-1">
                  <span className="text-[#6b7770]">{cat}</span>
                  <span className="rounded-full bg-[#faf9f5] border border-[#ede8dd] px-2.5 py-0.5 font-semibold text-[#1c2e24]">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
