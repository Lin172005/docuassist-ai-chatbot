"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AdminProductProvider } from "@/context/AdminProductContext";

type Theme = "light" | "dark";
type Role = "admin" | "editor" | "viewer";

interface AdminContextType {
  theme: Theme;
  toggleTheme: () => void;
  role: Role;
  setRole: (r: Role) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
}

const AdminContext = createContext<AdminContextType>({
  theme: "light",
  toggleTheme: () => {},
  role: "admin",
  setRole: () => {},
  sidebarOpen: false,
  setSidebarOpen: () => {},
});

export function useAdmin() {
  return useContext(AdminContext);
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [role, setRole] = useState<Role>("admin");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const saved = localStorage.getItem("admin-theme") as Theme | null;
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("admin-theme", theme);
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  function toggleTheme() {
    setTheme(t => (t === "light" ? "dark" : "light"));
  }

  const navItems = [
    { href: "/admin", icon: "📊", label: "Dashboard", exact: true },
    { href: "/admin/products", icon: "📦", label: "Product Management", exact: false },
  ];

  return (
    <AdminContext.Provider value={{ theme, toggleTheme, role, setRole, sidebarOpen, setSidebarOpen }}>
      <AdminProductProvider>
        <div className="admin-layout min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
          {sidebarOpen && (
            <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
          )}

          <aside className={`fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-200 dark:border-gray-800 dark:bg-gray-900 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
            <div className="flex h-16 items-center justify-between border-b border-gray-200 px-5 dark:border-gray-800">
              <a href="/admin" className="text-lg font-bold tracking-tight">
                Wild<span className="text-amber-500">Hive</span>
                <span className="ml-2 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">ADMIN</span>
              </a>
              <button onClick={() => setSidebarOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden" aria-label="Close sidebar">✕</button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Admin navigation">
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400">Navigation</p>
              {navItems.map(item => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                      isActive
                        ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    {item.label}
                  </a>
                );
              })}
            </nav>

            <div className="border-t border-gray-200 p-4 dark:border-gray-800">
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">Role</label>
              <select value={role} onChange={e => setRole(e.target.value as Role)} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800" aria-label="Select role">
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>

            <div className="border-t border-gray-200 p-4 dark:border-gray-800">
              <a href="/" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-500 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300">← Back to site</a>
            </div>
          </aside>

          <div className="lg:ml-64">
            <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white/80 px-4 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/80 sm:px-6">
              <button onClick={() => setSidebarOpen(true)} className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden" aria-label="Open sidebar">☰</button>
              <div className="flex-1" />
              <div className="flex items-center gap-3">
                <button onClick={toggleTheme} className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 dark:hover:bg-gray-800" aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}>
                  {theme === "light" ? "🌙" : "☀️"}
                </button>
                <div className="h-8 w-px bg-gray-200 dark:bg-gray-700" />
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">A</div>
                  <span className="hidden text-sm font-medium sm:block">Admin</span>
                </div>
              </div>
            </header>
            <main className="p-4 sm:p-6">{children}</main>
          </div>
        </div>
      </AdminProductProvider>
    </AdminContext.Provider>
  );
}
