// src/Components/Common/Header.jsx
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../Context/ContextSlices/authReader";
import { useNavigate, Link } from "react-router-dom";
import { FiLogOut, FiSun, FiMoon, FiMenu, FiX, FiBell } from "react-icons/fi";
import { useTheme } from "../../Context/ThemeContext";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { logoutApi } from "../../api/authApi";

const Header = ({ onMenuToggle, menuOpen }) => {
  const { isLoggedIn, user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch (_) {
      // ignore – clear locally regardless
    }
    dispatch(logout());
    toast.success("Logged out. See you soon! 👋", { icon: "🚪" });
    navigate("/login");
  };

  return (
    <div className="flex justify-between items-center w-full px-4 md:px-6">
      {/* Left: Hamburger (mobile) + Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="Toggle menu"
        >
          {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
        </button>

        <Link
          to="/"
          className="flex items-center gap-2 font-display text-xl font-bold text-indigo-600 dark:text-indigo-400 tracking-tight"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          <span className="bg-indigo-600 text-white rounded-lg px-2 py-0.5 text-sm font-bold tracking-widest">FH</span>
          <span className="hidden sm:inline">FinanceHub</span>
        </Link>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* {isLoggedIn && (
          <button className="relative p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            <FiBell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        )} */}

        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <FiSun size={17} /> : <FiMoon size={17} />}
        </button>

        {isLoggedIn ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-cyan-400 flex items-center justify-center text-white text-sm font-bold">
                {(user?.name || "U")[0].toUpperCase()}
              </div>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {user?.name || "User"}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg text-sm font-semibold hover:bg-red-100 dark:hover:bg-red-900/40 transition"
            >
              <FiLogOut size={14} />
              <span className="hidden xs:inline">Logout</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition shadow-sm shadow-indigo-200 dark:shadow-none"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;