// src/Pages/SignUp.jsx
import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { useNavigate, Link } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiArrowRight } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { signupApi } from "../api/authApi";

const Signup = () => {
  const navigate = useNavigate();

  const signupSchema = Yup.object().shape({
    name:     Yup.string().required("Full name is required"),
    email:    Yup.string().email("Invalid email").required("Required"),
    password: Yup.string().min(8, "At least 8 characters").required("Required"),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await signupApi(values);
      toast.success("Account created! Check your email for the OTP. 📧");
      // Pass email so VerifyEmail page knows where OTP was sent
      navigate("/login");
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.message || "Registration failed. Try again.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-[80vh] px-4"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-cyan-500 via-violet-500 to-indigo-500" />

          <div className="p-8">
            <div className="mb-8 text-center">
              <h2
                className="text-3xl font-bold text-slate-900 dark:text-white mb-1"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Create Account
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Start managing your finances today
              </p>
            </div>

            <Formik
              initialValues={{ name: "", email: "", password: "" }}
              validationSchema={signupSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched, isSubmitting }) => (
                <Form className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                      Full Name
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                      <Field
                        name="name"
                        placeholder="John Doe"
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm bg-slate-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition ${
                          errors.name && touched.name ? "border-red-400" : "border-slate-200 dark:border-slate-700"
                        }`}
                      />
                    </div>
                    <ErrorMessage name="name" component="p" className="text-red-500 text-xs mt-1" />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                      Email
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                      <Field
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm bg-slate-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition ${
                          errors.email && touched.email ? "border-red-400" : "border-slate-200 dark:border-slate-700"
                        }`}
                      />
                    </div>
                    <ErrorMessage name="email" component="p" className="text-red-500 text-xs mt-1" />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                      Password
                    </label>
                    <div className="relative">
                      <FiLock className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
                      <Field
                        name="password"
                        type="password"
                        placeholder="Min. 8 characters"
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm bg-slate-50 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition ${
                          errors.password && touched.password ? "border-red-400" : "border-slate-200 dark:border-slate-700"
                        }`}
                      />
                    </div>
                    <ErrorMessage name="password" component="p" className="text-red-500 text-xs mt-1" />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 mt-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition shadow-md shadow-indigo-200 dark:shadow-indigo-900/20"
                  >
                    {isSubmitting ? "Creating..." : "Create Account"}
                    {!isSubmitting && <FiArrowRight size={16} />}
                  </button>
                </Form>
              )}
            </Formik>

            <p className="mt-6 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;