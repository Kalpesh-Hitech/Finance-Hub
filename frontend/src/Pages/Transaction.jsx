// src/Pages/Transaction.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  FiArrowUpRight, FiArrowDownLeft, FiRefreshCw,
  FiPlus, FiTrash2, FiX, FiAlertTriangle, FiCheckCircle,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import {
  getTransactionsApi, createTransactionApi, deleteTransactionApi,
  getBudgetsApi,
} from "../api/authApi";

const CATEGORIES = ["Salary","Housing","Food & Dining","Transport","Entertainment","Shopping","Utilities","Healthcare","Education","Savings","Rent","Groceries","Other"];

const TYPE_STYLE = {
  income:  { icon: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600", badge: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300", amount: "text-emerald-600" },
  expense: { icon: "bg-red-50 dark:bg-red-900/20 text-red-500",             badge: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",                 amount: "text-red-500"     },
};

// ─── Budget Impact Warning shown inside modal ─────────────────
const BudgetImpact = ({ category, amount, budgets }) => {
  const matched = budgets.find((b) => b.category.toLowerCase() === category.toLowerCase());
  if (!matched || !amount) return null;

  const remaining = matched.budget_amount - matched.spent;
  const afterSpend = remaining - parseFloat(amount || 0);
  const willExceed = afterSpend < 0;
  const willWarn   = !willExceed && afterSpend < matched.budget_amount * 0.2; // <20% left

  return (
    <div className={`rounded-xl p-3 flex items-start gap-2.5 text-xs ${
      willExceed ? "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
      : willWarn  ? "bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
      :             "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800"
    }`}>
      {willExceed
        ? <FiAlertTriangle size={14} className="text-red-500 mt-0.5 shrink-0" />
        : willWarn
        ? <FiAlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" />
        : <FiCheckCircle   size={14} className="text-emerald-500 mt-0.5 shrink-0" />
      }
      <div>
        <p className={`font-semibold ${willExceed ? "text-red-700 dark:text-red-400" : willWarn ? "text-amber-700 dark:text-amber-400" : "text-emerald-700 dark:text-emerald-400"}`}>
          {matched.category} Budget
        </p>
        <p className="text-slate-500 dark:text-slate-400 mt-0.5">
          {willExceed
            ? `This will exceed your budget by $${Math.abs(afterSpend).toFixed(2)}!`
            : willWarn
            ? `Only $${afterSpend.toFixed(2)} will remain (${((afterSpend/matched.budget_amount)*100).toFixed(0)}%)`
            : `$${afterSpend.toFixed(2)} will remain after this transaction`
          }
        </p>
      </div>
    </div>
  );
};

// ─── Add Transaction Modal ────────────────────────────────────
const AddModal = ({ onClose, onAdded, budgets }) => {
  const [form, setForm]   = useState({
    date: new Date().toISOString().split("T")[0],
    category: "Salary", label: "", amount: "", type: "income",
  });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // When type switches to income, reset category to income-type
  const handleTypeChange = (t) => {
    set("type", t);
    if (t === "income") set("category", "Salary");
    else set("category", "Rent");
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.label.trim() || !form.amount) return toast.error("Please fill all fields");
    if (parseFloat(form.amount) <= 0) return toast.error("Amount must be greater than 0");
    setLoading(true);
    try {
      const { data } = await createTransactionApi({ ...form, amount: parseFloat(form.amount) });
      toast.success("Transaction added! ✅");
      onAdded(data);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to add transaction");
    } finally {
      setLoading(false);
    }
  };

  const isExpense = form.type === "expense";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-indigo-500 to-cyan-500" />

        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="font-bold text-slate-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            Add Transaction
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition">
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          {/* Type toggle */}
          <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
            {["income", "expense"].map((t) => (
              <button key={t} type="button" onClick={() => handleTypeChange(t)}
                className={`flex-1 py-2.5 text-sm font-semibold capitalize transition ${
                  form.type === t
                    ? t === "income" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                }`}>
                {t === "income" ? "💰 Income" : "💸 Expense"}
              </button>
            ))}
          </div>

          {/* Label */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Description</label>
            <input
              value={form.label} onChange={(e) => set("label", e.target.value)}
              placeholder={isExpense ? "e.g. Monthly Rent" : "e.g. Monthly Salary"}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition"
            />
          </div>

          {/* Amount + Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Amount ($)</label>
              <input
                type="number" min="0.01" step="0.01"
                value={form.amount} onChange={(e) => set("amount", e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Category</label>
              <select
                value={form.category} onChange={(e) => set("category", e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition">
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Date</label>
            <input
              type="date" value={form.date} onChange={(e) => set("date", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition"
            />
          </div>

          {/* Live budget impact — only for expenses */}
          {isExpense && (
            <BudgetImpact category={form.category} amount={form.amount} budgets={budgets} />
          )}

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition shadow-sm shadow-indigo-200 dark:shadow-none">
            {loading
              ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>Adding...</>
              : <><FiPlus size={16} />Add Transaction</>
            }
          </button>
        </form>
      </div>
    </div>
  );
};

