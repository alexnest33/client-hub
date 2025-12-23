import { configureStore } from "@reduxjs/toolkit";
import requestSlice from "../slices/requestSlice";
import adminSignIn from "../slices/adminSignIn";
import adminPanelSlice from "../slices/adminPanelSlice";

const store = configureStore({
  reducer: {
    request: requestSlice,
    admin: adminSignIn,
    adminPanel:adminPanelSlice,
  },
});

export default store;
