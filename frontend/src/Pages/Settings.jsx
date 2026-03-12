// src/Pages/Settings.jsx
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  FiUser, FiBell, FiShield, FiLock, FiMail,
  FiSave, FiEye, FiEyeOff, FiSend, FiCheck,
} from "react-icons/fi";
import { toast } from "react-hot-toast";
import { changePasswordApi } from "../api/authApi";

const Section = ({ title, icon: Icon, children }) => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
    <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
      <span className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg"><Icon size={16} /></span>
      <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{title}</h3>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

const Toggle = ({ label, desc, value, onChange }) => (
  <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
    <div>
      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{label}</p>
      {desc && <p className="text-xs text-slate-400 mt-0.5">{desc}</p>}
    </div>

    <button
      type="button" 
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${value ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
        }`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          // Ensure left-0 or translate-x-1 is clearly defined
          value ? "translate-x-6" : "translate-x-1"
          }`}
      />
    </button>
  </div>
);
const ChangePasswordSection = () => {
  const [showPw, setShowPw] = useState({ old: false, nw: false });
  const formik = useFormik({
    initialValues: { old_password: "", new_password: "", confirm: "" },
    validationSchema: Yup.object({
      old_password: Yup.string().required("Required"),
      new_password: Yup.string().min(8, "At least 8 characters").required("Required"),
      confirm: Yup.string().oneOf([Yup.ref("new_password")], "Passwords don't match").required("Required"),
    }),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        await changePasswordApi({ old_password: values.old_password, new_password: values.new_password });
        toast.success("Password changed! 🔐");
        resetForm();
      } catch (err) {
        toast.error(err.response?.data?.detail || "Failed to change password");
      } finally { setSubmitting(false); }
    },
  });

  return (
    <Section title="Change Password" icon={FiLock}>
      <form onSubmit={formik.handleSubmit} className="space-y-3">
        {[
          { name: "old_password", placeholder: "Current password", sk: "old" },
          { name: "new_password", placeholder: "New password", sk: "nw" },
          { name: "confirm", placeholder: "Confirm new password", sk: "nw" },
        ].map(({ name, placeholder, sk }) => (
          <div key={name}>
            <div className="relative">
              <input name={name} type={showPw[sk] ? "text" : "password"} placeholder={placeholder}
                className={`w-full px-4 py-2.5 pr-10 rounded-xl border text-sm bg-slate-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition ${formik.touched[name] && formik.errors[name] ? "border-red-400" : "border-slate-200 dark:border-slate-700"}`}
                {...formik.getFieldProps(name)} />
              <button type="button" onClick={() => setShowPw((p) => ({ ...p, [sk]: !p[sk] }))} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                {showPw[sk] ? <FiEyeOff size={15} /> : <FiEye size={15} />}
              </button>
            </div>
            {formik.touched[name] && formik.errors[name] && <p className="text-red-500 text-xs mt-1">{formik.errors[name]}</p>}
          </div>
        ))}
        <button type="submit" disabled={formik.isSubmitting}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition">
          <FiSave size={14} />{formik.isSubmitting ? "Saving..." : "Update Password"}
        </button>
      </form>
    </Section>
  );
};



const Settings = () => {
  const { user } = useSelector((s) => s.auth);
  const [notifs, setNotifs] = useState({ email: true, push: false, weekly: true });

  return (
    <div className="space-y-5 max-w-2xl mx-auto" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: "'Playfair Display', serif" }}>Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage your account</p>
      </div>

      <Section title="Profile" icon={FiUser}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-400 to-cyan-400 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {(user?.email || "U")[0].toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">{user?.name || "FinanceHub User"}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email || "—"}</p>
            <span className="inline-block mt-1.5 text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium">✓ Active</span>
          </div>
        </div>
      </Section>

      <ChangePasswordSection />

      <Section title="Notifications" icon={FiBell}>
        <Toggle label="Email Notifications" desc="Transaction alerts" value={notifs.email} onChange={(v) => setNotifs({ ...notifs, email: v })} />
        <Toggle label="Push Notifications" desc="Browser push alerts" value={notifs.push} onChange={(v) => setNotifs({ ...notifs, push: v })} />
        <Toggle label="Weekly Summary" desc="Weekly financial report" value={notifs.weekly} onChange={(v) => setNotifs({ ...notifs, weekly: v })} />
      </Section>

      <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-200 dark:border-red-900/40 p-5">
        <h3 className="font-semibold text-red-700 dark:text-red-400 mb-1 flex items-center gap-2 text-sm">
          <FiShield size={15} />Danger Zone
        </h3>
        <p className="text-xs text-red-500/70 mb-3">Deactivating will lock your account.</p>
        <button onClick={() => toast.error("Contact support to deactivate.")}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold transition">
          Deactivate Account
        </button>
      </div>
    </div>
  );
};

export default Settings;