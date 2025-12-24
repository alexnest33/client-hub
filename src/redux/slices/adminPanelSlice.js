import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  applications: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
  selectedApplication: null,
  stats: null,
  statusUpdatingId: null,
  applicationDetailsLoading: false,
  statsLoading: false,
  tableLoading: false, 
};

export const getAllLeads = createAsyncThunk(
  "get/allLeads",
  async (
    { page = 1, limit = 10, startDate, endDate, status } = {},
    thunkAPI
  ) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        `https://leadflow-9v3y.onrender.com/api/admin/applications`,
        {
          params: { page, limit, startDate, endDate, status },
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
      return response.data;
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

export const getStats = createAsyncThunk(
  "admin/getStats",
  async ({ startDate, endDate }, thunkAPI) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        "https://leadflow-9v3y.onrender.com/api/admin/stats",
        {
          params: { startDate, endDate },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.response?.data || err.message);
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
      // .addCase(updateApplicationStatus.fulfilled, (state, action) => {
      //   const updatedApplication = action.payload.data;

      //   const index = state.applications.findIndex(
      //     (app) => app.id === updatedApplication.id
      //   );

      //   if (index !== -1) {
      //     state.applications[index] = updatedApplication;
      //   }
      // })
      .addCase(getApplicationById.fulfilled, (state, action) => {
        state.selectedApplication = action.payload.data;
      })
      .addCase(getStats.fulfilled, (state, action) => {
        state.stats = action.payload.data;
      })
      .addMatcher(
        action => action.type === updateApplicationStatus.pending.type,
        (state, action) => {
          state.statusUpdatingId = action.meta.arg.id;
        }
      )
      .addMatcher(
        action =>
          action.type === updateApplicationStatus.fulfilled.type ||
          action.type === updateApplicationStatus.rejected.type,
        state => {
          state.statusUpdatingId = null;
        }
      )
      .addMatcher(
        action => action.type === getApplicationById.pending.type,
        state => {
          state.applicationDetailsLoading = true;
        }
      )
      .addMatcher(
        action =>
          action.type === getApplicationById.fulfilled.type ||
          action.type === getApplicationById.rejected.type,
        state => {
          state.applicationDetailsLoading = false;
        }
      )
      .addMatcher(
        action => action.type === getStats.pending.type,
        state => {
          state.statsLoading = true;
        }
      )
      .addMatcher(
        action =>
          action.type === getStats.fulfilled.type ||
          action.type === getStats.rejected.type,
        state => {
          state.statsLoading = false;
        }
      )
      .addMatcher(
        action => action.type === getAllLeads.pending.type,
        state => {
          state.tableLoading = true;
        }
      )
      .addMatcher(
        action =>
          action.type === getAllLeads.fulfilled.type ||
          action.type === getAllLeads.rejected.type,
        state => {
          state.tableLoading = false;
        }
      )
      
  },
  
});

export default adminPanelSlice.reducer;
