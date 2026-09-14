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
    { label: "Total Products", value: totalProducts, detail: `${published} published`, icon: "📦", color: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400" },
    { label: "Published", value: published, detail: `${draft} drafts`, icon: "✅", color: "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400" },
    { label: "Low Stock", value: lowStock, detail: `${outOfStock} out of stock`, icon: "⚠️", color: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400" },
    { label: "Inventory Value", value: formatCurrency(totalValue, "INR"), detail: `Across ${totalProducts} products`, icon: "💰", color: "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400" },
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back. Here&apos;s your store overview.</p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(stat => (
          <div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <span className={`flex h-10 w-10 items-center justify-center rounded-lg text-lg ${stat.color}`}>{stat.icon}</span>
              <span className="text-xs text-gray-400">{stat.detail}</span>
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
            <h2 className="font-semibold text-gray-900 dark:text-white">Recently Updated</h2>
            <a href="/admin/products" className="text-xs font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400">View all →</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-400 dark:border-gray-800">
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">Category</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3">Stock</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {recentProducts.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-900 dark:text-white">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.id}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-500 dark:text-gray-400">{p.category}</td>
                    <td className="px-5 py-3 font-medium">{formatCurrency(p.price, p.currency)}</td>
                    <td className="px-5 py-3">
                      <span className={`font-medium ${p.stock <= p.lowStockThreshold ? (p.stock === 0 ? "text-red-500" : "text-amber-500") : "text-gray-900 dark:text-white"}`}>
                        {p.stock}
                        {p.stock <= p.lowStockThreshold && p.stock > 0 && " ⚠"}
                        {p.stock === 0 && " ✕"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        p.status === "published" ? "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400" :
                        p.status === "archived" ? "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400" :
                        "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                      }`}>{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
              <h2 className="font-semibold text-gray-900 dark:text-white">Low Stock Alerts</h2>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {lowStockProducts.length === 0 && (
                <p className="px-5 py-4 text-sm text-gray-400">All stock levels healthy.</p>
              )}
              {lowStockProducts.map(p => (
                <div key={p.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{p.name}</p>
                    <p className="text-xs text-gray-400">Threshold: {p.lowStockThreshold}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    p.stock <= p.lowStockThreshold * 0.5
                      ? "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                      : "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
                  }`}>{p.stock} left</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
              <h2 className="font-semibold text-gray-900 dark:text-white">Categories</h2>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
                <div key={cat} className="flex items-center justify-between px-5 py-3">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{cat}</span>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-3 font-semibold text-gray-900 dark:text-white">Quick Stats</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Drafts</span><span className="font-medium">{draft}</span></div>
              <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Archived</span><span className="font-medium">{archived}</span></div>
              <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Out of Stock</span><span className="font-medium text-red-500">{outOfStock}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
