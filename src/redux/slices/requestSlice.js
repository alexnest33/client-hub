import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  orders: [],
};

// redux/slices/requestSlice.js
export const submitRequest = createAsyncThunk(
  "clientForm/submitRequest",
  async (formattedValues, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        "https://leadflow-9v3y.onrender.com/api/applications",
        formattedValues
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error?.response?.data?.message || "Ошибка отправки заявки"
      );
    }
  }
);

export const requestSlice = createSlice({
  name: "clientRequest",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(submitRequest.fulfilled, (state, action) => {
      console.log("Запрос выполнен успешно, action.payload:", action.payload);
      if (action.payload?.data) {
        state.orders.push(action.payload.data);
      }
    });
  },
});
export default requestSlice.reducer;
