// src/api/authApi.js
import api from "./axiosInstance";

// ── Auth ──
export const loginApi       = (data) => api.post("/signin", data);
export const signupApi      = (data) => api.post("/signup", data);
export const verifyEmailApi = (data) => api.post("/verifyemail", data);
export const logoutApi      = ()     => Promise.resolve();

// ── Password / Email ──
export const changePasswordApi     = (data) => api.post("/change_password", data);
export const requestChangeEmailApi = ()     => api.post("/request-change-email");
export const changeEmailApi        = (data) => api.put("/change_email", data);
export const forgetPasswordApi     = (data) => api.post("/forgetpassword", data);
export const resetPasswordApi      = (data) => api.post("/reset_password", data);

// ── Transactions ──
export const getTransactionsApi   = ()     => api.get("/transactions");
export const createTransactionApi = (data) => api.post("/transactions", data);
export const deleteTransactionApi = (id)   => api.delete(`/transactions/${id}`);

// ── Budgets ──
export const getBudgetsApi   = ()         => api.get("/budgets");
export const createBudgetApi = (data)     => api.post("/budgets", data);
export const updateBudgetApi = (id, data) => api.patch(`/budgets/${id}`, data);
export const deleteBudgetApi = (id)       => api.delete(`/budgets/${id}`);