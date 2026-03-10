// src/Pages/Analytics.jsx
import React from "react";
import { Bar, Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend } from "chart.js";
import { FiTrendingUp, FiArrowUp, FiArrowDown } from "react-icons/fi";

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend);

const months = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb"];

const barData = {
  labels: months,
  datasets: [
    {
      label: "Income",
      data: [2800, 3100, 2900, 3400, 3200, 3000, 3000],
      backgroundColor: "rgba(99,102,241,0.8)",
      borderRadius: 6,
    },
    {
      label: "Expenses",
      data: [1500, 1700, 1600, 1800, 2000, 1400, 1570],
      backgroundColor: "rgba(239,68,68,0.7)",
      borderRadius: 6,
    },
  ],
};

const savingsData = {
  labels: months,
  datasets: [{
    label: "Savings",
    data: [1300, 1400, 1300, 1600, 1200, 1600, 1430],
    borderColor: "#10b981",
    backgroundColor: "rgba(16,185,129,0.1)",
    tension: 0.4,
    fill: true,
  }],
};

const opts = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { labels: { color: "#94a3b8", font: { size: 12 } } } },
  scales: {
    x: { grid: { color: "rgba(148,163,184,0.1)" }, ticks: { color: "#94a3b8" } },
    y: { grid: { color: "rgba(148,163,184,0.1)" }, ticks: { color: "#94a3b8" } },
  },
};

const insights = [
  { label: "Avg Monthly Savings", value: "$1,419", icon: FiArrowUp, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
  { label: "Highest Expense Month", value: "December", icon: FiArrowDown, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20" },
  { label: "Savings Rate", value: "47.3%", icon: FiTrendingUp, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
];

const Analytics = () => (
  <div className="space-y-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
        Analytics
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Last 7 months financial overview</p>
    </div>

    {/* Insight cards */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {insights.map((ins, i) => (
        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex items-center gap-4">
          <span className={`p-3 rounded-xl ${ins.bg} ${ins.color}`}>
            <ins.icon size={20} />
          </span>
          <div>
            <p className="text-lg font-bold text-slate-900 dark:text-white">{ins.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{ins.label}</p>
          </div>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
        <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-4">Income vs Expenses</h3>
        <div className="h-64"><Bar data={barData} options={opts} /></div>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
        <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-4">Savings Trend</h3>
        <div className="h-64"><Line data={savingsData} options={opts} /></div>
      </div>
    </div>
  </div>
);

export default Analytics;