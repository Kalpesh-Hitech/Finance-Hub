import { createSlice } from "@reduxjs/toolkit";
const token = localStorage.getItem("token")
const user = (localStorage.getItem("user"))
const initialState = {
    user: user || null,
    token: token || null,
    isLoggedIn: !!token,
}
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            const { user, token } = action.payload;
            state.user = user;
            state.token = token;
            state.isLoggedIn = true;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isLoggedIn = false;

            localStorage.removeItem('token');
            localStorage.removeItem('user');
        },
    }
})
export const {setCredentials,logout} =authSlice.actions;
export default authSlice.reducer;