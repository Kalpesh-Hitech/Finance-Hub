// src/Pages/Login.jsx
import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { setCredentials } from "../Context/ContextSlices/authReader";
import { useNavigate, Link } from "react-router-dom";
import { FiMail, FiLock, FiArrowRight, FiHash } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { loginApi } from "../api/authApi";

const Login = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const [showOtp, setShowOtp] = useState(false);

  const validationSchema = Yup.object({
    email:    Yup.string().email("Invalid email address").required("Email is required"),
    password: Yup.string().min(6, "At least 6 characters").required("Required"),
    otp:      Yup.string().when([], {
      is:        () => showOtp,
      then:      (s) => s.matches(/^\d{6}$/, "OTP must be exactly 6 digits").required("OTP is required"),
      otherwise: (s) => s.notRequired(),
    }),
  });

  const formik = useFormik({
    initialValues: { email: "", password: "", otp: "" },
    validationSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const payload = { email: values.email, password: values.password };
        if (showOtp && values.otp) payload.otp = values.otp;

        const { data } = await loginApi(payload);

        // Backend returns { access_token, token_type } — no user object
        // Decode email from JWT payload (middle part, base64)
        let userObj = { email: values.email };
        try {
          const jwtPayload = JSON.parse(atob(data.access_token.split(".")[1]));
          userObj = { email: jwtPayload.sub };
        } catch {
          // fallback to form email if decode fails
        }

        dispatch(setCredentials({ user: userObj, token: data.access_token }));
        toast.success(`Welcome back! 🎉`);
        navigate("/dashboard");

      } catch (err) {
        const message = (err.response?.data?.detail || "").toLowerCase();
        const status  = err.response?.status;

        if (message.includes("otp") && (message.includes("invalid") || message.includes("incorrect") || message.includes("wrong"))) {
          // Case 1 — OTP is wrong
          toast.error("Invalid OTP. Please double-check and try again.", { icon: "🔐", duration: 4500 });

        } else if (message.includes("not verified") || message.includes("valid first") || message.includes("please valid")) {
          // Case 2 — Email not verified (matches: "please valid first")
          toast.error("Email not verified. Please verify your email first.", { icon: "📧", duration: 5000 });

        } else if (
          message.includes("inactive") ||
          message.includes("deactivated") ||
          message.includes("invalid credential") ||
          status === 400 || status === 404
        ) {
          // Case 3 — No active user / wrong credentials
          toast.error("Invalid credentials or inactive account.", { icon: "👤", duration: 4500 });

        } else {
          toast.error(err.response?.data?.detail || "Login failed. Please try again.");
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  const toggleOtp = () => {
    setShowOtp((v) => !v);
    formik.setFieldValue("otp", "");
    formik.setFieldTouched("otp", false);
  };

  return (
    <div
      className="flex items-center justify-center min-h-[80vh] px-4"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          {/* Accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500" />

          <div className="p-8">
            <div className="mb-8 text-center">
              <h2
                className="text-3xl font-bold text-slate-900 dark:text-white mb-1"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Welcome Back
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Sign in to continue to FinanceHub
              </p>
            </div>

            <form onSubmit={formik.handleSubmit} className="space-y-4">

              {/* ── Email ── */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                  Email
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                  <input
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm bg-slate-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition ${
                      formik.touched.email && formik.errors.email ? "border-red-400" : "border-slate-200 dark:border-slate-700"
                    }`}
                    {...formik.getFieldProps("email")}
                  />
                </div>
                {formik.touched.email && formik.errors.email && (
                  <p className="text-red-500 text-xs mt-1">{formik.errors.email}</p>
                )}
              </div>

              {/* ── Password ── */}
              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                  <input
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm bg-slate-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition ${
                      formik.touched.password && formik.errors.password ? "border-red-400" : "border-slate-200 dark:border-slate-700"
                    }`}
                    {...formik.getFieldProps("password")}
                  />
                </div>
                {formik.touched.password && formik.errors.password && (
                  <p className="text-red-500 text-xs mt-1">{formik.errors.password}</p>
                )}
              </div>

              {/* <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                    OTP
                  </label>
                  <button
                    type="button"
                    onClick={toggleOtp}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline transition"
                  >
                    {showOtp ? "✕ Remove OTP" : "+ Enter OTP"}
                  </button>
                </div>

                {/* Smooth slide-in */}
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    showOtp ? "max-h-24 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="relative">
                    <FiHash className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                    <input
                      name="otp"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="_ _ _ _ _ _"
                      autoComplete="one-time-code"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm bg-slate-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition font-mono tracking-[0.6em] text-center ${
                        formik.touched.otp && formik.errors.otp ? "border-red-400" : "border-slate-200 dark:border-slate-700"
                      }`}
                      {...formik.getFieldProps("otp")}
                    />
                  </div>
                  {formik.touched.otp && formik.errors.otp && (
                    <p className="text-red-500 text-xs mt-1">{formik.errors.otp}</p>
                  )}
                  <p className="text-xs text-slate-400 mt-1.5">
                    Enter the 6-digit code sent to your device.
                  </p>
                </div>
              {/* </div>  */}

              {/* ── Submit ── */}
              <button
                type="submit"
                disabled={formik.isSubmitting}
                className="w-full py-3 mt-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition shadow-md shadow-indigo-200 dark:shadow-indigo-900/20"
              >
                {formik.isSubmitting ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <> Sign In <FiArrowRight size={16} /> </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;