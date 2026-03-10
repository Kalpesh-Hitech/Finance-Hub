// src/Pages/Cards.jsx
import React, { useState } from "react";
import { FiCreditCard, FiPlus, FiTrash2, FiEye, FiEyeOff, FiWifi } from "react-icons/fi";
import { toast } from "react-hot-toast";

const CARD_GRADIENTS = [
  "from-indigo-600 to-violet-600",
  "from-slate-700 to-slate-900",
  "from-rose-500 to-pink-600",
  "from-emerald-500 to-teal-600",
];

const defaultCards = [
  { id: 1, name: "Personal Visa",    number: "4532 •••• •••• 7821", holder: "John Doe",  expiry: "08/27", balance: 4250.0,  gradient: 0, type: "Visa" },
  { id: 2, name: "Business Master",  number: "5412 •••• •••• 3390", holder: "John Doe",  expiry: "11/26", balance: 12800.5, gradient: 1, type: "Mastercard" },
];

// ── Card visual ───────────────────────────────────────────
const CardVisual = ({ card, reveal, onToggle }) => (
  <div className={`relative bg-gradient-to-br ${CARD_GRADIENTS[card.gradient]} rounded-3xl p-6 text-white shadow-xl shadow-black/20 aspect-[1.586/1] flex flex-col justify-between overflow-hidden`}>
    {/* Background pattern */}
    <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-white/5 -translate-y-16 translate-x-16" />
    <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full bg-white/5 translate-y-10 -translate-x-10" />

    <div className="flex items-start justify-between relative z-10">
      <div>
        <p className="text-xs text-white/60 font-medium uppercase tracking-widest">{card.name}</p>
        <p className="text-xl font-bold mt-0.5">${card.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
      </div>
      <FiWifi size={22} className="rotate-90 text-white/70" />
    </div>

    <div className="relative z-10">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-7 bg-yellow-400/80 rounded-md" />
        <p className="font-mono text-sm tracking-widest">
          {reveal ? "4532 1234 5678 7821" : card.number}
        </p>
        <button onClick={onToggle} className="text-white/60 hover:text-white ml-auto">
          {reveal ? <FiEyeOff size={16} /> : <FiEye size={16} />}
        </button>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs text-white/50 uppercase tracking-wider mb-0.5">Card Holder</p>
          <p className="text-sm font-semibold">{card.holder}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-white/50 uppercase tracking-wider mb-0.5">Expires</p>
          <p className="text-sm font-semibold">{card.expiry}</p>
        </div>
        <p className="text-lg font-bold text-white/80">{card.type}</p>
      </div>
    </div>
  </div>
);

// ── Add Card Modal ────────────────────────────────────────
const AddCardModal = ({ onClose, onAdded }) => {
  const [form, setForm] = useState({ name: "", holder: "", number: "", expiry: "", balance: "", gradient: 0, type: "Visa" });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.name || !form.holder || !form.number) return toast.error("Fill all fields");
    const last4 = form.number.replace(/\s/g, "").slice(-4);
    onAdded({ ...form, id: Date.now(), number: `•••• •••• •••• ${last4}`, balance: parseFloat(form.balance) || 0 });
    toast.success("Card added!");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-indigo-500 to-pink-500" />
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="font-bold text-slate-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Add New Card</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><FiCreditCard size={18} /></button>
        </div>
        <form onSubmit={submit} className="p-6 space-y-4">
          {[
            { label: "Card Nickname",  key: "name",   placeholder: "e.g. Personal Visa" },
            { label: "Card Holder",    key: "holder", placeholder: "Full name on card" },
            { label: "Card Number",    key: "number", placeholder: "1234 5678 9012 3456", maxLength: 19 },
            { label: "Expiry",         key: "expiry", placeholder: "MM/YY" },
            { label: "Current Balance",key: "balance",placeholder: "0.00", type: "number" },
          ].map(({ label, key, placeholder, type = "text", maxLength }) => (
            <div key={key}>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">{label}</label>
              <input type={type} value={form[key]} onChange={(e) => set(key, e.target.value)} placeholder={placeholder} maxLength={maxLength}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition" />
            </div>
          ))}
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">Card Color</label>
            <div className="flex gap-2">
              {CARD_GRADIENTS.map((g, i) => (
                <button key={i} type="button" onClick={() => set("gradient", i)}
                  className={`w-8 h-8 rounded-full bg-gradient-to-br ${g} transition-transform ${form.gradient === i ? "scale-125 ring-2 ring-offset-2 ring-slate-400" : "hover:scale-110"}`} />
              ))}
            </div>
          </div>
          <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition">
            Add Card
          </button>
        </form>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────
const Cards = () => {
  const [cards, setCards]       = useState(defaultCards);
  const [reveals, setReveals]   = useState({});
  const [showModal, setShowModal] = useState(false);

  const toggleReveal = (id) => setReveals((r) => ({ ...r, [id]: !r[id] }));
  const deleteCard   = (id) => { setCards((c) => c.filter((x) => x.id !== id)); toast.success("Card removed"); };

  const totalBalance = cards.reduce((s, c) => s + c.balance, 0);

  return (
    <div className="space-y-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {showModal && <AddCardModal onClose={() => setShowModal(false)} onAdded={(c) => setCards((p) => [...p, c])} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>My Cards</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Total balance: <span className="font-semibold text-indigo-600 dark:text-indigo-400">${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span></p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition">
          <FiPlus size={16} /> Add Card
        </button>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((card) => (
          <div key={card.id}>
            <CardVisual card={card} reveal={!!reveals[card.id]} onToggle={() => toggleReveal(card.id)} />
            <div className="mt-3 flex items-center justify-between px-1">
              <p className="text-xs text-slate-400">Click eye to {reveals[card.id] ? "hide" : "reveal"} number</p>
              <button onClick={() => deleteCard(card.id)} className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 font-medium transition">
                <FiTrash2 size={13} /> Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Cards",     value: cards.length },
          { label: "Highest Balance", value: `$${Math.max(...cards.map((c) => c.balance)).toLocaleString()}` },
          { label: "Active Cards",    value: cards.length },
          { label: "Combined Limit",  value: "$50,000" },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 text-center">
            <p className="text-xl font-bold text-slate-900 dark:text-white">{s.value}</p>
            <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Cards;