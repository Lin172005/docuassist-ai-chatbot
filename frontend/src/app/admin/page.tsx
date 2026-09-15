"use client";

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
    { label: "Total Products", value: totalProducts, detail: `${published} published`, icon: "📦", color: "bg-[#e7eee5] text-[#285d40] dark:bg-[#285d40]/15 dark:text-[#6b9776]" },
    { label: "Published", value: published, detail: `${draft} drafts`, icon: "✅", color: "bg-[#f0f7ee] text-[#285d40] dark:bg-[#285d40]/10 dark:text-[#7ba37c]" },
    { label: "Low Stock", value: lowStock, detail: `${outOfStock} out of stock`, icon: "⚠️", color: "bg-[#fdf3e0] text-[#9b6417] dark:bg-[#d88a16]/10 dark:text-[#e5a72f]" },
    { label: "Inventory Value", value: formatCurrency(totalValue, "INR"), detail: `Across ${totalProducts} products`, icon: "💰", color: "bg-[#f5f0e3] text-[#879088] dark:bg-[#eee7d8]/15 dark:text-[#657168]" },
  ];

  const lowStockProducts = products
    .filter(p => p.stock > 0 && p.stock <= p.lowStockThreshold)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 8);

  const recentProducts = [...products].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 8);

  const categoryBreakdown = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#243b2a] dark:text-white">Dashboard</h1>
        <p className="text-sm text-[#879088] dark:text-gray-400">Welcome back. Here&apos;s your store overview.</p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(stat => (
          <div key={stat.label} className="rounded-xl border border-[#eee7d8] bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <span className={`flex h-10 w-10 items-center justify-center rounded-lg text-lg ${stat.color}`}>{stat.icon}</span>
              <span className="text-xs text-[#879088]">{stat.detail}</span>
            </div>
            <p className="mt-3 text-2xl font-bold text-[#243b2a] dark:text-white">{stat.value}</p>
            <p className="text-sm text-[#657168] dark:text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-[#eee7d8] bg-white dark:border-gray-800 dark:bg-gray-900 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-[#eee7d8] px-5 py-4 dark:border-gray-800">
            <h2 className="font-semibold text-[#243b2a] dark:text-white">Recently Updated</h2>
            <a href="/admin/products" className="text-xs font-medium text-[#9b6417] hover:text-[#7b520f] dark:text-[#e5a72f]">View all →</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#eee7d8] text-xs uppercase tracking-wider text-[#879088] dark:border-gray-800 dark:text-gray-400">
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3">Stock</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eee7d8] dark:divide-gray-800">
                {recentProducts.map(p => (
                  <tr key={p.id} className="hover:bg-[#fbfaf5] dark:hover:bg-gray-800/50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-[#243b2a] dark:text-white">{p.name}</p>
                      <p className="text-xs text-[#879088]">{p.id}</p>
                    </td>
                    <td className="px-5 py-3 text-[#657168] dark:text-gray-400">{p.category}</td>
                    <td className="px-5 py-3 font-medium text-[#243b2a] dark:text-white">{formatCurrency(p.price, p.currency)}</td>
                    <td className="px-5 py-3">
                      <span className={`font-medium ${p.stock <= p.lowStockThreshold ? (p.stock === 0 ? "text-red-500 dark:text-red-400" : "text-[#9b6417]") : "text-[#243b2a] dark:text-white"}`}>
                        {p.stock}
                        {p.stock <= p.lowStockThreshold && p.stock > 0 && " ⚠"}
                        {p.stock === 0 && " ✕"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        p.status === "published" ? "bg-[#e7eee5] text-[#285d40] dark:bg-[#285d40]/15 dark:text-[#6b9776]" :
                        p.status === "archived" ? "bg-[#f2f0ea] text-[#879088] dark:bg-gray-800 dark:text-gray-400" :
                        "bg-[#fdf3e0] text-[#9b6417] dark:bg-[#d88a16]/10 dark:text-[#e5a72f]"
                      }`}>{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-[#eee7d8] bg-white dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-[#eee7d8] px-5 py-4 dark:border-gray-800">
              <h2 className="font-semibold text-[#243b2a] dark:text-white">Low Stock Alerts</h2>
            </div>
            <div className="divide-y divide-[#eee7d8] dark:divide-gray-800">
              {lowStockProducts.length === 0 && (
                <p className="px-5 py-4 text-sm text-[#879088]">All stock levels healthy.</p>
              )}
              {lowStockProducts.map(p => (
                <div key={p.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-[#243b2a] dark:text-white">{p.name}</p>
                    <p className="text-xs text-[#879088]">Threshold: {p.lowStockThreshold}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    p.stock <= p.lowStockThreshold * 0.5
                      ? "bg-[#fbecec] text-red-600 dark:bg-red-500/10 dark:text-red-400"
                      : "bg-[#fdf3e0] text-[#9b6417] dark:bg-[#d88a16]/10 dark:text-[#e5a72f]"
                  }`}>{p.stock} left</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[#eee7d8] bg-white dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-[#eee7d8] px-5 py-4 dark:border-gray-800">
              <h2 className="font-semibold text-[#243b2a] dark:text-white">Categories</h2>
            </div>
            <div className="divide-y divide-[#eee7d8] dark:divide-gray-800">
              {Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
                <div key={cat} className="flex items-center justify-between px-5 py-3">
                  <span className="text-sm text-[#536257] dark:text-gray-300">{cat}</span>
                  <span className="rounded-full bg-[#f2f0ea] px-2 py-0.5 text-xs font-medium text-[#657168] dark:bg-gray-800 dark:text-gray-400">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[#eee7d8] bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-3 font-semibold text-[#243b2a] dark:text-white">Quick Stats</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-[#657168] dark:text-gray-400">Drafts</span><span className="font-medium text-[#243b2a] dark:text-white">{draft}</span></div>
              <div className="flex justify-between"><span className="text-[#657168] dark:text-gray-400">Archived</span><span className="font-medium text-[#243b2a] dark:text-white">{archived}</span></div>
              <div className="flex justify-between"><span className="text-[#657168] dark:text-gray-400">Out of Stock</span><span className="font-medium text-red-500">{outOfStock}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
