// src/Pages/VerifyEmail.jsx
// User lands here after signup. Email is passed via router state.
import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { FiHash, FiArrowRight, FiMail } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { verifyEmailApi } from "../api/authApi";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Email is passed from Signup page: navigate("/verify-email", { state: { email } })
  const email = location.state?.email || "";

  const formik = useFormik({
    initialValues: { otp: "" },
    validationSchema: Yup.object({
      otp: Yup.string()
        .matches(/^[a-zA-Z0-9]{6}$/, "OTP must be exactly 6 characters")
        .required("OTP is required"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await verifyEmailApi({ email, otp: values.otp });
        toast.success("Email verified! You can now sign in. ✅");
        navigate("/login");
      } catch (err) {
        const message = (err.response?.data?.detail || "").toLowerCase();

        if (message.includes("invalid") || message.includes("wrong") || message.includes("galat")) {
          toast.error("Invalid OTP. Please check and try again.", { icon: "🔐" });
        } else if (message.includes("not exist") || message.includes("not found")) {
          toast.error("Account not found. Please sign up first.", { icon: "👤" });
        } else {
          toast.error(err.response?.data?.detail || "Verification failed. Try again.");
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div
      className="flex items-center justify-center min-h-[80vh] px-4"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-cyan-500 via-violet-500 to-indigo-500" />

          <div className="p-8">
            {/* Icon */}
            <div className="flex justify-center mb-5">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                <FiMail size={32} className="text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>

            <div className="text-center mb-8">
              <h2
                className="text-3xl font-bold text-slate-900 dark:text-white mb-2"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Verify Your Email
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                We sent a 6-character OTP to
              </p>
              {email && (
                <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
                  {email}
                </p>
              )}
            </div>

            <form onSubmit={formik.handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                  Enter OTP
                </label>
                <div className="relative">
                  <FiHash className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                  <input
                    name="otp"
                    type="text"
                    inputMode="text"
                    maxLength={6}
                    placeholder="_ _ _ _ _ _"
                    autoComplete="one-time-code"
                    autoFocus
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm bg-slate-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition font-mono tracking-[0.6em] text-center ${
                      formik.touched.otp && formik.errors.otp
                        ? "border-red-400"
                        : "border-slate-200 dark:border-slate-700"
                    }`}
                    {...formik.getFieldProps("otp")}
                  />
                </div>
                {formik.touched.otp && formik.errors.otp && (
                  <p className="text-red-500 text-xs mt-1">{formik.errors.otp}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={formik.isSubmitting}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition shadow-md shadow-indigo-200 dark:shadow-indigo-900/20"
              >
                {formik.isSubmitting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Verifying...
                  </>
                ) : (
                  <> Verify Email <FiArrowRight size={16} /> </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-slate-400">
              Didn&apos;t receive it? Check spam or{" "}
              <Link to="/signup" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                sign up again
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;