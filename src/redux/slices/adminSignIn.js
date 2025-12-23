import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  token: null,
  user: null,
  loading: false,
  error: null,
};

export const loginAdmin = createAsyncThunk(
  "admin/login",
  async (values, thunkAPI) => {
    try {
      const response = await axios.post(
        "https://leadflow-9v3y.onrender.com/api/auth/login",
        values
      );

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "Ошибка входа"
      );
    }
  }
);

const adminSignIn = createSlice({
  name: "admin",
  initialState,
  reducers: {
    logout: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.data.token;
        state.user = action.payload.data.user;
        localStorage.setItem("token", action.payload.data.token);
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = adminSignIn.actions;
export default adminSignIn.reducer;
