// src/Components/Common/Sidebar.jsx
import { NavLink } from "react-router-dom";
import {
  FiHome, FiDollarSign, FiPieChart, FiTrendingUp,
  FiTarget, FiCreditCard, FiSettings, FiX,
} from "react-icons/fi";

const menu = [
  { name: "Dashboard",    path: "/dashboard",    icon: FiHome },
  { name: "Transactions", path: "/transaction",  icon: FiDollarSign },
  { name: "Analytics",    path: "/analytics",    icon: FiTrendingUp },
  { name: "Budget",       path: "/budget",       icon: FiTarget },
  { name: "Cards",        path: "/cards",        icon: FiCreditCard },
  { name: "Reports",  path: "/reports",  icon: FiPieChart },
];

const bottom = [
  { name: "Settings", path: "/settings", icon: FiSettings },
];

const Sidebar = ({ open, onClose }) => {
  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed md:static top-0 left-0 z-40 md:z-auto
          h-full w-64 flex flex-col
          bg-white dark:bg-slate-900
          border-r border-slate-200 dark:border-slate-800
          transform transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Mobile close */}
        <div className="flex items-center justify-between p-5 md:hidden border-b border-slate-200 dark:border-slate-800">
          <span className="font-bold text-indigo-600 dark:text-indigo-400" style={{ fontFamily: "'Playfair Display', serif" }}>
            FinanceHub
          </span>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
            <FiX size={20} />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-5 space-y-1">
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-3">
            Main Menu
          </p>
          {menu.map(({ name, path, icon: Icon }) => (
            <NavLink
              key={name}
              to={path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                ${isActive
                  ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`p-1.5 rounded-lg ${isActive ? "bg-indigo-100 dark:bg-indigo-900/50" : "bg-transparent"}`}>
                    <Icon size={16} />
                  </span>
                  {name}
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                  )}
                </>
              )}
            </NavLink>
          ))}

          <div className="pt-4">
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-3">
              Preferences
            </p>
            {bottom.map(({ name, path, icon: Icon }) => (
              <NavLink
                key={name}
                to={path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                  ${isActive
                    ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={`p-1.5 rounded-lg ${isActive ? "bg-indigo-100 dark:bg-indigo-900/50" : ""}`}>
                      <Icon size={16} />
                    </span>
                    {name}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Bottom user card */}
        {/* <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-cyan-400 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
              FH
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">FinanceHub Pro</p>
              <p className="text-xs text-slate-400 truncate">v2.0</p>
            </div>
          </div>
        </div> */}
      </aside>
    </>
  );
};

export default Sidebar;