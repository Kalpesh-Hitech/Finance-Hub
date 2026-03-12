// src/App.jsx
import React, { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import PageLoader from "./Components/Features/PageLoader";
import { useSelector } from "react-redux";

const MainLayout     = lazy(() => import("./Pages/MainDashboard"));
const Login          = lazy(() => import("./Pages/Login"));
const Signup         = lazy(() => import("./Pages/SignUp"));
const ForgotPassword = lazy(() => import("./Pages/ForgetPassword"));
const Home           = lazy(() => import("./Pages/Home"));
const Transaction    = lazy(() => import("./Pages/Transaction"));
const Analytics      = lazy(() => import("./Pages/Analytics"));
const Budget         = lazy(() => import("./Pages/Budget"));
const Cards          = lazy(() => import("./Pages/Cards"));
const Reports        = lazy(() => import("./Pages/Reports"));
const Settings       = lazy(() => import("./Pages/Settings"));

const PrivateRoute = ({ children }) => {
  const isLoggedIn = useSelector((s) => s.auth.isLoggedIn);
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

const App = () => (
  <BrowserRouter>
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          {/* Public */}
          <Route path="login"           element={<Login />} />
          <Route path="signup"          element={<Signup />} />
          <Route path="forgot-password" element={<ForgotPassword />} />

          {/* Protected */}
          <Route index                  element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="dashboard"       element={<PrivateRoute><Home /></PrivateRoute>} />
          <Route path="transaction"     element={<PrivateRoute><Transaction /></PrivateRoute>} />
          <Route path="analytics"       element={<PrivateRoute><Analytics /></PrivateRoute>} />
          <Route path="budget"          element={<PrivateRoute><Budget /></PrivateRoute>} />
          <Route path="cards"           element={<PrivateRoute><Cards /></PrivateRoute>} />
          <Route path="reports"         element={<PrivateRoute><Reports /></PrivateRoute>} />
          <Route path="settings"        element={<PrivateRoute><Settings /></PrivateRoute>} />
        </Route>
      </Routes>
    </Suspense>
  </BrowserRouter>
);

export default App;