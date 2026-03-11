// src/Pages/MainDashboard.jsx
import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Header from "../Components/Common/Header";
import Sidebar from "../Components/Common/Sidebar";

const AUTH_ROUTES = ["/login", "/signup", "/verify-email", "/forgot-password"];

const MainLayout = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  const isAuthPage = AUTH_ROUTES.includes(pathname);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Toaster — global */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: "12px",
            background: "var(--toast-bg, #1e293b)",
            color: "var(--toast-color, #f1f5f9)",
            fontSize: "0.875rem",
            fontFamily: "'DM Sans', sans-serif",
            boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
            border: "1px solid rgba(99,102,241,0.2)",
          },
          success: {
            iconTheme: { primary: "#6366f1", secondary: "#fff" },
          },
          error: {
            iconTheme: { primary: "#ef4444", secondary: "#fff" },
          },
        }}
      />

      {/* Header — hidden on auth pages */}
      {!isAuthPage && (
        <header className="h-16 w-full bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 z-20 flex items-center px-2 shrink-0 transition-colors">
          <Header onMenuToggle={() => setMenuOpen((v) => !v)} menuOpen={menuOpen} />
        </header>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — hidden on auth pages */}
        {!isAuthPage && (
          <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />
        )}

        {/* Main content */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 dark:bg-slate-950 transition-colors">
            <Outlet />
          </main>

          {/* Footer — hidden on auth pages */}
          {!isAuthPage && (
            <footer className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 px-6 py-3 text-center text-xs text-gray-400 dark:text-slate-500 shrink-0 transition-colors">
              © {new Date().getFullYear()} FinanceHub · Built with ♥
            </footer>
          )}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;