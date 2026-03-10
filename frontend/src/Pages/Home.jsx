// src/Pages/Home.jsx
import React from "react";
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiCreditCard, FiArrowUpRight, FiArrowDownLeft } from "react-icons/fi";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Tooltip, Legend, ArcElement,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, ArcElement);

const stats = [
  {
    title: "Total Balance",
    value: "$12,450",
    change: "+2.4%",
    up: true,
    icon: FiDollarSign,
    gradient: "from-indigo-500 to-violet-600",
    light: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400",
  },
  {
    title: "Monthly Income",
    value: "$3,000",
    change: "+5.1%",
    up: true,
    icon: FiTrendingUp,
    gradient: "from-emerald-400 to-teal-600",
    light: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
  },
  {
    title: "Monthly Expenses",
    value: "$1,570",
    change: "-1.8%",
    up: false,
    icon: FiTrendingDown,
    gradient: "from-rose-400 to-red-600",
    light: "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400",
  },
  {
    title: "EMI Due",
    value: "$1,250",
    change: "Next: Mar 1",
    up: null,
    icon: FiCreditCard,
    gradient: "from-amber-400 to-orange-500",
    light: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
  },
];

const recentTx = [
  { label: "Salary Credit",      amount: "+$3,000", type: "income",  date: "Today",     cat: "Income" },
  { label: "Netflix",            amount: "-$15",    type: "expense", date: "Yesterday", cat: "Entertainment" },
  { label: "Grocery Store",      amount: "-$82",    type: "expense", date: "Feb 24",    cat: "Food" },
  { label: "Freelance Payment",  amount: "+$450",   type: "income",  date: "Feb 23",    cat: "Freelance" },
];

const lineData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [
    {
      label: "Income",
      data: [2800, 3000, 2900, 3200, 3000, 3400],
      borderColor: "#6366f1",
      backgroundColor: "rgba(99,102,241,0.08)",
      tension: 0.4,
      fill: true,
      pointRadius: 4,
      pointBackgroundColor: "#6366f1",
    },
    {
      label: "Expenses",
      data: [1600, 1400, 1700, 1500, 1570, 1480],
      borderColor: "#ef4444",
      backgroundColor: "rgba(239,68,68,0.05)",
      tension: 0.4,
      fill: true,
      pointRadius: 4,
      pointBackgroundColor: "#ef4444",
    },
  ],
};

const doughnutData = {
  labels: ["Housing", "Food", "Transport", "Entertainment", "Savings"],
  datasets: [{
    data: [35, 20, 15, 10, 20],
    backgroundColor: ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"],
    borderWidth: 0,
    hoverOffset: 6,
  }],
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: { color: "#94a3b8", font: { size: 12 } },
    },
  },
  scales: {
    x: { grid: { color: "rgba(148,163,184,0.1)" }, ticks: { color: "#94a3b8" } },
    y: { grid: { color: "rgba(148,163,184,0.1)" }, ticks: { color: "#94a3b8" } },
  },
};

const Home = () => (
  <div className="space-y-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>
    {/* Page title */}
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
        Dashboard
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
        Here's your financial overview for February 2026
      </p>
    </div>

    {/* Stat cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((s, i) => (
        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className={`p-2.5 rounded-xl ${s.light}`}>
              <s.icon size={18} />
            </span>
            {s.up !== null ? (
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${s.up ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600" : "bg-red-50 dark:bg-red-900/20 text-red-500"}`}>
                {s.change}
              </span>
            ) : (
              <span className="text-xs font-medium text-slate-400">{s.change}</span>
            )}
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.title}</p>
        </div>
      ))}
    </div>

    {/* Charts row */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
        <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-4">Income vs Expenses</h3>
        <div className="h-60">
          <Line data={lineData} options={chartOptions} />
        </div>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
        <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-4">Spending Breakdown</h3>
        <div className="h-60">
          <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom", labels: { color: "#94a3b8", font: { size: 11 }, padding: 10 } } } }} />
        </div>
      </div>
    </div>

    {/* Recent transactions */}
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
        <h3 className="font-semibold text-slate-700 dark:text-slate-200">Recent Transactions</h3>
        <a href="/transaction" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium">View all</a>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {recentTx.map((tx, i) => (
          <div key={i} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${tx.type === "income" ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600" : "bg-red-50 dark:bg-red-900/20 text-red-500"}`}>
                {tx.type === "income" ? <FiArrowDownLeft size={15} /> : <FiArrowUpRight size={15} />}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{tx.label}</p>
                <p className="text-xs text-slate-400">{tx.date} · {tx.cat}</p>
              </div>
            </div>
            <span className={`text-sm font-bold ${tx.type === "income" ? "text-emerald-600" : "text-red-500"}`}>
              {tx.amount}
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default Home;