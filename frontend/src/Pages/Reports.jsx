// src/Pages/Reports.jsx
import React, { useState, useEffect } from "react";
import { FiDownload, FiCalendar, FiTrendingUp, FiTrendingDown, FiDollarSign } from "react-icons/fi";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from "chart.js";
import { getTransactionsApi } from "../api/authApi";
import { toast } from "react-hot-toast";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const Reports = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [period, setPeriod]             = useState("monthly"); // monthly | weekly

  useEffect(() => {
    getTransactionsApi()
      .then(({ data }) => setTransactions(data))
      .catch(() => toast.error("Failed to load data"))
      .finally(() => setLoading(false));
  }, []);

  // ── Derived stats ──
  const income  = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const net     = income - expense;
  const savings = income > 0 ? ((net / income) * 100).toFixed(1) : "0.0";

  // Monthly bar data
  const monthlyData = MONTHS.map((_, mi) => {
    const txs = transactions.filter((t) => new Date(t.date).getMonth() === mi);
    return {
      income:  txs.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
      expense: txs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
    };
  });

  const barData = {
    labels: MONTHS,
    datasets: [
      { label: "Income",   data: monthlyData.map((d) => d.income),  backgroundColor: "rgba(99,102,241,0.8)",  borderRadius: 4 },
      { label: "Expense",  data: monthlyData.map((d) => d.expense), backgroundColor: "rgba(239,68,68,0.7)",   borderRadius: 4 },
    ],
  };

  // Pie by category
  const catMap = {};
  transactions.filter((t) => t.type === "expense").forEach((t) => {
    catMap[t.category] = (catMap[t.category] || 0) + t.amount;
  });
  const cats = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 7);
  const pieData = {
    labels: cats.map(([k]) => k),
    datasets: [{ data: cats.map(([, v]) => v), backgroundColor: ["#6366f1","#10b981","#f59e0b","#ef4444","#06b6d4","#8b5cf6","#ec4899"], borderWidth: 0 }],
  };

  const chartOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { labels: { color: "#94a3b8", font: { size: 11 } } } },
    scales: {
      x: { grid: { color: "rgba(148,163,184,0.1)" }, ticks: { color: "#94a3b8" } },
      y: { grid: { color: "rgba(148,163,184,0.1)" }, ticks: { color: "#94a3b8" } },
    },
  };

  const handleExport = () => {
    const csv = ["Date,Label,Category,Type,Amount",
      ...transactions.map((t) => `${t.date},${t.label},${t.category},${t.type},${t.amount}`)
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a"); a.href = url; a.download = "transactions.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Report exported!");
  };

  return (
    <div className="space-y-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Reports</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Financial summary & export</p>
        </div>
        <button onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition">
          <FiDownload size={16} /> Export CSV
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Income",   value: `$${income.toFixed(2)}`,   icon: FiTrendingUp,   color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
          { label: "Total Expenses", value: `$${expense.toFixed(2)}`,  icon: FiTrendingDown, color: "text-red-500",     bg: "bg-red-50 dark:bg-red-900/20" },
          { label: "Net Balance",    value: `$${Math.abs(net).toFixed(2)}`, icon: FiDollarSign, color: net >= 0 ? "text-indigo-600" : "text-red-500", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
          { label: "Savings Rate",   value: `${savings}%`,             icon: FiCalendar,     color: "text-amber-600",  bg: "bg-amber-50 dark:bg-amber-900/20" },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <span className={`p-2 rounded-xl ${s.bg} ${s.color} inline-flex mb-3`}><s.icon size={16} /></span>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 text-sm">Loading charts...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-4">Monthly Income vs Expenses</h3>
            <div className="h-64"><Bar data={barData} options={chartOpts} /></div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
            <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-4">Spending by Category</h3>
            {cats.length > 0 ? (
              <div className="h-64">
                <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom", labels: { color: "#94a3b8", font: { size: 11 }, padding: 8 } } } }} />
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-400 text-sm">No expense data yet</div>
            )}
          </div>
        </div>
      )}

      {/* Top transactions table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-semibold text-slate-700 dark:text-slate-200">Recent Activity</h3>
        </div>
        {transactions.length === 0 ? (
          <p className="text-center py-8 text-slate-400 text-sm">No transactions yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>{["Date","Description","Category","Amount"].map((h) => (
                  <th key={h} className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {transactions.slice(0, 10).map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="px-5 py-3 text-xs text-slate-400">{tx.date}</td>
                    <td className="px-5 py-3 text-sm font-medium text-slate-800 dark:text-slate-200">{tx.label}</td>
                    <td className="px-5 py-3"><span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-lg">{tx.category}</span></td>
                    <td className={`px-5 py-3 text-sm font-bold ${tx.type === "income" ? "text-emerald-600" : "text-red-500"}`}>
                      {tx.type === "income" ? "+" : "-"}${tx.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;