import axiosInstance from "../utils/axiosInstance";

export const registerUser = (data) =>
  axiosInstance.post("/auth/register", data);

export const loginUser = (data) =>
  axiosInstance.post("/auth/login", data);

export const sendOtp = (email) =>
  axiosInstance.post("/auth/send-otp", { email });

export const verifyOtp = (email, otp) =>
  axiosInstance.post("/auth/verify-otp", { email, otp });