// ─── Budget Mini Panel (shown below transaction list) ─────────
const BudgetPanel = ({ budgets, transactions }) => {
  if (budgets.length === 0) return null;

  // Re-calculate spent from actual transactions (front-end live view)
  const liveSpent = (category) =>
    transactions
      .filter((t) => t.type === "expense" && t.category.toLowerCase() === category.toLowerCase())
      .reduce((s, t) => s + t.amount, 0);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-200" style={{ fontFamily: "'Playfair Display', serif" }}>
            Budget Impact
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">How your transactions affect each budget</p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {budgets.map((b) => {
          const spent    = liveSpent(b.category);
          const pct      = b.budget_amount > 0 ? (spent / b.budget_amount) * 100 : 0;
          const over     = spent > b.budget_amount;
          const remaining = Math.max(0, b.budget_amount - spent);
          const warn     = !over && pct > 80;

          return (
            <div key={b.id}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: b.color }} />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{b.category}</span>
                  {over && (
                    <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-medium">
                      Over!
                    </span>
                  )}
                  {warn && !over && (
                    <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">
                      Almost full
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <span className={`text-sm font-bold ${over ? "text-red-500" : warn ? "text-amber-500" : "text-slate-700 dark:text-slate-300"}`}>
                    ${spent.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-400"> / ${b.budget_amount.toFixed(2)}</span>
                </div>
              </div>

              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(pct, 100)}%`,
                    backgroundColor: over ? "#ef4444" : warn ? "#f59e0b" : b.color,
                  }}
                />
              </div>

              <p className="text-xs text-slate-400 mt-1">
                {over
                  ? `$${(spent - b.budget_amount).toFixed(2)} over budget`
                  : `$${remaining.toFixed(2)} remaining · ${(100 - pct).toFixed(0)}% free`
                }
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Main Transaction Page ────────────────────────────────────
const Transaction = () => {
  const [transactions, setTransactions] = useState([]);
  const [budgets,      setBudgets]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [showModal,    setShowModal]    = useState(false);
  const [filter,       setFilter]       = useState("all");
  const [search,       setSearch]       = useState("");

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [txRes, budgetRes] = await Promise.all([getTransactionsApi(), getBudgetsApi()]);
      setTransactions(txRes.data);
      setBudgets(budgetRes.data);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // After adding a transaction, re-fetch budgets so spent values update
  const handleAdded = async (tx) => {
    setTransactions((prev) => [tx, ...prev]);
    if (tx.type === "expense") {
      try {
        const { data } = await getBudgetsApi();
        setBudgets(data);
      } catch { /* silent */ }
    }
  };

  // After deleting, re-fetch budgets too
  const handleDelete = async (id) => {
    const tx = transactions.find((t) => t.id === id);
    try {
      await deleteTransactionApi(id);
      setTransactions((t) => t.filter((x) => x.id !== id));
      toast.success("Transaction deleted");
      if (tx?.type === "expense") {
        const { data } = await getBudgetsApi();
        setBudgets(data);
      }
    } catch {
      toast.error("Failed to delete");
    }
  };

  const filtered = transactions
    .filter((t) => filter === "all" || t.type === filter)
    .filter((t) =>
      t.label?.toLowerCase().includes(search.toLowerCase()) ||
      t.category?.toLowerCase().includes(search.toLowerCase())
    );

  const totalIncome  = transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const net          = totalIncome - totalExpense;

  return (
    <div className="space-y-5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {showModal && (
        <AddModal
          onClose={() => setShowModal(false)}
          onAdded={handleAdded}
          budgets={budgets}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            Transactions
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{transactions.length} total records</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadAll}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            <FiRefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition shadow-sm shadow-indigo-200 dark:shadow-none">
            <FiPlus size={16} /> Add New
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Income",   value: totalIncome,  color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20",  prefix: "+" },
          { label: "Total Expenses", value: totalExpense, color: "text-red-500",     bg: "bg-red-50 dark:bg-red-900/20",           prefix: "-" },
          { label: "Net Balance",    value: Math.abs(net), color: net >= 0 ? "text-indigo-600" : "text-red-500", bg: "bg-indigo-50 dark:bg-indigo-900/20", prefix: net >= 0 ? "+" : "-" },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4`}>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.prefix}${s.value.toFixed(2)}</p>
          </div>
        ))}
      </div>

      {/* Two-column layout: table + budget panel */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Transaction table — takes 2/3 */}
        <div className="xl:col-span-2 space-y-4">
          {/* Filter + Search */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by description or category..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition"
            />
            <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
              {["all", "income", "expense"].map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-4 py-2.5 text-sm font-medium capitalize transition ${
                    filter === f ? "bg-indigo-600 text-white" : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-slate-400 text-sm">Loading transactions...</div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-sm">No transactions found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60">
                    <tr>
                      {["Transaction", "Category", "Date", "Amount", ""].map((h) => (
                        <th key={h} className="px-5 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filtered.map((tx) => {
                      const style = TYPE_STYLE[tx.type];
                      return (
                        <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition group">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-xl ${style.icon}`}>
                                {tx.type === "income" ? <FiArrowDownLeft size={14} /> : <FiArrowUpRight size={14} />}
                              </div>
                              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{tx.label}</p>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`text-xs px-2.5 py-1 rounded-lg font-medium ${style.badge}`}>{tx.category}</span>
                          </td>
                          <td className="px-5 py-3.5 text-xs text-slate-400">{tx.date}</td>
                          <td className={`px-5 py-3.5 font-bold text-sm ${style.amount}`}>
                            {tx.type === "income" ? "+" : "-"}${tx.amount.toFixed(2)}
                          </td>
                          <td className="px-5 py-3.5">
                            <button onClick={() => handleDelete(tx.id)}
                              className="opacity-0 group-hover:opacity-100 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 transition">
                              <FiTrash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Budget panel — takes 1/3 */}
        <div className="xl:col-span-1">
          {loading ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-400 text-sm">
              Loading budgets...
            </div>
          ) : budgets.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center">
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">No budgets set</p>
              <p className="text-slate-400 text-xs mt-1">
                Go to the <a href="/budget" className="text-indigo-500 hover:underline">Budget page</a> to add limits
              </p>
            </div>
          ) : (
            <BudgetPanel budgets={budgets} transactions={transactions} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Transaction;