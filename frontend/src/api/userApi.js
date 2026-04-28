import axiosInstance from "../utils/axiosInstance";

export const updateProfile = (formData) =>
  axiosInstance.put("/users/update", formData);

export const changePassword = (data) =>
  axiosInstance.put("/users/password", data);

export const getProfile = () =>
  axiosInstance.get("/users/me");