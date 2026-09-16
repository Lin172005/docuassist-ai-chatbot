"use client";

import { createContext, useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import Link from "next/link";
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

const emptySubscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

function AdminLayoutInner({ children }: { children: ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const mounted = useMounted();
  const [theme] = useState<Theme>("light");

  const [customRole, setCustomRole] = useState<Role | null>(null);
  const role: Role = customRole || (user?.role as Role) || "admin";
  const setRole = (r: Role) => setCustomRole(r);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.classList.remove("dark");
      localStorage.removeItem("admin-theme");
    }
  }, []);

  useEffect(() => {
    if (mounted && !isLoading && !user && pathname !== "/admin/login") {
      router.push("/admin/login");
    }
  }, [mounted, isLoading, user, pathname, router]);

  function toggleTheme() {
    // Keep light brand theme
  }

  if (!mounted || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#faf9f5]">
        <div className="flex items-center gap-3 text-sm text-[#637368]">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#1e3d2f] border-t-transparent" />
          <span>Verifying admin session...</span>
        </div>
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
    { href: "/admin/products", icon: "▦", label: "Products", exact: false },
  ];

  return (
    <AdminContext.Provider value={{ theme, toggleTheme, role, setRole, sidebarOpen, setSidebarOpen }}>
      <AdminProductProvider>
        <div className="min-h-screen bg-[#faf9f5] text-[#1c2e24]">
          {sidebarOpen && (
            <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
          )}

          <aside className={`fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-[#ede8dd] bg-white transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
            {/* Brand Header */}
            <div className="border-b border-[#ede8dd] px-6 py-5">
              <div className="flex items-center justify-between">
                <Link href="/admin" className="flex items-center gap-1.5 text-xl font-bold tracking-tight text-[#1e3d2f]">
                  Wild<span className="text-[#c98a2c]">Hive</span>
                </Link>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-[#8a948c] hover:bg-[#faf9f5] lg:hidden"
                  aria-label="Close sidebar"
                >
                  ✕
                </button>
              </div>
              <p className="mt-1 text-[11px] font-medium tracking-wide uppercase text-[#8a948c]">Admin Workspace</p>
            </div>

            {/* Nav Menu */}
            <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-1" aria-label="Admin navigation">
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-[#8a948c]">
                Menu
              </p>
              {navItems.map(item => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-medium transition ${
                      isActive
                        ? "bg-[#1e3d2f] text-white"
                        : "text-[#525e56] hover:bg-[#faf9f5] hover:text-[#1e3d2f]"
                    }`}
                  >
                    <span className="text-sm">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Quick Public Link */}
            <div className="px-4 py-3 border-t border-[#ede8dd]">
              <Link
                href="/"
                className="flex items-center justify-center gap-2 rounded-xl border border-[#ede8dd] bg-[#faf9f5] px-3 py-2 text-xs font-semibold text-[#1e3d2f] transition hover:bg-[#ede8dd]/50"
              >
                <span>↗</span> View Public Store
              </Link>
            </div>

            {/* User Profile */}
            <div className="border-t border-[#ede8dd] p-4 bg-white">
              <div className="mb-3 flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1e3d2f] text-xs font-bold text-white">
                  {user?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || "A"}
                </div>
                <div className="min-w-0">
                  <span className="block truncate text-xs font-semibold text-[#1c2e24]">{user?.full_name || "Administrator"}</span>
                  <span className="block truncate text-[10px] text-[#8a948c]">{user?.email || "admin@wildhive.com"}</span>
                </div>
              </div>
              <button
                onClick={() => { logout(); router.push("/admin/login"); }}
                className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-[#8a948c] transition hover:text-red-600 hover:bg-red-50/50"
              >
                <span aria-hidden="true">↪</span> Sign Out
              </button>
            </div>
          </aside>

          {/* Main Area */}
          <div className="lg:ml-64">
            <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#ede8dd] bg-[#faf9f5]/90 px-4 sm:px-8 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#ede8dd] bg-white text-[#1c2e24] hover:bg-[#faf9f5] lg:hidden"
                  aria-label="Open sidebar"
                >
                  ☰
                </button>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#8a948c]">
                  WildHive Store Management
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1e3d2f] text-xs font-bold text-white">
                    {user?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || "A"}
                  </div>
                  <span className="hidden text-xs font-semibold text-[#1c2e24] sm:block">{user?.full_name || "Admin"}</span>
                </div>
              </div>
            </header>
            <main className="p-4 sm:p-8">{children}</main>
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
