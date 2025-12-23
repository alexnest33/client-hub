import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  applications: [],
  pagination: {
    page: 1, // первая страница
    limit: 10, // количество записей на странице
    total: 0, // пока ничего нет
    pages: 0,
  },
  selectedApplication: null,
};

export const getAllLeads = createAsyncThunk(
  "get/allLeads",
  async ({ page, limit }, thunkAPI) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `https://leadflow-9v3y.onrender.com/api/admin/applications?page=${page}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getApplicationById = createAsyncThunk(
  "admin/getApplicationById",
  async (id, thunkAPI) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `https://leadflow-9v3y.onrender.com/api/admin/applications/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data; // вернём объект заявки
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const updateApplicationStatus = createAsyncThunk(
  "applications/updateStatus",
  async ({ id, status }, thunkAPI) => {
    const token = localStorage.getItem("token");

    try {
      const response = await axios.patch(
        `https://leadflow-9v3y.onrender.com/api/admin/applications/${id}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error?.response?.data?.message || "Ошибка обновления статуса"
      );
    }
  }
);

const adminPanelSlice = createSlice({
  name: "applications",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllLeads.fulfilled, (state, action) => {
        state.applications = action.payload.data.applications;
        state.pagination = action.payload.data.pagination;
      })
      .addCase(updateApplicationStatus.fulfilled, (state, action) => {
        const updatedApplication = action.payload.data;

        const index = state.applications.findIndex(
          (app) => app.id === updatedApplication.id
        );

        if (index !== -1) {
          state.applications[index] = updatedApplication;
        }
      })
      .addCase(getApplicationById.fulfilled, (state, action) => {
        state.selectedApplication = action.payload.data;
      });
  },
});

export default adminPanelSlice.reducer;
