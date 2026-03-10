// src/Pages/ForgotPassword.jsx
import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Link } from "react-router-dom";
import { FiMail, FiArrowLeft } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { forgetPasswordApi } from "../api/authApi";

const ForgotPassword = () => {
  const formik = useFormik({
    initialValues: { email: "" },
    validationSchema: Yup.object({ email: Yup.string().email("Invalid email").required("Required") }),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        await forgetPasswordApi({ email: values.email });
        toast.success("Reset link sent! Check your email. 📧", { duration: 5000 });
        resetForm();
      } catch (err) {
        const msg = (err.response?.data?.detail || "").toLowerCase();
        if (msg.includes("not exist") || msg.includes("email")) toast.error("No account found with this email.", { icon: "👤" });
        else if (msg.includes("deactivated") || msg.includes("inactive")) toast.error("This account is deactivated.", { icon: "🔒" });
        else toast.error(err.response?.data?.detail || "Something went wrong");
      } finally { setSubmitting(false); }
    },
  });

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500" />
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                <FiMail size={26} className="text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                Forgot Password?
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Enter your email and we'll send you a reset link
              </p>
            </div>

            <form onSubmit={formik.handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Email Address</label>
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                  <input name="email" type="email" placeholder="you@example.com"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm bg-slate-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 outline-none transition ${formik.touched.email && formik.errors.email ? "border-red-400" : "border-slate-200 dark:border-slate-700"}`}
                    {...formik.getFieldProps("email")} />
                </div>
                {formik.touched.email && formik.errors.email && <p className="text-red-500 text-xs mt-1">{formik.errors.email}</p>}
              </div>

              <button type="submit" disabled={formik.isSubmitting}
                className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white rounded-xl font-semibold text-sm transition shadow-md shadow-amber-200 dark:shadow-none">
                {formik.isSubmitting ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            <Link to="/login" className="flex items-center justify-center gap-2 mt-6 text-sm text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
              <FiArrowLeft size={14} /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;