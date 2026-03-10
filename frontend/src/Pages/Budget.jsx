// src/Pages/Budget.jsx
import React, { useState, useEffect, useCallback } from "react";
import { FiTarget, FiPlus, FiTrash2, FiX, FiEdit2, FiArrowUpRight, FiRefreshCw } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { getBudgetsApi, createBudgetApi, deleteBudgetApi, updateBudgetApi, getTransactionsApi } from "../api/authApi";

const CATEGORIES = ["Housing","Food & Dining","Transport","Entertainment","Shopping","Utilities","Healthcare","Education","Savings","Rent","Groceries","Other"];
const PALETTE    = ["#6366f1","#10b981","#f59e0b","#ef4444","#06b6d4","#8b5cf6","#ec4899","#14b8a6"];

// ─── Budget Modal ─────────────────────────────────────────────
const BudgetModal = ({ initial, onClose, onSaved }) => {
  const editing = !!initial;
  const [form, setForm]       = useState(initial || { category: "Housing", budget_amount: "", color: "#6366f1" });
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.budget_amount || parseFloat(form.budget_amount) <= 0) return toast.error("Enter a valid budget amount");
    setLoading(true);
    try {
      let data;
      if (editing) {
        ({ data } = await updateBudgetApi(initial.id, { ...form, budget_amount: parseFloat(form.budget_amount) }));
        toast.success("Budget updated! ✅");
      } else {
        ({ data } = await createBudgetApi({ ...form, budget_amount: parseFloat(form.budget_amount) }));
        toast.success("Budget created! 🎯");
      }
      onSaved(data, editing);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to save budget");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-indigo-500 to-violet-500" />
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="font-bold text-slate-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>
            {editing ? "Edit Budget" : "New Budget"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition"><FiX size={20} /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Category</label>
            <select value={form.category} onChange={(e) => set("category", e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition">
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1.5">Budget Limit ($)</label>
            <input type="number" min="1" step="0.01" value={form.budget_amount} onChange={(e) => set("budget_amount", e.target.value)} placeholder="e.g. 500"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">Color</label>
            <div className="flex gap-2 flex-wrap">
              {PALETTE.map((c) => (
                <button key={c} type="button" onClick={() => set("color", c)}
                  className={`w-8 h-8 rounded-full transition-transform ${form.color === c ? "scale-125 ring-2 ring-offset-2 ring-slate-400 dark:ring-slate-600" : "hover:scale-110"}`}
                  style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl font-semibold text-sm transition">
            {loading ? "Saving..." : editing ? "Save Changes" : "Create Budget"}
          </button>
        </form>
      </div>
    </div>
  );
};

// ─── Budget Card with transactions drill-down ─────────────────
const BudgetCard = ({ budget, transactions, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(false);

  // Live spent from actual transactions
  const liveSpent = transactions
    .filter((t) => t.type === "expense" && t.category.toLowerCase() === budget.category.toLowerCase())
    .reduce((s, t) => s + t.amount, 0);

  const pct       = budget.budget_amount > 0 ? (liveSpent / budget.budget_amount) * 100 : 0;
  const over      = liveSpent > budget.budget_amount;
  const warn      = !over && pct > 80;
  const remaining = Math.max(0, budget.budget_amount - liveSpent);

  // Related transactions for this category
  const related = transactions
    .filter((t) => t.type === "expense" && t.category.toLowerCase() === budget.category.toLowerCase())
    .slice(0, 5);

  const barColor = over ? "#ef4444" : warn ? "#f59e0b" : budget.color;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Card top */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-base font-bold shadow-sm" style={{ backgroundColor: budget.color }}>
              {budget.category[0]}
            </span>
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">{budget.category}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                {over ? (
                  <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-medium">Over Budget!</span>
                ) : warn ? (
                  <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">Almost full</span>
                ) : (
                  <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium">On track</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => onEdit(budget)} className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition">
              <FiEdit2 size={14} />
            </button>
            <button onClick={() => onDelete(budget.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition">
              <FiTrash2 size={14} />
            </button>
          </div>
        </div>

        {/* Amounts */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          <div className="text-center">
            <p className="text-xs text-slate-400 mb-0.5">Spent</p>
            <p className={`text-sm font-bold ${over ? "text-red-500" : "text-slate-800 dark:text-slate-200"}`}>${liveSpent.toFixed(2)}</p>
          </div>
          <div className="text-center border-x border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-400 mb-0.5">Limit</p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">${budget.budget_amount.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-400 mb-0.5">Remaining</p>
            <p className={`text-sm font-bold ${over ? "text-red-500" : remaining < budget.budget_amount * 0.2 ? "text-amber-500" : "text-emerald-600"}`}>
              {over ? `-$${(liveSpent - budget.budget_amount).toFixed(2)}` : `$${remaining.toFixed(2)}`}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-1.5">
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: barColor }} />
        </div>
        <p className="text-xs text-slate-400">{pct.toFixed(0)}% used</p>
      </div>

      {/* Expandable transactions */}
      {related.length > 0 && (
        <div className="border-t border-slate-100 dark:border-slate-800">
          <button onClick={() => setExpanded((v) => !v)}
            className="w-full px-5 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
            <span>{related.length} expense{related.length !== 1 ? "s" : ""} in this category</span>
            <FiArrowUpRight size={14} className={`transition-transform ${expanded ? "rotate-90" : ""}`} />
          </button>

          {expanded && (
            <div className="px-5 pb-4 space-y-2">
              {related.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-1.5 border-b border-slate-50 dark:border-slate-800 last:border-0">
                  <div>
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300">{tx.label}</p>
                    <p className="text-xs text-slate-400">{tx.date}</p>
                  </div>
                  <span className="text-xs font-bold text-red-500">-${tx.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Main Budget Page ─────────────────────────────────────────
const Budget = () => {
  const [budgets,      setBudgets]      = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [modal,        setModal]        = useState(null); // null | "add" | budget-obj

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [bRes, tRes] = await Promise.all([getBudgetsApi(), getTransactionsApi()]);
      setBudgets(bRes.data);
      setTransactions(tRes.data);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleDelete = async (id) => {
    try {
      await deleteBudgetApi(id);
      setBudgets((b) => b.filter((x) => x.id !== id));
      toast.success("Budget removed");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleSaved = (item, editing) => {
    if (editing) setBudgets((b) => b.map((x) => x.id === item.id ? item : x));
    else         setBudgets((b) => [...b, item]);
  };

  // Live totals computed from actual transactions
  const totalBudget = budgets.reduce((a, b) => a + b.budget_amount, 0);
  const totalSpent  = budgets.reduce((a, b) => {
    return a + transactions
      .filter((t) => t.type === "expense" && t.category.toLowerCase() === b.category.toLowerCase())
      .reduce((s, t) => s + t.amount, 0);
  }, 0);
  const overallPct  = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <div className="space-y-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {modal && (
        <BudgetModal
          initial={modal === "add" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Budget</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {new Date().toLocaleString("default", { month: "long", year: "numeric" })} · live from your transactions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadAll}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            <FiRefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={() => setModal("add")}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition shadow-sm shadow-indigo-200 dark:shadow-none">
            <FiPlus size={16} /> Add Budget
          </button>
        </div>
      </div>

      {/* Overall progress bar */}
      {budgets.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
          <div className="flex justify-between text-sm font-medium mb-2">
            <span className="text-slate-600 dark:text-slate-400">Overall Spending</span>
            <span className="text-slate-900 dark:text-white">
              ${totalSpent.toFixed(2)}
              <span className="text-slate-400 font-normal"> / ${totalBudget.toFixed(2)}</span>
            </span>
          </div>
          <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-500 ${overallPct > 100 ? "bg-red-500" : "bg-gradient-to-r from-indigo-500 to-violet-500"}`}
              style={{ width: `${Math.min(overallPct, 100)}%` }} />
          </div>
          <div className="flex justify-between mt-2">
            <p className="text-xs text-slate-400">{overallPct.toFixed(1)}% of total budget used</p>
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              ${Math.max(0, totalBudget - totalSpent).toFixed(2)} remaining
            </p>
          </div>
        </div>
      )}

      {/* Budget cards */}
      {loading ? (
        <div className="text-center text-slate-400 text-sm py-12">Loading budgets...</div>
      ) : budgets.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <FiTarget size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <p className="text-slate-500 dark:text-slate-400 font-medium">No budgets yet</p>
          <p className="text-slate-400 text-sm mt-1">Click "Add Budget" to set your first spending limit</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {budgets.map((b) => (
            <BudgetCard
              key={b.id}
              budget={b}
              transactions={transactions}
              onEdit={setModal}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Budget;