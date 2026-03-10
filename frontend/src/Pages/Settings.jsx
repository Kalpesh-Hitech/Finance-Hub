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
import { setCredentials } from "../Context/ContextSlices/authReader";
import { changePasswordApi, requestChangeEmailApi, changeEmailApi } from "../api/authApi";

const Section = ({ title, icon: Icon, children }) => (
  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
    <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
      <span className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg"><Icon size={16} /></span>
      <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{title}</h3>
    </div>
    <div className="p-5">{children}</div>
  </div>
);

// const Toggle = ({ label, desc, value, onChange }) => (
//   <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
//     <div>
//       <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{label}</p>
//       {desc && <p className="text-xs text-slate-400 mt-0.5">{desc}</p>}
//     </div>
//     <button onClick={() => onChange(!value)} className={`relative w-11 h-6 rounded-full transition-colors ${value ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"}`}>
//       <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${value ? "translate-x-6" : "translate-x-1"}`} />
//     </button>
//   </div>
// );
const Toggle = ({ label, desc, value, onChange }) => (
  <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
    <div>
      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{label}</p>
      {desc && <p className="text-xs text-slate-400 mt-0.5">{desc}</p>}
    </div>

    <button
      type="button" // Important to prevent form submission if this is inside a form
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

const ChangeEmailSection = () => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((s) => s.auth);
  const [otpSent, setOtpSent] = useState(false);
  const [sending, setSending] = useState(false);

  const sendOtp = async () => {
    setSending(true);
    try {
      await requestChangeEmailApi();
      setOtpSent(true);
      toast.success("OTP sent to your current email! 📧");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to send OTP");
    } finally { setSending(false); }
  };

  const formik = useFormik({
    initialValues: { email: "", otp: "" },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email").required("Required"),
      otp: Yup.string().required("OTP is required"),
    }),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const { data } = await changeEmailApi({ email: values.email, otp: values.otp });
        dispatch(setCredentials({ user: { ...user, email: values.email }, token: data.token || token }));
        toast.success("Email changed! ✅");
        setOtpSent(false);
        resetForm();
      } catch (err) {
        const msg = (err.response?.data?.detail || "").toLowerCase();
        if (msg.includes("otp") || msg.includes("galat")) toast.error("Invalid OTP", { icon: "🔐" });
        else toast.error(err.response?.data?.detail || "Failed to change email");
      } finally { setSubmitting(false); }
    },
  });

  return (
    <Section title="Change Email" icon={FiMail}>
      <div className="mb-4 flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
        <span className="text-xs text-slate-500 dark:text-slate-400">Current:</span>
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user?.email || "—"}</span>
      </div>
      {!otpSent ? (
        <button onClick={sendOtp} disabled={sending}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition">
          <FiSend size={14} />{sending ? "Sending OTP..." : "Send OTP to current email"}
        </button>
      ) : (
        <form onSubmit={formik.handleSubmit} className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-1">
            <FiCheck size={14} />OTP sent to {user?.email}
          </div>
          {[
            { name: "email", type: "email", placeholder: "New email address", extra: "" },
            { name: "otp", type: "text", placeholder: "Enter OTP", extra: "font-mono tracking-widest" },
          ].map(({ name, type, placeholder, extra }) => (
            <div key={name}>
              <input name={name} type={type} placeholder={placeholder} maxLength={name === "otp" ? 6 : undefined}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-slate-50 dark:bg-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition ${extra} ${formik.touched[name] && formik.errors[name] ? "border-red-400" : "border-slate-200 dark:border-slate-700"}`}
                {...formik.getFieldProps(name)} />
              {formik.touched[name] && formik.errors[name] && <p className="text-red-500 text-xs mt-1">{formik.errors[name]}</p>}
            </div>
          ))}
          <div className="flex gap-2">
            <button type="submit" disabled={formik.isSubmitting}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition">
              <FiSave size={14} />{formik.isSubmitting ? "Saving..." : "Change Email"}
            </button>
            <button type="button" onClick={() => { setOtpSent(false); formik.resetForm(); }}
              className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition">
              Cancel
            </button>
          </div>
        </form>
      )}
    </Section>
  );
};

const Settings = () => {
  const { user } = useSelector((s) => s.auth);
  const [notifs, setNotifs] = useState({ email: true, push: false, weekly: true });

  return (
    <div className="space-y-5 max-w-2xl" style={{ fontFamily: "'DM Sans', sans-serif" }}>
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
      <ChangeEmailSection />

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