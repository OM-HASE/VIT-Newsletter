import axiosInstance from "../utils/axiosInstance";

/* ANALYTICS */
export const getAnalytics = () =>
  axiosInstance.get("/admin/analytics");

/* USERS */
export const getAllUsers = () =>
  axiosInstance.get("/admin/users");

export const deleteUser = (id) =>
  axiosInstance.delete(`/admin/user/${id}`);

export const banUser = (id) =>
  axiosInstance.put(`/admin/ban/${id}`);

export const changeRole = (id, role) =>
  axiosInstance.put(`/admin/role/${id}`, {
    role,
  });

/* POSTS */
export const getAllPosts = () =>
  axiosInstance.get("/admin/posts");

export const deletePost = (id) =>
  axiosInstance.delete(`/admin/post/${id}`);

export const hidePost = (id) =>
  axiosInstance.put(`/admin/hide/${id}`);

export const pinPost = (id) =>
  axiosInstance.put(`/admin/pin/${id}`);

export const featurePost = (id) =>
  axiosInstance.put(`/admin/feature/${id}`);