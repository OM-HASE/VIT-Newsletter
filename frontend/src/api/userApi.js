import axiosInstance from "../utils/axiosInstance";

export const updateProfile = (formData) =>
  axiosInstance.put("/users/update", formData);

export const changePassword = (data) =>
  axiosInstance.put("/users/password", data);