"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminProductProvider } from "@/context/AdminProductContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";

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

function AdminLayoutInner({ children }: { children: ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
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

  useEffect(() => {
    if (!isLoading && !user && pathname !== "/admin/login") {
      router.push("/admin/login");
    }
  }, [isLoading, user, pathname, router]);

  useEffect(() => {
    if (user) {
      setRole(user.role as Role);
    }
  }, [user]);

  function toggleTheme() {
    setTheme(t => (t === "light" ? "dark" : "light"));
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!user && pathname !== "/admin/login") {
    return null;
  }

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const navItems = [
    { href: "/admin", icon: "⌂", label: "Dashboard", exact: true },
    { href: "/admin/products", icon: "▦", label: "Product Management", exact: false },
  ];

  return (
    <AdminContext.Provider value={{ theme, toggleTheme, role, setRole, sidebarOpen, setSidebarOpen }}>
      <AdminProductProvider>
        <div className="admin-layout min-h-screen bg-[#fbfaf5] text-[#243b2a] dark:bg-[#fbfaf5] dark:text-[#243b2a]">
          {sidebarOpen && (
            <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
          )}

          <aside className={`admin-sidebar fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-[#eee7d8] bg-[#fffdf8] transition-transform duration-200 dark:border-[#eee7d8] dark:bg-[#fffdf8] lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
            <div className="admin-brand-block border-b border-[#eee7d8] px-5 py-7 dark:border-[#eee7d8]">
              <a href="/admin" className="admin-brand flex items-center gap-2 text-xl font-bold tracking-tight">
                <span className="admin-brand-mark" aria-hidden="true"><i /><i /><i /></span>
                Wild<span className="text-amber-500">Hive</span>
              </a>
              <p className="admin-tagline">Pure · Natural · Organic</p>
              <button onClick={() => setSidebarOpen(false)} className="absolute right-4 top-5 flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 lg:hidden" aria-label="Close sidebar">✕</button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Admin navigation">
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#9b6417]">Workspace</p>
              {navItems.map(item => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`admin-nav-item mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                      isActive
                        ? "admin-nav-active"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    {item.label}
                  </a>
                );
              })}
            </nav>

            <div className="admin-sidebar-note mx-4 mb-5">
              <span>Good things<br />come from nature</span><b>✣</b>
            </div>

            <div className="admin-profile border-t border-[#eee7d8] p-4 dark:border-[#eee7d8]">
              <div className="mb-3 flex items-center gap-2 text-sm text-[#536257]">
                <div className="admin-avatar flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold text-white">
                  {user?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || "A"}
                </div>
                <div className="min-w-0"><span className="block truncate font-medium">{user?.full_name || "Admin"}</span><span className="block truncate text-[11px] text-[#879088]">{user?.email || "admin@wildhive.com"}</span></div>
              </div>
              <button onClick={() => { logout(); router.push("/admin/login"); }} className="flex w-full items-center gap-2 rounded-lg px-1 py-2 text-sm text-gray-500 transition hover:text-[#285d40]">
                <span aria-hidden="true">↪</span> Sign Out
              </button>
            </div>
          </aside>

          <div className="lg:ml-64">
            <header className="admin-topbar sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#eee7d8] bg-[#fbfaf5]/90 px-4 backdrop-blur-md dark:border-[#eee7d8] dark:bg-[#fbfaf5]/90 sm:px-6">
              <button onClick={() => setSidebarOpen(true)} className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 lg:hidden" aria-label="Open sidebar">☰</button>
              <label className="admin-top-search hidden items-center gap-2 md:flex"><span aria-hidden="true">⌕</span><input placeholder="Search products..." aria-label="Search products" /></label>
              <div className="flex-1" />
              <div className="flex items-center gap-3">
                <button className="admin-notification flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100" aria-label="Notifications">♧<i /></button>
                <div className="flex items-center gap-2">
                  <div className="admin-avatar flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white">
                    {user?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || "A"}
                  </div>
                  <span className="hidden text-sm font-medium sm:block">{user?.full_name || "Admin"}</span>
                  <span className="text-xs text-[#657168]">⌄</span>
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

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AuthProvider>
  );
}
