import { useMenu, useLogout, useGetIdentity } from "@refinedev/core";
import { Button } from "../../ui/button";
import {
  LayoutDashboard,
  MessageSquare,
  Calendar,
  FileText,
  Package,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router";

export function CRMLayout({ children }: { children: React.ReactNode }) {
  const { menuItems } = useMenu();
  const { mutate: logout } = useLogout();
  const { data: identity } = useGetIdentity();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const iconMap: Record<string, React.ReactNode> = {
    "💬": <MessageSquare className="h-5 w-5" />,
    "📅": <Calendar className="h-5 w-5" />,
    "📋": <FileText className="h-5 w-5" />,
    "🎒": <Package className="h-5 w-5" />,
  };

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    return path !== "/" && location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between border-b px-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <LayoutDashboard className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-900">
                Agent CRM
              </span>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            <Link
              to="/"
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive("/") && location.pathname === "/"
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>

            {menuItems.map((item) => (
              <Link
                key={item.key}
                to={item.route || "/"}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(item.route || "")
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {iconMap[item.meta?.icon as string] || (
                  <Package className="h-5 w-5" />
                )}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* User Section */}
          <div className="border-t p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <span className="text-sm font-semibold text-blue-700">
                  {identity?.name?.slice(0, 2).toUpperCase() || "AG"}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">
                  {identity?.name || "Agent"}
                </p>
                <p className="text-xs text-slate-500">{identity?.email}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => logout()}
              className="w-full justify-start gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-16 items-center justify-between border-b bg-white px-6 lg:px-8">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 lg:flex-none">
            <h1 className="text-xl font-semibold text-slate-900">
              Travel Agent CRM
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              ← Back to Site
            </a>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
